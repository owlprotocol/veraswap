import { Address } from "viem";

import { PoolKey } from "../types/PoolKey.js";
import { Token } from "../types/Token.js";

export interface TransactionTypeSwap {
    type: "SWAP";
    chainId: number;
    tokenIn: Token;
    tokenOut: Token;
    poolKey: PoolKey;
    zeroForOne: boolean;
}

export interface TransactionTypeBridge {
    type: "BRIDGE";
    tokenIn: Token;
    tokenOut: Token;
}

export interface TransactionTypeSwapBridge {
    type: "SWAP_BRIDGE";
    swap: TransactionTypeSwap;
    bridge: TransactionTypeBridge;
}

export interface TransactionTypeBridgeSwap {
    type: "BRIDGE_SWAP";
    bridge: TransactionTypeBridge;
    swap: TransactionTypeSwap;
}

export type TransactionType =
    | TransactionTypeSwap
    | TransactionTypeBridge
    | TransactionTypeSwapBridge
    | TransactionTypeBridgeSwap;

// TODO: Add invariant checks for when tokens have to be on same / different chains
/**
 * Take token pair and return list of token pairs on same chain using their `connections`
 * @param param0
 */
export function getSharedChainTokenPairs({
    tokenIn,
    tokenOut,
}: {
    tokenIn: {
        chainId: number;
        address: Address;
        connections?: {
            vm: string;
            chainId: number;
            address: Address;
        }[];
    };
    tokenOut: {
        chainId: number;
        address: Address;
        connections?: {
            vm: string;
            chainId: number;
            address: Address;
        }[];
    };
}): { chainId: number; tokenIn: Address; tokenOut: Address }[] {
    const result: { chainId: number; tokenIn: Address; tokenOut: Address }[] = [];
    const tokensIn: { chainId: number; address: Address }[] = [tokenIn, ...(tokenIn.connections ?? [])];
    const tokensOut: { chainId: number; address: Address }[] = [tokenOut, ...(tokenOut.connections ?? [])];

    tokensIn.forEach((tokenIn) => {
        // Find tokenOut on same chain
        const tokenOut = tokensOut.find((token) => token.chainId === tokenIn.chainId);
        if (tokenOut) result.push({ chainId: tokenIn.chainId, tokenIn: tokenIn.address, tokenOut: tokenOut.address });
    });

    return result;
}

/**
 * Get PoolKey from poolKeys and tokenIn/tokenOut (assumes both are on same chain)
 * @param param0
 * @returns
 */
export function getPoolKey({
    poolKeys,
    tokenIn,
    tokenOut,
}: {
    poolKeys: PoolKey[];
    tokenIn: Token;
    tokenOut: Token;
}): PoolKey | null {
    // Get correct address
    const tokenInAddress = tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
    const tokenOutAddress = tokenOut.standard === "HypERC20Collateral" ? tokenOut.collateralAddress : tokenOut.address;
    // Compute address following PoolKey invariant
    const currency0 = tokenInAddress < tokenOutAddress ? tokenInAddress : tokenOutAddress;
    const currency1 = tokenInAddress < tokenOutAddress ? tokenOutAddress : tokenInAddress;

    // Search for poolKey
    const poolKey = poolKeys.find((key) => {
        return key.currency0 === currency0 && key.currency1 === currency1;
    });

    return poolKey ?? null;
}

/**
 * Take a `tokenIn`/`tokenOut` (assumed on different chains) and find which chain(s) they can be swapped on
 * @param params
 * @returns
 */
export function getSharedChainPools({
    tokens,
    poolKeys,
    tokenIn,
    tokenOut,
}: {
    tokens: Record<number, Record<Address, Token | undefined>>;
    poolKeys: Record<number, PoolKey[]>;
    tokenIn: Token;
    tokenOut: Token;
}): { chainId: number; tokenIn: Token; tokenOut: Token; poolKey: PoolKey }[] {
    // same token!
    if (tokenIn.chainId === tokenOut.chainId && tokenIn.address === tokenOut.address) return [];

    const tokenPairs = getSharedChainTokenPairs({ tokenIn, tokenOut });

    // Find pool pairs on same chain to search pool keys
    const poolKeyOptions: { chainId: number; tokenIn: Token; tokenOut: Token; poolKey: PoolKey }[] = [];

    tokenPairs.forEach((pair) => {
        // Get tokens
        const tokenIn = tokens[pair.chainId][pair.tokenIn];
        const tokenOut = tokens[pair.chainId][pair.tokenOut];

        if (!tokenIn || !tokenOut) return;

        // Search for poolKey
        const chainPoolKeys = poolKeys[tokenIn.chainId];
        if (!chainPoolKeys) return;

        const poolKey = getPoolKey({ poolKeys: chainPoolKeys, tokenIn, tokenOut });
        // Add to options
        if (poolKey) {
            poolKeyOptions.push({ chainId: pair.chainId, tokenIn, tokenOut, poolKey });
        }
    });

    return poolKeyOptions;
}

