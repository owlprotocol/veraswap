import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { flatten, maxBy, uniqWith, zip } from "lodash-es";
import { Address, numberToHex } from "viem";

import { IStateView } from "../artifacts/IStateView.js";
import {
    quoteExactInput as quoteExactInputAbi,
    quoteExactInputSingle as quoteExactInputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import {
    createPoolKey,
    DEFAULT_POOL_PARAMS,
    getPoolId,
    getPoolKeyEncoding,
    PoolKey,
    poolKeyEqual,
    PoolKeyOptions,
    poolKeysToPath,
} from "../types/PoolKey.js";

/**
 * Get best Uniswap V4 Route
 */
export interface GetUniswapV4RouteParams extends GetUniswapV4RoutesWithLiquidityParams {
    exactAmount: bigint;
    contracts: {
        v4StateView: Address;
        v4Quoter: Address;
    };
}

/**
 * Get best Uniswap V4 Route
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns
 */
export async function getUniswapV4Route(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteParams,
) {
    const { chainId, exactAmount, currencyIn, currencyOut, contracts } = params;
    const zeroForOne = currencyIn < currencyOut;

    const routesWithLiquidity = await getUniswapV4RoutesWithLiquidity(queryClient, wagmiConfig, params);

    const routeQuotes = (await Promise.all(
        routesWithLiquidity.map((route) => {
            if (route.length == 1) {
                // Single-hop
                const poolKey = route[0];
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactInputSingleAbi],
                        functionName: "quoteExactInputSingle",
                        args: [
                            {
                                poolKey,
                                zeroForOne,
                                exactAmount: numberToHex(exactAmount),
                                hookData: "0x",
                            },
                        ],
                    }),
                );
            } else {
                // Multi-hop
                const path = poolKeysToPath(currencyIn, route);
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactInputAbi],
                        functionName: "quoteExactInput",
                        args: [
                            {
                                exactCurrency: currencyIn,
                                path,
                                exactAmount: numberToHex(exactAmount),
                            },
                        ],
                    }),
                );
            }
        }),
    )) as [amountOut: bigint, gasEstimate: bigint][];

    const routesWithQuotes = zip(routesWithLiquidity, routeQuotes).map(([route, quote]) => {
        // TODO: Update amountOut to account for gas?
        return {
            route: route!,
            amountOut: quote![0],
            gasEstimate: quote![1],
        };
    });
    const bestRoute = maxBy(routesWithQuotes, (r) => r.amountOut)!;

    return bestRoute;
}

/**
 * Get Uniswap V4 Routes that have active liquidity
 */
export interface GetUniswapV4RoutesWithLiquidityParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    currencyHops: Address[];
    poolKeyOptions?: PoolKeyOptions[];
    contracts: {
        v4StateView: Address;
    };
}

/**
 * Get Uniswap V4 Routes that have active liquidity
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns
 */
export async function getUniswapV4RoutesWithLiquidity(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RoutesWithLiquidityParams,
) {
    const { chainId, currencyIn, currencyOut, currencyHops, contracts } = params;
    const poolKeyOptions: PoolKeyOptions[] = params.poolKeyOptions ?? Object.values(DEFAULT_POOL_PARAMS);

    const routes = getPoolKeyRoutePermutations(currencyIn, currencyOut, currencyHops, poolKeyOptions);

    // Find pools with liquidity
    const poolKeys = uniqWith(flatten(routes), poolKeyEqual);
    const poolKeysLiquidity = await Promise.all(
        poolKeys.map((poolKey) =>
            queryClient.fetchQuery(
                readContractQueryOptions(wagmiConfig, {
                    chainId,
                    address: contracts.v4StateView,
                    abi: IStateView.abi,
                    functionName: "getLiquidity",
                    args: [getPoolId(poolKey)],
                }),
            ),
        ),
    );
    const poolKeysWithLiquidity = new Set(
        poolKeys.filter((_, idx) => poolKeysLiquidity[idx] > 0n).map((poolKey) => getPoolKeyEncoding(poolKey)),
    );

    // Filter out routes with no liquidity
    const routesWithLiquidity = routes.filter((route) => {
        // All pool keys must have liquidity
        return route.reduce((acc, poolKey) => acc && poolKeysWithLiquidity.has(getPoolKeyEncoding(poolKey)), true);
    });

    return routesWithLiquidity;
}

/**
 * Return route (list of pool keys) permutations that have [A, ..., B]
 */
export function getPoolKeyRoutePermutations(
    currencyIn: Address,
    currencyOut: Address,
    currencyHops: Address[],
    poolKeyOptions: PoolKeyOptions[] = Object.values(DEFAULT_POOL_PARAMS),
): PoolKey[][] {
    // Filter out any duplicates
    const currencyHopsUniq = currencyHops.filter(
        (currencyHop) => currencyHop != currencyIn && currencyHop != currencyOut,
    );

    // In/Out Pools
    const singleHopRoutes: [PoolKey][] = getPoolKeysForOptions(currencyIn, currencyOut, poolKeyOptions).map(
        (poolKey) => [poolKey],
    );

    const multiHopRoutes: [PoolKey, PoolKey][] = [];

    currencyHopsUniq.forEach((currencyHop) => {
        // In/X Pools
        const poolKeysIn = getPoolKeysForOptions(currencyIn, currencyHop, poolKeyOptions);
        // Out/X Pools
        const poolKeysOut = getPoolKeysForOptions(currencyOut, currencyHop, poolKeyOptions);
        poolKeysIn.forEach((poolKeyIn) => {
            poolKeysOut.forEach((poolKeyOut) => {
                multiHopRoutes.push([poolKeyIn, poolKeyOut]);
            });
        });
    });

    return [...singleHopRoutes, ...multiHopRoutes];
}

/**
 * Get all pool keys for 2 tokens & a list of options
 */
export function getPoolKeysForOptions(
    currencyA: Address,
    currencyB: Address,
    poolKeyOptions: PoolKeyOptions[] = Object.values(DEFAULT_POOL_PARAMS),
): PoolKey[] {
    return poolKeyOptions.map((option) => createPoolKey({ currency0: currencyA, currency1: currencyB, ...option }));
}
