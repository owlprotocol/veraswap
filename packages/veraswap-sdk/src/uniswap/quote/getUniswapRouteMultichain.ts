import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { maxBy } from "lodash-es";
import invariant from "tiny-invariant";
import { Address } from "viem";

import { Currency, getSharedChainTokenPairs } from "../../currency/currency.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { CreateCommandParamsGeneric } from "../routerCommands.js";

import { getUniswapRouteExactIn } from "./getUniswapRoute.js";

export interface GetUniswapRouteMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<number, { weth9: Address; metaQuoter: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get best Uniswap Route for chains where token share a deployment
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapRouteExactInMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapRouteMultichainParams,
): Promise<{
    currencyIn: Currency;
    currencyOut: Currency;
    amountOut: bigint;
    value: bigint;
    commands: CreateCommandParamsGeneric[];
} | null> {
    const { currencyIn, currencyOut, amountIn, currencyHopsByChain, contractsByChain, poolKeyOptions } = params;
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    const routes = (
        await Promise.all(
            tokenPairs.map(async (pair) => {
                const chainId = pair[0].chainId;
                const contracts = contractsByChain[chainId];
                if (!contracts) return null; // No uniswap deployment on this chain

                const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
                    chainId,
                    currencyIn: pair[0].wrapped.address,
                    currencyOut: pair[1].wrapped.address,
                    currencyHops: currencyHopsByChain[pair[0].chainId],
                    amountIn,
                    contracts,
                    poolKeyOptions,
                });
                if (!route) return null;
                return {
                    currencyIn: pair[0],
                    currencyOut: pair[1],
                    ...route,
                };
            }),
        )
    ).filter((route) => route !== null);

    if (routes.length === 0) return null; // No active route

    const bestRoute = maxBy(routes, (r) => r.amountOut)!;
    return bestRoute;
}
