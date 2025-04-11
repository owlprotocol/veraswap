import { describe, expect, test, beforeEach, beforeAll } from "vitest";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { connect, createConfig, http } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { mock } from "@wagmi/connectors";

import { opChainA, opChainAClient, opChainL1, opChainL1Client } from "../chains/supersim.js";

import { LOCAL_POOLS, LOCAL_TOKENS, localMockTokens } from "../constants/tokens.js";
import { Address, bytesToHex, createWalletClient, Hex, LocalAccount, padHex, parseUnits, zeroHash } from "viem";
import { getRandomValues } from "crypto";
import { IERC20 } from "../artifacts/IERC20.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { KernelFactory } from "../artifacts/KernelFactory.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { entryPoint07Address } from "viem/account-abstraction";
import { getBridgeSwapWithKernelCalls } from "./getBridgeSwapWithKernelCalls.js";
import { omit } from "lodash-es";
import { getHyperlaneMessagesFromReceipt } from "../utils/getHyperlaneMessagesFromReceipt.js";
import { relayHyperlaneMessage } from "../hyperlane/relayHyperlaneMessage.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "./getTransferRemoteWithKernelCalls.js";
import { getMailboxAddress } from "../constants/hyperlane.js";

describe("calls/getBridgeSwapWithKernelCalls.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const anvilClient = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const anvilClientRemote = createWalletClient({
        account: anvilAccount,
        chain: opChainAClient.chain,
        transport: http(),
    });

    // Mock connector to use wagmi signing
    const mockConnector = mock({
        accounts: [
            anvilAccount.address, //only works because anvil will allow RPC based signing (connector does not use in-memory pkey)
        ],
    });
    const config = createConfig({
        chains: [opChainL1, opChainA],
        transports: {
            [opChainL1.id]: http(),
            [opChainA.id]: http(),
        },
        connectors: [mockConnector],
    });
    const queryClient = new QueryClient();

    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const kernelVersion = KERNEL_V3_1;

    let kernelAddress: Address;
    let kernelInitData: Hex;
    let kernelSalt: Hex;

    const tokenA = localMockTokens[0];
    const tokenB = localMockTokens[1];
    const tokenAHypERC20Collateral = LOCAL_TOKENS[0];

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });
    });

    beforeEach(async () => {
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

        test("bridge and swap", async () => {
            const preCollateralBalance = await opChainL1Client.readContract({
                address: tokenA.address,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [tokenAHypERC20Collateral.address],
            });

            const opChainAMailbox = getMailboxAddress({ chainId: opChainA.id });
            const opL1Mailbox = getMailboxAddress({ chainId: opChainL1.id });

            const amount = parseUnits("1", tokenA.decimals);

            const bridgeParams: GetTransferRemoteWithKernelCallsParams = {
                chainId: opChainL1.id,
                token: tokenAHypERC20Collateral.address,
                tokenStandard: "HypERC20Collateral",
                account: anvilAccount.address,
                destination: opChainA.id,
                recipient: anvilAccount.address,
                amount,
                createAccount: {
                    initData: kernelInitData,
                    salt: zeroHash,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
            };

            const bridgeCall = await getTransferRemoteWithKernelCalls(queryClient, config, bridgeParams);

            // TODO: get this value better
            const tokenARemoteAddress = tokenAHypERC20Collateral.connections!.find(
                (c) => c.chainId === opChainA.id,
            )!.address;

            const bridgeReceipt = await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClient.sendTransaction(bridgeCall.calls[0]),
            });

            const [bridgeMessage] = getHyperlaneMessagesFromReceipt(bridgeReceipt);
            expect(bridgeMessage).toBeDefined();

            const emptyMetadata = "0x";

            const relayBridgeMessageHash = await relayHyperlaneMessage({
                mailboxAddress: opChainAMailbox,
                message: bridgeMessage,
                metadata: emptyMetadata,
                walletClient: anvilClientRemote,
            });

            await opChainAClient.waitForTransactionReceipt({ hash: relayBridgeMessageHash });

            const postBridgeBalance = await opChainAClient.readContract({
                address: tokenARemoteAddress,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [anvilAccount.address],
            });

            expect(postBridgeBalance).toBe(amount);

            const amountOutMinimum = 0n;
            // TODO: fix this
            const poolKey = LOCAL_POOLS[opChainL1.id][0];
            const zeroForOne = tokenA.address === poolKey.currency0;

            // Need to bridge from op chain a to op l1 since liquidity is on op l1
            const bridgeSwapCalls = await getBridgeSwapWithKernelCalls(queryClient, config, {
                chainId: opChainA.id,
                token: tokenARemoteAddress,
                tokenStandard: "HypERC20",
                account: anvilAccount.address,
                destination: opChainL1.id,
                recipient: anvilAccount.address,
                amount,
                createAccount: {
                    initData: kernelInitData,
                    salt: kernelSalt,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                createAccountRemote: {
                    initData: kernelInitData,
                    salt: kernelSalt,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: amount,
                    amountOutMinimum,
                    poolKey,
                    receiver: anvilAccount.address,
                    universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
                    zeroForOne,
                },
            });
            expect(bridgeSwapCalls.calls.length).toBe(1);
            // OwnableExecutor.executeBatchOnOwnedAccount(kernelAddress, calls)
            expect(bridgeSwapCalls.calls[0]).toBeDefined();
            expect(bridgeSwapCalls.calls[0].to).toBe(LOCAL_KERNEL_CONTRACTS.execute);

            const bridgeAndSwapReceipt = await opChainAClient.waitForTransactionReceipt({
                hash: await anvilClientRemote.sendTransaction(omit(bridgeSwapCalls.calls[0], "account")),
            });

            // Check messages have been emitted on op l1
            const [bridgeMessage2, swapMessage] = getHyperlaneMessagesFromReceipt(bridgeAndSwapReceipt);
            expect(bridgeMessage2).toBeDefined();
            expect(swapMessage).toBeDefined();

            const relayBridgeMessage2Hash = await relayHyperlaneMessage({
                mailboxAddress: opL1Mailbox,
                message: bridgeMessage2,
                metadata: emptyMetadata,
                walletClient: anvilClientRemote,
            });

            await opChainL1Client.waitForTransactionReceipt({ hash: relayBridgeMessage2Hash });

            const relaySwapMessageHash = await relayHyperlaneMessage({
                mailboxAddress: opL1Mailbox,
                message: swapMessage,
                metadata: emptyMetadata,
                walletClient: anvilClientRemote,
            });

            await opChainL1Client.waitForTransactionReceipt({ hash: relaySwapMessageHash });

            // TODO: check balance of token B on op l1
            const postCollateralBalance = await opChainL1Client.readContract({
                address: tokenB.address,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [anvilAccount.address],
            });
            expect(postCollateralBalance - preCollateralBalance).toBe(1n);
        });
    });
});
