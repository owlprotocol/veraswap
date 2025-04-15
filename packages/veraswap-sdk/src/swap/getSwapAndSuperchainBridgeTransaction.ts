import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../chains/index.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PoolKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getSuperchainBridgeCallTargetParams } from "./getSuperchainBridgeCallTargetParams.js";
import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndSuperchainBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Superchain Interop
 */
export function getSwapAndSuperchainBridgeTransaction({
    universalRouter,
    destinationChain,
    receiver,
    amountIn,
    amountOutMinimum,
    poolKey,
    zeroForOne,
    permit2PermitParams,
    hookData = "0x",
}: {
    universalRouter: Address;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    poolKey: PoolKey;
    zeroForOne: boolean;
    permit2PermitParams?: [PermitSingle, Hex];
    hookData?: Hex;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    const v4SwapParams = getV4SwapCommandParams({
        receiver: SUPERCHAIN_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        poolKey,
        zeroForOne,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    routePlanner.addCommand(
        CommandType.CALL_TARGET,
        getSuperchainBridgeCallTargetParams({
            destinationChain,
            receiver,
            outputTokenAddress: poolKey.currency1,
        }),
    );

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
