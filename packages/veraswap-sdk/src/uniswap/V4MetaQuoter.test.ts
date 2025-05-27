import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createWalletClient, Hex, http, parseAbi, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";

import { CommandType, RoutePlanner } from "./routerCommands.js";
import {
    metaQuoteExactInput,
    metaQuoteExactInputBest,
    metaQuoteExactInputSingle,
    metaQuoteExactOutput,
    metaQuoteExactOutputBest,
    metaQuoteExactOutputSingle,
    V4MetaQuoteBestType,
} from "./V4MetaQuoter.js";

describe("uniswap/V4MetaQuoter.test.ts", function () {
    // Uniswap Error Abi
    const UniswapV4ErrorAbi = parseAbi([
        "error DeltaNotNegative(address)",
        "error DeltaNotPositive(address)",
        "error CurrencyNotSettled()",
    ]);

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    // A/ETH, B/ETH Pools Exist
    // A/B Pool Does Not Exist
    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    test("metaQuoteExactInputSingle", async () => {
        const exactCurrency = tokenAAddress;
        const exactAmount = parseUnits("0.1", tokenA.decimals);
        const variableCurrency = zeroAddress;
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
        expect(quotes.length).toBe(1);
        const quote = quotes[0];
        // V4 Trade Plan
        const tradePlan = new V4Planner();
        tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey: quote.poolKey,
                zeroForOne: quote.zeroForOne,
                amountIn: exactAmount,
                amountOutMinimum: quote.variableAmount,
                hookData: quote.hookData,
            },
        ]);
        tradePlan.addAction(Actions.SETTLE_ALL, [exactCurrency, MAX_UINT_256]); //pay exact input
        tradePlan.addAction(Actions.TAKE_ALL, [variableCurrency, 0n]); //receive variable output
        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);
        // Execute
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("metaQuoteExactOutputSingle", async () => {
        const exactCurrency = zeroAddress;
        const exactAmount = parseUnits("0.1", 18);
        const variableCurrency = tokenAAddress;
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
        expect(quotes.length).toBe(1);
        const quote = quotes[0];
        // V4 Trade Plan
        const tradePlan = new V4Planner();
        tradePlan.addAction(Actions.SWAP_EXACT_OUT_SINGLE, [
            {
                poolKey: quote.poolKey,
                zeroForOne: quote.zeroForOne,
                amountOut: exactAmount,
                amountInMaximum: quote.variableAmount,
                hookData: quote.hookData,
            },
        ]);
        tradePlan.addAction(Actions.SETTLE_ALL, [variableCurrency, MAX_UINT_256]); //pay variable input
        tradePlan.addAction(Actions.TAKE_ALL, [exactCurrency, 0n]); //receive exact output
        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);
        // Execute
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("metaQuoteExactInput", async () => {
        const exactCurrency = tokenAAddress;
        const exactAmount = parseUnits("0.1", tokenA.decimals);
        const variableCurrency = tokenBAddress;
        const quotes = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            abi: [metaQuoteExactInput],
            functionName: "metaQuoteExactInput",
            args: [
                {
                    exactCurrency,
                    variableCurrency,
                    hopCurrencies: [zeroAddress],
                    exactAmount,
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
        const quote = quotes[0];
        // V4 Trade Plan
        const tradePlan = new V4Planner();
        tradePlan.addAction(Actions.SWAP_EXACT_IN, [
            {
                currencyIn: exactCurrency,
                path: quote.path,
                amountIn: exactAmount,
                amountOutMinimum: quote.variableAmount,
            },
        ]);
        tradePlan.addAction(Actions.SETTLE_ALL, [exactCurrency, MAX_UINT_256]); //pay exact input
        tradePlan.addAction(Actions.TAKE_ALL, [variableCurrency, 0n]); //receive variable output
        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);
        // Execute
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    test("metaQuoteExactOutput", async () => {
        const exactCurrency = tokenBAddress;
        const exactAmount = parseUnits("0.1", tokenB.decimals);
        const variableCurrency = tokenAAddress;
        const quotes = await opChainL1Client.readContract({
            address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            abi: [metaQuoteExactOutput],
            functionName: "metaQuoteExactOutput",
            args: [
                {
                    exactCurrency,
                    variableCurrency,
                    hopCurrencies: [zeroAddress],
                    exactAmount,
                    poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                } as const,
            ],
        });
        expect(quotes.length).toBe(1);
        const quote = quotes[0];
        // V4 Trade Plan
        const tradePlan = new V4Planner();
        tradePlan.addAction(Actions.SWAP_EXACT_OUT, [
            {
                currencyOut: exactCurrency,
                path: quote.path,
                amountOut: exactAmount,
                amountInMaximum: quote.variableAmount,
            },
        ]);
        tradePlan.addAction(Actions.SETTLE_ALL, [variableCurrency, MAX_UINT_256]); //pay variable input
        tradePlan.addAction(Actions.TAKE_ALL, [exactCurrency, 0n]); //receive exact output
        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);
        // Execute
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
    });

    describe("metaQuoteBest", () => {
        test("metaQuoteExactInputBest - single", async () => {
            const exactCurrency = tokenAAddress;
            const exactAmount = parseUnits("0.1", tokenA.decimals);
            const variableCurrency = zeroAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Single);
        });

        test("metaQuoteExactOutputBest - single", async () => {
            const exactCurrency = zeroAddress;
            const exactAmount = parseUnits("0.1", 18);
            const variableCurrency = tokenAAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Single);
        });

        test("metaQuoteExactInputBest - multihop", async () => {
            const exactCurrency = tokenAAddress;
            const exactAmount = parseUnits("0.1", tokenA.decimals);
            const variableCurrency = tokenBAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [zeroAddress],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Multihop);
        });

        test("metaQuoteExactOutputBest - multihop", async () => {
            const exactCurrency = tokenBAddress;
            const exactAmount = parseUnits("0.1", tokenB.decimals);
            const variableCurrency = tokenAAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [zeroAddress],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.Multihop);
        });

        test("metaQuoteExactInputBest - none", async () => {
            const exactCurrency = tokenAAddress;
            const exactAmount = parseUnits("0.1", tokenA.decimals);
            const variableCurrency = tokenBAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactInputBest],
                functionName: "metaQuoteExactInputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.None);
        });

        test("metaQuoteExactOutputBest - none", async () => {
            const exactCurrency = tokenBAddress;
            const exactAmount = parseUnits("0.1", tokenB.decimals);
            const variableCurrency = tokenAAddress;
            const [, , bestType] = await opChainL1Client.readContract({
                address: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                abi: [metaQuoteExactOutputBest],
                functionName: "metaQuoteExactOutputBest",
                args: [
                    {
                        exactCurrency,
                        variableCurrency,
                        hopCurrencies: [],
                        exactAmount,
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    } as const,
                ],
            });
            expect(bestType).toBe(V4MetaQuoteBestType.None);
        });
    });
});
