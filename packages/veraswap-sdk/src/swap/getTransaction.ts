import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, Hex, zeroHash } from "viem";

import {
    getBridgeSwapWithKernelCalls,
    GetBridgeSwapWithKernelCallsParams,
} from "../calls/getBridgeSwapWithKernelCalls.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "../calls/getTransferRemoteWithKernelCalls.js";
import { LOCAL_HYPERLANE_CONTRACTS } from "../constants/hyperlane.js";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import { OrbiterParams } from "../types/OrbiterParams.js";
import {
    TransactionTypeBridge,
    TransactionTypeBridgeSwap,
    TransactionTypeSwap,
    TransactionTypeSwapBridge,
} from "../utils/getTransactionType.js";

import { getSwapAndHyperlaneSweepBridgeTransaction } from "./getSwapAndHyperlaneSweepBridgeTransaction.js";
import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";
import { getTransferRemoteCall } from "./getTransferRemoteCall.js";

export interface TransactionSwapOptions {
    amountIn: bigint;
    amountOutMinimum: bigint;
}

export interface TransactionBridgeOptions {
    amountIn: bigint;
    walletAddress: Address;
    bridgePayment: bigint;
    orbiterParams?: OrbiterParams;
    initData?: Hex;
    queryClient?: QueryClient;
    wagmiConfig?: Config;
}

export interface TransactionBridgeHyperlaneCollateralOptions {
    amountIn: bigint;
    walletAddress: Address;
    bridgePayment?: bigint;
    orbiterParams?: OrbiterParams;
    initData: Hex;
    queryClient: QueryClient;
    wagmiConfig: Config;
}

export interface TransactionBridgeOrbiterOptions {
    amountIn: bigint;
    walletAddress: Address;
    orbiterParams?: OrbiterParams;
    // TODO: maybe calculate total amount in to pay and pass it as bridge payment
    // Keeping it for type consistency
    bridgePayment?: bigint;
    initData?: Hex;
    queryClient?: QueryClient;
    wagmiConfig?: Config;
}

export interface TransactionSwapBridgeOptions {
    amountIn: bigint;
    amountOutMinimum: bigint;
    bridgePayment: bigint;
    walletAddress: Address;
    uniswapContracts: Record<number, { UNIVERSAL_ROUTER: Address }>;
}

export interface TransactionBridgeSwapOptions {
    queryClient: QueryClient;
    wagmiConfig: Config;
    walletAddress: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    initData: Hex;
    orbiterParams?: OrbiterParams;
    orbiterAmountOut?: bigint;
}

export type TransactionParams =
    | (TransactionTypeSwap & TransactionSwapOptions)
    | (TransactionTypeBridge & TransactionBridgeOptions)
    | (TransactionTypeBridge & TransactionBridgeOrbiterOptions)
    | (TransactionTypeBridge & TransactionBridgeHyperlaneCollateralOptions)
    | (TransactionTypeSwapBridge & TransactionSwapBridgeOptions)
    | (TransactionTypeBridgeSwap & TransactionBridgeSwapOptions);

