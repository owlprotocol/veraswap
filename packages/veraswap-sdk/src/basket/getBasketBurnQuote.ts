import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address } from "viem";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../types/PoolKey.js";
import { getMetaQuoteExactInput } from "../uniswap/index.js";
import { V4MetaQuoteBestType } from "../uniswap/V4MetaQuoter.js";

export interface GetBasketBurnQuoteParams {
    chainId: number;
    basket: Address;
    amount: bigint;
    currencyOut: Address;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get basket mint quote for input token with amount
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of quotes
 */
export async function getBasketBurnQuote(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBasketBurnQuoteParams,
) {
    const {
        chainId,
        basket,
        amount,
        currencyOut,
        contracts,
        currencyHops,
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    // Get required underlying tokens and their raw units
    const basketUnits = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: basket,
            abi: BasketFixedUnits.abi,
            functionName: "getMintUnits",
            args: [amount],
        }),
    );

    // Quote exactOut for each token
    const quotes = await Promise.all(
        basketUnits.map(async (tokenUnits) => {
            const token = tokenUnits.addr;
            const units = tokenUnits.units;

            const quote = await getMetaQuoteExactInput(queryClient, wagmiConfig, {
                chainId,
                currencyIn: token,
                currencyOut,
                amountIn: units,
                currencyHops,
                poolKeyOptions,
                contracts,
            });

            return { quote, currencyOut: token, amountOut: units };
        }),
    );

    const currencyOutAmount = quotes.reduce((acc, swap) => {
        const [bestSingleSwap, bestMultihopSwap, bestType] = swap.quote;
        if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Single) {
            // Cheapest swap is single hop
            return acc + bestSingleSwap.variableAmount; // Increase input settlement
        } else if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Multihop) {
            // Cheapest swap is multihop
            return acc + bestMultihopSwap.variableAmount; // Increase input settlement
        } else {
            //TODO: Return null?
            throw new Error("no liquidity");
        }
    }, 0n);
    return { burnUnits: basketUnits, quotes, currencyOutAmount };
}
