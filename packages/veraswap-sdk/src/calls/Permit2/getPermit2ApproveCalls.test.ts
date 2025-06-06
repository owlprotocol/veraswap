import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { omit } from "lodash-es";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeEach, describe, expect, test } from "vitest";

import { IAllowanceTransfer } from "../../artifacts/IAllowanceTransfer.js";
import { MockERC20 } from "../../artifacts/MockERC20.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { MAX_UINT_160 } from "../../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";
import { getUniswapV4Address } from "../../currency/currency.js";

import { getPermit2ApproveCalls } from "./getPermit2ApproveCalls.js";

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

    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);

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
                address: tokenAAddress,
                abi: MockERC20.abi,
                functionName: "mint",
                args: [account.address, parseEther("100")],
            }),
        });
    });

    test("PERMIT2 NOT approved, approve minAmount", async () => {
        // Approve from account to spender
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAAddress,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(2);

        // ERC20.approve(PERMIT2_ADDRESS, 1)
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(tokenAAddress);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approvePermit2Call.calls[0], "account")),
        });

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approvePermit2Call.calls[1]).toBeDefined();
        expect(approvePermit2Call.calls[1].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approvePermit2Call.calls[1], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenAAddress, spender.address],
        });
        expect(allowance[0]).toBe(1n);
    });

    test("PERMIT2 NOT approved, approve MAX_UINT_160", async () => {
        // Approve from account to spender
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAAddress,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
            approveAmount: "MAX_UINT_160",
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(2);

        // ERC20.approve(PERMIT2_ADDRESS, 1)
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(tokenAAddress);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approvePermit2Call.calls[0], "account")),
        });

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approvePermit2Call.calls[1]).toBeDefined();
        expect(approvePermit2Call.calls[1].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approvePermit2Call.calls[1], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenAAddress, spender.address],
        });
        expect(allowance[0]).toBe(MAX_UINT_160);
    });

    test("PERMIT2 Already approved, approve minAmount", async () => {
        // Approve PERMIT2 with MAX_UINT256
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.writeContract({
                address: tokenAAddress,
                abi: IERC20.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS, 2n ** 256n - 1n],
            }),
        });

        // Approve from account to spender
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAAddress,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(1);

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approvePermit2Call.calls[0], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenAAddress, spender.address],
        });
        expect(allowance[0]).toBe(1n);
    });
});
