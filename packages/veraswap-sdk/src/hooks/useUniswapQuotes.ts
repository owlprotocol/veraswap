import { useQuery } from "@tanstack/react-query";
import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { directSwapQueryOptions, usdcSwapQueryOptions } from "../query/uniswapQuotes.js";

export function useUniswapQuotes(params: {
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
    allTokens: VeraSwapToken[];
    amount: string;
    account: string;
    uniswapApiKey: string;
}) {
    const directQuery = useQuery(directSwapQueryOptions(params));
    const usdcQuery = useQuery(usdcSwapQueryOptions(params));

    return {
        directSwap: directQuery.data ?? null,
        usdcSwap: {
            tokenInToUSDC: usdcQuery.data?.bestTokenInToUSDC ?? null,
            usdcToTokenOut: usdcQuery.data?.bestUSDCToTokenOut ?? null,
        },
        isLoadingDirect: directQuery.isLoading,
        errorDirect: directQuery.error,
        isLoadingUSDC: usdcQuery.isLoading,
        errorUSDC: usdcQuery.error,
        optimalTrade: directQuery.data, // TODO: create function that returns the best one
    };
}
