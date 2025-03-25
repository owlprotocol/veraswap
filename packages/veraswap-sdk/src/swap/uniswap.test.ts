/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, test } from "vitest";
import { UniswapTrade, RoutePlanner as UniswapRoutePlanner } from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { parseUnits, zeroAddress } from "viem";
import { polygon } from "viem/chains";
import { getHyperlaneSweepBridgeCallTargetParams } from "./getHyperlaneSweepBridgeCallTargetParams.js";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../constants.js";
import {
    RouterPreference,
    URAQuoteType,
    GetQuoteArgs,
    TradeType,
    TradeResult,
    ClassicTrade,
} from "../types/uniswapRouting.js";
import { CommandType, WBTC_POLYGON, WETH_POLYGON } from "../uniswap/index.js";
import { getUniswapRoutingQuote } from "../uniswap/getUniswapRoutingQuote.js";
import { RoutePlanner } from "../uniswap/index.js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const UNISWAP_API_KEY: string =
    // @ts-expect-error env is an attribute
    import.meta?.env.VITE_UNISWAP_API_KEY ?? "JoyCGj29tT4pymvhaGciK4r1aIPvqW6W53xT1fwo";

describe("uniswap.test.ts", function () {
    test.skip("Get quote", async () => {
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

        const routePlanner = new RoutePlanner();
        // Note config is currently unused in their sdk
        const _config = { allowRevert: true };

        uniswapTrade.encode(routePlanner as UniswapRoutePlanner, _config);

        console.log({
            outputAmountStr,
            gasUseEstimate: trade.gasUseEstimate,
            gasUseEstimateUSD: "$" + trade.gasUseEstimateUSD,
        });

        const { inputs, commands } = routePlanner;
        const inputsLength = inputs.length;
        console.log({ inputs, commands });

        const outputTokenBridgeAddress = zeroAddress;
        const receiver = zeroAddress;
        routePlanner.addCommand(
            CommandType.CALL_TARGET,
            getHyperlaneSweepBridgeCallTargetParams({
                bridgePayment: 1n,
                bridgeAddress: outputTokenBridgeAddress,
                receiver,
                destinationChain: 1338,
            }),
        );

        const { inputs: inputs2, commands: commands2 } = routePlanner;
        console.log({ inputs2, commands2 });

        const newInputs = inputs2.length - inputsLength;
        expect(newInputs).toBe(1);
    });
});
