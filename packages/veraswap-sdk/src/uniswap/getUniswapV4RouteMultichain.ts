import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { maxBy, zip } from "lodash-es";
import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { Currency, getSharedChainTokenPairs, getUniswapV4Address } from "../currency/currency.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { PoolKey, PoolKeyOptions } from "../types/PoolKey.js";

import { getUniswapV4Route, getUniswapV4RoutesWithLiquidity } from "./getUniswapV4Route.js";

export interface GetUniswapV4RouteMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    exactAmount: bigint;
    contractsByChain: Record<number, { v4StateView: Address; v4Quoter: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get best Uniswap V4 Route for chains where token share a deployment
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapV4RouteMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteMultichainParams,
): Promise<{
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    amountOut: bigint;
    gasEstimate: bigint;
} | null> {
    const { currencyIn, currencyOut, currencyHopsByChain, exactAmount, contractsByChain, poolKeyOptions } = params;
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    const routes = (
        await Promise.all(
            tokenPairs.map(async (pair) => {
                const [currIn, currOut] = pair;
                const chainId = currIn.chainId;
                const currencyHops = currencyHopsByChain[chainId] ?? [zeroAddress];
                const contracts = contractsByChain[chainId];
                if (!contracts) return null; // No uniswap deployment on this chain

                const route = await getUniswapV4Route(queryClient, wagmiConfig, {
                    chainId,
                    currencyIn: getUniswapV4Address(currIn),
                    currencyOut: getUniswapV4Address(currOut),
                    currencyHops,
                    exactAmount,
                    contracts,
                    poolKeyOptions,
                });
                if (!route) return null;

                return {
                    ...route,
                    currencyIn: currIn,
                    currencyOut: currOut,
                };
            }),
        )
    ).filter((route) => !!route);

    if (routes.length === 0) return null; // No active liquidity

    const bestRoute = maxBy(routes, (r) => r.amountOut)!;
    return bestRoute;
}

export interface GetUniswapV4RoutesWithLiquidityMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    currencyHopsByChain: Record<number, Address[]>;
    contractsByChain: Record<number, { v4StateView: Address }>;
    poolKeyOptions?: PoolKeyOptions[];
}
/**
 * Take token pair and find which chain(s) they can be swapped on
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapV4RoutesWithLiquidityMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RoutesWithLiquidityMultichainParams,
) {
    const { currencyIn, currencyOut, currencyHopsByChain, contractsByChain, poolKeyOptions } = params;
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    const routesWithLiquidity = await Promise.all(
        tokenPairs.map(async (pair) => {
            const [currIn, currOut] = pair;
            const chainId = currIn.chainId;
            const currencyHops = currencyHopsByChain[chainId] ?? [zeroAddress]; // Default to just checking native token
            const contracts = contractsByChain[chainId];
            invariant(
                !!contracts,
                `getUniswapV4RoutesWithLiquidityMultichain: contracts undefined for chain ${chainId}`,
            );

            return getUniswapV4RoutesWithLiquidity(queryClient, wagmiConfig, {
                chainId,
                currencyIn: getUniswapV4Address(currIn),
                currencyOut: getUniswapV4Address(currOut),
                currencyHops,
                contracts,
                poolKeyOptions,
            });
        }),
    );

    const multichainRoutes = zip(tokenPairs, routesWithLiquidity).map(([pair, routes]) => {
        return {
            pair: pair!,
            routes: routes!,
        };
    });

    return multichainRoutes;
}

export interface RouteComponentSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    amountOut: bigint;
    gasEstimate: bigint;
}

export interface RouteComponentBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
}

export type RouteComponent = RouteComponentSwap | RouteComponentBridge;

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
): Promise<[RouteComponent, ...RouteComponent[]] | null> {
    const { currencyIn, currencyOut } = params;

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
    const route = await getUniswapV4RouteMultichain(queryClient, wagmiConfig, params);
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const flows: RouteComponent[] = [];

    const swap: RouteComponentSwap = {
        type: "SWAP",
        chainId: route.currencyIn.chainId,
        currencyIn: route.currencyIn,
        currencyOut: route.currencyOut,
        route: route.route,
        amountOut: route.amountOut,
        gasEstimate: route.gasEstimate,
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

    return flows as [RouteComponent, ...RouteComponent[]];
}
