import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address } from "viem";

import { Currency } from "../../currency/currency.js";
import { MultichainToken } from "../../currency/multichainToken.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { RoutePlanner } from "../routerCommands.js";

import { getUniswapRouteExactInMultichain } from "./getUniswapRouteMultichain.js";

export interface RouteComponentSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    amountOut: bigint;
    routePlanner: RoutePlanner;
}

export interface RouteComponentBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
}

export type RouteComponent = RouteComponentSwap | RouteComponentBridge;

export type GetRouteMultichainReturnType = {
    flows: [RouteComponent, ...RouteComponent[]];
    amountOut: bigint;
} | null;

export interface GetRouteMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<number, { weth9: Address; metaQuoter: Address } | undefined>;
    recipient?: Address;
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get list of asset flows to get from currencyIn to currencyOut
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of asset flows which either represent:
 *  - assets on same chain to be swapped
 *  - assets on different chains that are remote tokens of each other
 */
export async function getRouteMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetRouteMultichainParams,
): Promise<GetRouteMultichainReturnType> {
    const { currencyIn, currencyOut, amountIn } = params;

    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // BRIDGE ONLY
    // BRIDGE: Native token bridge
    // TODO: account for bridge and gas fees
    if (currencyIn.isNative && currencyOut.isNative) {
        return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: amountIn };
    }

    if (currencyIn instanceof MultichainToken) {
        // BRIDGE
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: amountIn };
        }
    }

    // SWAP with pre-swap, post-swap bridging
    // Find crosschain pools
    const route = await getUniswapRouteExactInMultichain(queryClient, wagmiConfig, params);
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const flows: RouteComponent[] = [];

    const swap: RouteComponentSwap = {
        type: "SWAP",
        chainId: route.currencyIn.chainId,
        currencyIn: route.currencyIn,
        currencyOut: route.currencyOut,
        amountOut: route.amountOut,
        routePlanner: route.routePlanner,
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
        // Add output bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn: swap.currencyOut,
            currencyOut,
        });
    }

    return { flows: flows as [RouteComponent, ...RouteComponent[]], amountOut: route.amountOut };
}
