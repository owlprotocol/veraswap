import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { CommandType, CreateCommandParamsGeneric, RoutePlanner } from "../uniswap/routerCommands.js";

import { getHyperlaneSweepBridgeCallTargetParams } from "./getHyperlaneSweepBridgeCallTargetParams.js";

/**
 * getSwapAndHyperlaneSweepBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Hyperlane
 */
export function getSwapAndHyperlaneSweepBridgeTransaction({
    universalRouter,
    bridgeAddress,
    bridgePayment,
    destinationChain,
    receiver,
    amountIn,
    currencyIn,
    commands,
    permit2PermitParams,
}: {
    universalRouter: Address;
    bridgeAddress: Address;
    bridgePayment: bigint;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    currencyIn: Address;
    commands: CreateCommandParamsGeneric[];
    permit2PermitParams?: [PermitSingle, Hex];
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    addCommandsToRoutePlanner(routePlanner, commands);

    routePlanner.addCommand(
        CommandType.CALL_TARGET,
        getHyperlaneSweepBridgeCallTargetParams({ bridgeAddress, bridgePayment, destinationChain, receiver }),
    );

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
        value: isNative ? amountIn + bridgePayment : bridgePayment,
    };
}
