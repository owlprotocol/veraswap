import { QueryClient } from "@tanstack/react-query";
import { PoolKey } from "@uniswap/v4-sdk";
import { Config } from "@wagmi/core";
import { Address } from "viem";

import { PoolKeyOptions } from "../types/PoolKey.js";
import { getUniswapV4RouteExactIn } from "../uniswap/getUniswapV4Route.js";

export interface GetBasketQuotesParams {
    chainId: number;
    currencyIn: Address;
    currencyHops: Address[];
    contracts: {
        v4StateView: Address;
        v4Quoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
    exactAmount: bigint;
    basketTokens: {
        address: Address;
        weight: bigint;
    }[];
}

export type GetBasketQuotesReturnType = {
    currencyIn: Address;
    currencyOut: Address;
    route: PoolKey[];
    amountIn: bigint;
    amountOut: bigint;
    gasEstimate: bigint;
}[];

/**
 * Get basket quotes for input token with amount
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of quotes
 */
export async function getBasketQuotes(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBasketQuotesParams,
): Promise<GetBasketQuotesReturnType> {
    const { chainId, currencyIn, currencyHops, contracts, poolKeyOptions, exactAmount, basketTokens } = params;

    const totalWeights = basketTokens.reduce((acc, curr) => acc + curr.weight, 0n);

    const quotes = await Promise.all(
        basketTokens.map(async (token) => {
            const exactAmountIn = (exactAmount * token.weight) / totalWeights;
            const quote = await getUniswapV4RouteExactIn(queryClient, wagmiConfig, {
                chainId,
                currencyIn,
                currencyOut: token.address,
                currencyHops,
                contracts,
                poolKeyOptions,
                exactAmount: exactAmountIn,
            });

            if (!quote) return null;

            return {
                currencyIn: currencyIn,
                currencyOut: token.address,
                amountIn: exactAmountIn,
                ...quote,
            };
        }),
    );

    return quotes.filter((quote) => !!quote);
}
