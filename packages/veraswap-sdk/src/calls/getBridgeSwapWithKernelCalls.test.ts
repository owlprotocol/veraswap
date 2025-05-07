import { getRandomValues } from "crypto";

import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { mock } from "@wagmi/connectors";
import { connect, createConfig, http } from "@wagmi/core";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { omit } from "lodash-es";
import { Address, bytesToHex, createWalletClient, Hex, LocalAccount, padHex, parseEther } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IERC20 } from "../artifacts/IERC20.js";
import { MockMailbox } from "../artifacts/MockMailbox.js";
import { opChainA, opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_HYPERLANE_CONTRACTS } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { LOCAL_POOLS } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { MOCK_MAILBOX_CONTRACTS, MOCK_MAILBOX_TOKENS } from "../test/constants.js";
import { poolKeysToPathExactIn } from "../types/PoolKey.js";
import { processNextInboundMessage } from "../utils/MockMailbox.js";

import { getBridgeSwapWithKernelCalls } from "./getBridgeSwapWithKernelCalls.js";
import { getTransferRemoteWithApproveCalls } from "./getTransferRemoteWithApproveCalls.js";

//TODO: Test With MockMailbox, No Deployed Kernel
describe("calls/getBridgeSwapWithKernelCalls.test.ts", function () {
    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
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

    let kernelAddressL1: Address;
    let kernelInitDataL1: Hex;
    let kernelAddressOpA: Address;
    let kernelInitDataOpA: Hex;
    let kernelSalt: Hex;

    const tokenA = MOCK_MAILBOX_TOKENS[0].address; // ERC20 on L1 with A/B Uniswap Pool
    const tokenAHypERC20Collateral = MOCK_MAILBOX_TOKENS[0].hyperlaneAddress!; // HypERC20Collateral on L1
    const tokenAHypERC20 = MOCK_MAILBOX_TOKENS[1]; //Token A on "remote" opChainA
    const tokenB = MOCK_MAILBOX_TOKENS[2].address; // ERC20 on L1 with A/B Uniswap Pool

    let preCollateralBalance: bigint;
    let recipient: Address;

    beforeAll(async () => {
        await connect(config, {
            chainId: opChainL1.id,
            connector: mockConnector,
        });

        // Bridge TokenA L1 -> OPA (as we will be doing the reverse later)
        const transferRemoteCalls = await getTransferRemoteWithApproveCalls(queryClient, config, {
            chainId: opChainL1.id,
            token: tokenAHypERC20Collateral,
            tokenStandard: "HypERC20Collateral",
            account: anvilAccount.address,
            destination: 901,
            recipient: anvilAccount.address,
            amount: parseEther("100"),
            approveAmount: "MAX_UINT_256",
        });
        for (const call of transferRemoteCalls.calls) {
            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClientL1.sendTransaction(call),
            });
        }

        // Process Hyperlane Message
        await opChainL1Client.waitForTransactionReceipt({
            hash: await anvilClientL1.writeContract({
                address: MOCK_MAILBOX_CONTRACTS[opChainA.id].mailbox,
                abi: MockMailbox.abi,
                functionName: "processNextInboundMessage",
            }),
        });

        const balance = await opChainL1Client.readContract({
            address: tokenAHypERC20.address,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        expect(balance).toBeGreaterThanOrEqual(parseEther("100"));
    });

    beforeEach(async () => {
        recipient = privateKeyToAccount(generatePrivateKey()).address;
        // KernelFactory `createAccount` call salt
        kernelSalt = padHex(bytesToHex(getRandomValues(new Uint8Array(32))), { size: 32 });

        // ECDSA Validator & Plugin Manager same for both "chains"
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
        // Create smart account L1
        kernelInitDataL1 = await getKernelInitData({
            kernelPluginManager: kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: anvilAccount.address,
                    executor: MOCK_MAILBOX_CONTRACTS[opChainL1.id].ownableSignatureExecutor,
                }),
            ],
        });
        kernelAddressL1 = getKernelAddress({
            data: kernelInitDataL1,
            salt: kernelSalt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: MOCK_MAILBOX_CONTRACTS[opChainL1.id].kernelFactory,
        });
        // Create smart account OpA
        kernelInitDataOpA = await getKernelInitData({
            kernelPluginManager,
            initHook: false,
            initConfig: [
                installOwnableExecutor({
                    owner: anvilAccount.address,
                    executor: MOCK_MAILBOX_CONTRACTS[opChainA.id].ownableSignatureExecutor,
                }),
            ],
        });
        kernelAddressOpA = getKernelAddress({
            data: kernelInitDataOpA,
            salt: kernelSalt,
            implementation: LOCAL_KERNEL_CONTRACTS.kernel,
            factoryAddress: MOCK_MAILBOX_CONTRACTS[opChainA.id].kernelFactory,
        });
        // Pre collateral balance
        preCollateralBalance = await opChainL1Client.readContract({
            address: tokenA,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [tokenAHypERC20Collateral],
        });
    });

    describe("smart account not deployed", () => {
        test("bridge and swap", async () => {
            // Bridge Swap => opChainA -> opChainL1
            const amountOutMinimum = 0n;
            // TODO: fix this
            const poolKey = LOCAL_POOLS[opChainL1.id][0];
            const zeroForOne = tokenA === poolKey.currency0;

            const amount = parseEther("1");

            const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
            const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0;

            const path = poolKeysToPathExactIn(currencyIn, [poolKey]);

            // Bridge Swap => opChainA -> opChainL1
            const bridgeSwapCalls = await getBridgeSwapWithKernelCalls(queryClient, config, {
                chainId: opChainL1.id, //"opChainA" but we use are mocking on L1 for now
                token: tokenAHypERC20.address,
                tokenStandard: "HypERC20",
                tokenOutStandard: "HypERC20Collateral",
                account: anvilAccount.address,
                destination: opChainL1.id,
                recipient,
                amount,
                contracts: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: MOCK_MAILBOX_CONTRACTS[opChainA.id].ownableSignatureExecutor,
                    erc7579Router: MOCK_MAILBOX_CONTRACTS[opChainA.id].erc7579Router,
                    interchainGasPaymaster: LOCAL_HYPERLANE_CONTRACTS[opChainA.id].mockInterchainGasPaymaster,
                },
                contractsRemote: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: MOCK_MAILBOX_CONTRACTS[opChainL1.id].ownableSignatureExecutor,
                    erc7579Router: MOCK_MAILBOX_CONTRACTS[opChainL1.id].erc7579Router,
                },
                createAccount: {
                    initData: kernelInitDataOpA,
                    salt: kernelSalt,
                    factoryAddress: MOCK_MAILBOX_CONTRACTS[opChainA.id].kernelFactory,
                },
                createAccountRemote: {
                    initData: kernelInitDataL1,
                    salt: kernelSalt,
                    factoryAddress: MOCK_MAILBOX_CONTRACTS[opChainL1.id].kernelFactory,
                },
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: amount,
                    amountOutMinimum,
                    currencyIn,
                    currencyOut,
                    path,
                    receiver: recipient,
                    universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
                },
            });
            expect(bridgeSwapCalls.calls.length).toBe(1);
            expect(bridgeSwapCalls.calls[0]).toBeDefined();
            expect(bridgeSwapCalls.calls[0].to).toBe(LOCAL_KERNEL_CONTRACTS.execute);

            // 1. Send transaction on OpA
            // On chainA technically but here we are mocking with MockMailbox
            await opChainL1Client.waitForTransactionReceipt({
                hash: await anvilClientL1.sendTransaction(omit(bridgeSwapCalls.calls[0], "account")),
            });
            await expect(
                opChainL1Client.getCode({ address: kernelAddressOpA }),
                "smart account deployed on opChainA",
            ).resolves.toBeDefined();

            // 2. Process Bridge Message on L1
            // Messages get sent to opChainL1 Mailbox
            await processNextInboundMessage(anvilClientL1, { mailbox: MOCK_MAILBOX_CONTRACTS[opChainL1.id].mailbox });
            // unlocked collateral
            const postCollateralBalance = await opChainL1Client.readContract({
                address: tokenA,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [tokenAHypERC20Collateral],
            });
            expect(postCollateralBalance - preCollateralBalance).toBe(-amount);
            // ERC20 balance of kernel on L1
            const tokenABalancePostBridge = await opChainL1Client.readContract({
                address: tokenA,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [kernelAddressL1],
            });
            expect(tokenABalancePostBridge).toBe(parseEther("1"));

            // 3. Process Swap Message on L1
            const receipt = await processNextInboundMessage(anvilClientL1, {
                mailbox: MOCK_MAILBOX_CONTRACTS[opChainL1.id].mailbox,
            });

            const roundedGas = ((receipt.gasUsed + 49999n) / 50000n) * 50000n;
            expect(roundedGas).toBeGreaterThanOrEqual(800_000n);
            expect(roundedGas).toBeLessThanOrEqual(1_000_000n);

            const tokenABalancePostSwap = await opChainL1Client.readContract({
                address: tokenA,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [kernelAddressL1],
            });
            expect(tokenABalancePostSwap).toBe(0n);
            const tokenBBalancePostSwap = await opChainL1Client.readContract({
                address: tokenB,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [recipient],
            });
            expect(tokenBBalancePostSwap).toBeGreaterThan(0n);

            // TODO: check balance of token B on op l1

            //TODO: Replay of test fails => because of pending message on mailbox
            /*
            const postCollateralBalance = await opChainL1Client.readContract({
                address: tokenB.address,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [anvilAccount.address],
            });
            expect(postCollateralBalance - preCollateralBalance).toBe(1n);
            */
        });
    });
});
