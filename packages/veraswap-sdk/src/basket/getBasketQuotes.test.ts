import { QueryClient } from "@tanstack/react-query";
import { createConfig, http } from "@wagmi/core";
import { parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";

import { getBasketQuotes } from "./getBasketQuotes.js";

describe("basket/getBacketQuotes.test.ts", function () {
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

    const basketTokens = [
        {
            address: tokenAAddress,
            weight: 2,
        },
        {
            address: tokenBAddress,
            weight: 1,
        },
    ];

    test("getBasketQuotes", async () => {
        // Buy with ETH, (2A,1B) ratio
        const result = await getBasketQuotes(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: zeroAddress,
            currencyHops: [],
            exactAmount: parseUnits("0.1", tokenA.decimals),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
            basketTokens,
        });

        expect(result.length).toBe(2);
        expect(result[0].amountIn).toBe(result[1].amountIn * 2n);
        expect(result[0].amountOut).toBeGreaterThan(result[1].amountOut); //Not exactly 2x due to slippage
    });
});
