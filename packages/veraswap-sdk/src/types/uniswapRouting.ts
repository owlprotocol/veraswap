import { Currency, CurrencyAmount, Percent, Price, Token } from "@uniswap/sdk-core";
import { Trade, MixedRouteSDK } from "@uniswap/router-sdk";
import { Route as V2Route } from "@uniswap/v2-sdk";
import { Route as V3Route } from "@uniswap/v3-sdk";

// This is excluded from `RouterPreference` enum because it's only used
// internally for token -> USDC trades to get a USD value.
export const INTERNAL_ROUTER_PREFERENCE_PRICE = "price" as const;

// Buffer to add to the gas estimate to account for potential underestimation
const GAS_ESTIMATE_BUFFER = 1.15;

export enum RouterPreference {
    X = "uniswapx",
    API = "api",
}

// TODO(limits): add Limit market price intent
export enum QuoteIntent {
    Pricing = "pricing",
    Quote = "quote",
}

export interface GetQuoteArgs {
    tokenInAddress: string;
    tokenInChainId: number;
    tokenInDecimals: number;
    tokenInSymbol?: string;
    tokenOutAddress: string;
    tokenOutChainId: number;
    tokenOutDecimals: number;
    tokenOutSymbol?: string;
    amount: string;
    account?: string;
    routerPreference: RouterPreference | typeof INTERNAL_ROUTER_PREFERENCE_PRICE;
    protocolPreferences?: Protocol[];
    tradeType: TradeType;
    needsWrapIfUniswapX: boolean;
    uniswapXForceSyntheticQuotes: boolean;
    sendPortionEnabled: boolean;
    routingType: URAQuoteType;
}

export declare enum Protocol {
    V2 = "V2",
    V3 = "V3",
    V4 = "V4",
    MIXED = "MIXED",
}

export enum URAQuoteType {
    CLASSIC = "CLASSIC",
    DUTCH_V1 = "DUTCH_LIMIT", // "dutch limit" refers to dutch. Fully separate from "limit orders"
    DUTCH_V2 = "DUTCH_V2",
    DUTCH_V3 = "DUTCH_V3",
    PRIORITY = "PRIORITY",
}

// swap router API special cases these strings to represent native currencies
// all chains except for bnb chain and polygon
// have "ETH" as native currency symbol
export enum SwapRouterNativeAssets {
    MATIC = "MATIC",
    BNB = "BNB",
    AVAX = "AVAX",
    ETH = "ETH",
    MON = "MON",
}

export enum QuoteState {
    SUCCESS = "Success",
    NOT_FOUND = "Not found",
}

export enum QuoteMethod {
    ROUTING_API = "ROUTING_API",
    QUICK_ROUTE = "QUICK_ROUTE",
    CLIENT_SIDE_FALLBACK = "CLIENT_SIDE_FALLBACK", // If client-side was used after the routing-api call failed.
}

// TODO: make type more specific, see https://github.com/Uniswap/interface/blob/e069322ed8afd898185c1177947cc02c5e9919b7/apps/web/src/state/routing/types.ts#L949-L955
export type SubmittableTrade = Trade<Currency, Currency, TradeType>;

export type TradeResult =
    | {
          state: QuoteState.NOT_FOUND;
          trade?: undefined;
          latencyMs?: number;
      }
    | {
          state: QuoteState.SUCCESS;
          trade: SubmittableTrade;
          latencyMs?: number;
      };

export enum TradeType {
    EXACT_INPUT,
    EXACT_OUTPUT,
}

// From `ClassicQuoteDataJSON` in https://github.com/Uniswap/unified-routing-api/blob/main/lib/entities/quote/ClassicQuote.ts
export interface ClassicQuoteData {
    requestId?: string;
    quoteId?: string;
    blockNumber: string;
    amount: string;
    amountDecimals: string;
    gasPriceWei?: string;
    gasUseEstimate?: string;
    gasUseEstimateQuote?: string;
    gasUseEstimateQuoteDecimals?: string;
    gasUseEstimateUSD?: string;
    methodParameters?: { calldata: string; value: string };
    quote: string;
    quoteDecimals: string;
    quoteGasAdjusted: string;
    quoteGasAdjustedDecimals: string;
    route: Array<(V3PoolInRoute | V2PoolInRoute)[]>;
    routeString: string;
    portionBips?: number;
    portionRecipient?: string;
    portionAmount?: string;
    portionAmountDecimals?: string;
    quoteGasAndPortionAdjusted?: string;
    quoteGasAndPortionAdjustedDecimals?: string;
}

type URAClassicQuoteResponse = {
    routing: URAQuoteType.CLASSIC;
    quote: ClassicQuoteData;
    allQuotes: Array<URAQuoteResponse>;
};
export type URAQuoteResponse = URAClassicQuoteResponse;

export function isClassicQuoteResponse(data: URAQuoteResponse): data is URAClassicQuoteResponse {
    return data.routing === URAQuoteType.CLASSIC;
}

