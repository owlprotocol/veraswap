import { QueryClient } from "@tanstack/react-query";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, encodeFunctionData, Hex, numberToHex, padHex, parseAbi, zeroAddress } from "viem";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { ExecuteSweep } from "../artifacts/ExecuteSweep.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { metaQuoteExactOutputBest } from "../artifacts/IV4MetaQuoter.js";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { EXECUTE_SWEEP } from "../constants/uniswap.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";
import { V4MetaQuoteBestType, V4MetaQuoteExactBestReturnType } from "../uniswap/V4MetaQuoter.js";

export interface GetBasketMintQuoteParams {
    chainId: number;
    basket: Address;
    mintAmount: bigint;
    currencyIn: Address;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get basket mint quote for input token with amount
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of quotes
 */
export async function getBasketMintQuote(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBasketMintQuoteParams,
) {
    const {
        chainId,
        basket,
        mintAmount,
        currencyIn,
        contracts,
        currencyHops,
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    // Get required underlying tokens and their raw units
    const mintUnits = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: basket,
            abi: BasketFixedUnits.abi,
            functionName: "getMintUnits",
            args: [mintAmount],
        }),
    );

    // Quote exactOut for each token
    const quotes = (await Promise.all(
        mintUnits.map(async (mintUnit) => {
            const token = mintUnit.addr;
            const units = mintUnit.units;

            const quote = await queryClient.fetchQuery(
                readContractQueryOptions(wagmiConfig, {
                    chainId,
                    address: contracts.v4MetaQuoter,
                    abi: [metaQuoteExactOutputBest],
                    functionName: "metaQuoteExactOutputBest",
                    args: [
                        {
                            exactCurrency: token,
                            variableCurrency: currencyIn,
                            hopCurrencies: currencyHops.filter(
                                (hopToken) => hopToken !== token && hopToken !== currencyIn,
                            ),
                            exactAmount: numberToHex(units),
                            poolKeyOptions,
                        } as const,
                    ],
                }),
            );

            return { quote, currencyOut: token, amountOut: units };
        }),
    )) as { quote: V4MetaQuoteExactBestReturnType; currencyOut: Address; amountOut: bigint }[];

    const currencyInAmount = quotes.reduce((acc, swap) => {
        const [bestSingleSwap, bestMultihopSwap, bestType] = swap.quote;
        if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Single) {
            // Cheapest swap is single hop
            return acc + bestSingleSwap.variableAmount; // Increase input settlement
        } else if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Multihop) {
            // Cheapest swap is multihop
            return acc + bestMultihopSwap.variableAmount; // Increase input settlement
        } else {
            //TODO: Return null?
            throw new Error("no liquidity");
        }
    }, 0n);
    return { mintUnits, quotes, currencyInAmount };
}

export interface GetBasketMintParams extends GetBasketMintQuoteParams {
    receiver: Address;
    referrer?: Address;
    deadline: bigint;
    permit2PermitParams?: [PermitSingle, Hex];
    slippageCentiBps?: bigint;
    contracts: {
        v4MetaQuoter: Address;
        universalRouter: Address;
    };
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getBasketMintStub(queryClient: QueryClient, wagmiConfig: Config, params: GetBasketMintParams) {
    console.debug("getMasketMint", params);

    return {
        to: padHex("0x1", { size: 20 }), //address 1,
        data: "0x",
        value: 0n,
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
        //TODO: Compute slippage
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        slippageCentiBps = 1_000n,
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

        if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Single) {
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
        } else if ((bestType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Multihop) {
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
    /*
    // Add native token sweep command (if input is native)
    const inputIsNative = currencyIn === zeroAddress;
    if (inputIsNative) {
        //TODO: Add param to configure sweep recipient (default 0 = msg.sender)
        routePlanner.addCommand(CommandType.SWEEP, [zeroAddress, zeroAddress, 0n]);
    }
    */

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
