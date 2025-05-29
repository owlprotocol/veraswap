import { useMemo } from "react";
import { Address } from "viem";
import { BigNumber } from "@ethersproject/bignumber";
import { useGetTokenValues } from "./useGetTokenValues.js";
import { BasketPercentageAllocation } from "@/constants/baskets.js";

/** 10e18 */
export const shareDecimals = 18;
export const shareUnits = 10n ** BigInt(shareDecimals);

export function useBasketWeights({
    chainId = 0,
    basketDetails,
    // quoteCurrency = { address: zeroAddress, decimals: 18 },
}: {
    chainId?: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    // quoteCurrency?: { address: Address; decimals: number };
}): {
    totalValue: bigint;
    tokenValues: bigint[];
    weights: number[];
    percentages: string[];
    basketPercentageAllocations: BasketPercentageAllocation[];
    isReady: boolean;
    isLoading: boolean;
    isError: boolean;
} {
    const {
        data: tokenValues,
        pending: isLoading,
        // isError,
    } = useGetTokenValues({
        chainId,
        basketDetails,
    });

    const isError = tokenValues.some((value) => value === 0n);

    const calculatedData = useMemo(() => {
        // In wei units of the quote currency
        // const tokenValues = tokenValuesUsd.map(
        //     (value) => (value * currencyConversion) / 10n ** BigInt(quoteCurrency.decimals),
        // );

        if (tokenValues.length === 0 || isError) {
            return {
                totalValue: 0n,
                tokenValues: [],
                weights: [],
                percentages: [],
                basketPercentageAllocations: [],
                isReady: false,
                isLoading: false,
                isError,
            };
        }

        // Value for $1 of the token
        const tokenValuesAdjusted = tokenValues.map((value, idx) => {
            const tokenOneUsdAmount = value;
            // How many units of the token are in 10e18 units of the basket
            const units = basketDetails[idx].units;

            // How much the token is worth in usd for one ether share of the basket
            return BigNumber.from(units as unknown as number)
                .mul(shareUnits as unknown as number)
                .div(tokenOneUsdAmount as unknown as number)
                .toBigInt();
        });

        // Total value for units quoted (unitsToQuote)
        const totalValue = tokenValuesAdjusted.reduce((sum: bigint, curr) => sum + curr, 0n);

        const weights = tokenValuesAdjusted.map((value) =>
            totalValue > 0n
                ? // TODO: clean up
                  BigNumber.from(value as unknown as number)
                      .mul(10000000) // Increase for precision
                      .div(totalValue as unknown as number)
                      .toNumber() / 100000 // Convert to percentage
                : 0,
        );

        const percentages = weights.map((w) => w.toFixed(3));

        return {
            totalValue,
            tokenValues: tokenValuesAdjusted,
            weights,
            percentages,
            basketPercentageAllocations: basketDetails.map((allocation, idx) => ({
                address: allocation.addr,
                chainId,
                weight: weights[idx],
                percentage: percentages[idx],
                units: allocation.units,
            })),
            isReady: true,
        };
    }, [tokenValues, isError, basketDetails, chainId]);

    return {
        ...calculatedData,
        isLoading,
        isError,
    };
}
