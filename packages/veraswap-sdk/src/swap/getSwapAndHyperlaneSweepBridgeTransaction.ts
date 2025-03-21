import { encodeFunctionData, Address, Hex } from "viem";
import { getHyperlaneSweepBridgeCallTargetParams } from "./getHyperlaneSweepBridgeCallTargetParams.js";
import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";
import { PoolKey } from "../types/PoolKey.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../constants.js";
import { HypTokenRouterSweep } from "../artifacts/HypTokenRouterSweep.js";

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
    hookData?: Hex;
}) {
    const routePlanner = new RoutePlanner();

    const v4SwapParams = getV4SwapCommandParams({
        receiver: HYPERLANE_ROUTER_SWEEP_ADDRESS,
        amountIn,
        amountOutMinimum,
        poolKey,
        zeroForOne,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    const currencyOut = zeroForOne ? poolKey.currency1 : poolKey.currency0;

    // TODO: Don't do this it here, do in once elsewhere
    routePlanner.addCommand(CommandType.CALL_TARGET, [
        HYPERLANE_ROUTER_SWEEP_ADDRESS,
        0n,
        encodeFunctionData({
            abi: HypTokenRouterSweep.abi,
            functionName: "approveAll",
            args: [currencyOut, bridgeAddress],
        }),
    ]);

    routePlanner.addCommand(
        CommandType.CALL_TARGET,
        getHyperlaneSweepBridgeCallTargetParams({ bridgeAddress, bridgePayment, destinationChain, receiver }),
    );

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return {
        to: universalRouter,
        value: bridgePayment,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
