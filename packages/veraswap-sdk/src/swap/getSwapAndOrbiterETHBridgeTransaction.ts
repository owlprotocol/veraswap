import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { OrbiterBridgeSweep } from "../artifacts/OrbiterBridgeSweep.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { getOrbiterTransferData } from "../orbiter/getOrbiterTransferData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PathKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndOrbiterETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Orbiter
 */
export function getSwapAndOrbiterETHBridgeTransaction({
    universalRouter,
    walletAddress,
    receiver,
    amountIn,
    amountOutMinimum,
    currencyIn,
    currencyOut,
    path,
    permit2PermitParams,
    hookData = "0x",
    orbiterChainId,
    endpointContract,
}: {
    universalRouter: Address;
    walletAddress: Address;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    permit2PermitParams?: [PermitSingle, Hex];
    hookData?: Hex;
    orbiterChainId: number;
    endpointContract: Address;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    const v4SwapParams = getV4SwapCommandParams({
        receiver: ORBITER_BRIDGE_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        currencyIn,
        currencyOut,
        path,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    const orbiterTransferData = getOrbiterTransferData({ orbiterChainId, recipient: receiver });

    const orbiterCallData = encodeFunctionData({
        abi: OrbiterBridgeSweep.abi,
        functionName: "bridgeAllETH",
        args: [endpointContract, orbiterChainId, receiver, orbiterTransferData],
    });
    routePlanner.addCommand(CommandType.CALL_TARGET, [ORBITER_BRIDGE_SWEEP_ADDRESS, 0n, orbiterCallData]);

    routePlanner.addCommand(CommandType.UNWRAP_WETH, [walletAddress, 0n]);

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
