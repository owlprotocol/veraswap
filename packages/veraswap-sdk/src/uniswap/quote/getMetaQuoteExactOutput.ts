import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex } from "viem";

import { metaQuoteExactOutputBest } from "../../artifacts/IV4MetaQuoter.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { V4MetaQuoteExactBestReturnType } from "../V4MetaQuoter.js";

export interface GetMetaQuoteExactOutputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountOut: bigint;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

export async function getMetaQuoteExactOutput(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactOutputParams,
): Promise<V4MetaQuoteExactBestReturnType> {
    const { chainId, currencyOut, amountOut, currencyIn, contracts, currencyHops, poolKeyOptions } = params;

    const quote = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: contracts.v4MetaQuoter,
            abi: [metaQuoteExactOutputBest],
            functionName: "metaQuoteExactOutputBest",
            args: [
                {
                    exactCurrency: currencyOut,
                    variableCurrency: currencyIn,
                    hopCurrencies: currencyHops.filter(
                        (hopToken) => hopToken !== currencyOut && hopToken !== currencyIn,
                    ),
                    exactAmount: numberToHex(amountOut),
                    poolKeyOptions,
                } as const,
            ],
        }),
    );

    return quote;
}
