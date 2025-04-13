import { BigNumber } from "@ethersproject/bignumber";
import { MixedRouteSDK } from "@uniswap/router-sdk";
import { Currency, CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { PoolType } from "@uniswap/universal-router-sdk";
import { Pair, Route as V2Route } from "@uniswap/v2-sdk";
import { FeeAmount, Pool, Route as V3Route } from "@uniswap/v3-sdk";

import {
    ClassicQuoteData,
    ClassicTrade,
    GetQuoteArgs,
    isClassicQuoteResponse,
    QuoteMethod,
    QuoteState,
    RouterPreference,
    SwapFeeInfo,
    SwapRouterNativeAssets,
    TokenInRoute,
    TradeResult,
    URAQuoteResponse,
    URAQuoteType,
    V2PoolInRoute,
    V3PoolInRoute,
} from "../../types/uniswapRouting.js";
import { BIPS_BASE } from "../constants/misc.js";
import { nativeOnChain } from "../constants/tokens.js";

import { getApproveInfo } from "./gas.js";

// TODO(WEB-2050): Convert other instances of tradeType comparison to use this utility function
export function isExactInput(tradeType: TradeType): boolean {
    return tradeType === TradeType.EXACT_INPUT;
}

function parseToken({ address, chainId, decimals, symbol, buyFeeBps, sellFeeBps }: TokenInRoute): Token {
    const buyFeeBpsBN = buyFeeBps ? BigNumber.from(buyFeeBps) : undefined;
    const sellFeeBpsBN = sellFeeBps ? BigNumber.from(sellFeeBps) : undefined;
    return new Token(
        chainId,
        address,
        parseInt(decimals.toString()),
        symbol,
        undefined,
        false,
        buyFeeBpsBN,
        sellFeeBpsBN,
    );
}

function parsePool({ fee, sqrtRatioX96, liquidity, tickCurrent, tokenIn, tokenOut }: V3PoolInRoute): Pool {
    return new Pool(
        parseToken(tokenIn),
        parseToken(tokenOut),
        parseInt(fee) as FeeAmount,
        sqrtRatioX96,
        liquidity,
        parseInt(tickCurrent),
    );
}

const parsePair = ({ reserve0, reserve1 }: V2PoolInRoute): Pair =>
    new Pair(
        CurrencyAmount.fromRawAmount(parseToken(reserve0.token), reserve0.quotient),
        CurrencyAmount.fromRawAmount(parseToken(reserve1.token), reserve1.quotient),
    );

// Prepares the currencies used for the actual Swap (either UniswapX or Universal Router)
// May not match `currencyIn` that the user selected because for ETH inputs in UniswapX, the actual
// swap will use WETH.
export function getTradeCurrencies(
    // args: GetQuoteArgs | GetQuickQuoteArgs,
    args: GetQuoteArgs,
    // Leave this here in case we support Uniswap x after
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _isUniswapXTrade = false,
    routes?: ClassicQuoteData["route"],
): [Currency, Currency] {
    const {
        tokenInAddress,
        tokenInChainId,
        tokenInDecimals,
        tokenInSymbol,
        tokenOutAddress,
        tokenOutChainId,
        tokenOutDecimals,
        tokenOutSymbol,
    } = args;

    const tokenInIsNative = Object.values(SwapRouterNativeAssets).includes(tokenInAddress as SwapRouterNativeAssets);
    const tokenOutIsNative = Object.values(SwapRouterNativeAssets).includes(tokenOutAddress as SwapRouterNativeAssets);

    const serializedTokenIn = routes?.[0]?.[0]?.tokenIn;
    const serializedTokenOut = routes?.[0]?.[routes[0]?.length - 1]?.tokenOut;

    const currencyIn = tokenInIsNative
        ? nativeOnChain(tokenInChainId)
        : parseToken({
            address: tokenInAddress,
            chainId: tokenInChainId,
            decimals: tokenInDecimals,
            symbol: tokenInSymbol,
            buyFeeBps: serializedTokenIn?.buyFeeBps,
            sellFeeBps: serializedTokenIn?.sellFeeBps,
        });
    const currencyOut = tokenOutIsNative
        ? nativeOnChain(tokenOutChainId)
        : parseToken({
            address: tokenOutAddress,
            chainId: tokenOutChainId,
            decimals: tokenOutDecimals,
            symbol: tokenOutSymbol,
            buyFeeBps: serializedTokenOut?.buyFeeBps,
            sellFeeBps: serializedTokenOut?.sellFeeBps,
        });

    return [currencyIn, currencyOut];

    // if (!isUniswapXTrade) {
    //     return [currencyIn, currencyOut];
    // }
    //
    // return [currencyIn.isNative ? currencyIn.wrapped : currencyIn, currencyOut];
}

function getSwapFee(data: ClassicQuoteData): SwapFeeInfo | undefined {
    const { portionAmount, portionBips, portionRecipient } = data;

    if (!portionAmount || !portionBips || !portionRecipient) {
        return undefined;
    }

    return {
        recipient: portionRecipient,
        percent: new Percent(portionBips, BIPS_BASE),
        amount: portionAmount,
    };
}

function getClassicTradeDetails(
    args: GetQuoteArgs,
    data: URAQuoteResponse,
): {
    gasUseEstimate?: number;
    gasUseEstimateUSD?: number;
    blockNumber?: string;
    routes?: RouteResult[];
    swapFee?: SwapFeeInfo;
} {
    const classicQuote =
        data.routing === URAQuoteType.CLASSIC ? data.quote : data.allQuotes.find(isClassicQuoteResponse)?.quote;

    if (!classicQuote) {
        return {};
    }

    const gasUseEstimate = classicQuote.gasUseEstimate ? parseFloat(classicQuote.gasUseEstimate) : undefined;
    const gasUseEstimateUSD = classicQuote.gasFeeUSD ? parseFloat(classicQuote.gasFeeUSD) : undefined;

    return {
        gasUseEstimate,
        gasUseEstimateUSD,
        blockNumber: classicQuote.blockNumber,
        routes: computeRoutes(args, classicQuote.route),
        swapFee: getSwapFee(classicQuote),
    };
}

export function getUSDCostPerGas(gasUseEstimateUSD?: number, gasUseEstimate?: number): number | undefined {
    // Some sus javascript float math but it's ok because its just an estimate for display purposes
    if (!gasUseEstimateUSD || !gasUseEstimate) {
        return undefined;
    }
    return gasUseEstimateUSD / gasUseEstimate;
}

interface RouteResult {
    routev3: V3Route<Currency, Currency> | null;
    routev2: V2Route<Currency, Currency> | null;
    mixedRoute: MixedRouteSDK<Currency, Currency> | null;
    inputAmount: CurrencyAmount<Currency>;
    outputAmount: CurrencyAmount<Currency>;
}

/**
 * Transforms a Routing API quote into an array of routes that can be used to
 * create a `Trade`.
 */
export function computeRoutes(args: GetQuoteArgs, routes: ClassicQuoteData["route"]): RouteResult[] | undefined {
    if (routes.length === 0) {
        return [];
    }
    const [currencyIn, currencyOut] = getTradeCurrencies(args, false, routes);

    try {
        return routes.map((route) => {
            if (route.length === 0) {
                throw new Error("Expected route to have at least one pair or pool");
            }
            const rawAmountIn = route[0].amountIn;
            const rawAmountOut = route[route.length - 1].amountOut;

            if (!rawAmountIn || !rawAmountOut) {
                throw new Error("Expected both amountIn and amountOut to be present");
            }

            const isOnlyV2 = isVersionedRoute<V2PoolInRoute>(PoolType.V2Pool, route);
            const isOnlyV3 = isVersionedRoute<V3PoolInRoute>(PoolType.V3Pool, route);

            return {
                routev3: isOnlyV3 ? new V3Route(route.map(parsePool), currencyIn, currencyOut) : null,
                routev2: isOnlyV2 ? new V2Route(route.map(parsePair), currencyIn, currencyOut) : null,
                mixedRoute:
                    !isOnlyV3 && !isOnlyV2
                        ? new MixedRouteSDK(route.map(parsePoolOrPair), currencyIn, currencyOut)
                        : null,
                inputAmount: CurrencyAmount.fromRawAmount(currencyIn, rawAmountIn),
                outputAmount: CurrencyAmount.fromRawAmount(currencyOut, rawAmountOut),
            };
        });
    } catch (e) {
        console.warn("routing/utils", "computeRoutes", "Failed to compute routes", { error: e });
        return undefined;
    }
}

const parsePoolOrPair = (pool: V3PoolInRoute | V2PoolInRoute): Pool | Pair => {
    return pool.type === PoolType.V3Pool ? parsePool(pool) : parsePair(pool);
};

function isVersionedRoute<T extends V2PoolInRoute | V3PoolInRoute>(
    type: T["type"],
    route: (V3PoolInRoute | V2PoolInRoute)[],
): route is T[] {
    return route.every((pool) => pool.type === type);
}

export async function transformQuoteToTrade(
    args: GetQuoteArgs,
    data: URAQuoteResponse,
    quoteMethod: QuoteMethod,
): Promise<TradeResult> {
    const { tradeType, routerPreference, account, amount, routingType } = args;

    if (routingType !== URAQuoteType.CLASSIC || routerPreference !== RouterPreference.API) {
        throw new Error("Only Classic quotes are supported for API routing");
    }

    const [currencyIn] = getTradeCurrencies(args);

    const { gasUseEstimateUSD, blockNumber, routes, gasUseEstimate, swapFee } = getClassicTradeDetails(args, data);

    const usdCostPerGas = getUSDCostPerGas(gasUseEstimateUSD, gasUseEstimate);

    const approveInfo = await getApproveInfo(account, currencyIn, amount, usdCostPerGas);

    const classicTrade = new ClassicTrade({
        v2Routes:
            routes
                ?.filter((r): r is RouteResult & { routev2: NonNullable<RouteResult["routev2"]> } => r.routev2 !== null)
                .map(({ routev2, inputAmount, outputAmount }) => ({
                    routev2,
                    inputAmount,
                    outputAmount,
                })) ?? [],
        v3Routes:
            routes
                ?.filter((r): r is RouteResult & { routev3: NonNullable<RouteResult["routev3"]> } => r.routev3 !== null)
                .map(({ routev3, inputAmount, outputAmount }) => ({
                    routev3,
                    inputAmount,
                    outputAmount,
                })) ?? [],
        mixedRoutes:
            routes
                ?.filter(
                    (r): r is RouteResult & { mixedRoute: NonNullable<RouteResult["mixedRoute"]> } =>
                        r.mixedRoute !== null,
                )
                .map(({ mixedRoute, inputAmount, outputAmount }) => ({
                    mixedRoute,
                    inputAmount,
                    outputAmount,
                })) ?? [],
        tradeType,
        gasUseEstimateUSD,
        gasUseEstimate,
        approveInfo,
        blockNumber,
        requestId: data.quote.requestId,
        quoteMethod,
        swapFee,
    });

    return { state: QuoteState.SUCCESS, trade: classicTrade };
}
