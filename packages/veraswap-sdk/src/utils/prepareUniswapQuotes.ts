import { findMatchingChainIds } from "./findMatchingChainIds.js";
import { GetQuoteArgs, RouterPreference, TradeType, URAQuoteType } from "../types/uniswapRouting.js";
import { VeraSwapToken } from "../types/VeraSwapToken.js";

export async function prepareUniswapQuotes(
    token1: VeraSwapToken,
    token2: VeraSwapToken,
    allTokens: VeraSwapToken[],
    amount: string,
    account: string,
): Promise<GetQuoteArgs[]> {
    const matchingChains = await findMatchingChainIds(token1, token2, allTokens);

    if (!matchingChains.length) {
        console.log("No matching chain IDs found.");
        return [];
    }

    return matchingChains.map(({ token1, token2 }) => ({
        account,
        amount,
        routerPreference: RouterPreference.API,
        routingType: URAQuoteType.CLASSIC,
        tradeType: TradeType.EXACT_INPUT,
        tokenInAddress: token1.collateralAddress ?? token1.address,
        tokenOutAddress: token2.collateralAddress ?? token2.address,
        tokenInChainId: token1.chainId,
        tokenOutChainId: token2.chainId,
        tokenInDecimals: token1.decimals,
        tokenOutDecimals: token2.decimals,
        tokenInSymbol: token1.symbol,
        tokenOutSymbol: token2.symbol,
    }));
}

const USDC_ADDRESSES: Record<number, string> = {
    1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    // TODO: Add More
};
export async function prepareUniswapUSDCQuotes(
    tokenIn: VeraSwapToken,
    tokenOut: VeraSwapToken,
    allTokens: VeraSwapToken[],
    amount: string,
    account: string,
): Promise<{ tokenInToUSDC: GetQuoteArgs[]; usdcToTokenOut: GetQuoteArgs[] }> {
    const matchingChains = await findMatchingChainIds(tokenIn, tokenOut, allTokens);

    if (!matchingChains.length) {
        console.log("No matching chain IDs found.");
        return { tokenInToUSDC: [], usdcToTokenOut: [] };
    }

    const tokenInToUSDC: GetQuoteArgs[] = [];
    const usdcToTokenOut: GetQuoteArgs[] = [];

    for (const { token1, token2 } of matchingChains) {
        const usdcAddress = USDC_ADDRESSES[token1.chainId] ?? null;

        if (!usdcAddress) {
            console.warn(`No USDC address found for chainId: ${token1.chainId}`);
            continue;
        }

        tokenInToUSDC.push({
            account,
            amount,
            routerPreference: RouterPreference.API,
            routingType: URAQuoteType.CLASSIC,
            tradeType: TradeType.EXACT_INPUT,
            tokenInAddress: token1.collateralAddress ?? token1.address,
            tokenOutAddress: usdcAddress,
            tokenInChainId: token1.chainId,
            tokenOutChainId: token1.chainId,
            tokenInDecimals: token1.decimals,
            tokenOutDecimals: 6,
            tokenInSymbol: token1.symbol,
            tokenOutSymbol: "USDC",
        });

        usdcToTokenOut.push({
            account,
            amount,
            routerPreference: RouterPreference.API,
            routingType: URAQuoteType.CLASSIC,
            tradeType: TradeType.EXACT_INPUT,
            tokenInAddress: usdcAddress,
            tokenOutAddress: token2.collateralAddress ?? token2.address,
            tokenInChainId: token2.chainId,
            tokenOutChainId: token2.chainId,
            tokenInDecimals: 6,
            tokenOutDecimals: token2.decimals,
            tokenInSymbol: "USDC",
            tokenOutSymbol: token2.symbol,
        });
    }

    return { tokenInToUSDC, usdcToTokenOut };
}
