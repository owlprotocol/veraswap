import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { mock } from "@wagmi/connectors";
import { connect, createConfig, http } from "@wagmi/core";
import { Account, createWalletClient, parseEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IERC20 } from "../artifacts/IERC20.js";
import { opChainA, opChainL1, opChainL1Client } from "../chains/supersim.js";
import { MOCK_MAILBOX_CONTRACTS, MOCK_MAILBOX_TOKENS } from "../test/constants.js";
import { processNextInboundMessage } from "../utils/MockMailbox.js";

import { getTransferRemoteWithApproveCalls } from "./getTransferRemoteWithApproveCalls.js";

//TODO: Re-enable, fails due to interactions with other tests
describe.skip("calls/getTransferRemoteWithApproveCalls.test.ts", function () {
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

    const tokenA = MOCK_MAILBOX_TOKENS[0].address;
    const tokenAHypERC20Collateral = MOCK_MAILBOX_TOKENS[0].hyperlaneAddress!;
    const tokenAHypERC20 = MOCK_MAILBOX_TOKENS[1].address; //Token A on "remote" opChainA

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
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral],
        });

        // Approve from anvilAccount to account
        const transferRemoteCalls = await getTransferRemoteWithApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral,
            tokenStandard: "HypERC20Collateral",
            account: anvilAccount.address,
            destination: 901,
            recipient: account.address,
            amount: 1n,
            approveAmount: "MAX_UINT_256",
        });

        // ERC20 already approved
        expect(transferRemoteCalls.calls.length).toBe(1);

        //TODO: Add test with non anvil(0)
        /*
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
        */

        // HypERC20Collateral.transferRemote()
        expect(transferRemoteCalls.calls[0].to).toBe(tokenAHypERC20Collateral);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(transferRemoteCalls.calls[0]),
        });
        // locked collateral
        const postCollateralBalance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral],
        });
        expect(postCollateralBalance - preCollateralBalance).toBe(1n);

        // Process Hyperlane Message
        await processNextInboundMessage(anvilClient, { mailbox: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox });

        // hypERC20 balance of recipient
        const hypERC20Balance = await opChainL1Client.readContract({
            address: tokenAHypERC20,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(hypERC20Balance).toBe(1n);
    });
});
