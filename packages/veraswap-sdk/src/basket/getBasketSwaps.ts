import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PoolKeyOptions } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getBasketQuotes } from "./getBasketQuotes.js";
import { BatchSwapItem, getBatchSwaps } from "./getBatchSwaps.js";

export interface GetBasketSwapsParams {
    chainId: number;
    currencyIn: Address;
    exactAmount: bigint;
    deadline: bigint;
    permit2PermitParams?: [PermitSingle, Hex];
    receiver?: Address;
    slippage: number;
    currencyHops: Address[];
    contracts: {
        v4StateView: Address;
        v4Quoter: Address;
        universalRouter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
    basketTokens: {
        address: Address;
        weight: number;
    }[];
}

/**
 * Get basket quotes for input token with amount
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of quotes
 */
export async function getBasketSwaps(queryClient: QueryClient, wagmiConfig: Config, params: GetBasketSwapsParams) {
    const { contracts, currencyIn, exactAmount, permit2PermitParams, deadline, receiver } = params;
    const quotes = await getBasketQuotes(queryClient, wagmiConfig, params);

    // Compute V4 swap
    const swaps: BatchSwapItem[] = quotes.map((quote) => {
        return {
            currencyIn: quote.currencyIn,
            currencyOut: quote.currencyOut,
            route: quote.route,
            amountIn: quote.amountIn,
            amountOutMinimum: quote.amountOut, //TODO: Add slippage
        };
    });
    const v4Swap = getBatchSwaps({ swaps, receiver });

    const routePlanner = new RoutePlanner();
    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    routePlanner.addCommand(CommandType.V4_SWAP, [v4Swap]);

    const inputIsNative = currencyIn === zeroAddress;

    return {
        to: contracts.universalRouter,
        value: inputIsNative ? exactAmount : 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        }),
    };
}
