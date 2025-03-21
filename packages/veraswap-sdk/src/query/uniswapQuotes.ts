import { queryOptions } from "@tanstack/react-query";
import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { getBestSwap, getBestSequentialSwap } from "../uniswap/getBestSwap.js";
import { prepareUniswapQuotes, prepareUniswapUSDCQuotes } from "../utils/prepareUniswapQuotes.js";

interface UseUniswapQuotesParams {
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
    allTokens: VeraSwapToken[];
    amount: string;
    account: string;
    uniswapApiKey: string;
}

function directSwapQueryKey(params: UseUniswapQuotesParams) {
    return ["uniswapQuotes", "direct", params.tokenIn.address, params.tokenOut.address, params.amount, params.account];
}

function usdcSwapQueryKey(params: UseUniswapQuotesParams) {
    return ["uniswapQuotes", "USDC", params.tokenIn.address, params.tokenOut.address, params.amount, params.account];
}

async function directSwapQueryFn(params: UseUniswapQuotesParams) {
    const quotes = await prepareUniswapQuotes(
        params.tokenIn,
        params.tokenOut,
        params.allTokens,
        params.amount,
        params.account,
    );
    return getBestSwap(quotes, params.uniswapApiKey);
}

async function usdcSwapQueryFn(params: UseUniswapQuotesParams) {
    const { tokenInToUSDC, usdcToTokenOut } = await prepareUniswapUSDCQuotes(
        params.tokenIn,
        params.tokenOut,
        params.allTokens,
        params.amount,
        params.account,
    );
    return getBestSequentialSwap(tokenInToUSDC, usdcToTokenOut, params.uniswapApiKey);
}

export function directSwapQueryOptions(params: UseUniswapQuotesParams) {
    return queryOptions({
        queryKey: directSwapQueryKey(params),
        queryFn: () => directSwapQueryFn(params),
        retry: 1,
    });
}

export function usdcSwapQueryOptions(params: UseUniswapQuotesParams) {
    return queryOptions({
        queryKey: usdcSwapQueryKey(params),
        queryFn: () => usdcSwapQueryFn(params),
        retry: 1,
    });
}
