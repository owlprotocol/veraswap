import { Address } from "viem";
import { Token } from "../types/Token.js";
import { PoolKey } from "../types/PoolKey.js";

export interface TransactionSwap {
    type: "SWAP";
    chainId: number;
    tokenIn: Token;
    tokenOut: Token;
    poolKey: PoolKey;
}

export interface TransactionBridge {
    type: "BRIDGE";
    tokenIn: Token;
    tokenOut: Token;
}

export interface TransactionSwapAndBridge {
    type: "SWAP_BRIDGE";
    swap: TransactionSwap;
    bridge: TransactionBridge;
}

export interface TransactionBridgeAndSwap {
    type: "BRIDGE_SWAP";
    bridge: TransactionBridge;
    swap: TransactionSwap;
}

export type TransactionResult =
    | TransactionSwap
    | TransactionBridge
    | TransactionSwapAndBridge
    | TransactionBridgeAndSwap;

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
export function getPoolKey2({
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
    tokens: Record<number, Record<Address, Token>>;
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
        // Search for poolKey
        const chainPoolKeys = poolKeys[tokenIn.chainId];
        if (!chainPoolKeys) return;

        const poolKey = getPoolKey2({ poolKeys: chainPoolKeys, tokenIn, tokenOut });
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
}): TransactionResult | null {
    // same token!
    if (tokenIn.chainId === tokenOut.chainId && tokenIn.address === tokenOut.address) return null;

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
        const poolKey = getPoolKey2({ poolKeys: poolKeys[tokenIn.chainId] ?? [], tokenIn, tokenOut });
        //TODO: Check alternative sources of liquidity
        if (!poolKey) return null;

        return {
            type: "SWAP",
            chainId: tokenIn.chainId,
            poolKey,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
        };
    }

    // Find crosschain pools
    const poolKeyOptions = getSharedChainPools({ tokens, poolKeys, tokenIn, tokenOut });
    if (poolKeyOptions.length == 0) return null;

    // SWAP_BRIDGE: `pool.chainId == tokenIn.chainId`
    const poolKeyInChain = poolKeyOptions.find((option) => option.chainId === tokenIn.chainId);
    if (poolKeyInChain) {
        return {
            type: "SWAP_BRIDGE",
            swap: {
                type: "SWAP",
                chainId: tokenIn.chainId,
                poolKey: poolKeyInChain.poolKey,
                tokenIn,
                tokenOut: poolKeyInChain.tokenOut,
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
                tokenOut: poolKeyOutChain.tokenOut,
            },
        };
    }

    return null;
}
