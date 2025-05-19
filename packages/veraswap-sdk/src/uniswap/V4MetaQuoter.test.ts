import { parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import {
    metaQuoteExactInput,
    metaQuoteExactInputBest,
    metaQuoteExactInputSingle,
    metaQuoteExactOutput,
    metaQuoteExactOutputBest,
    metaQuoteExactOutputSingle,
} from "../artifacts/IV4MetaQuoter.js";
import { opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";

import {
    V4MetaQuoteBestType,
    V4MetaQuoteExactBestReturnType,
    V4MetaQuoteExactReturnType,
    V4MetaQuoteExactSingleReturnType,
} from "./V4MetaQuoter.js";

describe("uniswap/V4MetaQuoter.test.ts", function () {
    // A/ETH, B/ETH Pools Exist
    // A/B Pool Does Not Exist
    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    test("metaQuoteExactInputSingle", async () => {
        const quotes: V4MetaQuoteExactSingleReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactInputSingle],
            functionName: "metaQuoteExactInputSingle",
            args: [
                {
                    exactCurrency: tokenAAddress,
                    variableCurrency: zeroAddress,
                    exactAmount: parseUnits("0.1", tokenA.decimals),
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
    });

    test("metaQuoteExactOutputSingle", async () => {
        const quotes: V4MetaQuoteExactSingleReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactOutputSingle],
            functionName: "metaQuoteExactOutputSingle",
            args: [
                {
                    exactCurrency: zeroAddress,
                    variableCurrency: tokenAAddress,
                    exactAmount: parseUnits("0.1", 18),
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
    });

    test("metaQuoteExactInput", async () => {
        const quotes: V4MetaQuoteExactReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactInput],
            functionName: "metaQuoteExactInput",
            args: [
                {
                    exactCurrency: tokenAAddress,
                    variableCurrency: tokenBAddress,
                    hopCurrencies: [zeroAddress],
                    exactAmount: parseUnits("0.1", tokenA.decimals),
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
    });

    test("metaQuoteExactOutput", async () => {
        const quotes: V4MetaQuoteExactReturnType = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
            abi: [metaQuoteExactOutput],
            functionName: "metaQuoteExactOutput",
            args: [
                {
                    exactCurrency: tokenBAddress,
                    variableCurrency: tokenAAddress,
                    hopCurrencies: [zeroAddress],
                    exactAmount: parseUnits("0.1", tokenB.decimals),
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
    });

    describe("metaQuoteBest", () => {
        test("metaQuoteExactInputBest - single", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency: tokenAAddress,
                        variableCurrency: zeroAddress,
                        hopCurrencies: [],
                        exactAmount: parseUnits("0.1", tokenA.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Single);
        });

        test("metaQuoteExactOutputBest - single", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency: zeroAddress,
                        variableCurrency: tokenAAddress,
                        hopCurrencies: [],
                        exactAmount: parseUnits("0.1", tokenB.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Single);
        });

        test("metaQuoteExactInputBest - multihop", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency: tokenAAddress,
                        variableCurrency: tokenBAddress,
                        hopCurrencies: [zeroAddress],
                        exactAmount: parseUnits("0.1", tokenA.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Multihop);
        });

        test("metaQuoteExactOutputBest - multihop", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency: tokenBAddress,
                        variableCurrency: tokenAAddress,
                        hopCurrencies: [zeroAddress],
                        exactAmount: parseUnits("0.1", tokenB.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Multihop);
        });

        test("metaQuoteExactInputBest - none", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency: tokenAAddress,
                        variableCurrency: tokenBAddress,
                        hopCurrencies: [],
                        exactAmount: parseUnits("0.1", tokenA.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.None);
        });

        test("metaQuoteExactOutputBest - none", async () => {
            const [, , bestType]: V4MetaQuoteExactBestReturnType = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.v4MetaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency: tokenBAddress,
                        variableCurrency: tokenAAddress,
                        hopCurrencies: [],
                        exactAmount: parseUnits("0.1", tokenB.decimals),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.None);
        });
    });
});
