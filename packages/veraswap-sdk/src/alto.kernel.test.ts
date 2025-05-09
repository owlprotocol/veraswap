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
    Hex,
    http,
    LocalAccount,
    padHex,
    parseEther,
    Transport,
} from "viem";
import { entryPoint07Address, SmartAccount } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, describe, expect, test } from "vitest";

import { opChainL1, opChainL1BundlerClient, opChainL1BundlerPort, opChainL1Client } from "./chains/supersim.js";
import { LOCAL_KERNEL_CONTRACTS } from "./constants/kernel.js";
import { getKernelAddress } from "./smartaccount/getKernelAddress.js";
import { getKernelInitData } from "./smartaccount/getKernelInitData.js";
import { installOwnableExecutor } from "./smartaccount/OwnableExecutor.js";

describe("alto.kernel.test.ts", function () {
    const bundlerTransport = http(`http://127.0.0.1:${opChainL1BundlerPort}`);

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    let kernelInitData: Hex;
    let kernelSalt: Hex;

    let smartAccountAddress: Address;
    let smartAccount: CreateKernelAccountReturnType<"0.7">;
    let smartAccountClient: KernelAccountClient<Transport, Chain, SmartAccount, Client>;

    beforeAll(async () => {
        const EntryPoint = await opChainL1Client.getCode({ address: entryPoint07Address });
        expect(EntryPoint).toBeDefined();

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
        kernelInitData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: anvilAccount.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        kernelSalt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });

        smartAccountAddress = getKernelAddress({
            data: kernelInitData,
            salt: kernelSalt,
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

        //Pre-fund wallet just to pay tx cost
        const fundSmartAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: parseEther("5"),
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSmartAccountHash });
    });

    test("Simple AA", async () => {
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
});
