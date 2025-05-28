import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Address, encodePacked, Hex, padHex, parseAbi, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IERC20 } from "../../artifacts/IERC20.js";
import { IUniversalRouter } from "../../artifacts/IUniversalRouter.js";
import { opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../../constants/uniswap.js";
import { getUniswapV4Address } from "../../currency/currency.js";
import { anvilClientL1 } from "../../test/constants.js";
import { DEFAULT_POOL_PARAMS } from "../../types/PoolKey.js";
import { ACTION_CONSTANTS, CommandType, RoutePlanner } from "../routerCommands.js";

import { metaQuoteExactInput } from "./MetaQuoter.js";

const address3: Address = padHex("0x3", { size: 20 });
// TODO: With WETH9 pools, add test for wrapping/unwrapping ETH
// Replicate mixed route swap tests from test/MetaQuoter.test.sol in Typescript
describe("uniswap/quote/MixedRoutes.test.ts", function () {
    // Uniswap Error Abi
    const UniswapV4ErrorAbi = parseAbi([
        "error DeltaNotNegative(address)",
        "error DeltaNotPositive(address)",
        "error CurrencyNotSettled()",
    ]);

    const exactAmount = parseUnits("0.01", 18);

    // A/ETH, B/ETH Pools Exist
    // A/B Pool Does Not Exist
    const tokenA = getUniswapV4Address(LOCAL_CURRENCIES[0]); // 2 A tokens after this (Hyperlane)
    // const tokenB = getUniswapV4Address(LOCAL_CURRENCIES[3]); // 2 B tokens after this (Hyperlane)
    const tokenL34 = getUniswapV4Address(LOCAL_CURRENCIES[6]);
    const tokenL3 = getUniswapV4Address(LOCAL_CURRENCIES[7]);
    const tokenL4 = getUniswapV4Address(LOCAL_CURRENCIES[8]);

    // Helper function to get balance of a token
    const getBalance = function (token: Address) {
        if (token === zeroAddress) return opChainL1Client.getBalance({ address: anvilClientL1.account.address });

        return opChainL1Client.readContract({
            address: token,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilClientL1.account.address],
        });
    };

    const currencyIn = tokenA;
    const exactCurrency = currencyIn;
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

        // V3 Trade Plan
        const v3Path = encodePacked(
            ["address", "uint24", "address"],
            [currencyIn, quote.path[0].fee, quote.path[0].intermediateCurrency],
        );
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            ACTION_CONSTANTS.ADDRESS_THIS, // recipient
            exactAmount, // exact amount in
            0n, // amountOutMinimum ignored for intermediate swap
            v3Path,
            true, // payerIsUser
        ];

        // V4 Trade Plan
        const [v4Currency0, v4Currency1] =
            quote.path[0].intermediateCurrency < quote.path[1].intermediateCurrency
                ? [quote.path[0].intermediateCurrency, quote.path[1].intermediateCurrency]
                : [quote.path[1].intermediateCurrency, quote.path[0].intermediateCurrency];
        const v4TradePlan = new V4Planner();
        v4TradePlan.addAction(Actions.SETTLE, [
            quote.path[0].intermediateCurrency,
            ACTION_CONSTANTS.CONTRACT_BALANCE,
            false,
        ]); // Open delta for intermediateCurrency
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey: {
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[1].fee,
                    tickSpacing: quote.path[1].tickSpacing,
                    hooks: quote.path[1].hooks,
                },
                zeroForOne: v4Currency0 == quote.path[0].intermediateCurrency,
                amountIn: ACTION_CONSTANTS.OPEN_DELTA,
                amountOutMinimum: quote.variableAmount,
                hookData: quote.path[1].hookData,
            },
        ]);
        v4TradePlan.addAction(Actions.TAKE_ALL, [currencyOut, quote.variableAmount]); //receive variable output
        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V3_SWAP_EXACT_IN, v3TradePlan);
        routePlanner.addCommand(CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);
        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - exactAmount); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
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

        // V4 Trade Plan
        const [v4Currency0, v4Currency1] =
            currencyIn < quote.path[0].intermediateCurrency
                ? [currencyIn, quote.path[0].intermediateCurrency]
                : [quote.path[0].intermediateCurrency, currencyIn];
        const v4TradePlan = new V4Planner();
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey: {
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: quote.path[0].fee,
                    tickSpacing: quote.path[0].tickSpacing,
                    hooks: quote.path[0].hooks,
                },
                zeroForOne: v4Currency0 == currencyIn,
                amountIn: exactAmount,
                amountOutMinimum: 0n, // amountOutMinimum ignored for intermediate swap
                hookData: quote.path[0].hookData,
            },
        ]);
        v4TradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, exactAmount]);
        v4TradePlan.addAction(Actions.TAKE, [
            quote.path[0].intermediateCurrency,
            ACTION_CONSTANTS.ADDRESS_THIS,
            ACTION_CONSTANTS.OPEN_DELTA,
        ]);

        // V3 Trade Plan
        const v3Path = encodePacked(
            ["address", "uint24", "address"],
            [quote.path[0].intermediateCurrency, quote.path[1].fee, quote.path[1].intermediateCurrency],
        );
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            ACTION_CONSTANTS.MSG_SENDER, // recipient
            ACTION_CONSTANTS.CONTRACT_BALANCE,
            quote.variableAmount,
            v3Path,
            false, // payerIsUser
        ];

        // Universal Router Plan
        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]);
        routePlanner.addCommand(CommandType.V3_SWAP_EXACT_IN, v3TradePlan);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapV4ErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value: 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);
        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - exactAmount); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + quote.variableAmount); // Output balance increased by variable amount
    });
});
