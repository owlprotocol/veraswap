import { Address, Hex } from "viem";
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

export interface TransactionSwapOptions {
    amountIn: bigint;
    amountOutMinimum: bigint;
}

export interface OrbiterParams {
    endpoint: Address;
    endpointContract: Address;
    orbiterChainId: number;
    withholdingFee: string;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TransactionBridgeSwapOptions {}

export type TransactionParams =
    | (TransactionTypeSwap & TransactionSwapOptions)
    | (TransactionTypeBridge & TransactionBridgeOptions)
    | (TransactionTypeBridge & TransactionBridgeOrbiterOptions)
    | (TransactionTypeSwapBridge & TransactionSwapBridgeOptions)
    | (TransactionTypeBridgeSwap & TransactionBridgeSwapOptions);

export function getTransaction(
    params: TransactionParams,
    constants?: { uniswapContracts: Record<number, { universalRouter: Address }> },
): { to: Address; data: Hex; value: bigint } | null {
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
            // TODO: Implement this case
            return null;
        }

        default:
            return null;
    }
}
