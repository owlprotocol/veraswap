import invariant from "tiny-invariant";
import { zeroAddress } from "viem";

import { Currency } from "../currency/currency.js";
import { Ether } from "../currency/ether.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { PoolKey } from "../types/PoolKey.js";

/**
 * Take token pair and return list of token pairs on same chain using their remote tokens
 * @param currencyA
 * @param currencyB
 */
export function getSharedChainTokenPairs(currencyA: Currency, currencyB: Currency): [Currency, Currency][] {
    invariant(currencyA.equals(currencyB) === false, "Cannot find pairs for same token");

    const currenciesA: Currency[] = [];
    const currenciesB: Currency[] = [];

    if (currencyA instanceof MultichainToken) {
        // Add all versions of currencyA
        currenciesA.push(currencyA, ...currencyA.getRemoteTokens());
    } else if (!currencyA.isNative) {
        currenciesA.push(currencyA);
    }

    if (currencyB instanceof MultichainToken) {
        // Add all versions of currencyB
        currenciesB.push(currencyB, ...currencyB.getRemoteTokens());
    } else if (!currencyB.isNative) {
        currenciesB.push(currencyB);
    }

    // Native Tokens: Assume native tokens are the same (Ether) on all chains
    if (currencyA.isNative) {
        // Add native token for each chain of B
        //TODO: Assumes all native tokens are the same on all chains
        invariant(currencyA instanceof Ether, "Native token must be Ether");
        currenciesB.forEach((currB) => currenciesA.push(Ether.onChain(currB.chainId)));
    }

    if (currencyB.isNative) {
        // Add native token for each chain of A
        //TODO: Assumes all native tokens are the same on all chains
        invariant(currencyB instanceof Ether, "Native token must be Ether");
        currenciesA.forEach((currA) => currenciesB.push(Ether.onChain(currA.chainId)));
    }

    const result: [Currency, Currency][] = [];

    currenciesA.forEach((currA) => {
        // Find tokenOut on same chain
        const currB = currenciesB.find((currency) => currency.chainId === currA.chainId);
        if (currB) result.push([currA, currB]);
    });

    return result;
}

/**
 * Get PoolKey from poolKeys and tokenA/tokenB (assumes both are on same chain)
 * @param currencyA
 * @param currencyB
 * @param poolKeys List of pool keys on the same chain
 * @returns PoolKey or null
 */
export function getPoolKey(currencyA: Currency, currencyB: Currency, poolKeys: PoolKey[]): PoolKey | null {
    invariant(currencyA.equals(currencyB) === false, "Cannot find pool key for same token");
    invariant(currencyA.chainId === currencyB.chainId, "Cannot find pool key on different chains");

    // Get correct address
    const currencyAAddress = currencyA.isNative ? zeroAddress : currencyA.wrapped.address; //v4 uses zeroAddress for native tokens
    const currencyBAddress = currencyB.isNative ? zeroAddress : currencyB.wrapped.address; //v4 uses zeroAddress for native tokens
    // Compute address following PoolKey invariant
    const currency0 = currencyAAddress < currencyBAddress ? currencyAAddress : currencyBAddress;
    const currency1 = currencyAAddress < currencyBAddress ? currencyBAddress : currencyAAddress;

    // Search for poolKey
    const poolKey = poolKeys.find((key) => {
        return key.currency0 === currency0 && key.currency1 === currency1;
    });

    return poolKey ?? null;
}

/**
 * Take token pair and find which chain(s) they can be swapped on
 * @param currencyIn
 * @param currencyOut
 * @param poolKeysByChain List of pool keys on each chain
 * @returns
 */
export function getSharedChainPools(
    currencyIn: Currency,
    currencyOut: Currency,
    poolKeysByChain: Record<number, PoolKey[]>,
): { chainId: number; poolKey: PoolKey; currencyIn: Currency; currencyOut: Currency; zeroForOne: boolean }[] {
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    // Find pool pairs on same chain to search pool keys
    const sharedPoools: {
        chainId: number;
        poolKey: PoolKey;
        currencyIn: Currency;
        currencyOut: Currency;
        zeroForOne: boolean;
    }[] = [];

    tokenPairs.forEach((pair) => {
        const [currIn, currOut] = pair;
        // Search for poolKey
        const chainPoolKeys = poolKeysByChain[currIn.chainId];
        if (!chainPoolKeys) return;

        const poolKey = getPoolKey(currIn, currOut, chainPoolKeys);
        // Add to options
        if (poolKey) {
            const currInAddress = currIn.isNative ? zeroAddress : currIn.wrapped.address; //v4 uses zeroAddress for native tokens
            const zeroForOne = poolKey.currency0 === currInAddress;
            sharedPoools.push({
                chainId: currIn.chainId,
                poolKey,
                currencyIn: currIn,
                currencyOut: currOut,
                zeroForOne,
            });
        }
    });

    return sharedPoools;
}

