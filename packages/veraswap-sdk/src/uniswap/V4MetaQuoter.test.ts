import { parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { metaQuoteExactOutput } from "../artifacts/IV4MetaQuoter.js";
import { metaQuoteExactInput } from "../artifacts/V4MetaQuoter.js";
import { opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";

import { V4MetaQuoteReturnType } from "./V4MetaQuoter.js";

describe("uniswap/V4MetaQuoter.test.ts", function () {
    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    test("metaQuoteExactInput - single hop", async () => {
        const quote: V4MetaQuoteReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactInput],
            functionName: "metaQuoteExactInput",
            args: [
                {
                    exactCurrency: tokenAAddress,
                    variableCurrency: zeroAddress,
                    hopCurrencies: [],
                    exactAmount: parseUnits("0.1", tokenA.decimals),
                    poolKeyOptions: [
                        {
                            fee: 3000,
                            tickSpacing: 60,
                            hooks: zeroAddress,
                        },
                    ],
                } as const,
            ],
        });

        expect(quote[0].variableAmount).toBeGreaterThan(0n);
        expect(quote[0].variableAmount).toBeGreaterThan(quote[1].variableAmount);
    });

    test("metaQuoteExactOutput - single hop", async () => {
        const quote: V4MetaQuoteReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactOutput],
            functionName: "metaQuoteExactOutput",
            args: [
                {
                    exactCurrency: zeroAddress,
                    variableCurrency: tokenAAddress,
                    hopCurrencies: [],
                    exactAmount: parseUnits("0.1", 18),
                    poolKeyOptions: [
                        {
                            fee: 3000,
                            tickSpacing: 60,
                            hooks: zeroAddress,
                        },
                    ],
                } as const,
            ],
        });

        expect(quote[0].variableAmount).toBeGreaterThan(0n);
        expect(quote[0].variableAmount).toBeGreaterThan(quote[1].variableAmount);
    });

    test("metaQuoteExactInput - multi hop", async () => {
        const quote: V4MetaQuoteReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactInput],
            functionName: "metaQuoteExactInput",
            args: [
                {
                    exactCurrency: tokenAAddress,
                    variableCurrency: tokenBAddress,
                    hopCurrencies: [zeroAddress],
                    exactAmount: parseUnits("0.1", tokenA.decimals),
                    poolKeyOptions: [
                        {
                            fee: 3000,
                            tickSpacing: 60,
                            hooks: zeroAddress,
                        },
                    ],
                } as const,
            ],
        });

        expect(quote[0].variableAmount).toBe(0n); // No A/B pool
        expect(quote[1].variableAmount).toBeGreaterThan(0n);
    });

    test("metaQuoteExactOutput - multi hop", async () => {
        const quote: V4MetaQuoteReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactOutput],
            functionName: "metaQuoteExactOutput",
            args: [
                {
                    exactCurrency: tokenBAddress,
                    variableCurrency: tokenAAddress,
                    hopCurrencies: [zeroAddress],
                    exactAmount: parseUnits("0.1", tokenB.decimals),
                    poolKeyOptions: [
                        {
                            fee: 3000,
                            tickSpacing: 60,
                            hooks: zeroAddress,
                        },
                    ],
                } as const,
            ],
        });

        expect(quote[0].variableAmount).toBe(0n); // No A/B pool
        expect(quote[1].variableAmount).toBeGreaterThan(0n);
    });
});
