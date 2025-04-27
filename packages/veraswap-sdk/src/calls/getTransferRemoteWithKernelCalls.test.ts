import { getRandomValues } from "crypto";

import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { mock } from "@wagmi/connectors";
import { connect, createConfig, http } from "@wagmi/core";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { getExecMode } from "@zerodev/sdk";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { CALL_TYPE, EXEC_TYPE, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { omit } from "lodash-es";
import { Address, bytesToHex, createWalletClient, encodeFunctionData, Hex, LocalAccount, padHex } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { Execute } from "../artifacts/Execute.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";
import { opChainA, opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_HYPERLANE_CONTRACTS } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { MAX_UINT_160, MAX_UINT_256 } from "../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { encodeCallArgsBatch } from "../smartaccount/ExecLib.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";
import { getSignatureExecutionData, installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { MOCK_MAILBOX_CONTRACTS, MOCK_MAILBOX_TOKENS } from "../test/constants.js";
import { processNextInboundMessage } from "../utils/MockMailbox.js";

import { getKernelFactoryCreateAccountCalls } from "./getKernelFactoryCreateAccountCalls.js";
import { getTransferRemoteWithFunderCalls } from "./getTransferRemoteWithFunderCalls.js";
import { getTransferRemoteWithKernelCalls } from "./getTransferRemoteWithKernelCalls.js";

describe("calls/getTransferRemoteWithKernelCalls.test.ts", function () {
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

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    let kernelAddress: Address;
    let kernelInitData: Hex;
    let kernelSalt: Hex;

    const tokenA = MOCK_MAILBOX_TOKENS[0].address;
    const tokenAHypERC20Collateral = MOCK_MAILBOX_TOKENS[0].hyperlaneAddress!;
    const tokenAHypERC20 = MOCK_MAILBOX_TOKENS[1].address; //Token A on "remote" opChainA

    let preCollateralBalance: bigint;
    let recipient: Address;

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(async () => {
        recipient = privateKeyToAccount(generatePrivateKey()).address;
        // Create smart account
        const ecdsaValidator = await signerToEcdsaValidator(opChainL1Client, {
            entryPoint,
            kernelVersion,
            signer: { type: "local", address: anvilAccount.address } as LocalAccount,
            validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
        });
        const kernelPluginManager = await toKernelPluginManager<"0.7">(opChainL1Client, {
            entryPoint,
            kernelVersion,
            sudo: ecdsaValidator,
            chainId: opChainL1Client.chain.id,
        });
        // Kernel `initialize` call
        kernelInitData = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: anvilAccount.address,
                    executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                }),
            ],
        });
        // KernelFactory `createAccount` call
        kernelSalt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });

        kernelAddress = getKernelAddress({
            data: kernelInitData,
            salt: kernelSalt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
        });
        // Pre collateral balance
        preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral],
        });
    });

    describe("smart account deployed", () => {
        beforeEach(async () => {
            const hash = await anvilClient.writeContract({
                address: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                abi: KernelFactory.abi,
                functionName: "createAccount",
                args: [kernelInitData, kernelSalt],
            });
            await opChainL1Client.waitForTransactionReceipt({ hash });

            const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
            expect(bytecode).toBeDefined();
        });

        test("auto", async () => {
            const transferRemoteCalls = await getTransferRemoteWithKernelCalls(queryClient, config, {
                chainId: opChainL1.id,
                token: tokenAHypERC20Collateral,
                tokenStandard: "HypERC20Collateral",
                account: anvilAccount.address,
                destination: 901,
                recipient,
                amount: 1n,
                createAccount: {
                    initData: kernelInitData,
                    salt: kernelSalt,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                contracts: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].erc7579Router,
                },
                // Pre-configure account for future calls to support execution from 901
                erc7579RouterOwners: [
                    {
                        owner: anvilAccount.address,
                        domain: 901,
                        router: LOCAL_HYPERLANE_CONTRACTS[901].erc7579Router,
                        enabled: true,
                    },
                ],
            });
            expect(transferRemoteCalls.calls.length).toBe(1);
            // OwnableExecutor.executeBatchOnOwnedAccount(kernelAddress, calls)
            expect(transferRemoteCalls.calls[0]).toBeDefined();
            expect(transferRemoteCalls.calls[0].to).toBe(LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor);

            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClient.sendTransaction(omit(transferRemoteCalls.calls[0], "account")),
            });

            // Check owner set on Executor
            const owners = await opChainL1Client.readContract({
                address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "getOwners",
                args: [kernelAddress],
            });
            expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(erc7579Router)").toContain(
                LOCAL_HYPERLANE_CONTRACTS[900].erc7579Router,
            );

            // Check owners set on 7579Router
            const isOwner = await opChainL1Client.readContract({
                address: LOCAL_HYPERLANE_CONTRACTS[900].erc7579Router,
                abi: ERC7579ExecutorRouter.abi,
                functionName: "owners",
                args: [kernelAddress, 901, LOCAL_HYPERLANE_CONTRACTS[901].erc7579Router, anvilAccount.address],
            });
            expect(isOwner, `ERC7579Router.owner(kernelAddress, 901, erc7579Router 901, owner) == true`).toBe(true);
        });

        test("manual", async () => {
            const transferRemoteCalls = await getTransferRemoteWithFunderCalls(queryClient, config, {
                chainId: opChainL1.id,
                token: tokenAHypERC20Collateral,
                tokenStandard: "HypERC20Collateral",
                account: kernelAddress,
                funder: anvilAccount.address,
                destination: 901,
                recipient,
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
            // Permit2.transferFrom(funder, account, 1n, token)
            expect(transferRemoteCalls.calls[1]).toBeDefined();
            expect(transferRemoteCalls.calls[1].to).toBe(PERMIT2_ADDRESS);
            // ERC20.approve(HypERC20Collateral, 1)
            expect(transferRemoteCalls.calls[2]).toBeDefined();
            expect(transferRemoteCalls.calls[2].to).toBe(tokenA);
            // HypERC20Collateral.transferRemote(...)
            expect(transferRemoteCalls.calls[3]).toBeDefined();
            expect(transferRemoteCalls.calls[3].to).toBe(tokenAHypERC20Collateral);

            // Execute batched calls
            const callData = encodeCallArgsBatch(transferRemoteCalls.calls);

            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClient.writeContract({
                    address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    abi: OwnableSignatureExecutor.abi,
                    functionName: "executeBatchOnOwnedAccount",
                    args: [kernelAddress, callData],
                }),
            });
        });
    });

    describe("smart account not deployed", () => {
        test("auto", async () => {
            const transferRemoteCalls = await getTransferRemoteWithKernelCalls(queryClient, config, {
                chainId: opChainL1.id,
                token: tokenAHypERC20Collateral,
                tokenStandard: "HypERC20Collateral",
                account: anvilAccount.address,
                destination: 901,
                recipient,
                amount: 1n,
                createAccount: {
                    initData: kernelInitData,
                    salt: kernelSalt,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                contracts: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: LOCAL_HYPERLANE_CONTRACTS[opChainL1.id].erc7579Router,
                },
                // Pre-configure account for future calls to support execution from 901
                erc7579RouterOwners: [
                    {
                        owner: anvilAccount.address,
                        domain: 901,
                        router: LOCAL_HYPERLANE_CONTRACTS[901].erc7579Router,
                        enabled: true,
                    },
                ],
            });
            expect(transferRemoteCalls.calls.length).toBe(1);
            // Execute.execute(...)
            expect(transferRemoteCalls.calls[0]).toBeDefined();
            expect(transferRemoteCalls.calls[0].to).toBe(LOCAL_KERNEL_CONTRACTS.execute);

            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClient.sendTransaction(omit(transferRemoteCalls.calls[0], "account")),
            });

            // Check owner set on Executor
            const owners = await opChainL1Client.readContract({
                address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                abi: OwnableSignatureExecutor.abi,
                functionName: "getOwners",
                args: [kernelAddress],
            });
            expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(erc7579Router)").toContain(
                LOCAL_HYPERLANE_CONTRACTS[900].erc7579Router,
            );

            // Check owners set on 7579Router
            const isOwner = await opChainL1Client.readContract({
                address: LOCAL_HYPERLANE_CONTRACTS[900].erc7579Router,
                abi: ERC7579ExecutorRouter.abi,
                functionName: "owners",
                args: [kernelAddress, 901, LOCAL_HYPERLANE_CONTRACTS[901].erc7579Router, anvilAccount.address],
            });
            expect(isOwner, `ERC7579Router.owner(kernelAddress, 901, erc7579Router 901, owner) == true`).toBe(true);
        });

        test("manual", async () => {
            const createAccountCalls = await getKernelFactoryCreateAccountCalls(queryClient, config, {
                chainId: opChainL1.id,
                account: anvilAccount.address,
                initData: kernelInitData,
                salt: kernelSalt,
                factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
            });
            const kernelAddress = createAccountCalls.kernelAddress;
            expect(createAccountCalls.calls.length).toBe(1);
            // KernelFactory.createAccount(...)
            expect(createAccountCalls.calls[0]).toBeDefined();
            expect(createAccountCalls.calls[0].to).toBe(LOCAL_KERNEL_CONTRACTS.kernelFactory);

            const transferRemoteCalls = await getTransferRemoteWithFunderCalls(queryClient, config, {
                chainId: opChainL1.id,
                token: tokenAHypERC20Collateral,
                tokenStandard: "HypERC20Collateral",
                account: kernelAddress,
                funder: anvilAccount.address,
                destination: 901,
                recipient,
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
            // Permit2.transferFrom(funder, account, 1n, token)
            expect(transferRemoteCalls.calls[1]).toBeDefined();
            expect(transferRemoteCalls.calls[1].to).toBe(PERMIT2_ADDRESS);
            // ERC20.approve(HypERC20Collateral, 1)
            expect(transferRemoteCalls.calls[2]).toBeDefined();
            expect(transferRemoteCalls.calls[2].to).toBe(tokenA);
            // HypERC20Collateral.transferRemote(...)
            expect(transferRemoteCalls.calls[3]).toBeDefined();
            expect(transferRemoteCalls.calls[3].to).toBe(tokenAHypERC20Collateral);

            // Execute batched calls
            const smartAccountCallData = encodeCallArgsBatch(transferRemoteCalls.calls);
            // TODO: Add helper function to create the signatureData from list of calls
            const signatureExecution = {
                account: kernelAddress,
                nonce: 0n,
                validAfter: 0,
                validUntil: 2 ** 48 - 1,
                value: 0n,
                callData: smartAccountCallData,
            };
            const signature = await anvilAccount.signTypedData(
                getSignatureExecutionData(
                    signatureExecution,
                    LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    opChainL1Client.chain.id,
                ),
            );

            const executeBatchOnOwnedAccountCall = {
                to: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                data: encodeFunctionData({
                    abi: OwnableSignatureExecutor.abi,
                    functionName: "executeBatchOnOwnedAccountWithSignature",
                    args: [signatureExecution, signature],
                }),
            };

            const deployAndExecuteCalls = encodeCallArgsBatch([
                ...createAccountCalls.calls,
                executeBatchOnOwnedAccountCall,
            ]);

            // Execute batch
            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClient.writeContract({
                    address: LOCAL_KERNEL_CONTRACTS.execute,
                    abi: Execute.abi,
                    functionName: "execute",
                    args: [
                        getExecMode({ callType: CALL_TYPE.BATCH, execType: EXEC_TYPE.DEFAULT }),
                        deployAndExecuteCalls,
                    ],
                }),
            });
        });
    });

    afterEach(async () => {
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
            args: [recipient],
        });
        expect(hypERC20Balance).toBe(1n);

        const bytecode = await opChainL1Client.getCode({ address: kernelAddress });
        expect(bytecode, "smart account deployed").toBeDefined();

        const owners = await opChainL1Client.readContract({
            address: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [kernelAddress],
        });
        expect(owners, "OwnableExecutor.getOwners(kernelAddress).includes(owner)").toContain(anvilAccount.address);

        const hypERC20CollateralAllowance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [kernelAddress, tokenAHypERC20Collateral],
        });
        expect(hypERC20CollateralAllowance, "ERC20(tokenA).allowance(kernelAddress, tokenACollateral) == max").toBe(
            MAX_UINT_256,
        );

        const permit2Allowance = await opChainL1Client.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [anvilAccount.address, tokenA, kernelAddress],
        });
        expect(permit2Allowance[0], "Permit2.allowance(funder, token, kernelAddress) == max").toBe(MAX_UINT_160);
    });
});
