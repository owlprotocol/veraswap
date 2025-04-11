import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { mock } from "@wagmi/connectors";

import { opChainA, opChainL1, opChainL1Client } from "../chains/supersim.js";

import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { IERC20 } from "../artifacts/IERC20.js";
import { omit } from "lodash-es";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { MOCK_MAILBOX_TOKENS, MOCK_MAILBOX_CONTRACTS, mockMailboxMockERC20Tokens } from "../test/constants.js";

describe("calls/getTransferRemoteCalls.test.ts", function () {
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

    test("getTransferRemoteCalls", async () => {
        // locked collateral
        const preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });

        const transferRemoteCalls = await getTransferRemoteWithFunderCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral.address,
            tokenStandard: "HypERC20Collateral",
            account: account.address,
            funder: anvilAccount.address,
            destination: 901,
            recipient: account.address,
            amount: 1n,
            approveAmount: "MAX_UINT_256",
            permit2: {
                approveExpiration: "MAX_UINT_48",
                approveAmount: "MAX_UINT_160",
            },
        });
        expect(transferRemoteCalls.calls.length).toBe(4);

        // Permit2.permit(funder, permitSingle, signature)
        expect(transferRemoteCalls.calls[0]).toBeDefined();
        expect(transferRemoteCalls.calls[0].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferRemoteCalls.calls[0], "account")),
        });

        // Permit2.transferFrom(funder, account, 1n, token)
        expect(transferRemoteCalls.calls[1]).toBeDefined();
        expect(transferRemoteCalls.calls[1].to).toBe(PERMIT2_ADDRESS);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferRemoteCalls.calls[1], "account")),
        });
        const balanceAccount = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(balanceAccount).toBe(1n);

        // ERC20.approve(HypERC20Collateral, 1)
        expect(transferRemoteCalls.calls[2]).toBeDefined();
        expect(transferRemoteCalls.calls[2].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferRemoteCalls.calls[2], "account")),
        });
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account.address, tokenAHypERC20Collateral.address],
        });
        expect(allowance).toBe(MAX_UINT_256);

        // HypERC20Collateral.transferRemote(...)
        expect(transferRemoteCalls.calls[3]).toBeDefined();
        expect(transferRemoteCalls.calls[3].to).toBe(tokenAHypERC20Collateral.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(omit(transferRemoteCalls.calls[3], "account")),
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
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox,
                abi: MockMailbox.abi,
                functionName: "processNextInboundMessage",
            }),
        });

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
