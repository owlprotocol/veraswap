import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex } from "viem";

import { metaQuoteExactInputBest } from "../../artifacts/IV4MetaQuoter.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { V4MetaQuoteExactBestReturnType } from "../V4MetaQuoter.js";

export interface GetMetaQuoteExactInputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

export async function getMetaQuoteExactInput(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactInputParams,
): Promise<V4MetaQuoteExactBestReturnType> {
    const { chainId, currencyOut, amountIn, currencyIn, contracts, currencyHops, poolKeyOptions } = params;

    const quote = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: contracts.v4MetaQuoter,
            abi: [metaQuoteExactInputBest],
            functionName: "metaQuoteExactInputBest",
            args: [
                {
                    exactCurrency: currencyOut,
                    variableCurrency: currencyIn,
                    hopCurrencies: currencyHops.filter(
                        (hopToken) => hopToken !== currencyOut && hopToken !== currencyIn,
                    ),
                    exactAmount: numberToHex(amountIn),
                    poolKeyOptions,
                } as const,
            ],
        }),
    );

    return quote;
}
