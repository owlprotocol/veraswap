import { Currency } from "../currency/currency.js";
import { PoolKey } from "../types/PoolKey.js";

import { assetFlowsToTransactionType, getAssetFlows } from "./getAssetFlows.js";

export interface TransactionTypeSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    poolKey: PoolKey;
    zeroForOne: boolean;
    // Not needed here but used for consistency
    withSuperchain?: boolean;
}

export interface TransactionTypeBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
    withSuperchain?: boolean;
}

export interface TransactionTypeSwapBridge {
    type: "SWAP_BRIDGE";
    swap: TransactionTypeSwap;
    bridge: TransactionTypeBridge;
    withSuperchain?: boolean;
}

export interface TransactionTypeBridgeSwap {
    type: "BRIDGE_SWAP";
    bridge: TransactionTypeBridge;
    swap: TransactionTypeSwap;
    withSuperchain?: boolean;
}

export type TransactionType =
    | TransactionTypeSwap
    | TransactionTypeBridge
    | TransactionTypeSwapBridge
    | TransactionTypeBridgeSwap;

/**
 * Get transaction type & params (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) for Currency
 * @param param0
 * @returns
 */
export function getTransactionType({
    currencyIn,
    currencyOut,
    poolKeys,
}: {
    currencyIn: Currency;
    currencyOut: Currency;
    poolKeys: Record<number, PoolKey[]>;
}): TransactionType | null {
    if (currencyIn.equals(currencyOut)) return null;
    const flows = getAssetFlows(currencyIn, currencyOut, poolKeys);
    if (!flows) return null;
    return assetFlowsToTransactionType(flows);
}