export interface AssetFlowSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    poolKey: PoolKey;
    zeroForOne: boolean;
}

export interface AssetFlowBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
}

export type AssetFlow = AssetFlowSwap | AssetFlowBridge;

// TODO: Update quoting logic to use actual API and use an amount/minLiquidity parameter (current logic just checks hard-coded poolKeys)

/**
 * Get list of asset flows to get from currencyIn to currencyOut
 * @param currencyIn
 * @param currencyOut
 * @returns list of asset flows which either represent:
 *  - assets on same chain to be swapped
 *  - assets on different chains that are remote tokens of each other
 */
export function getAssetFlows(
    currencyIn: Currency,
    currencyOut: Currency,
    poolKeysByChain: Record<number, PoolKey[]>,
): [AssetFlow, ...AssetFlow[]] | null {
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // BRIDGE ONLY
    // BRIDGE: Native token bridge
    if (currencyIn.isNative && currencyOut.isNative) {
        return [{ type: "BRIDGE", currencyIn, currencyOut }];
    }

    if (currencyIn instanceof MultichainToken) {
        // BRIDGE: `currencyIn.getRemoteToken(currencyOut.chainId).equals(currencyOut)`
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            return [
                {
                    type: "BRIDGE",
                    currencyIn: currencyIn,
                    currencyOut: currencyOut,
                },
            ];
        }
    }

    // SWAP with pre-swap, post-swap bridging
    // Find crosschain pools
    const poolKeyOptions = getSharedChainPools(currencyIn, currencyOut, poolKeysByChain);
    if (poolKeyOptions.length == 0) return null;

    // Mixed Bridge/Swap/Bridge
    // TODO: Find optimal pool key using quoting & gas estimations
    const pool = poolKeyOptions[0];
    const flows: AssetFlow[] = [];
    const swap: AssetFlowSwap = {
        type: "SWAP",
        chainId: pool.chainId,
        poolKey: pool.poolKey,
        currencyIn: pool.currencyIn,
        currencyOut: pool.currencyOut,
        zeroForOne: pool.zeroForOne,
    };

    if (!swap.currencyIn.equals(currencyIn)) {
        // Add input bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn,
            currencyOut: swap.currencyIn,
        });
    }
    // Add swap
    flows.push(swap);
    if (!swap.currencyOut.equals(currencyOut)) {
        // Add ouput bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn: swap.currencyOut,
            currencyOut,
        });
    }

    return flows as [AssetFlow, ...AssetFlow[]];
}

export interface TransactionTypeSwapBridge {
    type: "SWAP_BRIDGE";
    swap: AssetFlowSwap;
    bridge: AssetFlowBridge;
}

export interface TransactionTypeBridgeSwap {
    type: "BRIDGE_SWAP";
    bridge: AssetFlowBridge;
    swap: AssetFlowSwap;
}

export type TransactionType = AssetFlowSwap | AssetFlowBridge | TransactionTypeSwapBridge | TransactionTypeBridgeSwap;
/**
 * Convert list of asset flows to TransactionType (used on frontend)
 * @param flows
 */
export function assetFlowsToTransactionType(flows: [AssetFlow, ...AssetFlow[]]): TransactionType | null {
    invariant(flows.length >= 1, "flows.length MUST be >= 1");
    if (flows.length === 1) {
        return flows[0];
    }

    if (flows.length === 2) {
        if (flows[0].type === "SWAP" && flows[1].type === "BRIDGE") {
            return {
                type: "SWAP_BRIDGE",
                swap: flows[0],
                bridge: flows[1],
            };
        } else if (flows[0].type === "BRIDGE" && flows[1].type === "SWAP") {
            return {
                type: "BRIDGE_SWAP",
                bridge: flows[0],
                swap: flows[1],
            };
        }
        throw new Error("flows.length === 2 but not SWAP_BRIDGE / BRIDGE_SWAP");
    }

    //Longer flows unsupported
    return null;
}
