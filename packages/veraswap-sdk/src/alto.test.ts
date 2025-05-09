// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { getAnvilAccount } from "@owlprotocol/anvil-account";
import { getSimpleAccountAddress, SIMPLE_ACCOUNT_FACTORY_ADDRESS } from "@owlprotocol/contracts-account-abstraction";
import { SimpleSmartAccountImplementation, toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient, SmartAccountClient } from "permissionless/clients";
import { createPublicClient, createWalletClient, http, nonceManager, parseEther } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";
import { beforeAll, describe, expect, test } from "vitest";

import { altoPort0, anvilPort0 } from "./test/constants.js";

describe("index.test.ts", function () {
    const chain = localhost;
    const chainId = chain.id;
    const transport = http(`http://127.0.0.1:${anvilPort0}`);
    const bundlerTransport = http(`http://127.0.0.1:${altoPort0}`);
    const publicClient = createPublicClient({
        chain,
        transport,
    });

    const walletClient = createWalletClient({
        account: getAnvilAccount(0, { nonceManager }),
        chain,
        transport,
    });

    beforeAll(async () => {
        const EntryPoint = await publicClient.getCode({ address: entryPoint07Address });
        expect(EntryPoint).toBeDefined();
    });

    test("Simple AA", async () => {
        const owner = privateKeyToAccount(generatePrivateKey());
        const smartAccountAddress = getSimpleAccountAddress({ owner: owner.address });

        const smartAccount = await toSimpleSmartAccount({
            address: smartAccountAddress,
            client: publicClient,
            owner,
            factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            entryPoint: {
                address: entryPoint07Address,
                version: "0.7",
            },
        });
        const smartAccountClient = createSmartAccountClient({
            account: smartAccount,
            chain,
            bundlerTransport,
        });

        //Pre-fund wallet just to pay tx cost
        const fundSimpleAccountHash = await walletClient.sendTransaction({
            to: smartAccount.address,
            value: parseEther("5"),
        });
        await publicClient.waitForTransactionReceipt({ hash: fundSimpleAccountHash });

        const target = privateKeyToAccount(generatePrivateKey());
        const fees = await publicClient.estimateFeesPerGas();
        console.debug(fees);
        const hash = await smartAccountClient.sendTransaction({
            to: target.address,
            data: "0x123",
            value: 0n,
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxFeePerGas,
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        expect(receipt).toBeDefined();
    });
});