export async function getTransaction(
    params: TransactionParams,
    constants?: { uniswapContracts: Record<number, { universalRouter: Address }> },
): Promise<{ to: Address; data: Hex; value: bigint } | null> {
    const uniswapContracts = constants?.uniswapContracts ?? UNISWAP_CONTRACTS;

    switch (params.type) {
        case "SWAP": {
            const { tokenIn, poolKey, zeroForOne, amountIn, amountOutMinimum } = params;
            return getSwapExactInExecuteData({
                universalRouter: uniswapContracts[tokenIn.chainId].universalRouter,
                poolKey,
                zeroForOne,
                amountIn,
                amountOutMinimum,
            });
        }

        case "BRIDGE": {
            const { tokenIn, tokenOut, amountIn, walletAddress, orbiterParams } = params;

            if (tokenIn.standard === "NativeToken" && tokenOut.standard === "NativeToken") {
                if (!orbiterParams) {
                    throw new Error("Orbiter params are required for Orbiter bridging");
                }

                return getOrbiterETHTransferTransaction({
                    ...orbiterParams,
                    amount: amountIn,
                });
            }

            if (tokenIn.standard === "HypERC20Collateral") {
                const { queryClient, wagmiConfig, initData } = params;

                if (!queryClient || !wagmiConfig || !initData || !walletAddress) {
                    throw new Error(
                        "Query client, wagmi config, init data and wallet address are required for bridging",
                    );
                }

                const bridgeParams: GetTransferRemoteWithKernelCallsParams = {
                    chainId: tokenIn.chainId,
                    token: tokenIn.address,
                    tokenStandard: tokenIn.standard,
                    account: walletAddress,
                    destination: tokenOut.chainId,
                    recipient: walletAddress,
                    amount: amountIn,
                    createAccount: {
                        initData,
                        salt: zeroHash,
                        factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                    },
                };

                const result = await getTransferRemoteWithKernelCalls(queryClient, wagmiConfig, bridgeParams);
                //TODO: data and value are optional
                return result.calls[0] as {
                    to: Address;
                    data: Hex;
                    value: bigint;
                };
            }

            return getTransferRemoteCall({
                address: tokenIn.address,
                destination: tokenOut.chainId,
                recipient: walletAddress,
                amount: amountIn,
                bridgePayment: params.bridgePayment!,
            });
        }

        case "SWAP_BRIDGE": {
            const { swap, bridge, bridgePayment, amountIn, amountOutMinimum, walletAddress } = params;
            const { tokenIn: swapTokenIn, poolKey, zeroForOne } = swap;
            const { tokenIn: bridgeTokenIn, tokenOut: bridgeTokenOut } = bridge;

            const bridgeAddress = bridgeTokenIn.address;

            return getSwapAndHyperlaneSweepBridgeTransaction({
                universalRouter: uniswapContracts[swapTokenIn.chainId].universalRouter,
                bridgeAddress,
                // Default for local env
                bridgePayment: bridgePayment ?? 1n,
                destinationChain: bridgeTokenOut.chainId,
                receiver: walletAddress,
                poolKey,
                zeroForOne,
                amountIn,
                amountOutMinimum,
            });
        }

        case "BRIDGE_SWAP": {
            const {
                bridge,
                swap,
                queryClient,
                wagmiConfig,
                walletAddress,
                amountIn,
                amountOutMinimum,
                initData,
                orbiterParams,
                orbiterAmountOut,
            } = params;

            const { tokenIn, tokenOut } = bridge;
            const { poolKey, zeroForOne } = swap;

            if (tokenIn.standard === "NativeToken" && (!orbiterParams || !orbiterAmountOut)) {
                throw new Error("Orbiter params and amount out are required for Orbiter bridging");
            }

            // TODO: fix this for non local env
            const originERC7579ExecutorRouter =
                LOCAL_HYPERLANE_CONTRACTS[tokenIn.chainId as keyof typeof LOCAL_HYPERLANE_CONTRACTS]?.erc7579Router;
            const remoteERC7579ExecutorRouter =
                LOCAL_HYPERLANE_CONTRACTS[tokenOut.chainId as keyof typeof LOCAL_HYPERLANE_CONTRACTS]?.erc7579Router;

            if (!originERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${tokenIn.chainId}`);
            }

            if (!remoteERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${tokenOut.chainId}`);
            }

            const bridgeSwapParams: GetBridgeSwapWithKernelCallsParams = {
                chainId: tokenIn.chainId,
                token: tokenIn.address,
                tokenStandard: tokenIn.standard,
                account: walletAddress,
                destination: tokenOut.chainId,
                recipient: walletAddress,
                amount: amountIn,
                contracts: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: LOCAL_HYPERLANE_CONTRACTS[tokenIn.chainId as 900 | 901].erc7579Router,
                },
                contractsRemote: {
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: LOCAL_HYPERLANE_CONTRACTS[tokenOut.chainId as 900 | 901].erc7579Router,
                },
                createAccount: {
                    initData,
                    salt: zeroHash,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                createAccountRemote: {
                    initData,
                    salt: zeroHash,
                    factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                },
                // erc7579RouterOwners: [],
                // erc7579RouterOwnersRemote: [],
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: orbiterAmountOut ?? amountIn,
                    amountOutMinimum,
                    poolKey,
                    receiver: walletAddress,
                    universalRouter: uniswapContracts[tokenOut.chainId].universalRouter,
                    zeroForOne,
                },
                orbiterParams,
            };

            const result = await getBridgeSwapWithKernelCalls(queryClient, wagmiConfig, bridgeSwapParams);

            return result.calls[0] as {
                to: Address;
                data: Hex;
                value: bigint;
            };
        }

        default:
            return null;
    }
}
