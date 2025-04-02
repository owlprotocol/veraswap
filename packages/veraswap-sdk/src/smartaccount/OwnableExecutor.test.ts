import { beforeAll, describe, expect, test } from "vitest";
import { Account, Address, createWalletClient, http, LocalAccount, zeroHash } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { getAnvilAccount } from "@veraswap/anvil-account";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { opChainL1Client } from "../chains/index.js";
import { getKernelInitData } from "./getKernelInitData.js";
import { encodeExecuteSignature, installOwnableExecutor } from "./OwnableExecutor.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { getKernelAddress } from "./getKernelAddress.js";
import { Kernel } from "../artifacts/Kernel.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { encodeCallArgsBatch, encodeCallArgsSingle } from "./ExecLib.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ERC7579_MODULE_TYPE } from "./ERC7579Module.js";

describe("smartaccount/OwnableExecutor.test.ts", function () {
    // Test ZeroDev SDK & Custom SDK Tooling
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    const account: Account = getAnvilAccount(1);
    const signer = { type: "local", address: account.address } as LocalAccount;
    const walletClient = createWalletClient({ account, chain: opChainL1Client.chain, transport: http() });

    let kernelAddress: Address;

    beforeAll(async () => {
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer,
            validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
            entryPoint,
            kernelVersion,
            sudo: ecdsaValidator,
            chainId: opChainL1Client.chain.id,
        });
        // Kernel `initialize` call
        const initData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: account.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        kernelAddress = getKernelAddress({
            data: initData,
            salt: zeroHash,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });

        const hash = await walletClient.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.kernelFactory,
            abi: KernelFactory.abi,
            functionName: "createAccount",
            args: [initData, zeroHash],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });

        const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
        expect(bytecode).toBeDefined();
    });

    test("installOwnableExecutor", async () => {
        const isModuleInstalled = await opChainL1Client.readContract({
            address: kernelAddress,
            abi: Kernel.abi,
            functionName: "isModuleInstalled",
            args: [BigInt(ERC7579_MODULE_TYPE.EXECUTOR), LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor, "0x"],
        });
        expect(isModuleInstalled).toBe(true);
        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [kernelAddress],
        });
        expect(owners).toStrictEqual([account.address]);
    });

    test("OwnableExecutor.executeOnOwnedAccount - direct", async () => {
        const callData = encodeCallArgsSingle({
            to: "0x0000000000000000000000000000000000000001",
            data: "0x1234",
        });

        const hash = await walletClient.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "executeOnOwnedAccount",
            args: [kernelAddress, callData],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("OwnableExecutor.executeBatchOnOwnedAccount - direct", async () => {
        const callData = encodeCallArgsBatch([
            {
                to: "0x0000000000000000000000000000000000000001",
                data: "0x1234",
            },
        ]);

        const hash = await walletClient.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "executeBatchOnOwnedAccount",
            args: [kernelAddress, callData],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("OwnableExecutor.executeOnOwnedAccount - signature", async () => {
        const walletClient2 = createWalletClient({
            account: getAnvilAccount(2),
            chain: opChainL1Client.chain,
            transport: http(),
        });

        const callData = encodeCallArgsSingle({
            to: "0x0000000000000000000000000000000000000001",
            data: "0x1234",
        });
        // Get nonce key 0. We could also just generate a random key
        const nonce = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getNonce",
            args: [kernelAddress, 0n],
        });
        const signatureParams = {
            chainId: BigInt(opChainL1Client.chain.id),
            ownedAccount: kernelAddress,
            nonce: nonce,
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            msgValue: 0n,
            callData,
        };
        const signatureData = encodeExecuteSignature(signatureParams);
        const signature = await account.signMessage({ message: { raw: signatureData } });

        const hash = await walletClient2.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "executeOnOwnedAccount",
            args: [
                signatureParams.ownedAccount,
                signatureParams.nonce,
                signatureParams.validAfter,
                signatureParams.validUntil,
                signatureParams.callData,
                signature,
            ],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("OwnableExecutor.executeBatchOnOwnedAccount - signature", async () => {
        const walletClient2 = createWalletClient({
            account: getAnvilAccount(2),
            chain: opChainL1Client.chain,
            transport: http(),
        });

        const callData = encodeCallArgsBatch([
            {
                to: "0x0000000000000000000000000000000000000001",
                data: "0x1234",
            },
        ]);
        // Get nonce key 0. We could also just generate a random key
        const nonce = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getNonce",
            args: [kernelAddress, 0n],
        });
        const signatureParams = {
            chainId: BigInt(opChainL1Client.chain.id),
            ownedAccount: kernelAddress,
            nonce: nonce,
            validAfter: 0,
            validUntil: 2 ** 48 - 1,
            msgValue: 0n,
            callData,
        };
        const signatureData = encodeExecuteSignature(signatureParams);
        const signature = await account.signMessage({ message: { raw: signatureData } });

        const hash = await walletClient2.writeContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "executeBatchOnOwnedAccount",
            args: [
                signatureParams.ownedAccount,
                signatureParams.nonce,
                signatureParams.validAfter,
                signatureParams.validUntil,
                signatureParams.callData,
                signature,
            ],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });
});
