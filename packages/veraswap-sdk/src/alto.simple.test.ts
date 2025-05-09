import { getAnvilAccount } from "@veraswap/anvil-account";
import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount, ToSimpleSmartAccountReturnType } from "permissionless/accounts";
import { Address, Chain, createWalletClient, http, parseEther, Transport, zeroAddress } from "viem";
import { entryPoint07Address, formatUserOperationRequest, UserOperation } from "viem/account-abstraction";
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
    });

    test("Simple AA", async () => {
        //Pre-fund wallet just to pay tx cost
        const fundSimpleAccountHash = await anvilClientL1.sendTransaction({
            to: smartAccountAddress,
            value: parseEther("5"),
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: fundSimpleAccountHash });

        // Simple AA
        const callData = await smartAccountClient.account.encodeCalls([
            {
                to: zeroAddress,
                value: 0n,
                data: "0x123",
            },
        ]);
        console.debug({ callData });
        const fees = await opChainL1Client.estimateFeesPerGas();
        const userOp = await smartAccountClient.prepareUserOperation({
            callData,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
            // Gas estimation fails
            preVerificationGas: 200_000n,
            verificationGasLimit: 200_000n,
            callGasLimit: 5_000_000n,
        });
        const signature = await smartAccount.signUserOperation(userOp as UserOperation);
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
                params: [rpcParameters, entryPoint07Address ?? smartAccount?.entryPoint?.address],
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
