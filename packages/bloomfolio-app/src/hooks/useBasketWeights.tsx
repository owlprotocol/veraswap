import { useMemo } from "react";
import { Address, formatUnits, zeroAddress } from "viem";
import {
    getCurrencyHops,
    USD_CURRENCIES,
    getUniswapV4RouteExactOut,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk";
import { useQuery } from "@tanstack/react-query";
import { useGetTokenValues } from "./useGetTokenValues.js";
import { queryClient } from "@/queryClient.js";
import { config } from "@/config.js";

export function useBasketWeights({
    chainId,
    basketDetails,
    quoteCurrency = { address: zeroAddress, decimals: 18 },
}: {
    chainId: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    quoteCurrency?: { address: Address; decimals: number };
}) {
    const {
        data: tokenValuesUsd,
        pending: isLoading,
        // isError,
    } = useGetTokenValues({
        chainId,
        basketDetails: basketDetails.map(({ addr, units }) => ({ addr, units })),
    });

    const usdCurrency = USD_CURRENCIES[chainId] ?? { address: zeroAddress, decimals: 18 };

    // const { data: currencyConversionQuote } = useQuery({
    //     queryKey: ["currencyConversion", chainId, quoteCurrency.address],
    //     queryFn: async () =>
    //         getUniswapV4RouteExactIn(queryClient, config, {
    //             chainId,
    //             contracts: UNISWAP_CONTRACTS[chainId]!,
    //             currencyIn: usdCurrency.address,
    //             currencyOut: quoteCurrency.address,
    //             currencyHops: getCurrencyHops(chainId).filter(
    //                 (c) => c !== usdCurrency.address && c !== quoteCurrency.address,
    //             ),
    //             exactAmount: 10n ** BigInt(usdCurrency.decimals),
    //         }),
    //     enabled: quoteCurrency.address !== (USD_CURRENCIES[chainId]?.address ?? zeroAddress),
    // });

    const { data: currencyConversionQuote } = useQuery({
        queryKey: ["currencyConversion", chainId, quoteCurrency.address],
        queryFn: async () =>
            getUniswapV4RouteExactOut(queryClient, config, {
                chainId,
                contracts: UNISWAP_CONTRACTS[chainId]!,
                currencyIn: usdCurrency.address,
                currencyOut: quoteCurrency.address,
                currencyHops: getCurrencyHops(chainId).filter(
                    (c) => c !== usdCurrency.address && c !== quoteCurrency.address,
                ),
                exactAmount: 10n ** BigInt(quoteCurrency.decimals),
            }),
        enabled: quoteCurrency.address !== (USD_CURRENCIES[chainId]?.address ?? zeroAddress),
    });

    //  an amount in eth wei. Divide by 10^18 to get the amount in eth unit
    // const currencyConversion = currencyConversionQuote?.amountOut ?? 10n ** 18n;
    const currencyConversion = currencyConversionQuote?.amountIn ?? 10n ** 18n;
    console.log({ currencyConversion });
    // NOTE: token values are off by 10n ** 10n
    console.log({
        currencyConversion,
        fmrat: formatUnits(currencyConversion, 18),
        tokenValuesUsd: tokenValuesUsd.map((v) => formatUnits(v, usdCurrency.decimals)),
    });

    const isError = tokenValuesUsd.some((value) => value === 0n);

    const calculatedData = useMemo(() => {
        // In wei units of the quote currency
        const tokenValues = tokenValuesUsd.map(
            (value) => (value * currencyConversion) / 10n ** BigInt(quoteCurrency.decimals),
        );

        if (!tokenValues || tokenValues.length === 0 || isError) {
            return {
                totalValue: 0n,
                weights: [],
                percentages: [],
                isReady: false,
            };
        }

        // Total value for units quoted (unitsToQuote)
        const totalValue = tokenValues.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n);

        const weights =
            totalValue > 0n
                ? tokenValues.map(
                      (value) =>
                          // TODO: clean up
                          Number(formatUnits(((value ?? 0n) * 10n ** 18n) / totalValue, 18)) * 100,
                  )
                : [];

        console.log({ totalValue, tokenValues, weights, basketDetails });
        const percentages = weights.map((w) => w.toFixed(3));

        return {
            totalValue,
            tokenValues,
            weights,
            percentages,
            isReady: true,
        };
    }, [tokenValuesUsd, isError, currencyConversion]);

    return {
        ...calculatedData,
        isLoading,
        isError,
    };
}
