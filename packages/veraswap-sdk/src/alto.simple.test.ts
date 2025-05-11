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
        //Pre-fund wallet to pay target + gas cost
        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: parseEther("1"),
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
    });

    test("paymaster - balance delta", async () => {
        //Pre-fund wallet to pay target only
        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: parseEther("1") + 1n,
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
            {
                to: contracts.balanceDeltaPaymaster,
                value: parseEther("1"),
                data: encodeFunctionData({
                    abi: BalanceDeltaPaymaster.abi,
                    functionName: "deposit",
                    args: [],
                }),
            },
        ]);
        const fees = await opChainL1Client.estimateFeesPerGas();
        const userOpHash = await smartAccountClient.sendUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
            paymaster: contracts.balanceDeltaPaymaster,
        });
        const userOpReceipt = await opChainL1BundlerClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
        });
        expect(userOpReceipt).toBeDefined();

        const balance = await opChainL1Client.getBalance({ address: target.address });
        expect(balance).toBe(1n);
    });
});
