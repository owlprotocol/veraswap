import { QueryClient } from "@tanstack/react-query";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData, Hex, padHex, parseAbi, zeroAddress } from "viem";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { ExecuteSweep } from "../artifacts/ExecuteSweep.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { EXECUTE_SWEEP } from "../constants/uniswap.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { MetaQuoteBestType } from "../uniswap/quote/MetaQuoter.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getBasketMintQuote, GetBasketMintQuoteParams } from "./getBasketMintQuote.js";

export interface GetBasketMintParams extends GetBasketMintQuoteParams {
    receiver: Address;
    referrer?: Address;
    deadline: bigint;
    permit2PermitParams?: [PermitSingle, Hex];
    slippageCentiBps?: bigint;
    nativeSweepRecipient?: Address; // Native token sweep recipient, defaults to address(1) which sweeps to caller
    contracts: {
        metaQuoter: Address;
        universalRouter: Address;
    };
}

/**
 * Get basket quotes for input token with amount
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of quotes
 */
export async function getBasketMint(queryClient: QueryClient, wagmiConfig: Config, params: GetBasketMintParams) {
    const {
        basket,
        mintAmount,
        receiver,
        referrer,
        currencyIn,
        nativeSweepRecipient,
        //TODO: Compute slippage

        // slippageCentiBps = 1_000n,
        permit2PermitParams,
        deadline,
        contracts,
    } = params;

    // Get quotes for underlying tokens
    const { mintUnits, quotes, currencyInAmount } = await getBasketMintQuote(queryClient, wagmiConfig, params);

    const tradePlan = new V4Planner();
    // Add swaps
    quotes.forEach((swap) => {
        const [bestSingleSwap, bestMultihopSwap, bestType] = swap.quote;
        const currencyOut = swap.currencyOut;
        const amountOut = swap.amountOut;

        if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
            // Cheapest swap is single hop
            tradePlan.addAction(Actions.SWAP_EXACT_OUT_SINGLE, [
                {
                    poolKey: bestSingleSwap.poolKey,
                    zeroForOne: bestSingleSwap.zeroForOne,
                    amountOut,
                    amountInMaximum: bestSingleSwap.variableAmount,
                    hookData: bestSingleSwap.hookData,
                },
            ]);
        } else if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Multihop) {
            // Cheapest swap is multihop
            tradePlan.addAction(Actions.SWAP_EXACT_OUT, [
                {
                    currencyOut,
                    path: bestMultihopSwap.path,
                    amountOut,
                    amountInMaximum: bestMultihopSwap.variableAmount,
                },
            ]);
        } else {
            //TODO: Return null?
            throw new Error("no liquidity");
        }
    });

    // Settle all inputs
    //TODO: Add slippage for input & sweep any dust to user
    tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, MAX_UINT_256]);
    // Take all outputs (send to ExecuteSweep)
    const uniqueCurrencyOut = new Set(quotes.map(({ currencyOut }) => currencyOut));
    uniqueCurrencyOut.forEach((currencyOut) => {
        tradePlan.addAction(Actions.TAKE, [currencyOut, EXECUTE_SWEEP, 0]);
    });

    // Encode router plan
    const routePlanner = new RoutePlanner();
    if (permit2PermitParams) {
        // Add permit2 permit command
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }
    // Add v4 swap command
    routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);
    // Add native token sweep command (if input is native)
    const inputIsNative = currencyIn === zeroAddress;
    if (inputIsNative) {
        // Sweep any extra native tokens to `nativeSweepRecipient` or caller (address(1))
        routePlanner.addCommand(CommandType.SWEEP, [
            zeroAddress,
            nativeSweepRecipient ?? padHex("0x1", { size: 20 }),
            0n,
        ]);
    }

    // Add call target command
    // Encode mint call
    const mintCall = encodeFunctionData({
        abi: BasketFixedUnits.abi,
        functionName: "mint",
        args: [mintAmount, receiver, referrer ?? zeroAddress],
    });

    const mintUnitEth = mintUnits.find((unit) => unit.addr === zeroAddress);
    const mintUnitEthAmount = mintUnitEth ? mintUnitEth.units : 0n; //one of the basket assets is ETH
    const executeSweepCall = encodeFunctionData({
        abi: ExecuteSweep.abi,
        functionName: "execute",
        args: [basket, mintCall, mintUnitEthAmount],
    });
    routePlanner.addCommand(CommandType.CALL_TARGET, [EXECUTE_SWEEP, 0n, executeSweepCall]);

    const errorAbi = parseAbi([
        "error DeltaNotNegative(address)",
        "error DeltaNotPositive(address)",
        "error CurrencyNotSettled()",
    ]);
    return {
        abi: [...IUniversalRouter.abi, ...errorAbi],
        address: contracts.universalRouter,
        value: inputIsNative ? currencyInAmount : 0n,
        functionName: "execute",
        args: [routePlanner.commands, routePlanner.inputs, deadline],
    } as const;

    /*
    return {
        to: contracts.universalRouter,
        value: inputIsNative ? currencyInAmount : 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        }),
        */
}
