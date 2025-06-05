import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS } from "../constants/stargate.js";
import { getStargateBridgeAllETHCallData } from "../stargate/getStargateBridgeAllETHCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PathKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndStargateETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Stargate
 */
export function getSwapAndStargateETHBridgeTransaction({
    universalRouter,
    amountIn,
    amountOutMinimum,
    currencyIn,
    currencyOut,
    path,
    permit2PermitParams,
    hookData = "0x",
    dstChain,
    srcChain,
    recipient,
}: {
    universalRouter: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    permit2PermitParams?: [PermitSingle, Hex];
    hookData?: Hex;
    dstChain: number;
    srcChain: number;
    recipient: Address;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    const v4SwapParams = getV4SwapCommandParams({
        receiver: STARGATE_BRIDGE_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        currencyIn,
        currencyOut,
        path,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

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
