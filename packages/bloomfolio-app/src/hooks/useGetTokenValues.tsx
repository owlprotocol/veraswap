import { getUniswapV4RouteExactIn, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { Address } from "viem";
import { useQuery } from "@tanstack/react-query";

import { config } from "@/config.js";
import { Basket } from "@/constants/baskets.js";
import { getCurrencyHops, getTokenDetailsForAllocation, TOKENS } from "@/constants/tokens.js";
import { queryClient } from "@/queryClient.js";

export function useGetTokenValues({
    basket,
    quoteCurrency,
}: {
    basket?: Basket;
    quoteCurrency?: { address: Address; chainId: number };
}) {
    return useQuery({
        queryKey: ["getTokenValues", basket?.id ?? "", quoteCurrency?.address ?? ""],
        queryFn: async () => {
            if (!basket || !quoteCurrency) return null;

            const chainId = basket.allocations[0].chainId;

            const quotes = await Promise.all(
                basket.allocations.map(async (allocation) => {
                    const token = getTokenDetailsForAllocation(allocation, TOKENS);
                    if (!token) return null;

                    return getUniswapV4RouteExactIn(queryClient, config, {
                        chainId,
                        exactAmount: allocation.units,
                        currencyIn: token.address,
                        currencyOut: quoteCurrency.address,
                        contracts: UNISWAP_CONTRACTS[allocation.chainId]!,
                        currencyHops: getCurrencyHops(chainId),
                    });
                }),
            );

            return quotes.map((q) => q?.amountOut);
        },
        enabled: !!basket && !!quoteCurrency,
    });
}
