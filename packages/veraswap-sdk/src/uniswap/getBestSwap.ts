import { getUniswapRoutingQuote } from "./getUniswapRoutingQuote.js";
import { GetQuoteArgs, TradeResult, QuoteState } from "../types/uniswapRouting.js";

export async function getBestSwap(quoteConfigs: GetQuoteArgs[], apiKey: string) {
    if (!quoteConfigs.length) return null;

    const tradeResults = await Promise.all(
        quoteConfigs.map(async (config) => {
            try {
                const response = await getUniswapRoutingQuote(config, apiKey);
                return response.data as TradeResult;
            } catch (error) {
                console.error(`Quote failed for ${config.tokenInAddress} → ${config.tokenOutAddress}:`, error);
                return { state: QuoteState.NOT_FOUND } as TradeResult;
            }
        }),
    );

    const validTrades = tradeResults.filter((trade) => trade.state === QuoteState.SUCCESS && trade.trade);
    if (!validTrades.length) return null;

    return validTrades.reduce((best, current) => {
        return Number(current.trade!.outputAmount.toExact()) > Number(best.trade!.outputAmount.toExact())
            ? current
            : best;
    }, validTrades[0]);
}

export async function getBestSequentialSwap(
    tokenInToUSDC: GetQuoteArgs[],
    usdcToTokenOut: GetQuoteArgs[],
    apiKey: string,
) {
    const bestTokenInToUSDC = await getBestSwap(tokenInToUSDC, apiKey);

    if (!bestTokenInToUSDC) {
        console.log("No valid trade found for TokenIn → USDC.");
        return { bestTokenInToUSDC: null, bestUSDCToTokenOut: null };
    }

    const usdcAmount = bestTokenInToUSDC.trade?.outputAmount.quotient.toString();
    if (!usdcAmount) {
        console.log("Invalid USDC output amount.");
        return { bestTokenInToUSDC, bestUSDCToTokenOut: null };
    }

    const updatedUsdcToTokenOut = usdcToTokenOut.map((quote) => ({
        ...quote,
        amount: usdcAmount,
    }));

    const bestUSDCToTokenOut = await getBestSwap(updatedUsdcToTokenOut, apiKey);

    if (!bestUSDCToTokenOut) {
        console.log("No valid trade found for USDC → TokenOut.");
        return { bestTokenInToUSDC, bestUSDCToTokenOut: null };
    }

    return { bestTokenInToUSDC, bestUSDCToTokenOut };
}
