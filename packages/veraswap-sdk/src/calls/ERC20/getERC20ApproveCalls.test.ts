import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { omit } from "lodash-es";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeEach, describe, expect, test } from "vitest";

import { IERC20 } from "../../artifacts/IERC20.js";
import { MockERC20 } from "../../artifacts/MockERC20.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { MAX_UINT_256 } from "../../constants/uint256.js";
import { getUniswapV4Address } from "../../currency/currency.js";

import { getERC20ApproveCalls } from "./getERC20ApproveCalls.js";

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
    test("approve minAmount", async () => {
        // Approve from account to spender
        const approveCall = await getERC20ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAAddress,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
        });
        expect(approveCall.allowance).toBe(0n);
        expect(approveCall.calls.length).toBe(1);

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approveCall.calls[0]).toBeDefined();
        expect(approveCall.calls[0].to).toBe(tokenAAddress);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approveCall.calls[0], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: tokenAAddress,
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
            token: tokenAAddress,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveAmount: "MAX_UINT_256",
        });
        expect(approveCall.allowance).toBe(0n);
        expect(approveCall.calls.length).toBe(1);

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approveCall.calls[0]).toBeDefined();
        expect(approveCall.calls[0].to).toBe(tokenAAddress);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(approveCall.calls[0], "account")),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: tokenAAddress,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account.address, spender.address],
        });
        expect(allowance).toBe(MAX_UINT_256);
    });
});
