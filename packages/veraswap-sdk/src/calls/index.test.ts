import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, getBalance, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { getBalanceQueryOptions } from "wagmi/query";
import { mock } from "@wagmi/connectors";

import { opChainL1, opChainL1Client } from "../chains/supersim.js";

import { getTransferRemoteCalls, getTransferRemoteWithApprovalCalls } from "./getTransferRemoteCalls.js";
import { LOCAL_TOKENS, localMockTokens } from "../constants/tokens.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Account, Chain, createWalletClient, parseEther, Transport, WalletClient } from "viem";
import { IERC20 } from "../artifacts/IERC20.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { getERC20ApproveCalls } from "./getERC20ApproveCalls.js";
import { getERC20TransferFromCalls } from "./getERC20TransferFromCalls.js";
import { getPermit2ApproveCalls } from "./getPermit2ApproveCalls.js";
import { getPermit2PermitCalls } from "./getPermit2PermitCalls.js";

describe("calls/index.test.ts", function () {
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
    const tokenAHypERC20Collateral = LOCAL_TOKENS[0];

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

    test("getBalance", async () => {
        // Example test fetching balance in 3 ways

        // viem
        const viemResult = await opChainL1Client.getBalance({
            address: anvilAccount.address,
        });
        // wagmi/core: calls viem via global config, accepts chainId as parameter
        const wagmiResult = await getBalance(config, { chainId: opChainL1.id, address: anvilAccount.address });
        expect(wagmiResult.value).toBe(viemResult);
        // tanstack/query: call wagmi/core logic via queryOptions supporting custom caching logic
        const queryResult = await queryClient.fetchQuery(
            getBalanceQueryOptions(config, { chainId: opChainL1.id, address: anvilAccount.address }),
        );
        expect(queryResult.value).toBe(viemResult);
    });

    test("getTransferRemoteCalls", async () => {
        const preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });

        // Approve account as spender
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.writeContract({
                address: tokenA.address,
                abi: IERC20.abi,
                functionName: "approve",
                args: [account.address, 1n],
            }),
        });

        // Approve from anvilAccount to account
        const transferRemoteCalls = await getTransferRemoteCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral.address,
            tokenStandard: "HypERC20Collateral",
            account: account.address,
            funder: anvilAccount.address,
            destination: 901,
            recipient: account.address,
            amount: 1n,
        });
        expect(transferRemoteCalls.calls.length).toBe(3);

        // ERC20.transferFrom(anvilAccount, account, 1)
        expect(transferRemoteCalls.calls[0].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(transferRemoteCalls.calls[0]),
        });
        const balanceAccount = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account.address],
        });
        expect(balanceAccount).toBe(1n);

        // ERC20.approve(HypERC20Collateral, 1)
        expect(transferRemoteCalls.calls[1].to).toBe(tokenA.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(transferRemoteCalls.calls[1]),
        });
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account.address, tokenAHypERC20Collateral.address],
        });
        expect(allowance).toBe(1n);

        // HypERC20Collateral.transferRemote()
        expect(transferRemoteCalls.calls[2].to).toBe(tokenAHypERC20Collateral.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(transferRemoteCalls.calls[2]),
        });
        const postCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });
        expect(postCollateralBalance - preCollateralBalance).toBe(1n);
    });

    test("getTransferRemoteWithApprovalCalls", async () => {
        const preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });

        // Approve from anvilAccount to account
        const transferRemoteCalls = await getTransferRemoteWithApprovalCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral.address,
            tokenStandard: "HypERC20Collateral",
            account: anvilAccount.address,
            destination: 901,
            recipient: account.address,
            amount: 1n,
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
        expect(allowance).toBe(1n);

        // HypERC20Collateral.transferRemote()
        expect(transferRemoteCalls.calls[1].to).toBe(tokenAHypERC20Collateral.address);
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(transferRemoteCalls.calls[1]),
        });
        const postCollateralBalance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral.address],
        });
        expect(postCollateralBalance - preCollateralBalance).toBe(1n);
    });

    test("getPermit2ApprovalCall", async () => {
        // Approve from anvilAccount to account
        const approvePermit2Call = await getPermit2ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: anvilAccount.address,
            spender: account.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });

        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls[0]).toBeDefined();
        // Transfer using regular approval
        expect(approvePermit2Call.calls[0].to).toBe(PERMIT2_ADDRESS);
        // Send from anvilAccount `IAllowance.approve(token, account, approveAmount, approveExpiration)`
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(approvePermit2Call.calls[0]),
        });

        // Check balance of account
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [anvilAccount.address, tokenA.address, account.address],
        });
        expect(allowance[0]).toBe(1n);
    });

    test("getPermit2PermitCall", async () => {
        // Approve from anvilAccount to account
        const approvePermit2Call = await getPermit2PermitCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: anvilAccount.address,
            spender: account.address,
            minAmount: 1n,
            approveExpiration: Date.now() + 24 * 60 * 60,
        });

        expect(approvePermit2Call.allowance).toBe(0n);
        expect(approvePermit2Call.calls[0]).toBeDefined();
        // Transfer using regular approval
        expect(approvePermit2Call.calls[0].to).toBe(PERMIT2_ADDRESS);
        // Send from account `IAllowance.permit(anvilAccount, permitDetails, signature)` (signature enables any sender to set the allowance)
        await opChainL1Client.waitForTransactionReceipt({
            hash: await accountClient.sendTransaction(approvePermit2Call.calls[0]),
        });

        // Check balance of account
        const allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [anvilAccount.address, tokenA.address, account.address],
        });
        expect(allowance[0]).toBe(1n);
    });

    test("getApprovalCall", async () => {
        // Approve from anvilAccount to account
        const approveCall = await getERC20ApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenA.address,
            account: anvilAccount.address,
            spender: account.address,
            minAmount: 1n,
        });

        expect(approveCall.allowance).toBe(0n);
        expect(approveCall.calls[0]).toBeDefined();
        // Transfer using regular approval
        expect(approveCall.calls[0].to).toBe(tokenA.address);

        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClient.sendTransaction(approveCall.calls[0]),
        });

        // Check balance of account
        const allowance = await opChainL1Client.readContract({
            address: tokenA.address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [anvilAccount.address, account.address],
        });
        expect(allowance).toBe(1n);
    });

    test("getTransferFromCall", async () => {
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
        expect(transferFromCall.calls[0]).toBeDefined();
        // Transfer using regular approval
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
