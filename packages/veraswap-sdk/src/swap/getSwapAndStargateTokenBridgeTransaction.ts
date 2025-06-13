import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { getStargateBridgeAllTokenCallData } from "../stargate/getStargateBridgeAllTokenCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PathKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

export function getSwapAndStargateTokenBridgeTransaction({
    universalRouter,
    amountIn,
    amountOutMinimum,
    currencyIn,
    currencyOut,
    path,
    permit2PermitParams,
    // poolApprovalParams,
    hookData = "0x",
    dstChain,
    srcChain,
    recipient,
    tokenSymbol,
}: {
    universalRouter: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    permit2PermitParams?: [PermitSingle, Hex];
    // poolApprovalParams?: [Address, bigint, Hex];
    hookData?: Hex;
    dstChain: number;
    srcChain: number;
    recipient: Address;
    tokenSymbol: keyof typeof STARGATE_TOKEN_POOLS;
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
