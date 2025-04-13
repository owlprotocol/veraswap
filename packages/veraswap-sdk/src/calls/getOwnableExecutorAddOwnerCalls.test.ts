import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { Account, Chain, createWalletClient, http, padHex, parseEther, Transport, WalletClient } from "viem";
import { describe, expect, test, beforeEach } from "vitest";
import { opChainL1, opChainL1Client } from "../chains/supersim.js";
import { getOwnableExecutorAddOwnerCalls } from "./getOwnableExecutorAddOwnerCalls.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { createConfig } from "wagmi";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { omit } from "lodash-es";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

describe("calls/getTransferRemoteWithKernelCalls.test.ts", function () {
    const queryClient = new QueryClient();
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });

    let account: Account;
    let accountClient: WalletClient<Transport, Chain, Account>;

    // can't use address(1) because it is the SENTINEL
    const twoAddress = padHex("0x2", { size: 20 });
    const threeAddress = padHex("0x3", { size: 20 });

    beforeEach(async () => {
        const anvilAccount = getAnvilAccount();
        const anvilClient = createWalletClient({
            account: anvilAccount,
            chain: opChainL1Client.chain,
            transport: http(),
        });

        account = privateKeyToAccount(generatePrivateKey());
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction({
                to: account.address,
                value: parseEther("1"),
            }),
        });
        accountClient = createWalletClient({ account, chain: opChainL1, transport: http() });
    });

    test("onInstall - addOwner", async () => {
        // Install Module
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.writeContract({
                address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "onInstall",
                args: [twoAddress], //address 1,
            }),
        });

        // Module installed with 1 owner, check if adding a new owner is necessary using `getOwners`
        const executorAddOwnerCalls = await getOwnableExecutorAddOwnerCalls(queryClient, config, {
            chainId: opChainL1.id,
            account: account.address,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            owner: threeAddress,
        });
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(executorAddOwnerCalls.calls[0], "account")),
        });

        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [account.address],
        });
        expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(address(1))").toContain(twoAddress);
        expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(address(2))").toContain(threeAddress);
    });

    test("LinkedList_InvalidPage - addOwner", async () => {
        // LinkedList not initialized, consider this same as empty array (though module must be installed first!)
        // Module not installed (check with `isInitialized`) so owner must be added
        const executorAddOwnerCalls = await getOwnableExecutorAddOwnerCalls(queryClient, config, {
            chainId: opChainL1.id,
            account: account.address,
            executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            owner: threeAddress,
        });

        // Install Module
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.writeContract({
                address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "onInstall",
                args: [twoAddress], //address 1,
            }),
        });

        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(executorAddOwnerCalls.calls[0], "account")),
        });

        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [account.address],
        });
        expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(address(1))").toContain(twoAddress);
        expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(address(2))").toContain(threeAddress);
    });
});
