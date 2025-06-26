import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { getOrbiterBridgeAllETHCallData } from "../orbiter/getOrbiterBridgeAllETHCallData.js";
import { OrbiterQuote } from "../query/orbiterQuote.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { CommandType, CreateCommandParamsGeneric, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndOrbiterETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Orbiter
 */
export function getSwapAndOrbiterETHBridgeTransaction({
    universalRouter,
    commands,
    permit2PermitParams,
    orbiterQuote,
}: {
    universalRouter: Address;
    commands: CreateCommandParamsGeneric[];
    permit2PermitParams?: [PermitSingle, Hex];
    orbiterQuote: OrbiterQuote;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    addCommandsToRoutePlanner(routePlanner, commands);

    const orbiterCallData = getOrbiterBridgeAllETHCallData(orbiterQuote);
    routePlanner.addCommand(CommandType.CALL_TARGET, [ORBITER_BRIDGE_SWEEP_ADDRESS, 0n, orbiterCallData]);

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
