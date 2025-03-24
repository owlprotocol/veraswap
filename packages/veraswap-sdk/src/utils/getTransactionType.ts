import { Address } from "viem";
import { VeraSwapToken } from "../types/VeraSwapToken.js";

type TransactionSwap = {
    type: "SWAP";
    chainId: number;
    fromToken: Address;
    toToken: Address;
};

type TransactionBridge = {
    type: "BRIDGE";
    fromChainId: number;
    toChainId: number;
    fromToken: Address;
    toToken: Address;
};

type TransactionSwapAndBridge = {
    type: "SWAP_AND_BRIDGE";
    swap: {
        chainId: number;
        fromToken: Address;
        toToken: Address;
    };
    bridge: {
        fromChainId: number;
        toChainId: number;
        fromToken: Address;
        toToken: Address;
    };
};

type TransactionBridgeAndSwap = {
    type: "BRIDGE_AND_SWAP";
    bridge: {
        fromChainId: number;
        toChainId: number;
        fromToken: string;
        toToken: string;
    };
    swap: {
        chainId: number;
        fromToken: string;
        toToken: string;
    };
};

export type TransactionResult =
    | TransactionSwap
    | TransactionBridge
    | TransactionSwapAndBridge
    | TransactionBridgeAndSwap
    | { type: "UNKNOWN" };

const isHyperlaneStandard = (standard?: string) =>
    standard === "EvmHypCollateral" || standard === "EvmHypSynthetic";

function hasConnection(from: VeraSwapToken, to: VeraSwapToken): boolean {
    if (!from.connections) return false;
    return from.connections.some(
        (c) =>
            c.chainId === to.chainId &&
            c.address.toLowerCase() === to.address.toLowerCase()
    );
}

export function getTransactionType({
    tokenIn,
    tokenOut,
}: {
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
}): TransactionResult {
    const sameChain = tokenIn.chainId === tokenOut.chainId;

    // We assume that if the chain is the same, there is some liquidty and it's a swap. TODO: improve
    if (sameChain) {
        return {
            type: "SWAP",
            chainId: tokenIn.chainId,
            fromToken: tokenIn.collateralAddress ?? tokenIn.address,
            toToken: tokenOut.collateralAddress ?? tokenOut.address,
        };
    }

    if (isHyperlaneStandard(tokenIn.standard) &&
        isHyperlaneStandard(tokenOut.standard) &&
        hasConnection(tokenIn, tokenOut)) {
        return {
            type: "BRIDGE",
            fromChainId: tokenIn.chainId,
            toChainId: tokenOut.chainId,
            fromToken: tokenIn.collateralAddress ?? tokenIn.address,
            toToken: tokenOut.collateralAddress ?? tokenOut.address,
        };
    }

    if (isHyperlaneStandard(tokenIn.standard)) {
        const tokenInConnection = tokenIn.connections?.find(
            (c) => c.chainId === tokenOut.chainId
        );
        if (tokenInConnection) {
            return {
                type: "BRIDGE_AND_SWAP",
                bridge: {
                    fromChainId: tokenIn.chainId,
                    toChainId: tokenOut.chainId,
                    fromToken: tokenIn.collateralAddress ?? tokenIn.address,
                    toToken: tokenInConnection.address,
                },
                swap: {
                    chainId: tokenOut.chainId,
                    fromToken: tokenInConnection.address,
                    toToken: tokenOut.collateralAddress ?? tokenOut.address,
                },
            };
        }
    }

    if (isHyperlaneStandard(tokenOut.standard)) {
        const tokenOutConnection = tokenOut.connections?.find(
            (c) => c.chainId === tokenIn.chainId
        );
        if (tokenOutConnection) {
            return {
                type: "SWAP_AND_BRIDGE",
                swap: {
                    chainId: tokenIn.chainId,
                    fromToken: tokenIn.collateralAddress ?? tokenIn.address,
                    toToken: tokenOutConnection.address,
                },
                bridge: {
                    fromChainId: tokenIn.chainId,
                    toChainId: tokenOut.chainId,
                    fromToken: tokenOutConnection.address,
                    toToken: tokenOut.collateralAddress ?? tokenOut.address,
                },
            };
        }
    }

    return { type: "UNKNOWN" };
}
