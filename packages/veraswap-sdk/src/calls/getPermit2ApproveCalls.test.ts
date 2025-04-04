import { describe, expect, test, beforeEach } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

import { localMockTokens } from "../constants/tokens.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { getPermit2ApproveCalls } from "./getPermit2ApproveCalls.js";
import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import { MockERC20 } from "../artifacts/MockERC20.js";

describe("calls/getPermit2ApproveCall.test.ts", function () {
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

    test("getPermit2ApproveCalls - PERMIT2 NOT approved", async () => {
        // Approve from account to spender
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(2);

        // Approve PERMIT2 `IERC20.approve(PERMIT2_ADDRESS, 1)`
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(approvePermit2Call.calls[0]),
        });

        // Send from account `IAllowance.approve(token, spender, approveAmount, approveExpiration)`
        expect(approvePermit2Call.calls[1]).toBeDefined();
        expect(approvePermit2Call.calls[1].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(approvePermit2Call.calls[1]),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenA.address, spender.address],
        });
        expect(allowance[0]).toBe(1n);
    });

    test("getPermit2ApproveCalls - PERMIT2 Already approved", async () => {
        // Approve PERMIT2 with MAX_UINT256
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.writeContract({
                address: tokenA.address,
                abi: IERC20.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS, 2n ** 256n - 1n],
            }),
        });

        // Approve from account to spender
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(1);

        // Send from account `IAllowance.approve(token, spender, approveAmount, approveExpiration)`
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(approvePermit2Call.calls[0]),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenA.address, spender.address],
        });
        expect(allowance[0]).toBe(1n);
    });
});
