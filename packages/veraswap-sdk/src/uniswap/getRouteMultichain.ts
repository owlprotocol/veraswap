import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";

import { STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { Currency, getUniswapV4Address, isMultichainToken } from "../currency/currency.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { PathKey, PoolKey, poolKeysToPathExactIn } from "../types/PoolKey.js";

import {
    getUniswapV4RouteExactInMultichain,
    GetUniswapV4RouteMultichainParams,
} from "./getUniswapV4RouteMultichain.js";

export interface RouteComponentSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    path: PathKey[];
    amountOut: bigint;
    gasEstimate: bigint;
}

export interface RouteComponentBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
    withSuperchain?: boolean;
}

export type RouteComponent = RouteComponentSwap | RouteComponentBridge;

export type GetRouteMultichainReturnType = {
    flows: [RouteComponent, ...RouteComponent[]];
    amountOut: bigint;
} | null;

const isBridgeWithSuperchain = (currencyIn: Currency, currencyOut: Currency): boolean =>
    isMultichainToken(currencyIn) &&
    currencyIn.isSuperERC20() &&
    isMultichainToken(currencyOut) &&
    currencyOut.isSuperERC20();

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
    params: GetUniswapV4RouteMultichainParams,
): Promise<GetRouteMultichainReturnType> {
    const { currencyIn, currencyOut, exactAmount } = params;

    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // BRIDGE ONLY
    // BRIDGE: Native token bridge
    // TODO: account for bridge and gas fees
    if (currencyIn.isNative && currencyOut.isNative) {
        return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: exactAmount };
    }

    if (
        currencyIn.symbol &&
        currencyOut.symbol &&
        currencyIn.symbol === currencyOut.symbol &&
        currencyIn.symbol in STARGATE_TOKEN_POOLS &&
        currencyOut.symbol in STARGATE_TOKEN_POOLS
    ) {
        return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: exactAmount };
    }

    if (currencyIn instanceof MultichainToken) {
        // BRIDGE
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            return {
                flows: [
                    {
                        type: "BRIDGE",
                        currencyIn,
                        currencyOut,
                        withSuperchain: isBridgeWithSuperchain(currencyIn, currencyOut),
                    },
                ],
                amountOut: exactAmount,
            };
        }
    }

    // SWAP with pre-swap, post-swap bridging
    // Find crosschain pools
    const route = await getUniswapV4RouteExactInMultichain(queryClient, wagmiConfig, params);
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const flows: RouteComponent[] = [];

    const path = poolKeysToPathExactIn(getUniswapV4Address(route.currencyIn), route.route);

    const swap: RouteComponentSwap = {
        type: "SWAP",
        chainId: route.currencyIn.chainId,
        currencyIn: route.currencyIn,
        currencyOut: route.currencyOut,
        route: route.route,
        path,
        amountOut: route.amountOut,
        gasEstimate: route.gasEstimate,
    };

    if (!swap.currencyIn.equals(currencyIn)) {
        const currencyOut = swap.currencyIn;
        // Add input bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn,
            currencyOut,
            withSuperchain: isBridgeWithSuperchain(currencyIn, currencyOut),
        });
    }
    // Add swap
    flows.push(swap);
    if (!swap.currencyOut.equals(currencyOut)) {
        const currencyIn = swap.currencyOut;

        // Add ouput bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn: swap.currencyOut,
            currencyOut,
            withSuperchain: isBridgeWithSuperchain(currencyIn, currencyOut),
        });
    }

    return { flows: flows as [RouteComponent, ...RouteComponent[]], amountOut: route.amountOut };
}
