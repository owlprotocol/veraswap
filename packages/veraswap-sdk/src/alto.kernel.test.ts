import { getRandomValues } from "crypto";

import { getAnvilAccount } from "@veraswap/anvil-account";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, KernelAccountClient } from "@zerodev/sdk";
import { CreateKernelAccountReturnType, toKernelPluginManager } from "@zerodev/sdk/accounts";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import {
    Address,
    bytesToHex,
    Chain,
    Client,
    createWalletClient,
    encodeFunctionData,
    Hex,
    http,
    LocalAccount,
    padHex,
    parseEther,
    Transport,
} from "viem";
import { entryPoint07Address, SmartAccount } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { BalanceDeltaPaymaster } from "./artifacts/BalanceDeltaPaymaster.js";
import { KernelFactory } from "./artifacts/KernelFactory.js";
import { opChainL1, opChainL1BundlerClient, opChainL1BundlerPort, opChainL1Client } from "./chains/supersim.js";
import { ERC4337_CONTRACTS } from "./constants/erc4337.js";
import { LOCAL_KERNEL_CONTRACTS } from "./constants/kernel.js";
import { getKernelAddress } from "./smartaccount/getKernelAddress.js";
import { getKernelInitData } from "./smartaccount/getKernelInitData.js";

describe("alto.kernel.test.ts", function () {
    const contracts = ERC4337_CONTRACTS[opChainL1Client.chain.id]!;

    const bundlerTransport = http(`http://127.0.0.1:${opChainL1BundlerPort}`);

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    let smartAccountInitData: Hex;
    let smartAccountSalt: Hex;

    let smartAccountAddress: Address;
    let smartAccount: CreateKernelAccountReturnType<"0.7">;
    let smartAccountClient: KernelAccountClient<Transport, Chain, SmartAccount, Client>;

    beforeAll(async () => {
        const entryPointCode = await opChainL1Client.getCode({ address: entryPoint07Address });
        expect(entryPointCode).toBeDefined();
        const ecdsaValidatorCode = await opChainL1Client.getCode({
            address: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        expect(ecdsaValidatorCode).toBeDefined();
        const openPaymasterCode = await opChainL1Client.getCode({
            address: contracts.openPaymaster,
        });
        expect(openPaymasterCode).toBeDefined();
        const balanceDeltaPaymasterCode = await opChainL1Client.getCode({ address: contracts.balanceDeltaPaymaster });
        expect(balanceDeltaPaymasterCode).toBeDefined();
    });

    beforeEach(async () => {
        // Create smart account
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer: { type: "local", address: anvilAccount.address } as LocalAccount,
            validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
            entryPoint,
            kernelVersion,
            sudo: ecdsaValidator,
            chainId: opChainL1Client.chain.id,
        });
        // Kernel `initialize` call
        smartAccountInitData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [],
        });
        // KernelFactory `createAccount` call
        smartAccountSalt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });
        smartAccountAddress = getKernelAddress({
            data: smartAccountInitData,
            salt: smartAccountSalt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });
        smartAccount = await createKernelAccount(opChainL1Client, {
            address: smartAccountAddress,
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion,
        });
        smartAccountClient = createKernelAccountClient({
            account: smartAccount,
            chain: opChainL1,
            bundlerTransport,
            client: opChainL1Client,
        });

        //TODO: Remove this when the kernel META factory is deployed as that is used by sdk
        const deployHash = await anvilClientL1.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.kernelFactory,
            abi: KernelFactory.abi,
            functionName: "createAccount",
            args: [smartAccountInitData, smartAccountSalt],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: deployHash });
    });

    test("self pay", async () => {
        const target = privateKeyToAccount(generatePrivateKey());
        const calls = [
            {
                to: target.address,
                value: 1n,
                data: "0x",
            },
        ] as const;
        // Get cost of calls without paymaster
        const userOpGas = await smartAccountClient.estimateUserOperationGas({
            calls,
            stateOverride: [
                {
                    // Adding 100 ETH to the smart account during estimation to prevent AA21 errors while estimating
                    balance: parseEther("100"),
                    address: smartAccountClient.account.address,
                },
            ],
        });
        const userOpGasTotal = userOpGas.preVerificationGas + userOpGas.verificationGasLimit + userOpGas.callGasLimit;
        const feesPerGas = await opChainL1Client.estimateFeesPerGas();
        const userOpMaxCost = userOpGasTotal * feesPerGas.maxFeePerGas;

        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: userOpMaxCost + 1n,
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSmartAccountHash });

        const userOpHash = await smartAccountClient.sendUserOperation({
            calls,
            maxFeePerGas: feesPerGas.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas.maxFeePerGas,
        });
        const userOpReceipt = await opChainL1BundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await opChainL1Client.getBalance({ address: target.address });
        expect(balance).toBe(1n);
    });

    test("paymaster - open", async () => {
        //Pre-fund wallet to pay target only
        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: 1n,
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSmartAccountHash });

        // Simple AA
        const target = privateKeyToAccount(generatePrivateKey());
        const callData = await smartAccountClient.account.encodeCalls([
            {
                to: target.address,
                value: 1n,
                data: "0x",
            },
        ]);
        const fees = await opChainL1Client.estimateFeesPerGas();
        const userOpHash = await smartAccountClient.sendUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
            paymaster: contracts.openPaymaster,
        });
        const userOpReceipt = await opChainL1BundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await opChainL1Client.getBalance({ address: target.address });
        expect(balance).toBe(1n);

        const smartAccountBalance = await opChainL1Client.getBalance({
            address: smartAccountClient.account.address,
        });
        expect(smartAccountBalance).toBe(0n);
    });

    test("paymaster - balance delta", async () => {
        const target = privateKeyToAccount(generatePrivateKey());
        const calls = [
            {
                to: target.address,
                value: 1n,
                data: "0x",
            },
        ] as const;
        // Get cost of calls without paymaster
        const userOpGas = await smartAccountClient.estimateUserOperationGas({
            calls,
            stateOverride: [
                {
                    // Adding 100 ETH to the smart account during estimation to prevent AA21 errors while estimating
                    balance: parseEther("100"),
                    address: smartAccountClient.account.address,
                },
            ],
        });
        const DEPOSIT_GAS_COST = 50_000n; //may be even more optimized, but this is a good estimate
        const userOpGasTotal =
            userOpGas.preVerificationGas + userOpGas.verificationGasLimit + userOpGas.callGasLimit + DEPOSIT_GAS_COST;
        const feesPerGas = await opChainL1Client.estimateFeesPerGas();
        const userOpMaxCost = userOpGasTotal * feesPerGas.maxFeePerGas;

        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: userOpMaxCost + 1n,
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSmartAccountHash });

        const nonce = await smartAccount.getNonce();
        const userOpHash = await smartAccountClient.sendUserOperation({
            calls: [
                ...calls,
                {
                    to: contracts.balanceDeltaPaymaster,
                    value: userOpMaxCost,
                    data: encodeFunctionData({
                        abi: BalanceDeltaPaymaster.abi,
                        functionName: "payUserOp",
                        args: [smartAccountClient.account.address, nonce],
                    }),
                },
            ],
            maxFeePerGas: feesPerGas.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas.maxFeePerGas,
            paymaster: contracts.balanceDeltaPaymaster,
            nonce,
        });
        const userOpReceipt = await opChainL1BundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await opChainL1Client.getBalance({ address: target.address });
        expect(balance).toBe(1n);

        const smartAccountBalance = await opChainL1Client.getBalance({
            address: smartAccountClient.account.address,
        });
        expect(smartAccountBalance).toBeGreaterThan(0n);
    });
});
