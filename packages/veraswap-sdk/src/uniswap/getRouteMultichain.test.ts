import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { Chain, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";

import { getRouteMultichain, RouteComponentBridge, RouteComponentSwap } from "./getRouteMultichain.js";

//TODO: Other tests interfere with quoting by draining liquidity
describe.skip("uniswap/getRouteMultichain.test.ts", function () {
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
            weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
            metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
        },
    };
    const currencyHopsByChain = {
        [opChainL1.id]: [zeroAddress],
    };

    describe("getRouteMultichain", () => {
        test("BRIDGE: different chain", async () => {
            // Tokens are on the different chains (900, 901)
            // No swap needed
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenA_901,
                exactAmount: parseUnits("1", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);

            const { flows } = result!;
            expect(flows.length).toBe(1);

            const bridge = flows[0] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenA_900));
            expect(bridge.currencyOut.equals(tokenA_901));
        });

        test("SWAP: same chain, with liquidity", async () => {
            // Tokens are on the same chain (900)
            // Liquidity is on same chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_900,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("1", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);

            const { flows } = result!;
            expect(flows.length).toBe(1);

            const swap = flows[0] as RouteComponentSwap;
            expect(swap.path.length).toBe(2);
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
                exactAmount: parseUnits("1", tokenA_900.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);

            const { flows } = result!;
            expect(flows.length).toBe(2);

            const swap = flows[0] as RouteComponentSwap;
            expect(swap.path.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));

            const bridge = flows[1] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenB_900));
            expect(bridge.currencyOut.equals(tokenA_901));
        });

        test("BRIDGE_SWAP: different chain, output liquidity", async () => {
            // Tokens are on different chains (901, 900)
            // Liquidity is on output chain (900)
            const result = await getRouteMultichain(queryClient, config, {
                currencyIn: tokenA_901,
                currencyOut: tokenB_900,
                exactAmount: parseUnits("1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);

            const { flows } = result!;
            expect(flows.length).toBe(2);

            const bridge = flows[0] as RouteComponentBridge;
            expect(bridge.currencyIn.equals(tokenA_901));
            expect(bridge.currencyOut.equals(tokenA_900));

            const swap = flows[1] as RouteComponentSwap;
            expect(swap.path.length).toBe(2);
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
                exactAmount: parseUnits("1", tokenA_901.decimals),
                contractsByChain,
                currencyHopsByChain,
            });
            expect(result).not.toBe(null);

            const { flows } = result!;
            expect(flows.length).toBe(3);

            const bridgeIn = flows[0] as RouteComponentBridge;
            expect(bridgeIn.currencyIn.equals(tokenA_901));
            expect(bridgeIn.currencyOut.equals(tokenA_900));

            const swap = flows[1] as RouteComponentSwap;
            expect(swap.path.length).toBe(2);
            expect(swap.amountOut).toBeGreaterThan(0n);
            expect(swap.currencyIn.equals(tokenA_900));
            expect(swap.currencyOut.equals(tokenB_900));

            const bridgeOut = flows[2] as RouteComponentBridge;
            expect(bridgeOut.currencyIn.equals(tokenB_900));
            expect(bridgeOut.currencyOut.equals(tokenB_902));
        });
    });
});