export enum TradeFillType {
    Classic = "classic", // Uniswap V1, V2, and V3 trades with on-chain routes
    UniswapX = "uniswap_x", // off-chain trades, no routes
    UniswapXv2 = "uniswap_x_v2",
    UniswapXv3 = "uniswap_x_v3",
    None = "none", // for preview trades, cant be used for submission
}

export type ApproveInfo = { needsApprove: true; approveGasEstimateUSD: number } | { needsApprove: false };
export type WrapInfo = { needsWrap: true; wrapGasEstimateUSD: number } | { needsWrap: false };

export type SwapFeeInfo = { recipient: string; percent: Percent; amount: string /* raw amount of output token */ };

export class ClassicTrade extends Trade<Currency, Currency, TradeType> {
    public readonly fillType = TradeFillType.Classic;
    approveInfo: ApproveInfo;
    gasUseEstimate?: number; // gas estimate for swaps
    gasUseEstimateUSD?: number; // gas estimate for swaps in USD
    blockNumber: string | null | undefined;
    requestId: string | undefined;
    quoteMethod: QuoteMethod;
    swapFee: SwapFeeInfo | undefined;

    constructor({
        gasUseEstimate,
        gasUseEstimateUSD,
        blockNumber,
        requestId,
        quoteMethod,
        approveInfo,
        swapFee,
        ...routes
    }: {
        gasUseEstimate?: number;
        gasUseEstimateUSD?: number;
        totalGasUseEstimateUSD?: number;
        blockNumber?: string | null;
        requestId?: string;
        quoteMethod: QuoteMethod;
        approveInfo: ApproveInfo;
        swapFee?: SwapFeeInfo;
        v2Routes: {
            routev2: V2Route<Currency, Currency>;
            inputAmount: CurrencyAmount<Currency>;
            outputAmount: CurrencyAmount<Currency>;
        }[];
        v3Routes: {
            routev3: V3Route<Currency, Currency>;
            inputAmount: CurrencyAmount<Currency>;
            outputAmount: CurrencyAmount<Currency>;
        }[];
        tradeType: TradeType;
        mixedRoutes?: {
            mixedRoute: MixedRouteSDK<Currency, Currency>;
            inputAmount: CurrencyAmount<Currency>;
            outputAmount: CurrencyAmount<Currency>;
        }[];
    }) {
        super(routes);
        this.blockNumber = blockNumber;
        this.gasUseEstimateUSD = gasUseEstimateUSD;
        this.requestId = requestId;
        this.quoteMethod = quoteMethod;
        this.approveInfo = approveInfo;
        this.swapFee = swapFee;
        this.gasUseEstimate = gasUseEstimate;
    }

    public get executionPrice(): Price<Currency, Currency> {
        if (this.tradeType === TradeType.EXACT_INPUT || !this.swapFee) {
            return super.executionPrice;
        }

        // Fix inaccurate price calculation for exact output trades
        return new Price({ baseAmount: this.inputAmount, quoteAmount: this.postSwapFeeOutputAmount });
    }

    public get postSwapFeeOutputAmount(): CurrencyAmount<Currency> {
        // Routing api already applies the swap fee to the output amount for exact-in
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return this.outputAmount;
        }

        const swapFeeAmount = CurrencyAmount.fromRawAmount(this.outputAmount.currency, this.swapFee?.amount ?? 0);
        return this.outputAmount.subtract(swapFeeAmount);
    }

    // gas estimate for maybe approve + swap
    public get totalGasUseEstimateUSD(): number | undefined {
        if (this.approveInfo.needsApprove && this.gasUseEstimateUSD) {
            return this.approveInfo.approveGasEstimateUSD + this.gasUseEstimateUSD;
        }

        return this.gasUseEstimateUSD;
    }

    public get totalGasUseEstimateUSDWithBuffer(): number {
        return this.totalGasUseEstimateUSD ? this.totalGasUseEstimateUSD * GAS_ESTIMATE_BUFFER : 0;
    }
}

export type TokenInRoute = Pick<Token, "address" | "chainId" | "symbol" | "decimals"> & {
    buyFeeBps?: string;
    sellFeeBps?: string;
};

export type V3PoolInRoute = {
    type: "v3-pool";
    tokenIn: TokenInRoute;
    tokenOut: TokenInRoute;
    sqrtRatioX96: string;
    liquidity: string;
    tickCurrent: string;
    fee: string;
    amountIn?: string;
    amountOut?: string;

    // not used in the interface
    address?: string;
};

type V2Reserve = {
    token: TokenInRoute;
    quotient: string;
};

export type V2PoolInRoute = {
    type: "v2-pool";
    tokenIn: TokenInRoute;
    tokenOut: TokenInRoute;
    reserve0: V2Reserve;
    reserve1: V2Reserve;
    amountIn?: string;
    amountOut?: string;

    // not used in the interface
    // avoid returning it from the client-side smart-order-router
    address?: string;
};
