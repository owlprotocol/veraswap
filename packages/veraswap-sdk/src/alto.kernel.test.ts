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
    zeroAddress,
} from "viem";
import { entryPoint07Address, formatUserOperationRequest, SmartAccount, UserOperation } from "viem/account-abstraction";
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

    let kernelAddress: Address;
    let kernelInitData: Hex;
    let kernelSalt: Hex;
    let kernelAccount: CreateKernelAccountReturnType<"0.7">;
    let kernelClient: KernelAccountClient<Transport, Chain, SmartAccount, Client>;

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

        kernelAddress = getKernelAddress({
            data: kernelInitData,
            salt: kernelSalt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });

        kernelAccount = await createKernelAccount(opChainL1Client, {
            address: kernelAddress,
            plugins: {
                sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion,
        });

        kernelClient = createKernelAccountClient({
            account: kernelAccount,
            chain: opChainL1,
            bundlerTransport,
            client: opChainL1Client,
        });
    });

    test("Simple AA", async () => {
        //Pre-fund wallet just to pay tx cost
        const fundSimpleAccountHash = await anvilClientL1.sendTransaction({
            to: kernelAccount.address,
            value: parseEther("5"),
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSimpleAccountHash });

        // Simple AA
        const callData = await kernelClient.account.encodeCalls([
            {
                to: zeroAddress,
                value: 0n,
                data: "0x123",
            },
        ]);
        console.debug({ callData });
        const fees = await opChainL1Client.estimateFeesPerGas();
        const userOp = await kernelClient.prepareUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
            // Gas estimation fails
            preVerificationGas: 200_000n,
            verificationGasLimit: 200_000n,
            callGasLimit: 5_000_000n,
        });
        const signature = await kernelAccount.signUserOperation(userOp as UserOperation);
        const rpcParameters = formatUserOperationRequest({
            ...userOp,
            signature,
        } as UserOperation);

        console.debug({ rpcParameters });

        //TODO: Bundler not responding?
        // Ideas: Simplify smart account deploy, run alto locall,

        const rpcResponse = await opChainL1BundlerClient.request(
            {
                method: "eth_sendUserOperation",
                params: [rpcParameters, entryPoint07Address ?? kernelAccount?.entryPoint?.address],
            },
            { retryCount: 0 },
        );
        console.debug({ rpcResponse });
        /*
        const userOpHash = await kernelClient.sendUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
            // Gas estimation fails
            preVerificationGas: 100_000n,
            verificationGasLimit: 100_000n,
            callGasLimit: 1_000_000n,
        });

        console.log("UserOp hash:", userOpHash);
        await kernelClient.waitForUserOperationReceipt({
            hash: userOpHash,
            timeout: 1000 * 15,
export const opChainABundlerClient = createBundlerClient({
    chain: opChainL1,
    transport: http(`http://127.0.0.1:${opChainABundlerPort}`),
}AAA        });
        *.

        /*
        const target = privateKeyToAccount(generatePrivateKey());
        const fees = await opChainL1Client.estimateFeesPerGas();
        console.debug(fees);
        const hash = await smartAccountClient.sendTransaction({
            to: target.address,
            data: "0x123",
            value: 0n,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
        });
        const receipt = await opChainL1Client.waitForTransactionReceipt({ hash });
        expect(receipt).toBeDefined();
        */
    });
});
