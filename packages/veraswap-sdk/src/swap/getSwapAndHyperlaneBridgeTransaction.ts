import { Address, encodeFunctionData, Hex, padHex, zeroAddress } from "viem";

import { HypERC20FlashCollateral } from "../artifacts/HypERC20FlashCollateral.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner, getRouterCommandsForQuote, MetaQuoteBest } from "../uniswap/index.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndHyperlaneBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Hyperlane
 */
export function getSwapAndHyperlaneBridgeTransaction({
    universalRouter,
    bridgeAddress,
    bridgePayment,
    destinationChain,
    receiver,
    amountIn,
    currencyIn,
    currencyOut,
    quote,
    permit2PermitParams,
    contracts,
}: {
    universalRouter: Address;
    bridgeAddress: Address;
    bridgePayment: bigint;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    currencyIn: Address;
    currencyOut: Address;
    quote: MetaQuoteBest;
    permit2PermitParams?: [PermitSingle, Hex];
    contracts: {
        weth9: Address;
    };
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        0n,
        encodeFunctionData({ abi: HypERC20FlashCollateral.abi, functionName: "transferRemoteLock" }),
    ]);

    const commands = getRouterCommandsForQuote({
        amountIn,
        contracts,
        currencyIn,
        currencyOut,
        ...quote,
        recipient: bridgeAddress,
    });
    addCommandsToRoutePlanner(routePlanner, commands);

    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        bridgePayment,
        encodeFunctionData({
            abi: HypERC20FlashCollateral.abi,
            functionName: "transferRemoteUnlock",
            args: [destinationChain, padHex(receiver, { size: 32 })],
        }),
    ]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        value: isNative ? amountIn + bridgePayment : bridgePayment,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
