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
}

export interface TransactionTypeBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
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

/**
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
