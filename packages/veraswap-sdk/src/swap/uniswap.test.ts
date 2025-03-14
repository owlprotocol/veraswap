import { describe, expect, test } from "vitest";
import { UniswapTrade } from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { parseUnits } from "viem";
import { polygon } from "viem/chains";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../constants.js";
import {
    RouterPreference,
    URAQuoteType,
    GetQuoteArgs,
    TradeType,
    TradeResult,
    ClassicTrade,
} from "../types/uniswapRouting.js";
import { WBTC_POLYGON, WETH_POLYGON } from "../uniswap/index.js";
import { getUniswapRoutingQuote } from "../uniswap/getUniswapRoutingQuote.js";

export const UNISWAP_API_KEY: string =
    // @ts-expect-error env is an attribute
    import.meta?.env.VITE_UNISWAP_API_KEY ?? "JoyCGj29tT4pymvhaGciK4r1aIPvqW6W53xT1fwo";

const addressOne = "0x0000000000000000000000000000000000000001";

describe("uniswap.test.ts", function () {
    test("Get quote", async () => {
        const slippageTolerance = new Percent(1, 100);

        const quoteArgs: GetQuoteArgs = {
            tokenInChainId: polygon.id,
            tokenOutChainId: polygon.id,
            amount: parseUnits("1", WBTC_POLYGON.decimals).toString(),
            tokenInDecimals: WBTC_POLYGON.decimals,
            tokenInAddress: WBTC_POLYGON.address,
            tokenOutDecimals: WETH_POLYGON.decimals,
            tokenOutAddress: WETH_POLYGON.address,
            routerPreference: RouterPreference.API,
            routingType: URAQuoteType.CLASSIC,
            tradeType: TradeType.EXACT_INPUT,
            account: addressOne,
        };
        const { data } = await getUniswapRoutingQuote(quoteArgs);

        expect(data).toHaveProperty("trade");
        const trade = (data as TradeResult).trade as ClassicTrade;
        expect(trade).toBeDefined();

        // TODO: change to hyperlane sweep address once merged
        const recipient = SUPERCHAIN_SWEEP_ADDRESS;

        // slippageTolerance required if specifying recipient
        const uniswapTrade = new UniswapTrade(trade, { recipient, slippageTolerance });

        // Expected swaps. There may be multiple, and each may involve going through multiple pools
        expect(uniswapTrade.trade.swaps.length).toBeGreaterThan(0);
        // Expected amount out
        const outputAmountStr = uniswapTrade.trade.outputAmount.toExact();

        expect(Number(outputAmountStr)).toBeGreaterThan(1n);
        expect(trade.gasUseEstimate).toBeGreaterThan(0);
        expect(trade.gasUseEstimateUSD).toBeGreaterThan(0);

        console.log({
            outputAmountStr,
            gasUseEstimate: trade.gasUseEstimate,
            gasUseEstimateUSD: "$" + trade.gasUseEstimateUSD,
        });
    });
});
