import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { OrbiterBridgeSweep } from "../artifacts/OrbiterBridgeSweep.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { getOrbiterTransferData } from "../orbiter/getOrbiterTransferData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { OrbiterParams } from "../types/OrbiterParams.js";
import { PoolKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndOrbiterETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Orbiter
 */
export function getSwapAndOrbiterETHBridgeTransaction({
    universalRouter,
    receiver,
    amountIn,
    amountOutMinimum,
    poolKey,
    zeroForOne,
    permit2PermitParams,
    hookData = "0x",
    orbiterParams,
}: {
    universalRouter: Address;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    poolKey: PoolKey;
    zeroForOne: boolean;
    permit2PermitParams?: [PermitSingle, Hex];
    hookData?: Hex;
    orbiterParams: OrbiterParams;
}) {
    const { endpoint, endpointContract, orbiterChainId } = orbiterParams;
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    const v4SwapParams = getV4SwapCommandParams({
        receiver: ORBITER_BRIDGE_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        poolKey,
        zeroForOne,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    const orbiterTransferData = getOrbiterTransferData({ orbiterChainId, recipient: receiver });

    const orbiterCallData = encodeFunctionData({
        abi: OrbiterBridgeSweep.abi,
        functionName: "bridgeAllETH",
        args: [receiver, endpointContract, orbiterChainId, endpoint, orbiterTransferData],
    });
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
