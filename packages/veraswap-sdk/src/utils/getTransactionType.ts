import { Currency } from "../currency/currency.js";
import { PathKey } from "../types/PoolKey.js";
import { NewRouteComponent } from "../uniswap/quote/getNewRouteMultichain.js";
import { RouterCommand } from "../uniswap/routerCommands.js";

import { assetFlowsToTransactionType } from "./getAssetFlows.js";

export interface TransactionTypeSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    amountOut: bigint;
    commands: RouterCommand[];
    path?: PathKey[]; // TODO: Remove once BRIDGE_SWAP is updated to use routePlanner
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

// TODO: Update quoting logic to use actual API and use an amount/minLiquidity parameter (current logic just checks hard-coded poolKeys)
/**
 * Get transaction type & params (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP)
 * @param param0
 * @returns
 */
export function getTransactionType({
    currencyIn,
    currencyOut,
    routeComponents,
}: {
    currencyIn: Currency;
    currencyOut: Currency;
    routeComponents: [NewRouteComponent, ...NewRouteComponent[]] | null;
}): TransactionType | null {
    if (currencyIn.equals(currencyOut)) return null;

    if (!routeComponents) return null;

    return assetFlowsToTransactionType(routeComponents);
}
