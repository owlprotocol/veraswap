import { Address } from "viem";
import { useQueries } from "@tanstack/react-query";

import { BigNumber } from "@ethersproject/bignumber";
import { getTokenDollarValueQueryOptions } from "@owlprotocol/veraswap-sdk";
import { config } from "@/config.js";

export const unitsToQuote = 10n ** 18n;

export function useGetTokenValues({
    chainId,
    basketDetails,
    // quoteCurrency,
}: {
    chainId: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    // quoteCurrency: { address: Address; decimals: number };
}) {
    return useQueries({
        queries: basketDetails.map((allocation) =>
            // TODO: cast return type
            getTokenDollarValueQueryOptions(config, {
                tokenAddress: allocation.addr,
                chainId,
            }),
        ),
        combine: (results) => ({
            data: results.map((result, idx) => {
                if (!result.data) return 0n;

                const tokenAmount = result.data;
                const units = basketDetails[idx].units;

                return (
                    BigNumber.from(tokenAmount as unknown as number)
                        .mul(unitsToQuote as unknown as number)
                        .div(units as unknown as number)
                        // .div(unitsToQuote)
                        .toBigInt()
                );
            }),
            pending: results.some((result) => result.isPending),
        }),
    });
}
