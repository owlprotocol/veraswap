import invariant from "tiny-invariant";

import { RouteComponent, RouteComponentBridge, RouteComponentSwap } from "../uniswap/getRouteMultichain.js";

export interface TransactionTypeSwapBridge {
    type: "SWAP_BRIDGE";
    swap: RouteComponentSwap;
    bridge: RouteComponentBridge;
}

export interface TransactionTypeBridgeSwap {
    type: "BRIDGE_SWAP";
    bridge: RouteComponentBridge;
    swap: RouteComponentSwap;
}

export type TransactionType = RouteComponent | TransactionTypeSwapBridge | TransactionTypeBridgeSwap;
/**
 * Convert list of asset flows to TransactionType (used on frontend)
 * @param flows
 */
export function assetFlowsToTransactionType(
    routeComponents: [RouteComponent, ...RouteComponent[]],
): TransactionType | null {
    invariant(routeComponents.length >= 1, "routeComponents.length MUST be >= 1");
    if (routeComponents.length === 1) {
        return routeComponents[0];
    }

    if (routeComponents.length === 2) {
        if (routeComponents[0].type === "SWAP" && routeComponents[1].type === "BRIDGE") {
            return {
                type: "SWAP_BRIDGE",
                swap: routeComponents[0],
                bridge: routeComponents[1],
            };
        } else if (routeComponents[0].type === "BRIDGE" && routeComponents[1].type === "SWAP") {
            return {
                type: "BRIDGE_SWAP",
                bridge: routeComponents[0],
                swap: routeComponents[1],
            };
        }
        throw new Error("routeComponents.length === 2 but not SWAP_BRIDGE / BRIDGE_SWAP");
    }

    //Longer routes unsupported
    return null;
}
