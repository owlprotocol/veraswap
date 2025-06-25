import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { getOrbiterBridgeAllETHCallData } from "../orbiter/getOrbiterBridgeAllETHCallData.js";
import { OrbiterQuote } from "../query/orbiterQuote.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndOrbiterETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Orbiter
 */
export function getSwapAndOrbiterETHBridgeTransaction({
    universalRouter,
    routePlanner,
    permit2PermitParams,
    orbiterQuote,
}: {
    universalRouter: Address;
    routePlanner: RoutePlanner;
    permit2PermitParams?: [PermitSingle, Hex];
    orbiterQuote: OrbiterQuote;
}) {
    const finalRoutePlanner = permit2PermitParams ? new RoutePlanner() : routePlanner;

    if (permit2PermitParams) {
        finalRoutePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
        const hexCommands = routePlanner.commands.slice(2); // remove "0x"
        const commands: CommandType[] = [];
        for (let i = 0; i < hexCommands.length; i += 2) {
            commands.push(Number(hexCommands.slice(i, i + 2)));
        }
        commands.forEach((commandType, i) => {
            finalRoutePlanner.addCommand(commandType, [routePlanner.inputs[i]]);
        });
    }

    const orbiterCallData = getOrbiterBridgeAllETHCallData(orbiterQuote);
    finalRoutePlanner.addCommand(CommandType.CALL_TARGET, [ORBITER_BRIDGE_SWEEP_ADDRESS, 0n, orbiterCallData]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return {
        to: universalRouter,
        value: 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [finalRoutePlanner.commands, finalRoutePlanner.inputs, routerDeadline],
        }),
    };
}
