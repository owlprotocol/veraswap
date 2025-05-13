import { getRandomValues } from "crypto";

import { getAnvilAccount } from "@veraswap/anvil-account";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount, ToSimpleSmartAccountReturnType } from "permissionless/accounts";
import {
    Address,
    bytesToHex,
    Chain,
    createWalletClient,
    encodeFunctionData,
    Hex,
    hexToBigInt,
    http,
    padHex,
    parseEther,
    Transport,
} from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { BalanceDeltaPaymaster } from "./artifacts/BalanceDeltaPaymaster.js";
import { BalanceDeltaRefundPaymaster } from "./artifacts/BalanceDeltaRefundPaymaster.js";
import { opChainL1BundlerClient, opChainL1BundlerPort, opChainL1Client } from "./chains/supersim.js";
import { ERC4337_CONTRACTS } from "./constants/erc4337.js";

describe("alto.simple.test.ts", function () {
    const contracts = ERC4337_CONTRACTS[opChainL1Client.chain.id]!;

    const bundlerTransport = http(`http://127.0.0.1:${opChainL1BundlerPort}`);

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;

    let smartAccountSalt: Hex;
    let smartAccountAddress: Address;
    let smartAccount: ToSimpleSmartAccountReturnType<"0.7">;
    let smartAccountClient: SmartAccountClient<Transport, Chain, ToSimpleSmartAccountReturnType<"0.7">>;

    beforeAll(async () => {
        const entryPointCode = await opChainL1Client.getCode({ address: entryPoint07Address });
        expect(entryPointCode).toBeDefined();
        const simpleAccountFactoryCode = await opChainL1Client.getCode({ address: contracts.simpleAccountFactory });
        expect(simpleAccountFactoryCode).toBeDefined();
        const openPaymasterCode = await opChainL1Client.getCode({
            address: contracts.openPaymaster,
        });
        expect(openPaymasterCode).toBeDefined();
        const balanceDeltaPaymasterCode = await opChainL1Client.getCode({ address: contracts.balanceDeltaPaymaster });
        expect(balanceDeltaPaymasterCode).toBeDefined();
    });

    beforeEach(async () => {
        smartAccountSalt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });
        smartAccount = await toSimpleSmartAccount({
            owner: anvilAccount,
            client: opChainL1Client,
            entryPoint,
            factoryAddress: contracts.simpleAccountFactory,
            index: hexToBigInt(smartAccountSalt),
        });
        smartAccountAddress = smartAccount.address;
        smartAccountClient = createSmartAccountClient({
            account: smartAccount,
            chain: opChainL1Client.chain,
            bundlerTransport,
        });
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

        const userOpHash = await smartAccountClient.sendUserOperation({
            calls: [
                ...calls,
                {
                    to: contracts.balanceDeltaPaymaster,
                    value: userOpMaxCost,
                    data: encodeFunctionData({
                        abi: BalanceDeltaPaymaster.abi,
                        functionName: "deposit",
                        args: [],
                    }),
                },
            ],
            maxFeePerGas: feesPerGas.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas.maxFeePerGas,
            paymaster: contracts.balanceDeltaPaymaster,
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

    test.only("paymaster - balance delta with refund", async () => {
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
        console.debug({ nonce });
        const userOpHash = await smartAccountClient.sendUserOperation({
            calls: [
                ...calls,
                {
                    to: contracts.balanceDeltaRefundPaymaster,
                    value: userOpMaxCost,
                    data: encodeFunctionData({
                        abi: BalanceDeltaRefundPaymaster.abi,
                        functionName: "deposit",
                        args: [smartAccountClient.account.address, nonce],
                    }),
                },
            ],
            maxFeePerGas: feesPerGas.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas.maxFeePerGas,
            paymaster: contracts.balanceDeltaRefundPaymaster,
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
