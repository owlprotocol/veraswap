import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { mock } from "@wagmi/connectors";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

import { localMockTokens } from "../constants/tokens.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { IERC20 } from "../artifacts/IERC20.js";
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

    const tokenA = localMockTokens[0];
    // const tokenAHypERC20Collateral = LOCAL_TOKENS[0];

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

    test("ERC20.approve", async () => {
        // Approve account as spender
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: tokenA.address,
                abi: IERC20.abi,
                functionName: "approve",
                args: [account.address, 1n],
            }),
        });

        // Transfer from anvilAccount to account
        const transferFromCall = await getERC20TransferFromCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            funder: anvilAccount.address,
            minAmount: 1n,
        });
        expect(transferFromCall.balance).toBe(0n);
        expect(transferFromCall.calls.length).toBe(1);

        // Send from account `IERC20.transferFrom(anvilAccount, account, 1n)`
        expect(transferFromCall.calls[0]).toBeDefined();
        expect(transferFromCall.calls[0].to).toBe(tokenA.address);

        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(transferFromCall.calls[0]),
        });

        // Check balance of account
        const balance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(balance).toBe(1n);
    });
});
