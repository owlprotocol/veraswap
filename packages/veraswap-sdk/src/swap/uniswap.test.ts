import { describe, expect } from "vitest";
import { UniswapTrade } from "@uniswap/universal-router-sdk";
import { Percent } from "@uniswap/sdk-core";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../constants.js";

describe("uniswap.test.ts", function () {
    describe("Get quote", () => {
        expect(1).toBe(1);

        const slippageTolerance = new Percent(1, 100);

        const trade = {} as ConstructorParameters<typeof UniswapTrade>[0];
        // TODO: change to hyperlane sweep address once merged
        const recipient = SUPERCHAIN_SWEEP_ADDRESS;

        // slippageTolerance required if specifying recipient
        const uniswapTrade = new UniswapTrade(trade, { recipient, slippageTolerance });

        expect(uniswapTrade).toBeDefined();
    });
});