// TODO: Update quoting logic to use actual API and use an amount/minLiquidity parameter (current logic just checks hard-coded poolKeys)
/**
 * Get transaction type & params (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP)
 * @param param0
 * @returns
 */
export function getTransactionType({
    tokens,
    poolKeys,
    tokenIn,
    tokenOut,
}: {
    tokens: Record<number, Record<Address, Token>>;
    poolKeys: Record<number, PoolKey[]>;
    tokenIn: Token;
    tokenOut: Token;
}): TransactionType | null {
    // same token!
    if (tokenIn.chainId === tokenOut.chainId && tokenIn.address === tokenOut.address) return null;

    if (tokenIn.standard === "NativeToken" && tokenOut.standard === "NativeToken") {
        return {
            type: "BRIDGE",
            tokenIn,
            tokenOut,
        };
    }

    // BRIDGE: `tokenIn.connections.includes(tokenOut)`
    if (tokenIn.connections?.find((c) => c.chainId === tokenOut.chainId && c.address === tokenOut.address)) {
        return {
            type: "BRIDGE",
            tokenIn,
            tokenOut,
        };
    }

    // SWAP: `tokenIn.chainId == tokenOut.chainId`
    if (tokenIn.chainId === tokenOut.chainId) {
        const poolKey = getPoolKey({ poolKeys: poolKeys[tokenIn.chainId] ?? [], tokenIn, tokenOut });
        //TODO: Check alternative sources of liquidity
        if (!poolKey) return null;

        const tokenInAddress = tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
        const zeroForOne = poolKey.currency0 === tokenInAddress;

        return {
            type: "SWAP",
            chainId: tokenIn.chainId,
            poolKey,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            zeroForOne,
        };
    }

    // Find crosschain pools
    const poolKeyOptions = getSharedChainPools({ tokens, poolKeys, tokenIn, tokenOut });
    if (poolKeyOptions.length == 0) return null;

    // SWAP_BRIDGE: `pool.chainId == tokenIn.chainId`
    const poolKeyInChain = poolKeyOptions.find((option) => option.chainId === tokenIn.chainId);
    if (poolKeyInChain) {
        const tokenInAddress = tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
        const zeroForOne = poolKeyInChain.poolKey.currency0 === tokenInAddress;

        return {
            type: "SWAP_BRIDGE",
            swap: {
                type: "SWAP",
                chainId: tokenIn.chainId,
                poolKey: poolKeyInChain.poolKey,
                tokenIn,
                tokenOut: poolKeyInChain.tokenOut,
                zeroForOne,
            },
            bridge: {
                type: "BRIDGE",
                tokenIn: poolKeyInChain.tokenOut,
                tokenOut,
            },
        };
    }

    // BRIDGE_SWAP: `pool.chainId == tokenOut.chainId`
    const poolKeyOutChain = poolKeyOptions.find((option) => option.chainId === tokenOut.chainId);
    if (poolKeyOutChain) {
        const tokenOutAddress =
            tokenOut.standard === "HypERC20Collateral" ? tokenOut.collateralAddress : tokenOut.address;
        const zeroForOne = poolKeyOutChain.poolKey.currency1 === tokenOutAddress;

        return {
            type: "BRIDGE_SWAP",
            bridge: {
                type: "BRIDGE",
                tokenIn,
                tokenOut: poolKeyOutChain.tokenIn,
            },
            swap: {
                type: "SWAP",
                chainId: tokenOut.chainId,
                poolKey: poolKeyOutChain.poolKey,
                tokenIn: poolKeyOutChain.tokenIn,
                tokenOut: tokenOut,
                zeroForOne,
            },
        };
    }

    return null;
}
