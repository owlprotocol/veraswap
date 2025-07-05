import { Address, padHex, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../../constants/uniswap.js";
import { getUniswapV4Address } from "../../currency/currency.js";
import { DEFAULT_POOL_PARAMS } from "../../types/PoolKey.js";

import {
    MetaQuoteBestType,
    metaQuoteExactInput,
    metaQuoteExactInputBest,
    metaQuoteExactInputSingle,
    metaQuoteExactOutput,
    metaQuoteExactOutputBest,
    metaQuoteExactOutputSingle,
} from "./MetaQuoter.js";

const address2: Address = padHex("0x2", { size: 20 });
const address3: Address = padHex("0x3", { size: 20 });
// Replicate tests from test/MetaQuoter.test.sol in Typescript but without execution (just quotes)
describe("uniswap/quote/MetaQuoter.test.ts", function () {
    const exactAmount = parseUnits("0.01", 18);

    // A/ETH, B/ETH Pools Exist
    // A/B Pool Does Not Exist
    const tokenA = getUniswapV4Address(LOCAL_CURRENCIES[0]); // 2 A tokens after this (Hyperlane)
    const tokenB = getUniswapV4Address(LOCAL_CURRENCIES[3]); // 2 B tokens after this (Hyperlane)
    const tokenL34 = getUniswapV4Address(LOCAL_CURRENCIES[6]);
    const tokenL3 = getUniswapV4Address(LOCAL_CURRENCIES[7]);
    const tokenL4 = getUniswapV4Address(LOCAL_CURRENCIES[8]);

    describe("Single Quotes", () => {
        describe("exactInputSingle", () => {
            const currencyIn = tokenA;
            const exactCurrency = currencyIn;
            test("A (exact) -> L3 (variable)", async () => {
                const currencyOut = tokenL3;
                const variableCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputSingle],
                    functionName: "metaQuoteExactInputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1); // 1 pool
                expect(quotes[0].poolKey.hooks).toBe(address3); // V3 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (exact) -> L4 (variable)", async () => {
                const currencyOut = tokenL4;
                const variableCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputSingle],
                    functionName: "metaQuoteExactInputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1); // 1 pool
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (exact) -> L34 (variable)", async () => {
                const currencyOut = tokenL34;
                const variableCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputSingle],
                    functionName: "metaQuoteExactInputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(3); // 3 pools
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                expect(quotes[1].poolKey.hooks).toBe(address3); // V3 Pool
                expect(quotes[2].poolKey.hooks).toBe(address2); // V2 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (exact) -> ETH (variable)", async () => {
                const currencyOut = zeroAddress;
                const variableCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputSingle],
                    functionName: "metaQuoteExactInputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(3); // 3 pools
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                expect(quotes[1].poolKey.hooks).toBe(address3); // V3 Pool
                expect(quotes[2].poolKey.hooks).toBe(address2); // V2 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
        });
        describe("exactOutputSingle", () => {
            const currencyIn = tokenA;
            const variableCurrency = currencyIn;
            test("A (variable) -> L3 (exact)", async () => {
                const currencyOut = tokenL3;
                const exactCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputSingle],
                    functionName: "metaQuoteExactOutputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1); // 1 pool
                expect(quotes[0].poolKey.hooks).toBe(address3); // V3 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (variable) -> L4 (exact)", async () => {
                const currencyOut = tokenL4;
                const exactCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputSingle],
                    functionName: "metaQuoteExactOutputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1); // 1 pool
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (variable) -> L34 (exact)", async () => {
                const currencyOut = tokenL34;
                const exactCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputSingle],
                    functionName: "metaQuoteExactOutputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(3); // 3 pools
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                expect(quotes[1].poolKey.hooks).toBe(address3); // V3 Pool
                expect(quotes[2].poolKey.hooks).toBe(address2); // V2 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
            test("A (variable) -> ETH (exact)", async () => {
                const currencyOut = zeroAddress;
                const exactCurrency = currencyOut;
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputSingle],
                    functionName: "metaQuoteExactOutputSingle",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(3); // 3 pools
                expect(quotes[0].poolKey.hooks).toBe(zeroAddress); // V4 Pool
                expect(quotes[1].poolKey.hooks).toBe(address3); // V3 Pool
                expect(quotes[2].poolKey.hooks).toBe(address2); // V2 Pool
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
            });
        });
    });

    describe("Multihop Quotes", () => {
        describe("exactInput", () => {
            const currencyIn = tokenA;
            const exactCurrency = currencyIn;
            test("A (exact) -> L34 -> B (variable)", async () => {
                const currencyOut = tokenB;
                const variableCurrency = currencyOut;
                const hopCurrencies = [tokenL34];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInput],
                    functionName: "metaQuoteExactInput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (exact) -> ETH -> B (variable)", async () => {
                const currencyOut = tokenB;
                const variableCurrency = currencyOut;
                const hopCurrencies = [zeroAddress];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInput],
                    functionName: "metaQuoteExactInput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (exact) -> L3 -> L34 (variable): Mixed V3 -> V4", async () => {
                const currencyOut = tokenL34;
                const variableCurrency = currencyOut;
                const hopCurrencies = [tokenL3];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInput],
                    functionName: "metaQuoteExactInput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(address3); // V3 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (exact) -> L4 -> L34 (variable): Mixed V4 -> V3", async () => {
                const currencyOut = tokenL34;
                const variableCurrency = currencyOut;
                const hopCurrencies = [tokenL4];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInput],
                    functionName: "metaQuoteExactInput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(address3); // V3 Pool
            });
        });
        describe("exactOutput", () => {
            const currencyIn = tokenA;
            const variableCurrency = currencyIn;
            test("A (variable) -> L34 -> B (exact)", async () => {
                const currencyOut = tokenB;
                const exactCurrency = currencyOut;
                const hopCurrencies = [tokenL34];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutput],
                    functionName: "metaQuoteExactOutput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (variable) -> ETH -> B (exact)", async () => {
                const currencyOut = tokenB;
                const exactCurrency = currencyOut;
                const hopCurrencies = [zeroAddress];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutput],
                    functionName: "metaQuoteExactOutput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (variable) -> L3 -> L34 (exact): Mixed V3 -> V4", async () => {
                const currencyOut = tokenL34;
                const exactCurrency = currencyOut;
                const hopCurrencies = [tokenL3];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutput],
                    functionName: "metaQuoteExactOutput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(address3); // V3 Pool
                expect(quote.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (variable) -> L4 -> L34 (exact): Mixed V4 -> V3", async () => {
                const currencyOut = tokenL34;
                const exactCurrency = currencyOut;
                const hopCurrencies = [tokenL4];
                const quotes = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutput],
                    functionName: "metaQuoteExactOutput",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(quotes.length).toBe(1);
                const quote = quotes[0];
                expect(quote.variableAmount).toBeGreaterThan(0n);
                expect(quote.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(quote.path[1].hooks).toBe(address3); // V3 Pool
            });
        });
    });

    describe("Best Quotes", () => {
        describe("exactInput", () => {
            test("A (exact) -> ETH (variable)", async () => {
                const currencyIn = tokenA;
                const exactCurrency = currencyIn;
                const currencyOut = zeroAddress;
                const variableCurrency = currencyOut;
                const hopCurrencies: Address[] = [];
                const [bestQuoteSingle, , bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputBest],
                    functionName: "metaQuoteExactInputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Single);
                expect(bestQuoteSingle.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteSingle.poolKey.hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (exact) -> ETH -> B (variable)", async () => {
                const currencyIn = tokenA;
                const exactCurrency = currencyIn;
                const currencyOut = tokenB;
                const variableCurrency = currencyOut;
                const hopCurrencies = [zeroAddress];
                const [, bestQuoteMultihop, bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputBest],
                    functionName: "metaQuoteExactInputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Multihop);
                expect(bestQuoteMultihop.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteMultihop.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(bestQuoteMultihop.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("L4 (exact) -> L34 -> L3 (variable): Mixed V3 -> V4", async () => {
                const currencyIn = tokenL4;
                const exactCurrency = currencyIn;
                const currencyOut = tokenL3;
                const variableCurrency = currencyOut;
                const hopCurrencies = [tokenL34];
                const [, bestQuoteMultihop, bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputBest],
                    functionName: "metaQuoteExactInputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Multihop);
                expect(bestQuoteMultihop.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteMultihop.path[0].hooks).toBe(address3); // V3 Pool
                expect(bestQuoteMultihop.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("L3 (exact) -> L34 -> L4 (variable): Mixed V4 -> V3", async () => {
                const currencyIn = tokenL3;
                const exactCurrency = currencyIn;
                const currencyOut = tokenL4;
                const variableCurrency = currencyOut;
                const hopCurrencies = [tokenL34];
                const [, bestQuoteMultihop, bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputBest],
                    functionName: "metaQuoteExactInputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Multihop);
                expect(bestQuoteMultihop.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteMultihop.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(bestQuoteMultihop.path[1].hooks).toBe(address3); // V3 Pool
            });
            test("A (exact) -> ETH -> B (variable): none (no hop currencies)", async () => {
                const currencyIn = tokenA;
                const exactCurrency = currencyIn;
                const currencyOut = tokenB;
                const variableCurrency = currencyOut;
                const hopCurrencies: Address[] = [];
                const [, , bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactInputBest],
                    functionName: "metaQuoteExactInputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.None);
            });
        });

        describe("exactOutput", () => {
            const currencyIn = tokenA;
            const variableCurrency = currencyIn;
            test("A (variable) -> ETH (exact)", async () => {
                const currencyOut = zeroAddress;
                const exactCurrency = currencyOut;
                const hopCurrencies: Address[] = [];
                const [bestQuoteSingle, , bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputBest],
                    functionName: "metaQuoteExactOutputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Single);
                expect(bestType).toBe(MetaQuoteBestType.Single);
                expect(bestQuoteSingle.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteSingle.poolKey.hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (variable) -> ETH -> B (exact)", async () => {
                const currencyOut = tokenB;
                const exactCurrency = currencyOut;
                const hopCurrencies = [zeroAddress];
                const [, bestQuoteMultihop, bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputBest],
                    functionName: "metaQuoteExactOutputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.Multihop);
                expect(bestQuoteMultihop.variableAmount).toBeGreaterThan(0n);
                expect(bestQuoteMultihop.path[0].hooks).toBe(zeroAddress); // V4 Pool
                expect(bestQuoteMultihop.path[1].hooks).toBe(zeroAddress); // V4 Pool
            });
            test("A (variable) -> ETH -> B (exact): none (no hop currencies)", async () => {
                const currencyOut = tokenB;
                const exactCurrency = currencyOut;
                const hopCurrencies: Address[] = [];
                const [, , bestType] = await opChainL1Client.readContract({
                    address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                    abi: [metaQuoteExactOutputBest],
                    functionName: "metaQuoteExactOutputBest",
                    args: [
                        {
                            exactCurrency,
                            variableCurrency,
                            hopCurrencies,
                            exactAmount,
                            poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                        } as const,
                    ],
                });
                expect(bestType).toBe(MetaQuoteBestType.None);
            });
        });
    });
});
