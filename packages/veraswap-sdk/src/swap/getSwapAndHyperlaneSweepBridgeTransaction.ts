import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../constants/index.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PoolKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getHyperlaneSweepBridgeCallTargetParams } from "./getHyperlaneSweepBridgeCallTargetParams.js";
import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndHyperlaneSweepBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Hyperlane
 */
export function getSwapAndHyperlaneSweepBridgeTransaction({
    universalRouter,
    bridgeAddress,
    bridgePayment,
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
    bridgeAddress: Address;
    bridgePayment: bigint;
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
        receiver: HYPERLANE_ROUTER_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        poolKey,
        zeroForOne,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    routePlanner.addCommand(
        CommandType.CALL_TARGET,
        getHyperlaneSweepBridgeCallTargetParams({ bridgeAddress, bridgePayment, destinationChain, receiver }),
    );

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
        value: isNative ? amountIn + bridgePayment : bridgePayment,
    };
}
