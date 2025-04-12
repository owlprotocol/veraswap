import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { mock } from "@wagmi/connectors";

import { opChainA, opChainL1, opChainL1Client } from "../chains/supersim.js";

import { MOCK_MAILBOX_CONTRACTS, MOCK_MAILBOX_TOKENS, mockMailboxMockERC20Tokens } from "../test/constants.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, createWalletClient, parseEther } from "viem";
import { IERC20 } from "../artifacts/IERC20.js";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { getTransferRemoteWithApproveCalls } from "./getTransferRemoteWithApproveCalls.js";
import { processNextInboundMessage } from "../utils/MockMailbox.js";

describe("calls/getTransferRemoteWithApproveCalls.test.ts", function () {
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

    const tokenA = mockMailboxMockERC20Tokens[0];
    const tokenAHypERC20Collateral = MOCK_MAILBOX_TOKENS[0];
    const tokenAHypERC20 = MOCK_MAILBOX_TOKENS[1]; //Token A on "remote" opChainA

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(async () => {
        account = privateKeyToAccount(generatePrivateKey());
        // Fund account
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction({
                to: account.address,
                value: parseEther("1"),
            }),
        });
    });

    test("getTransferRemoteWithApproveCalls", async () => {
        // locked collateral
        const preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });

        // Approve from anvilAccount to account
        const transferRemoteCalls = await getTransferRemoteWithApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral.address,
            tokenStandard: "HypERC20Collateral",
            account: anvilAccount.address,
            destination: 901,
            recipient: account.address,
            amount: 1n,
            approveAmount: "MAX_UINT_256",
        });

        expect(transferRemoteCalls.calls.length).toBe(2);
        // ERC20.approve(HypERC20Collateral, 1)
        expect(transferRemoteCalls.calls[0].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(transferRemoteCalls.calls[0]),
        });
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [anvilAccount.address, tokenAHypERC20Collateral.address],
        });
        expect(allowance).toBe(MAX_UINT_256);

        // HypERC20Collateral.transferRemote()
        expect(transferRemoteCalls.calls[1].to).toBe(tokenAHypERC20Collateral.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(transferRemoteCalls.calls[1]),
        });
        // locked collateral
        const postCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });
        expect(postCollateralBalance - preCollateralBalance).toBe(1n);

        // Process Hyperlane Message
        await processNextInboundMessage(anvilClient, { mailbox: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox });

        // hypERC20 balance of recipient
        const hypERC20Balance = await opChainL1Client.readContract({
            address: tokenAHypERC20.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(hypERC20Balance).toBe(1n);
    });
});
