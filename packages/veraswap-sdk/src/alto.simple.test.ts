import { getAnvilAccount } from "@veraswap/anvil-account";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount, ToSimpleSmartAccountReturnType } from "permissionless/accounts";
import { Address, Chain, createWalletClient, http, parseEther, Transport } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, describe, expect, test } from "vitest";

import { SimpleAccountFactory } from "./artifacts/SimpleAccountFactory.js";
import { opChainL1, opChainL1BundlerClient, opChainL1BundlerPort, opChainL1Client } from "./chains/supersim.js";
import { SIMPLE_ACCOUNT_FACTORY_ADDRESS } from "./constants/erc4337.js";

describe("alsto.simple.test.ts", function () {
    const bundlerTransport = http(`http://127.0.0.1:${opChainL1BundlerPort}`);

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;

    let smartAccountAddress: Address;
    let smartAccount: ToSimpleSmartAccountReturnType<"0.7">;
    let smartAccountClient: SmartAccountClient<Transport, Chain, ToSimpleSmartAccountReturnType<"0.7">>;

    beforeAll(async () => {
        const entryPointCode = await opChainL1Client.getCode({ address: entryPoint07Address });
        expect(entryPointCode).toBeDefined();
        const simpleAccountFactoryCode = await opChainL1Client.getCode({ address: SIMPLE_ACCOUNT_FACTORY_ADDRESS });
        expect(simpleAccountFactoryCode).toBeDefined();

        smartAccountAddress = await opChainL1Client.readContract({
            address: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            abi: SimpleAccountFactory.abi,
            functionName: "getAddress",
            args: [anvilAccount.address, 0n],
        });
        smartAccount = await toSimpleSmartAccount({
            owner: anvilAccount,
            address: smartAccountAddress,
            client: opChainL1Client,
            entryPoint,
            factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        });
        smartAccountClient = createSmartAccountClient({
            account: smartAccount,
            chain: opChainL1,
            bundlerTransport,
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
            // Gas estimation fails
            preVerificationGas: 500_000n,
            verificationGasLimit: 500_000n,
            callGasLimit: 2_000_000n,
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
