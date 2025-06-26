import { QueryClient } from "@tanstack/react-query";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, encodePacked, Hex, padHex, zeroAddress } from "viem";

import { PathKey, PoolKeyOptions, poolKeysToPathExactIn } from "../../types/PoolKey.js";
import { ACTION_CONSTANTS, CommandType, CreateCommandParamsGeneric } from "../routerCommands.js";

import { getMetaQuoteExactInputQueryOptions } from "./getMetaQuoteExactInput.js";
import { MetaQuoteBestMultihop, MetaQuoteBestSingle, MetaQuoteBestType } from "./MetaQuoter.js";

const address3 = padHex("0x3", { size: 20 }); // Used as a flag for Uni V3 pools

export interface GetUniswapRouteParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    contracts: {
        weth9: Address;
        metaQuoter: Address;
    };
    recipient?: Address;
    currencyHops?: Address[];
    poolKeyOptions?: PoolKeyOptions[];
}

// TODO: Convert to queryOptions helper (only single query needed)
// TODO: Implement more generic swap encoding logi
// TODO: Add more invariants, refactor as smaller functions
export async function getUniswapRouteExactIn(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapRouteParams,
): Promise<{
    amountOut: bigint;
    value: bigint;
    commands: CreateCommandParamsGeneric[];
    path: readonly PathKey[];
    gasEstimate: bigint;
} | null> {
    const { currencyIn, currencyOut, amountIn, contracts, recipient } = params;
    const [bestQuoteSingle, bestQuoteMultihop, bestQuoteType] = await queryClient.fetchQuery(
        getMetaQuoteExactInputQueryOptions(wagmiConfig, params),
    );

    const quoteType = bestQuoteType as MetaQuoteBestType;
    if (quoteType === MetaQuoteBestType.None) {
        // No liquidity
        return null;
    }

    // Universal Router planner
    const commands = getRouterCommandsForQuote({
        bestQuoteSingle,
        bestQuoteMultihop,
        bestQuoteType,
        currencyIn,
        currencyOut,
        amountIn,
        recipient,
        contracts,
    });

    const value = currencyIn === zeroAddress ? amountIn : 0n;

    const { gasEstimate, variableAmount: amountOut } =
        quoteType === MetaQuoteBestType.Single ? bestQuoteSingle : bestQuoteMultihop;

    if (quoteType === MetaQuoteBestType.Single) {
        const poolKeys = [bestQuoteSingle.poolKey];
        return {
            amountOut,
            commands,
            value,
            gasEstimate,
            path: poolKeysToPathExactIn(currencyIn, poolKeys),
        };
    }

    // Multihop quote
    return {
        amountOut,
        commands,
        value,
        gasEstimate,
        path: bestQuoteMultihop.path,
    };
}

