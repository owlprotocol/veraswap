import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address } from "viem";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../types/PoolKey.js";
import { getMetaQuoteExactOutput } from "../uniswap/index.js";
import { MetaQuoteBestType } from "../uniswap/quote/MetaQuoter.js";

export interface GetBasketMintQuoteParams {
    chainId: number;
    basket: Address;
    mintAmount: bigint;
    currencyIn: Address;
    currencyHops: Address[];
    contracts: {
        metaQuoter: Address;
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
export async function getBasketMintQuote(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBasketMintQuoteParams,
) {
    const {
        chainId,
        basket,
        mintAmount,
        currencyIn,
        contracts,
        currencyHops,
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    // Get required underlying tokens and their raw units
    const mintUnits = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: basket,
            abi: BasketFixedUnits.abi,
            functionName: "getMintUnits",
            args: [mintAmount],
        }),
    );

    // Quote exactOut for each token
    const quotes = await Promise.all(
        mintUnits.map(async (mintUnit) => {
            const token = mintUnit.addr;
            const units = mintUnit.units;

            const quote = await getMetaQuoteExactOutput(queryClient, wagmiConfig, {
                chainId,
                currencyIn,
                currencyOut: token,
                amountOut: units,
                currencyHops,
                poolKeyOptions,
                contracts,
            });

            return { quote, currencyOut: token, amountOut: units };
        }),
    );

    const currencyInAmount = quotes.reduce((acc, swap) => {
        const [bestSingleSwap, bestMultihopSwap, bestType] = swap.quote;
        if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
            // Cheapest swap is single hop
            return acc + bestSingleSwap.variableAmount; // Increase input settlement
        } else if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Multihop) {
            // Cheapest swap is multihop
            return acc + bestMultihopSwap.variableAmount; // Increase input settlement
        } else {
            //TODO: Return null?
            throw new Error("no liquidity");
        }
    }, 0n);
    return { mintUnits, quotes, currencyInAmount };
}
