import { useMemo } from "react";
import { formatUnits, zeroAddress } from "viem";
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
            totalValue > 0n
                ? tokenValues.map((value) =>
                      // TODO: clean up
                      (Number(formatUnits(((value ?? 0n) * 10n ** 18n) / totalValue, 18)) * 100).toFixed(3),
                  )
                : [];

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
