import { Config } from "wagmi";
import { Address } from "viem";

import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
import { readContract } from "@wagmi/core";
import { readContractQueryKey } from "wagmi/query";
import { queryOptions } from "@tanstack/react-query";
import {
    quoteExactInputSingle as quoteExactInputSingleAbi,
    quoteExactOutputSingle as quoteExactOutputSingleAbi,
} from "../artifacts/IV4Quoter.js";
import { PoolKey } from "../types/PoolKey.js";
import { getUniswapRoutingQuote } from "../uniswap/getUniswapRoutingQuote.js";
import { ClassicTrade, GetQuoteArgs, TradeResult } from "../types/uniswapRouting.js";

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
    return queryOptions({ queryKey: quoteQueryKey(params), queryFn: () => quote(config, params), retry: 1 });
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

// UNISWAP API QUOTE

export function apiQuoteQueryKey(params: GetQuoteArgs) {
    return [
        "apiQuote",
        params.account,
        params.amount,
        params.tokenInAddress,
        params.tokenOutAddress,
        params.tokenInChainId,
        params.tokenOutChainId,
        params.tokenInDecimals,
        params.tokenOutDecimals,
        params.tokenInSymbol,
        params.tokenOutSymbol,
        params.routerPreference,
        params.routingType,
        params.tradeType,
    ];
}

export function apiQuote(params: GetQuoteArgs, apiKey: string): Promise<[bigint, bigint]> {
    return getUniswapRoutingQuote(
        {
            account: params.account,
            amount: params.amount,
            routerPreference: params.routerPreference,
            routingType: params.routingType,
            tokenInAddress: params.tokenInAddress,
            tokenOutAddress: params.tokenOutAddress,
            tokenInChainId: params.tokenInChainId,
            tokenOutChainId: params.tokenOutChainId,
            tokenInDecimals: params.tokenInDecimals,
            tokenOutDecimals: params.tokenOutDecimals,
            tradeType: params.tradeType,
            tokenInSymbol: params.tokenInSymbol,
            tokenOutSymbol: params.tokenOutSymbol,
        },
        apiKey,
    ).then((res) => {
        const data = res.data as TradeResult;
        const trade = data.trade as ClassicTrade;

        return [
            BigInt(trade.outputAmount.quotient.toString()),
            trade.gasUseEstimate ? BigInt(trade.gasUseEstimate) : 0n,
        ];
    });
}

export function apiQuoteQueryOptions(params: GetQuoteArgs, apiKey: string) {
    return queryOptions({
        queryKey: apiQuoteQueryKey(params),
        queryFn: () => apiQuote(params, apiKey),
        retry: 1,
    });
}
