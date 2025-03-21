import { prepareUniswapQuotes, prepareUniswapUSDCQuotes } from "./prepareUniswapQuotes.js";
import { VeraSwapToken } from "../types/VeraSwapToken.js";
import { getBestSequentialSwap, getBestSwap } from "../uniswap/getBestSwap.js";
import { TradeResult } from "../types/uniswapRouting.js";
export async function getQuotes({
    tokenIn,
    tokenOut,
    allTokens,
    amount,
    account,
    uniswapApiKey,
}: {
    tokenIn: VeraSwapToken;
    tokenOut: VeraSwapToken;
    allTokens: VeraSwapToken[];
    amount: string;
    account: string;
    uniswapApiKey: string;
}): Promise<{
    bestDirectSwap: TradeResult | null;
    bestTokenInToUSDC: TradeResult | null;
    bestUSDCToTokenOut: TradeResult | null;
}> {
    const quotesPromise = prepareUniswapQuotes(tokenIn, tokenOut, allTokens, amount, account);
    const usdcQuotesPromise = prepareUniswapUSDCQuotes(tokenIn, tokenOut, allTokens, amount, account);

    const bestDirectSwapPromise = quotesPromise.then((quotes) => getBestSwap(quotes, uniswapApiKey));

    const bestSequentialSwapPromise = usdcQuotesPromise.then(({ tokenInToUSDC, usdcToTokenOut }) =>
        getBestSequentialSwap(tokenInToUSDC, usdcToTokenOut, uniswapApiKey),
    );

    const bestDirectSwap = await bestDirectSwapPromise;

    const { bestTokenInToUSDC, bestUSDCToTokenOut } = await bestSequentialSwapPromise;

    return {
        bestDirectSwap,
        bestTokenInToUSDC,
        bestUSDCToTokenOut,
    };
}
