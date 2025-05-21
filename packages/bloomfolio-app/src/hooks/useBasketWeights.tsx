import { useMemo } from "react";
import { Address, formatUnits, zeroAddress } from "viem";
import { useGetTokenValues } from "./useGetTokenValues.js";

export function useBasketWeights({
    chainId,
    basketDetails,
    quoteCurrency = zeroAddress,
}: {
    chainId: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    quoteCurrency?: Address;
}) {
    const {
        data: tokenValues,
        pending: isLoading,
        // isError,
    } = useGetTokenValues({
        chainId,
        basketDetails,
        quoteCurrency,
    });

    const isError = tokenValues.some((value) => value === 0n);

    const calculatedData = useMemo(() => {
        if (!tokenValues || tokenValues.length === 0 || isError) {
            return {
                totalValue: 0n,
                weights: [],
                percentages: [],
                isReady: false,
            };
        }

        const totalValue = tokenValues.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n);

        const weights =
            totalValue > 0n
                ? tokenValues.map(
                      (value) =>
                          // TODO: clean up
                          Number(formatUnits(((value ?? 0n) * 10n ** 18n) / totalValue, 18)) * 100,
                  )
                : [];
        const percentages = weights.map((w) => w.toFixed(3));

        return {
            totalValue,
            tokenValues,
            weights,
            percentages,
            isReady: true,
        };
    }, [tokenValues, isError]);

    return {
        ...calculatedData,
        isLoading,
        isError,
    };
}
