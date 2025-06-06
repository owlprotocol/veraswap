import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { mock } from "@wagmi/connectors";
import { connect, createConfig, http } from "@wagmi/core";
import { omit } from "lodash-es";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IAllowanceTransfer } from "../../artifacts/IAllowanceTransfer.js";
import { IERC20 } from "../../artifacts/IERC20.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { MAX_UINT_160, MAX_UINT_48 } from "../../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";

import { getPermit2TransferFromCalls } from "./getPermit2TransferFromCalls.js";

describe("calls/getPermit2TransferFromCalls.test.ts", function () {
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
    test("Permit2.transferFrom", async () => {
        // Permit2 already approved for funder(anvil0)
        // Transfer from anvilAccount to account
        // Set approvals to MAX
        const transferFromCall = await getPermit2TransferFromCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA,
            account: account.address,
            funder: anvilAccount.address,
            minAmount: 1n,
            approveExpiration: "MAX_UINT_48",
            approveAmount: "MAX_UINT_160",
        });
        expect(transferFromCall.balance).toBe(0n);
        expect(transferFromCall.calls.length).toBe(2);

        // Permit2.permit(funder, permitSingle, signature)
        expect(transferFromCall.calls[0]).toBeDefined();
        expect(transferFromCall.calls[0].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferFromCall.calls[0], "account")),
        });

        // Permit2.transferFrom(funder, account, 1n, token)
        expect(transferFromCall.calls[1]).toBeDefined();
        expect(transferFromCall.calls[1].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferFromCall.calls[1], "account")),
        });

        // Check balance of account
        const balance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(balance).toBe(1n);
        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [anvilAccount.address, tokenA, account.address],
        });
        expect(allowance[0]).toBe(MAX_UINT_160);
        expect(allowance[1]).toBe(MAX_UINT_48);
    });
});
