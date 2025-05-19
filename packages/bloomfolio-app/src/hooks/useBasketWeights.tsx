import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useGetTokenValues } from "./useGetTokenValues.js";
import { Basket } from "@/constants/baskets.js";

export function useBasketWeights(basket: Basket) {
    const {
        data: tokenValues,
        isLoading,
        isError,
    } = useGetTokenValues({
        basket,
        quoteCurrency: basket
            ? {
                  address: zeroAddress,
                  chainId: basket.allocations[0].chainId,
              }
            : undefined,
    });

    const calculatedData = useMemo(() => {
        if (!tokenValues || tokenValues.length === 0) {
            return {
                totalValue: 0n,
                weights: [],
                percentages: [],
                isReady: false,
            };
        }

        const totalValue = tokenValues.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n);

        const percentages =
            totalValue > 0n ? tokenValues.map((value) => Number(((value ?? 0n) * 10000n) / totalValue) / 100) : [];

        return {
            totalValue,
            tokenValues,
            percentages,
            isReady: true,
        };
    }, [tokenValues]);

    return {
        ...calculatedData,
        isLoading,
        isError,
    };
}
