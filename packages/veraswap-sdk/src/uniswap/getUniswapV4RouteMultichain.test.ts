import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { parseEther, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";

import {
    getRouteMultichain,
    getUniswapV4RouteMultichain,
    RouteComponentBridge,
    RouteComponentSwap,
} from "./getUniswapV4RouteMultichain.js";

describe.skip("uniswap/getUniswapV4RouteMultichain.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
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

    describe("getUniswapV4RouteMultichain", () => {
        test("same chain, with liquidity", async () => {
            // Tokens are on the same chain (900)
            // Liquidity is on different chain (900)
            const result = await getUniswapV4RouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.route.length).toBe(2);
            expect(result!.amountOut).toBeGreaterThan(0n);
            expect(result!.currencyIn.equals(tokenA_900));
            expect(result!.currencyOut.equals(tokenB_900));
        });

        test("same chain, no liquidity", async () => {
            // Tokens are on same chain (901)
            // Liquidity is on different chain (900)
            const result = await getUniswapV4RouteMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_901,
                exactAmount: parseEther("1"),
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
            const result = await getUniswapV4RouteMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_902,
                exactAmount: parseEther("1"),
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

    describe("getRouteMultichain", () => {
        test("BRIDGE: different chain", async () => {
            // Tokens are on the different chains (900, 901)
            // No swap needed
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenA_901,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.length).toBe(1);

            const bridge = result![0] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenA_900));
            expect(bridge.currencyOut.equals(tokenA_901));
        });

        test("SWAP: same chain, with liquidity", async () => {
            // Tokens are on the same chain (900)
            // Liquidity is on same chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.length).toBe(1);

            const swap = result![0] as RouteComponentSwap;
            expect(swap.route.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));
        });

        test("SWAP_BRIDGE: different chain, input liquidity", async () => {
            // Tokens are on different chains (900, 901)
            // Liquidity is on input chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_901,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.length).toBe(2);

            const swap = result![0] as RouteComponentSwap;
            expect(swap.route.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));

            const bridge = result![1] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenB_900));
            expect(bridge.currencyOut.equals(tokenA_901));
        });

        test("BRIDGE_SWAP: different chain, output liquidity", async () => {
            // Tokens are on different chains (901, 900)
            // Liquidity is on output chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_900,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.length).toBe(2);

            const bridge = result![0] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenA_901));
            expect(bridge.currencyOut.equals(tokenA_900));

            const swap = result![1] as RouteComponentSwap;
            expect(swap.route.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));
        });

        test("BRIDGE_SWAP_BRIDGE: different chain, output liquidity", async () => {
            // Tokens are on different chains (901, 902)
            // Liquidity is on a third different chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_902,
                exactAmount: parseEther("1"),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);
            expect(result!.length).toBe(3);

            const bridgeIn = result![0] as RouteComponentBridge;
            expect(bridgeIn.currencyIn.equals(tokenA_901));
            expect(bridgeIn.currencyOut.equals(tokenA_900));

            const swap = result![1] as RouteComponentSwap;
            expect(swap.route.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));

            const bridgeOut = result![2] as RouteComponentBridge;
            expect(bridgeOut.currencyIn.equals(tokenB_900));
            expect(bridgeOut.currencyOut.equals(tokenB_902));
        });
    });
});
