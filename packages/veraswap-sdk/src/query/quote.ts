import { Config } from "wagmi";
import { Address } from "viem";

import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import { readContractQueryKey } from "wagmi/query";
import { readContract } from "@wagmi/core";
import { queryOptions } from "@tanstack/react-query";
import {
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import { PoolKey } from "../types/PoolKey.js";

export type QuoteType = "quoteExactInputSingle" | "quoteExactOutputSingle";

export interface QuoteParams {
    chainId: number;
    quoterAddress: Address;
    poolKey: PoolKey;
    quoteType: QuoteType;
    exactCurrencyAmount: CurrencyAmount<Currency>;
}

export interface QuoteResult {
    quote: bigint | undefined;
    gasEstimate: bigint | undefined;
    quoteType: QuoteType;
    error: Error | null;
    isLoading: boolean;
}

export function quoteQueryOptions(config: Config, params: QuoteParams) {
    return queryOptions({ queryKey: quoteQueryKey(params), queryFn: () => quote(config, params) });
}

export function quoteQueryKey({ chainId, quoterAddress, poolKey, quoteType, exactCurrencyAmount }: QuoteParams) {
    const zeroForOne =
        quoteType === "quoteExactInputSingle"
            ? exactCurrencyAmount.currency.wrapped.address === poolKey.currency0
            : exactCurrencyAmount.currency.wrapped.address === poolKey.currency1;

    return readContractQueryKey({
        chainId,
        address: quoterAddress,
        abi: [quoteExactInputSingleAbi, quoteExactOutputSingleAbi],
        functionName: quoteType,
        args: [
            {
                poolKey,
                zeroForOne,
                exactAmount: exactCurrencyAmount.quotient.toString(),
                hookData: "0x",
            },
        ],
    });
}

export function quote(
    config: Config,
    { chainId, quoterAddress, poolKey, quoteType, exactCurrencyAmount }: QuoteParams,
) {
    const zeroForOne =
        quoteType === "quoteExactInputSingle"
            ? exactCurrencyAmount.currency.wrapped.address === poolKey.currency0
            : exactCurrencyAmount.currency.wrapped.address === poolKey.currency1;

    return readContract(config, {
        chainId,
        address: quoterAddress,
        abi: [quoteExactInputSingleAbi, quoteExactOutputSingleAbi],
        functionName: quoteType,
        args: [
            {
                poolKey,
                zeroForOne,
                exactAmount: exactCurrencyAmount.quotient.toString(),
                hookData: "0x",
            },
        ],
    }) as Promise<[bigint, bigint]>;
}
