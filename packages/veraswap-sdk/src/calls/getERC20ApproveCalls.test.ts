import { describe, expect, test, beforeEach } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { omit } from "lodash-es";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

import { localMockTokens } from "../constants/tokens.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { getERC20ApproveCalls } from "./getERC20ApproveCalls.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { MAX_UINT_256 } from "../constants/uint256.js";

describe("calls/getERC20ApproveCall.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    let account: Account;
    let accountClient: WalletClient<Transport, Chain, Account>;
    let spender: Account;

    const tokenA = localMockTokens[0];

    beforeEach(async () => {
        const anvilAccount = getAnvilAccount();
        const anvilClient = createWalletClient({
            account: anvilAccount,
            chain: opChainL1Client.chain,
            transport: http(),
        });

        account = privateKeyToAccount(generatePrivateKey());
        accountClient = createWalletClient({
            account,
            chain: opChainL1Client.chain,
            transport: http(),
        });
        spender = privateKeyToAccount(generatePrivateKey());
        // Fund account with Ether
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction({
                to: account.address,
                value: parseEther("1"),
            }),
        });
        // Fund account with Token A
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: tokenA.address,
                abi: MockERC20.abi,
                functionName: "mint",
                args: [account.address, parseEther("100")],
            }),
        });
    });
    test("approve minAmount", async () => {
        // Approve from account to spender
        const approveCall = await getERC20ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
        });
        expect(approveCall.allowance).toBe(0n);
        expect(approveCall.calls.length).toBe(1);

        // Send from account `IAllowance.approve(token, spender, approveAmount, approveExpiration)`
        expect(approveCall.calls[0]).toBeDefined();
        expect(approveCall.calls[0].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approveCall.calls[0], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account.address, spender.address],
        });
        expect(allowance).toBe(1n);
    });

    test("approve MAX_UINT_256", async () => {
        // Approve from account to spender
        const approveCall = await getERC20ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveAmount: "MAX_UINT_256",
        });
        expect(approveCall.allowance).toBe(0n);
        expect(approveCall.calls.length).toBe(1);

        // Send from account `IAllowance.approve(token, spender, approveAmount, approveExpiration)`
        expect(approveCall.calls[0]).toBeDefined();
        expect(approveCall.calls[0].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approveCall.calls[0], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account.address, spender.address],
        });
        expect(allowance).toBe(MAX_UINT_256);
    });
});
