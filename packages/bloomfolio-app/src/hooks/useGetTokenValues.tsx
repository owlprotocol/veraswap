import { Address } from "viem";
import { useQueries } from "@tanstack/react-query";

import { getTokenDollarValueQueryOptions } from "@owlprotocol/veraswap-sdk";
import { config } from "@/config.js";

export function useGetTokenValues({
    chainId,
    basketDetails,
}: {
    chainId?: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
}) {
    return useQueries({
        queries: basketDetails.map((allocation) => ({
            ...getTokenDollarValueQueryOptions(config, {
                tokenAddress: allocation.addr,
                chainId,
            }),
            refetchInterval: 2000,
            refetchOnWindowFocus: false,
            staleTime: 2000,
        })),
        combine: (results) => ({
            data: results.map((result) => {
                if (!result.data) return 0n;

                return result.data;
            }),
            pending: results.some((result) => result.isPending),
        }),
    });
}
