import { useReadContract } from "wagmi";
import { Address, getAddress } from "viem";

import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import {
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";

type QuoteType = "quoteExactInputSingle" | "quoteExactOutputSingle";

interface PoolKey {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
}

interface UseQuoteParams {
    poolKey: PoolKey;
    exactCurrencyAmount: CurrencyAmount<Currency>;
    quoteType: QuoteType;
    quoterAddress: Address;
}
interface QuoteResult {
    quote: bigint | undefined;
    gasEstimate: bigint | undefined;
    quoteType: QuoteType;
    error: Error | null;
    isLoading: boolean;
}

export function useQuote({ poolKey, exactCurrencyAmount, quoteType, quoterAddress }: UseQuoteParams): QuoteResult {
    const functionName = quoteType;

    const [sortedCurrency0, sortedCurrency1] =
        poolKey.currency0 < poolKey.currency1
            ? [poolKey.currency0, poolKey.currency1]
            : [poolKey.currency1, poolKey.currency0];

    const formattedPoolKey = {
        currency0: getAddress(sortedCurrency0),
        currency1: getAddress(sortedCurrency1),
        fee: poolKey.fee,
        tickSpacing: poolKey.tickSpacing,
        hooks: getAddress(poolKey.hooks),
    };

    console.log("formattedPoolKey", formattedPoolKey);

    // TODO: only works for erc20 (type Token)
    const zeroForOne =
        quoteType === "quoteExactInputSingle"
            ? exactCurrencyAmount.currency.wrapped.address === formattedPoolKey.currency0
            : exactCurrencyAmount.currency.wrapped.address === formattedPoolKey.currency1;

    const exactAmount = BigInt(exactCurrencyAmount.decimalScale.toString());
    const args = [
        {
            poolKey: formattedPoolKey,
            zeroForOne,
            exactAmount,
            hookData: "0x",
        },
    ];

    const { data, error, isLoading } = useReadContract({
        address: quoterAddress,
        abi: [quoteExactInputSingleAbi, quoteExactOutputSingleAbi],
        functionName,
        args,
        query: { enabled: exactAmount > 0 },
    });

    return {
        quote: data ? data[0] : undefined,
        gasEstimate: data ? data[1] : undefined,
        quoteType,
        error,
        isLoading,
    };
}
