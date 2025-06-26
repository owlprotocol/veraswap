import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { getStargateBridgeAllTokenCallData } from "../stargate/getStargateBridgeAllTokenCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { CommandType, CreateCommandParamsGeneric, RoutePlanner } from "../uniswap/routerCommands.js";

export function getSwapAndStargateTokenBridgeTransaction({
    universalRouter,
    currencyIn,
    commands,
    permit2PermitParams,
    dstChain,
    srcChain,
    recipient,
    tokenSymbol,
}: {
    universalRouter: Address;
    currencyIn: Address;
    commands: CreateCommandParamsGeneric[];
    permit2PermitParams?: [PermitSingle, Hex];
    dstChain: number;
    srcChain: number;
    recipient: Address;
    tokenSymbol: keyof typeof STARGATE_TOKEN_POOLS;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    addCommandsToRoutePlanner(routePlanner, commands);

    const stargateCallData = getStargateBridgeAllTokenCallData({
        dstChain,
        srcChain,
        recipient,
        tokenAddress: currencyIn,
        tokenSymbol: tokenSymbol,
    });
    routePlanner.addCommand(CommandType.CALL_TARGET, [STARGATE_BRIDGE_SWEEP_ADDRESS, 0n, stargateCallData]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
        value: 0n,
    };
}
