import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { CommandType, CreateCommandParamsGeneric, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapExactInExecuteData creates a trade plan, and returns a router execute call data.
 */
export function getSwapExactInExecuteData({
    universalRouter,
    currencyIn,
    commands,
    permit2PermitParams,
    amountIn,
}: {
    universalRouter: Address;
    currencyIn: Address;
    commands: CreateCommandParamsGeneric[];
    permit2PermitParams?: [PermitSingle, Hex];
    amountIn: bigint;
    amountOutMinimum: bigint;
}): { to: Address; data: Hex; value: bigint } {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    addCommandsToRoutePlanner(routePlanner, commands);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
        value: isNative ? amountIn : 0n,
    };
}
