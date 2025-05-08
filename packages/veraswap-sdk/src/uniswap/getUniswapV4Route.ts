import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { flatten, maxBy, minBy, uniqWith, zip } from "lodash-es";
import { Address, numberToHex } from "viem";

import { IStateView } from "../artifacts/IStateView.js";
import {
    quoteExactInput as quoteExactInputAbi,
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutput as quoteExactOutputAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import { UnexpectedRevertBytes } from "../artifacts/V4Quoter.js";
import {
    createPoolKey,
    DEFAULT_POOL_PARAMS,
    getPoolId,
    getPoolKeyEncoding,
    PoolKey,
    poolKeyEqual,
    PoolKeyOptions,
    poolKeysToPathExactIn,
    poolKeysToPathExactOut,
} from "../types/PoolKey.js";

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

/**
 * Returns trade routes as lists of pool keys that start with currencyIn and output currencyOut
 * @param currencyHops an array of possible intermediate tokens to swap currencyIn and currencyOut with
 */
export function getPoolKeyRoutePermutations(
    currencyIn: Address,
    currencyOut: Address,
    currencyHops: Address[],
    poolKeyOptions?: PoolKeyOptions[],
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
 * Get Uniswap V4 Routes that have active liquidity
 */
export interface GetUniswapV4RoutesWithLiquidityParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    currencyHops: Address[];
    contracts: {
        v4StateView: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
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
    const { chainId, currencyIn, currencyOut, currencyHops, contracts, poolKeyOptions } = params;
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

    const poolKeysWithLiquidity = poolKeys.filter((_, idx) => poolKeysLiquidity[idx] > 0n);

    const poolKeysWithLiquidityEncoded = new Set(poolKeysWithLiquidity.map((poolKey) => getPoolKeyEncoding(poolKey)));

    // Filter out routes with no liquidity
    const routesWithLiquidity = routes.filter((route) =>
        // All pool keys in the route must have liquidity
        route.every((poolKey) => poolKeysWithLiquidityEncoded.has(getPoolKeyEncoding(poolKey))),
    );

    return routesWithLiquidity;
}

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
 * Get Uniswap V4 Route with `quoteExactIn` with highest `amountOut`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns
 */
export async function getUniswapV4RouteExactIn(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteParams,
): Promise<{ route: PoolKey[]; amountOut: bigint; gasEstimate: bigint } | null> {
    const { chainId, exactAmount, currencyIn, currencyOut, contracts } = params;
    const zeroForOne = currencyIn < currencyOut;

    const routesWithLiquidity = await getUniswapV4RoutesWithLiquidity(queryClient, wagmiConfig, params);
    if (routesWithLiquidity.length === 0) return null; // No active liquidity

    const routeQuotes = await Promise.allSettled(
        routesWithLiquidity.map((route) => {
            if (route.length == 1) {
                // Single-hop
                const poolKey = route[0];
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactInputSingleAbi, UnexpectedRevertBytes],
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
                ) as unknown as Promise<[amountOut: bigint, gasEstimate: bigint]>;
            } else {
                // Multi-hop
                const path = poolKeysToPathExactIn(currencyIn, route);
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactInputAbi, UnexpectedRevertBytes],
                        functionName: "quoteExactInput",
                        args: [
                            {
                                exactCurrency: currencyIn,
                                path,
                                exactAmount: numberToHex(exactAmount),
                            },
                        ],
                    }),
                ) as unknown as Promise<[amountOut: bigint, gasEstimate: bigint]>;
            }
        }),
    );

    const routesWithQuotes = zip(routesWithLiquidity, routeQuotes)
        .filter(([, quoteResult]) => quoteResult?.status === "fulfilled")
        .map(([route, quoteResult]) => {
            // TODO: Update amountOut to account for gas?
            const quote = (quoteResult as PromiseFulfilledResult<[amountOut: bigint, gasEstimate: bigint]>).value;
            return {
                route: route!,
                amountOut: quote[0],
                gasEstimate: quote[1],
            };
        });

    if (routesWithQuotes.length === 0) return null;

    const bestRoute = maxBy(routesWithQuotes, (r) => r.amountOut)!;
    if (bestRoute.amountOut === 0n) return null;

    return bestRoute;
}

/**
 * Get Uniswap V4 Route with `quoteExactOut` with lowest `amountIn`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns
 */
export async function getUniswapV4RouteExactOut(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteParams,
): Promise<{ route: PoolKey[]; amountIn: bigint; gasEstimate: bigint } | null> {
    const { chainId, exactAmount, currencyIn, currencyOut, contracts } = params;
    const zeroForOne = currencyIn < currencyOut;

    const routesWithLiquidity = await getUniswapV4RoutesWithLiquidity(queryClient, wagmiConfig, params);
    if (routesWithLiquidity.length === 0) return null; // No active liquidity

    const routeQuotes = await Promise.allSettled(
        routesWithLiquidity.map((route) => {
            if (route.length == 1) {
                // Single-hop
                const poolKey = route[0];
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactOutputSingleAbi, UnexpectedRevertBytes],
                        functionName: "quoteExactOutputSingle",
                        args: [
                            {
                                poolKey,
                                zeroForOne,
                                exactAmount: numberToHex(exactAmount),
                                hookData: "0x",
                            },
                        ],
                    }),
                ) as unknown as Promise<[amountIn: bigint, gasEstimate: bigint]>;
            } else {
                // Multi-hop
                const path = poolKeysToPathExactOut(currencyOut, route);
                return queryClient.fetchQuery(
                    readContractQueryOptions(wagmiConfig, {
                        chainId,
                        address: contracts.v4Quoter,
                        abi: [quoteExactOutputAbi, UnexpectedRevertBytes],
                        functionName: "quoteExactOutput",
                        args: [
                            {
                                exactCurrency: currencyOut,
                                path,
                                exactAmount: numberToHex(exactAmount),
                            },
                        ],
                    }),
                ) as unknown as Promise<[amountIn: bigint, gasEstimate: bigint]>;
            }
        }),
    );

    const routesWithQuotes = zip(routesWithLiquidity, routeQuotes)
        .filter(([, quoteResult]) => quoteResult?.status === "fulfilled")
        .map(([route, quoteResult]) => {
            // TODO: Update amountIn to account for gas?
            const quote = (quoteResult as PromiseFulfilledResult<[amountIn: bigint, gasEstimate: bigint]>).value;
            return {
                route: route!,
                amountIn: quote[0],
                gasEstimate: quote[1],
            };
        });

    if (routesWithQuotes.length === 0) return null;

    const bestRoute = minBy(routesWithQuotes, (r) => r.amountIn)!;
    if (bestRoute.amountIn === 0n) return null;

    return bestRoute;
}
