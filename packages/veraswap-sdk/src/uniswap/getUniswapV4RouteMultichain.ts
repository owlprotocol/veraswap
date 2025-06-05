import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { maxBy, minBy, zip } from "lodash-es";
import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { Currency, getSharedChainTokenPairs, getUniswapV4Address } from "../currency/currency.js";
import { orbiterQuoteQueryOptions } from "../query/orbiterQuote.js";
import { StargateETHQuoteParams, stargateETHQuoteQueryOptions } from "../query/stargateETHQuote.js";
import { PoolKey, PoolKeyOptions } from "../types/PoolKey.js";

import { nativeOnChain } from "./constants/tokens.js";
import {
    getUniswapV4RouteExactIn,
    getUniswapV4RouteExactOut,
    getUniswapV4RoutesWithLiquidity,
} from "./getUniswapV4Route.js";

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
export async function getUniswapV4RouteExactInMultichain(
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
    const { currencyIn, currencyOut, currencyHopsByChain, contractsByChain, poolKeyOptions } = params;
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

                let exactAmount = params.exactAmount;
                if (currencyIn.chainId !== currIn.chainId && currencyIn.isNative && currencyIn.symbol === "ETH") {
                    if (nativeOnChain(currIn.chainId).symbol !== "ETH") {
                        // Can only bridge native ETH
                        return null;
                    }

                    // Address doesn't matter for quote
                    const quoteReceiver = "0x0000000000000000000000000000000000000001";
                    const stargateETHQuoteParams: StargateETHQuoteParams = {
                        amount: exactAmount,
                        srcChain: currencyIn.chainId,
                        dstChain: currIn.chainId,
                        receiver: quoteReceiver,
                    };
                    const stargateQuoteResult = await queryClient.fetchQuery(
                        stargateETHQuoteQueryOptions(wagmiConfig, stargateETHQuoteParams),
                    );

                    if (stargateQuoteResult) {
                        exactAmount = BigInt(stargateQuoteResult.amountFeeRemoved);
                    } else {
                        if (!stargateQuoteResult) {
                            const orbiterQuoteResult = await queryClient.fetchQuery(
                                orbiterQuoteQueryOptions({
                                    amount: exactAmount,
                                    destChainId: currIn.chainId,
                                    destToken: zeroAddress,
                                    sourceChainId: currencyIn.chainId,
                                    sourceToken: zeroAddress,
                                    // User address doesn't matter, but avoid address zero
                                    userAddress: ORBITER_BRIDGE_SWEEP_ADDRESS,
                                }),
                            );

                            // Bridging is needed, but no quote found for either providers
                            if (!orbiterQuoteResult) return null;

                            exactAmount = BigInt(orbiterQuoteResult.details.minDestTokenAmount);
                        }
                    }
                }

                const route = await getUniswapV4RouteExactIn(queryClient, wagmiConfig, {
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

/**
 * Get best Uniswap V4 Route for chains where token share a deployment
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapV4RouteExactOutMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteMultichainParams,
): Promise<{
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    amountIn: bigint;
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

                const route = await getUniswapV4RouteExactOut(queryClient, wagmiConfig, {
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

    const bestRoute = minBy(routes, (r) => r.amountIn)!;
    return bestRoute;
}

// TODO: Code below is unused for now but could become helpful if looking to explore more routes beyond just best input/output
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
