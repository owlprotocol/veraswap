import { Address, Hex } from "viem";
import {
    TransactionSwap,
    TransactionBridge,
    TransactionSwapAndBridge,
    TransactionBridgeAndSwap,
} from "../utils/getTransactionType.js";
import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";
import { UNISWAP_CONTRACTS } from "../constants.js";
import { getSwapAndHyperlaneSweepBridgeTransaction } from "./getSwapAndHyperlaneSweepBridgeTransaction.js";
import { getHyperlaneBridgeTransaction } from "./getHyperlaneBridgeData.js";

export type TransactionSwapExtras = {
    amountIn: bigint;
    amountOutMinimum: bigint;
    zeroForOne: boolean;
};

export type TransactionBridgeExtras = {
    amountIn: bigint;
    walletAddress: Address;
};

export type TransactionSwapAndBridgeExtras = {
    amountIn: bigint;
    amountOutMinimum: bigint;
    bridgePayment: bigint;
    zeroForOne: boolean;
    walletAddress: Address;
};

export type TransactionBridgeAndSwapExtras = {
};

export type TransactionParams =
    | (TransactionSwap & TransactionSwapExtras)
    | (TransactionBridge & TransactionBridgeExtras)
    | (TransactionSwapAndBridge & TransactionSwapAndBridgeExtras)
    | (TransactionBridgeAndSwap & TransactionBridgeAndSwapExtras);

export const getTransaction = (params: TransactionParams): { to: Address; data: Hex; value: bigint } | null => {
    switch (params.type) {
        case "SWAP": {
            const { tokenIn, poolKey, zeroForOne, amountIn, amountOutMinimum } = params;
            return getSwapExactInExecuteData({
                universalRouter: UNISWAP_CONTRACTS[tokenIn.chainId].UNIVERSAL_ROUTER,
                poolKey,
                zeroForOne,
                amountIn,
                amountOutMinimum,
            });
        }

        case "BRIDGE": {
            const { tokenIn, tokenOut, amountIn, walletAddress } = params;
            return getHyperlaneBridgeTransaction({
                tokenIn,
                tokenOut,
                recipient: walletAddress,
                amount: amountIn,
            });
        }

        case "SWAP_BRIDGE": {
            const { swap, bridge, bridgePayment, zeroForOne, amountIn, amountOutMinimum, walletAddress } = params;
            const { tokenIn: swapTokenIn, poolKey } = swap;
            const { tokenIn: bridgeTokenIn, tokenOut: bridgeTokenOut } = bridge;

            const bridgeAddress =
                bridgeTokenIn.standard === "HypERC20Collateral"
                    ? bridgeTokenIn.collateralAddress
                    : bridgeTokenIn.address;

            return getSwapAndHyperlaneSweepBridgeTransaction({
                universalRouter: UNISWAP_CONTRACTS[swapTokenIn.chainId].UNIVERSAL_ROUTER,
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
};
