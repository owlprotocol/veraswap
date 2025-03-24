import { Address } from "viem";
import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { HYPERLANE_CHAIN_MAP } from "./HyperlaneChainIdMap.js";

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


function getChainIdFromName(name: string): number | undefined {
    const entry = Object.entries(HYPERLANE_CHAIN_MAP).find(
        ([, value]) => value === name
    );
    return entry ? parseInt(entry[0]) : undefined;
}

function hasConnection(from: VeraSwapToken, to: VeraSwapToken): boolean {
    if (!from.connections) return false;
    return from.connections.some(
        (c) =>
            c.address.toLowerCase() === to.address.toLowerCase() &&
            getChainIdFromName(c.chain) === to.chainId
    );
}

export function getTransactionType({
    allTokens,
    tokenIn,
    tokenOut,
}: {
    allTokens: VeraSwapToken[];
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
}): TransactionResult {
    const sameChain = tokenIn.chainId === tokenOut.chainId;
    const tokenInIsHyperlane = !!tokenIn.standard;
    const tokenOutIsHyperlane = !!tokenOut.standard;


    if (sameChain) {
        return {
            type: "SWAP",
            chainId: tokenIn.chainId,
            fromToken: tokenIn.collateralAddress ?? tokenIn.address,
            toToken: tokenOut.collateralAddress ?? tokenOut.address,
        };
    }

    if (!tokenInIsHyperlane && tokenOutIsHyperlane) {
        const matchingToken = allTokens.find(
            (token) =>
                token.chainId === tokenIn.chainId &&
                token.standard &&
                token.address.toLowerCase() ===
                tokenOut.connections?.find(
                    (c) => getChainIdFromName(c.chain) === token.chainId
                )?.address.toLowerCase()
        );
        if (matchingToken) {
            return {
                type: "SWAP_AND_BRIDGE",
                swap: {
                    chainId: tokenIn.chainId,
                    fromToken: tokenIn.collateralAddress ?? tokenIn.address,
                    toToken: matchingToken.collateralAddress ?? matchingToken.address,
                },
                bridge: {
                    fromChainId: matchingToken.chainId,
                    toChainId: tokenOut.chainId,
                    fromToken: matchingToken.collateralAddress ?? matchingToken.address,
                    toToken: tokenOut.collateralAddress ?? tokenOut.address,
                },
            };
        }
    }

    if (tokenInIsHyperlane && !tokenOutIsHyperlane) {
        const matchingToken = allTokens.find(
            (token) =>
                token.chainId === tokenOut.chainId &&
                token.standard &&
                token.address.toLowerCase() ===
                tokenIn.connections?.find(
                    (c) => getChainIdFromName(c.chain) === token.chainId
                )?.address.toLowerCase()
        );
        if (matchingToken) {
            return {
                type: "BRIDGE_AND_SWAP",
                bridge: {
                    fromChainId: tokenIn.chainId,
                    toChainId: matchingToken.chainId,
                    fromToken: tokenIn.collateralAddress ?? tokenIn.address,
                    toToken: matchingToken.collateralAddress ?? matchingToken.address,
                },
                swap: {
                    chainId: tokenOut.chainId,
                    fromToken: matchingToken.collateralAddress ?? matchingToken.address,
                    toToken: tokenOut.collateralAddress ?? tokenOut.address,
                },
            };
        }
    }

    if (
        tokenInIsHyperlane &&
        tokenOutIsHyperlane &&
        (hasConnection(tokenIn, tokenOut))
    ) {
        return {
            type: "BRIDGE",
            fromChainId: tokenIn.chainId,
            toChainId: tokenOut.chainId,
            fromToken: tokenIn.collateralAddress ?? tokenIn.address,
            toToken: tokenOut.collateralAddress ?? tokenOut.address,
        };
    }

    return { type: "UNKNOWN" };
}
