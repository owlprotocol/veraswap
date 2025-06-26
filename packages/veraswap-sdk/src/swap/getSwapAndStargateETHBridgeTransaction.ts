import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS } from "../constants/stargate.js";
import { getStargateBridgeAllETHCallData } from "../stargate/getStargateBridgeAllETHCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { CommandType, CreateCommandParamsGeneric, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndStargateETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Stargate
 */
export function getSwapAndStargateETHBridgeTransaction({
    universalRouter,
    commands,
    permit2PermitParams,
    dstChain,
    srcChain,
    recipient,
}: {
    universalRouter: Address;
    commands: CreateCommandParamsGeneric[];
    permit2PermitParams?: [PermitSingle, Hex];
    dstChain: number;
    srcChain: number;
    recipient: Address;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    addCommandsToRoutePlanner(routePlanner, commands);

    const stargateCallData = getStargateBridgeAllETHCallData({ dstChain, srcChain, recipient });
    routePlanner.addCommand(CommandType.CALL_TARGET, [STARGATE_BRIDGE_SWEEP_ADDRESS, 0n, stargateCallData]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return {
        to: universalRouter,
        value: 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
