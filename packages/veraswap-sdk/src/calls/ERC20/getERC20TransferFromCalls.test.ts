import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { mock } from "@wagmi/connectors";
import { connect, createConfig, http } from "@wagmi/core";
import { omit } from "lodash-es";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IERC20 } from "../../artifacts/IERC20.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";

import { getERC20TransferFromCalls } from "./getERC20TransferFromCalls.js";

describe("calls/getERC20TransferFromCalls.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const anvilClient = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    // Mock connector to use wagmi signing
    const mockConnector = mock({
        accounts: [
            anvilAccount.address, //only works because anvil will allow RPC based signing (connector does not use in-memory pkey)
        ],
    });
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
        connectors: [mockConnector],
    });
    const queryClient = new QueryClient();

    let account: Account;
    let accountClient: WalletClient<Transport, Chain, Account>;

    const tokenA = LOCAL_CURRENCIES[0].wrapped.address;

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(async () => {
        account = privateKeyToAccount(generatePrivateKey());
        accountClient = createWalletClient({
            account,
            chain: opChainL1Client.chain,
            transport: http(),
        });
        // Fund account
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction({
                to: account.address,
                value: parseEther("1"),
            }),
        });
    });

    test("ERC20.transferFrom", async () => {
        // Approve account as spender
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: tokenA,
                abi: IERC20.abi,
                functionName: "approve",
                args: [account.address, 1n],
            }),
        });

        // Transfer from anvilAccount to account
        const transferFromCall = await getERC20TransferFromCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA,
            account: account.address,
            funder: anvilAccount.address,
            minAmount: 1n,
        });
        expect(transferFromCall.balance).toBe(0n);
        expect(transferFromCall.calls.length).toBe(1);

        // ERC20.transferFrom(anvilAccount, account, 1n)
        expect(transferFromCall.calls[0]).toBeDefined();
        expect(transferFromCall.calls[0].to).toBe(tokenA);

        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferFromCall.calls[0], "account")),
        });

        // Check balance of account
        const balance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(balance).toBe(1n);
    });
});
