import { encodeFunctionData, Address, Hex } from "viem";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { getSuperchainBridgeCallTargetParams } from "./getSuperchainBridgeCallTargetParams.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";
import { PoolKey } from "../types/PoolKey.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../constants.js";

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
    hookData = "0x",
}: {
    universalRouter: Address;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    poolKey: PoolKey;
    zeroForOne: boolean;
    hookData?: Hex;
}) {
    const routePlanner = new RoutePlanner();

    // planner data: use take instead of take all to set receive to  bridge
    const tradePlan = new V4Planner();
    tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [{ poolKey, zeroForOne, amountIn, amountOutMinimum, hookData }]);
    tradePlan.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
    tradePlan.addAction(Actions.TAKE, [poolKey.currency1, SUPERCHAIN_SWEEP_ADDRESS, 0]);

    const swapInput = tradePlan.finalize() as Hex;

    routePlanner.addCommand(CommandType.V4_SWAP, [swapInput]);

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