export interface GetRouterCommandsForQuote {
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    bestQuoteSingle: MetaQuoteBestSingle;
    bestQuoteMultihop: MetaQuoteBestMultihop;
    bestQuoteType: MetaQuoteBestType;
    recipient?: Address;
    contracts: {
        weth9: Address;
    };
}
export function getRouterCommandsForQuote(params: GetRouterCommandsForQuote): CreateCommandParamsGeneric[] {
    const { bestQuoteSingle, bestQuoteMultihop, bestQuoteType } = params;
    if (bestQuoteType === MetaQuoteBestType.None) {
        return [];
    } else if (bestQuoteType === MetaQuoteBestType.Single) {
        // Single quotes
        return getRouterCommandsForSingleQuote({ ...params, quote: bestQuoteSingle });
    } else if (bestQuoteType === MetaQuoteBestType.Multihop) {
        // Multihop quotes
        return getRouterCommandsForMultihopQuote({ ...params, quote: bestQuoteMultihop });
    } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Invalid MetaQuoteBestType: ${bestQuoteType}`);
    }
}

export interface GetRouterCommandsForMultihopQuoteParams {
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    quote: MetaQuoteBestMultihop;
    recipient?: Address;
    contracts: {
        weth9: Address;
    };
}
export function getRouterCommandsForMultihopQuote(
    params: GetRouterCommandsForMultihopQuoteParams,
): CreateCommandParamsGeneric[] {
    //TODO: Is currencyOut even needed here?
    const { currencyIn, amountIn, quote } = params;
    const weth9 = params.contracts.weth9;
    const commands: CreateCommandParamsGeneric[] = [];

    // Multihop quotes
    invariant(quote.path.length === 2, "Multihop quotes should have exactly 2 hops");

    const [hop0, hop1] = quote.path;

    if (hop0.hooks === address3 && hop1.hooks === address3) {
        // Multihop V3 -> V3
        // Wrap ETH to WETH if needed
        const wrapNative = currencyIn === zeroAddress;
        if (wrapNative) {
            commands.push([CommandType.WRAP_ETH, [ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.CONTRACT_BALANCE]]);
        }

        // V3 Trade Plan
        const v3SwapCurrencyIn = wrapNative ? weth9 : currencyIn;
        const v3Path = encodePacked(
            ["address", "uint24", "address", "uint24", "address"],
            [v3SwapCurrencyIn, hop0.fee, hop0.intermediateCurrency, hop1.fee, hop1.intermediateCurrency],
        );
        const unwrapWeth = hop1.intermediateCurrency === weth9;
        const recipient = ACTION_CONSTANTS.MSG_SENDER ?? params.recipient;
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            unwrapWeth ? ACTION_CONSTANTS.ADDRESS_THIS : recipient, // WETH received to router
            amountIn, // exact amount in
            quote.variableAmount,
            v3Path,
            !wrapNative, // payerIsUser (WETH received to router)
        ];
        commands.push([CommandType.V3_SWAP_EXACT_IN, v3TradePlan]);

        // Unwrap WETH to ETH if needed
        if (unwrapWeth) {
            commands.push([CommandType.UNWRAP_WETH, [recipient, quote.variableAmount]]);
        }
    } else if (hop0.hooks !== address3 && hop1.hooks !== address3) {
        // Multihop V4 -> V4
        const v4TradePlan = new V4Planner();
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN, [
            {
                currencyIn,
                path: quote.path,
                amountIn,
                amountOutMinimum: quote.variableAmount,
            },
        ]);
        v4TradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
        if (!params.recipient) {
            v4TradePlan.addAction(Actions.TAKE_ALL, [hop1.intermediateCurrency, quote.variableAmount]);
        } else {
            v4TradePlan.addAction(Actions.TAKE, [hop1.intermediateCurrency, params.recipient, quote.variableAmount]);
        }
        commands.push([CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]]);
    } else if (hop0.hooks === address3 && hop1.hooks !== address3) {
        // Mixed Route V3 -> V4
        // Wrap ETH to WETH if needed
        const wrapNative = currencyIn === zeroAddress;
        if (wrapNative) {
            commands.push([CommandType.WRAP_ETH, [ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.CONTRACT_BALANCE]]);
        }

        // V3 Trade Plan
        const v3SwapCurrencyIn = wrapNative ? weth9 : currencyIn;
        const v3Path = encodePacked(
            ["address", "uint24", "address"],
            [v3SwapCurrencyIn, hop0.fee, hop0.intermediateCurrency],
        );
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            ACTION_CONSTANTS.ADDRESS_THIS, // recipient
            amountIn, // exact amount in
            0n, // amountOutMinimum ignored for intermediate swap
            v3Path,
            !wrapNative, // payerIsUser (WETH received to router)
        ];
        commands.push([CommandType.V3_SWAP_EXACT_IN, v3TradePlan]);

        // Unwrap WETH to ETH if needed
        const unwrapWeth = hop0.intermediateCurrency === weth9;
        if (unwrapWeth) {
            commands.push([CommandType.UNWRAP_WETH, [ACTION_CONSTANTS.ADDRESS_THIS, 0n]]);
        }

        // V4 Trade Plan
        const v4SwapCurrencyIn = unwrapWeth ? zeroAddress : hop0.intermediateCurrency;
        const [v4Currency0, v4Currency1] =
            v4SwapCurrencyIn < hop1.intermediateCurrency
                ? [v4SwapCurrencyIn, hop1.intermediateCurrency]
                : [hop1.intermediateCurrency, v4SwapCurrencyIn];
        const v4TradePlan = new V4Planner();
        v4TradePlan.addAction(Actions.SETTLE, [v4SwapCurrencyIn, ACTION_CONSTANTS.CONTRACT_BALANCE, false]); // Open delta for intermediateCurrency
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey: {
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: hop1.fee,
                    tickSpacing: hop1.tickSpacing,
                    hooks: hop1.hooks,
                },
                zeroForOne: v4Currency0 == v4SwapCurrencyIn,
                amountIn: ACTION_CONSTANTS.OPEN_DELTA,
                amountOutMinimum: quote.variableAmount,
                hookData: hop1.hookData,
            },
        ]);
        if (!params.recipient) {
            v4TradePlan.addAction(Actions.TAKE_ALL, [hop1.intermediateCurrency, quote.variableAmount]);
        } else {
            v4TradePlan.addAction(Actions.TAKE, [hop1.intermediateCurrency, params.recipient, quote.variableAmount]);
        }
        commands.push([CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]]);
    } else if (hop0.hooks !== address3 && hop1.hooks === address3) {
        // Mixed Route V4 -> V3
        // Uniswap V4 pool
        const v4TradePlan = new V4Planner();
        const [v4Currency0, v4Currency1] =
            currencyIn < hop0.intermediateCurrency
                ? [currencyIn, hop0.intermediateCurrency]
                : [hop0.intermediateCurrency, currencyIn];
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey: {
                    currency0: v4Currency0,
                    currency1: v4Currency1,
                    fee: hop0.fee,
                    tickSpacing: hop0.tickSpacing,
                    hooks: hop0.hooks,
                },
                zeroForOne: v4Currency0 == currencyIn,
                amountIn,
                amountOutMinimum: 0n, // amountOutMinimum ignored for intermediate swap
                hookData: hop0.hookData,
            },
        ]);
        v4TradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
        v4TradePlan.addAction(Actions.TAKE, [
            hop0.intermediateCurrency,
            ACTION_CONSTANTS.ADDRESS_THIS,
            ACTION_CONSTANTS.OPEN_DELTA,
        ]);
        commands.push([CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]]);

        // Wrap ETH to WETH if needed
        const wrapNative = hop0.intermediateCurrency === zeroAddress;
        if (wrapNative) {
            commands.push([CommandType.UNWRAP_WETH, [ACTION_CONSTANTS.ADDRESS_THIS, 0n]]);
        }

        // V3 Trade Plan
        const v3SwapCurrencyIn = wrapNative ? weth9 : hop0.intermediateCurrency;
        const v3Path = encodePacked(
            ["address", "uint24", "address"],
            [v3SwapCurrencyIn, hop1.fee, hop1.intermediateCurrency],
        );
        const unwrapWeth = hop1.intermediateCurrency === weth9;
        const recipient = ACTION_CONSTANTS.MSG_SENDER ?? params.recipient;
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            unwrapWeth ? ACTION_CONSTANTS.ADDRESS_THIS : recipient, // WETH received to router
            ACTION_CONSTANTS.CONTRACT_BALANCE,
            quote.variableAmount,
            v3Path,
            false, // payerIsUser
        ];
        commands.push([CommandType.V3_SWAP_EXACT_IN, v3TradePlan]);

        // Unwrap WETH to ETH if needed
        if (unwrapWeth) {
            commands.push([CommandType.UNWRAP_WETH, [recipient, quote.variableAmount]]);
        }
    }

    return commands;
}

export interface GetRouterCommandsForSingleQuoteParams {
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    quote: MetaQuoteBestSingle;
    recipient?: Address;
    contracts: {
        weth9: Address;
    };
}
export function getRouterCommandsForSingleQuote(
    params: GetRouterCommandsForSingleQuoteParams,
): CreateCommandParamsGeneric[] {
    const { currencyIn, currencyOut, amountIn, quote } = params;
    const weth9 = params.contracts.weth9;
    const commands: CreateCommandParamsGeneric[] = [];
    // Single quotes
    const poolKey = quote.poolKey;
    if (quote.poolKey.hooks === address3) {
        // Uniswap V3 pool
        // Wrap ETH to WETH if needed
        const wrapNative = currencyIn === zeroAddress;
        if (wrapNative) {
            commands.push([CommandType.WRAP_ETH, [ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.CONTRACT_BALANCE]]);
        }

        // V3 Trade Plan
        const v3SwapCurrencyIn = wrapNative ? weth9 : currencyIn;
        const unwrapWeth = currencyOut === zeroAddress;
        const v3SwapCurrencyOut = unwrapWeth ? weth9 : currencyOut;
        const v3Path = encodePacked(
            ["address", "uint24", "address"],
            [v3SwapCurrencyIn, poolKey.fee, v3SwapCurrencyOut],
        );
        const recipient = ACTION_CONSTANTS.MSG_SENDER ?? params.recipient;
        const v3TradePlan: [Address, bigint, bigint, Hex, boolean] = [
            unwrapWeth ? ACTION_CONSTANTS.ADDRESS_THIS : recipient, // WETH received to router
            amountIn, // exact amount in
            quote.variableAmount,
            v3Path,
            !wrapNative, // payerIsUser (WETH received to router)
        ];
        commands.push([CommandType.V3_SWAP_EXACT_IN, v3TradePlan]);

        // Unwrap WETH to ETH if needed
        if (unwrapWeth) {
            commands.push([CommandType.UNWRAP_WETH, [recipient, quote.variableAmount]]);
        }
    } else {
        // Uniswap V4 pool
        const v4TradePlan = new V4Planner();
        v4TradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            {
                poolKey,
                zeroForOne: quote.zeroForOne,
                amountIn,
                amountOutMinimum: quote.variableAmount,
                hookData: quote.hookData,
            },
        ]);
        v4TradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
        if (!params.recipient) {
            v4TradePlan.addAction(Actions.TAKE_ALL, [currencyOut, quote.variableAmount]);
        } else {
            v4TradePlan.addAction(Actions.TAKE, [currencyOut, params.recipient, quote.variableAmount]);
        }
        commands.push([CommandType.V4_SWAP, [v4TradePlan.finalize() as Hex]]);
    }

    return commands;
}
