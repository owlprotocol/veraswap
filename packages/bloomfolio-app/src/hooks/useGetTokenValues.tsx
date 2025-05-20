import {
    DEFAULT_POOL_PARAMS,
    V4MetaQuoteExactBestParams,
    V4MetaQuoteExactBestReturnType,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk";
import { Address, numberToHex } from "viem";
import { useQueries } from "@tanstack/react-query";

import { metaQuoteExactOutputBest } from "@owlprotocol/veraswap-sdk/artifacts/IV4MetaQuoter";
import { readContractQueryOptions } from "wagmi/query";
import { config } from "@/config.js";
import { getCurrencyHops } from "@/constants/tokens.js";

export const unitsToQuote = 10n ** 16n;

export function useGetTokenValues({
    chainId,
    basketDetails,
    quoteCurrency,
}: {
    chainId: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    quoteCurrency: Address;
}) {
    const v4MetaQuoter = UNISWAP_CONTRACTS[chainId]!.v4MetaQuoter!;
    const hopCurrencies = getCurrencyHops(chainId);

    return useQueries({
        queries: basketDetails.map((allocation) =>
            // TODO: cast return type
            readContractQueryOptions(config, {
                chainId,
                abi: [metaQuoteExactOutputBest],
                address: v4MetaQuoter,
                functionName: "metaQuoteExactOutputBest",
                // @ts-expect-error wrong type since query key can't have a bigint
                args: [
                    {
                        exactAmount: numberToHex(allocation.units * unitsToQuote),
                        exactCurrency: allocation.addr,
                        variableCurrency: quoteCurrency,
                        hopCurrencies,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    },
                ] as V4MetaQuoteExactBestParams,
            }),
        ),
        combine: (results) => ({
            data: results.map((result) => {
                if (!result.data) return 0n;
                // @ts-ignore result.data does exist
                const data = result.data as V4MetaQuoteExactBestReturnType;

                const bestSwap = data[2];
                if (bestSwap === 0) return 0n;

                return data[(bestSwap - 1) as 0 | 1].variableAmount;
            }),
            pending: results.some((result) => result.isPending),
        }),
    });
}
