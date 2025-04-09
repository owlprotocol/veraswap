import { Address, Hex, zeroHash } from "viem";
import {
    TransactionTypeSwap,
    TransactionTypeBridge,
    TransactionTypeSwapBridge,
    TransactionTypeBridgeSwap,
} from "../utils/getTransactionType.js";
import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";

import { getSwapAndHyperlaneSweepBridgeTransaction } from "./getSwapAndHyperlaneSweepBridgeTransaction.js";
import { getTransferRemoteCall } from "./getTransferRemoteCall.js";
import { UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "../calls/getTransferRemoteWithKernelCalls.js";
import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { OrbiterParams } from "../types/OrbiterParams.js";

export interface TransactionSwapOptions {
    amountIn: bigint;
    amountOutMinimum: bigint;
}

export interface TransactionBridgeOptions {
    amountIn: bigint;
    walletAddress: Address;
    bridgePayment: bigint;
    orbiterParams?: OrbiterParams;
}

export interface TransactionBridgeOrbiterOptions {
    amountIn: bigint;
    walletAddress?: Address;
    orbiterParams?: OrbiterParams;
    // TODO: maybe calculate total amount in to pay and pass it as bridge payment
    // Keeping it for type consistency
    bridgePayment?: bigint;
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
    initData: Hex;
    orbiterParams?: OrbiterParams;
}

export type TransactionParams =
    | (TransactionTypeSwap & TransactionSwapOptions)
    | (TransactionTypeBridge & TransactionBridgeOptions)
    | (TransactionTypeBridge & TransactionBridgeOrbiterOptions)
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

            return getTransferRemoteCall({
                address: tokenIn.address,
                destination: tokenOut.chainId,
                recipient: walletAddress!,
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
            const { bridge, queryClient, wagmiConfig, walletAddress, amountIn, initData, orbiterParams } = params;

            const { tokenIn, tokenOut } = bridge;

            if (tokenIn.standard === "NativeToken" && !orbiterParams) {
                throw new Error("Orbiter params are required for Orbiter bridging");
            }

            const bridgeSwapParms: GetTransferRemoteWithKernelCallsParams = {
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
                orbiterParams,
            };

            const result = await getTransferRemoteWithKernelCalls(queryClient, wagmiConfig, bridgeSwapParms);
            //TODO: data and value are optional
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
