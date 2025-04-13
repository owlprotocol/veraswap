import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http, mock } from "@wagmi/core";
import { Account, createWalletClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IAllowanceTransfer } from "../../artifacts/IAllowanceTransfer.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { localMockTokens } from "../../constants/tokens.js";
import { MAX_UINT_160 } from "../../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";

import { getPermit2PermitCalls } from "./getPermit2PermitCalls.js";

describe("calls/getPermit2PermitCall.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const anvilClient = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    // Mock connector to use wagmi signing
    const mockConnector = mock({
        accounts: [
            //only works because anvil will allow RPC based signing (connector does not use in-memory pkey)
            getAnvilAccount(1).address,
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

    // Have to use anvil account for the mock connector
    const account = getAnvilAccount(1);
    const accountClient = createWalletClient({
        account,
        chain: opChainL1Client.chain,
        transport: http(),
    });
    let spender: Account;

    const tokenA = localMockTokens[0];

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(() => {
        spender = privateKeyToAccount(generatePrivateKey());
    });

    test("PERMIT2 Already approved, approve minAmount", async () => {
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
        const approvePermit2Call = await getPermit2PermitCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
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
            // Transaction sent from anvil account but works because of signature
            hash: await anvilClient.sendTransaction(approvePermit2Call.calls[0]),
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

    test("PERMIT2 Already approved, approve MAX_UINT_160", async () => {
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
        const approvePermit2Call = await getPermit2PermitCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: account.address,
            spender: spender.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
            approveAmount: "MAX_UINT_160",
        });
        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls.length).toBe(1);

        // Permit2.approve(token, spender, approveAmount, approveExpiration)
        expect(approvePermit2Call.calls[0]).toBeDefined();
        expect(approvePermit2Call.calls[0].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            // Transaction sent from anvil account but works because of signature
            hash: await anvilClient.sendTransaction(approvePermit2Call.calls[0]),
        });

        // Check allowance of spender
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account.address, tokenA.address, spender.address],
        });
        expect(allowance[0]).toBe(MAX_UINT_160);
    });
});
