import { PoolKey } from "@uniswap/v4-sdk";
import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapExactInExecuteData creates a trade plan, and returns a router execute call data.
 */
export function getSwapExactInExecuteData({
    universalRouter,
    poolKey,
    zeroForOne,
    permit2PermitParams,
    amountIn,
    amountOutMinimum,
}: {
    universalRouter: Address;
    poolKey: PoolKey;
    zeroForOne: boolean;
    permit2PermitParams?: [PermitSingle, Hex];
    amountIn: bigint;
    amountOutMinimum: bigint;
}): { to: Address; data: Hex; value: bigint } {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }
    const v4SwapParams = getV4SwapCommandParams({ amountIn, amountOutMinimum, poolKey, zeroForOne });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
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
