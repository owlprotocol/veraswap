import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { maxBy } from "lodash-es";
import invariant from "tiny-invariant";
import { Address } from "viem";

import { Currency, getSharedChainTokenPairs } from "../../currency/currency.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";

import { getMetaQuoteExactInputQueryOptions } from "./getMetaQuoteExactInput.js";
import { MetaQuoteBestMultihop, MetaQuoteBestSingle, MetaQuoteBestType } from "./MetaQuoter.js";

export interface GetMetaQuoteExactInputMultichain {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<number, { metaQuoter?: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}

//TODO: Refactor as queryOptions with combine?
/**
 * Get best Uniswap Route for chains where token share a deployment
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getMetaQuoteExactInputMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactInputMultichain,
): Promise<{
    currencyIn: Currency;
    currencyOut: Currency;
    amountOut: bigint;
    bestQuoteSingle: MetaQuoteBestSingle;
    bestQuoteMultihop: MetaQuoteBestMultihop;
    bestQuoteType: MetaQuoteBestType;
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
                const { metaQuoter } = contracts;
                if (!metaQuoter) return null; // Missing required contracts

                const options = getMetaQuoteExactInputQueryOptions(wagmiConfig, {
                    chainId,
                    currencyIn: pair[0].wrapped.address,
                    currencyOut: pair[1].wrapped.address,
                    currencyHops: currencyHopsByChain[pair[0].chainId],
                    amountIn,
                    contracts: { metaQuoter },
                    poolKeyOptions,
                });

                let amountOut: bigint;
                const [bestQuoteSingle, bestQuoteMultihop, bestQuoteType] = await queryClient.fetchQuery(options);
                if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.None) {
                    return null; // No active route
                } else if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
                    amountOut = bestQuoteSingle.variableAmount;
                } else {
                    amountOut = bestQuoteMultihop.variableAmount;
                }

                return {
                    currencyIn: pair[0],
                    currencyOut: pair[1],
                    amountOut,
                    bestQuoteSingle,
                    bestQuoteMultihop,
                    bestQuoteType,
                };
            }),
        )
    ).filter((route) => route !== null);

    if (routes.length === 0) return null; // No active route

    const bestRoute = maxBy(routes, (r) => r.amountOut)!;
    return bestRoute;
}
