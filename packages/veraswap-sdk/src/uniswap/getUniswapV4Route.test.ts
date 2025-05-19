import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { poolKeysToPathExactIn, poolKeysToPathExactOut } from "../types/PoolKey.js";

import { getUniswapV4RouteExactIn, getUniswapV4RouteExactOut } from "./getUniswapV4Route.js";

describe("uniswap/getUniswapV4Route.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    test("getUniswapV4RouteExactIn - single hop", async () => {
        const result = await getUniswapV4RouteExactIn(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: tokenAAddress,
            currencyOut: zeroAddress,
            currencyHops: [],
            exactAmount: parseUnits("0.1", tokenA.decimals),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
        });

        expect(result).not.toBe(null);
        expect(result!.route.length).toBe(1);
        expect(result!.amountOut).toBeGreaterThan(0n);
    });

    test("getUniswapV4RouteExactOut - single hop", async () => {
        const result = await getUniswapV4RouteExactOut(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: tokenAAddress,
            currencyOut: zeroAddress,
            currencyHops: [],
            exactAmount: parseUnits("0.1", 18),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
        });

        expect(result).not.toBe(null);
        expect(result!.route.length).toBe(1);
        expect(result!.amountIn).toBeGreaterThan(0n);
    });

    test("getUniswapV4RouteExactIn - multi hop", async () => {
        const result = await getUniswapV4RouteExactIn(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: tokenAAddress,
            currencyOut: tokenBAddress,
            currencyHops: [zeroAddress],
            exactAmount: parseUnits("0.1", tokenA.decimals),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
        });

        expect(result).not.toBe(null);
        expect(result!.route.length).toBe(2);
        expect(result!.amountOut).toBeGreaterThan(0n);
        console.debug(result!.route);
        console.debug(poolKeysToPathExactIn(tokenAAddress, result!.route));
        console.debug(tokenAAddress, tokenBAddress);
    });

    test.only("getUniswapV4RouteExactOut - multi hop", async () => {
        const result = await getUniswapV4RouteExactOut(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: tokenAAddress,
            currencyOut: tokenBAddress,
            currencyHops: [zeroAddress],
            exactAmount: parseUnits("0.1", tokenB.decimals),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
        });

        expect(result).not.toBe(null);
        expect(result!.route.length).toBe(2);
        expect(result!.amountIn).toBeGreaterThan(0n);
        console.debug(result!.route);
        console.debug(poolKeysToPathExactOut(tokenBAddress, result!.route));
        console.debug(tokenAAddress, tokenBAddress);
    });
});
