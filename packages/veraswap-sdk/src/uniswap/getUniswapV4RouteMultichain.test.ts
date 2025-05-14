import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { Chain, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";

import {
    getUniswapV4RouteExactInMultichain,
    getUniswapV4RouteExactOutMultichain,
} from "./getUniswapV4RouteMultichain.js";

describe("uniswap/getUniswapV4RouteMultichain.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1] as readonly [Chain, ...Chain[]],
        transports: {
            [opChainL1.id]: http(),
            [opChainA.id]: http(),
            [opChainB.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    const tokenA_900 = LOCAL_CURRENCIES[0];
    const tokenA_901 = LOCAL_CURRENCIES[1];
    // const tokenA_902 = LOCAL_CURRENCIES[2];
    const tokenB_900 = LOCAL_CURRENCIES[3];
    const tokenB_901 = LOCAL_CURRENCIES[4];
    const tokenB_902 = LOCAL_CURRENCIES[5];

    const contractsByChain = {
        [opChainL1.id]: {
            v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
            v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
        },
    };
    const currencyHopsByChain = {
        [opChainL1.id]: [zeroAddress],
    };

    describe("getUniswapV4RouteExactInMultichain", () => {
        test("same chain, with liquidity", async () => {
            // Tokens are on the same chain (900)
            const result = await getUniswapV4RouteExactInMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("0.1", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountOut).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });

        test("same chain, with liquidity, amount too high", async () => {
            // Tokens are on the same chain (900)
            const result = await getUniswapV4RouteExactInMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("10", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).toBe(null);
        });

        test("same chain, no liquidity", async () => {
            // Tokens are on same chain (901)
            // Liquidity is on different chain (900)
            const result = await getUniswapV4RouteExactInMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_901,
                exactAmount: parseUnits("0.1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountOut).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });

        test("different chains", async () => {
            // Tokens are on different chains (901, 902)
            // Liquidity is on a third different chain (900)
            const result = await getUniswapV4RouteExactInMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_902,
                exactAmount: parseUnits("0.1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountOut).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });
    });

    describe("getUniswapV4RouteExactOutMultichain", () => {
        test("same chain, with liquidity", async () => {
            // Tokens are on the same chain (900)
            const result = await getUniswapV4RouteExactOutMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("0.1", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountIn).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });

        test("same chain, with liquidity, amount too high", async () => {
            // Tokens are on the same chain (900)
            const result = await getUniswapV4RouteExactOutMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("10", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).toBe(null);
        });

        test("same chain, no liquidity", async () => {
            // Tokens are on same chain (901)
            // Liquidity is on different chain (900)
            const result = await getUniswapV4RouteExactOutMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_901,
                exactAmount: parseUnits("0.1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountIn).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });

        test("different chains", async () => {
            // Tokens are on different chains (901, 902)
            // Liquidity is on a third different chain (900)
            const result = await getUniswapV4RouteExactOutMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_902,
                exactAmount: parseUnits("0.1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountIn).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });
    });
});
