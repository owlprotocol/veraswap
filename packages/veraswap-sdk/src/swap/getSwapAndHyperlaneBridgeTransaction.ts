import { encodeFunctionData, Address, padHex, Hex } from "viem";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";
import { HypERC20FlashCollateral } from "../artifacts/HypERC20FlashCollateral.js";
import { Actions, V4Planner } from "../uniswap/v4Planner.js";
import { PoolKey } from "../types/PoolKey.js";
/**
 * getSwapAndHyperlaneBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Hyperlane
 */
export async function getSwapAndHyperlaneBridgeTransaction({
    bridgePayment,
    bridgeAddress,
    destinationChain,
    receiver,
    amountIn,
    amountOutMinimum,
    poolKey,
    zeroForOne,
    hookData = "0x",
}: {
    bridgePayment: bigint;
    bridgeAddress: Address;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    poolKey: PoolKey;
    zeroForOne: boolean;
    hookData: Hex;
}) {
    const routePlanner = new RoutePlanner();
    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        0n,
        encodeFunctionData({ abi: HypERC20FlashCollateral.abi, functionName: "transferRemoteLock" }),
    ]);

    // planner data: use take instead of take all to set receive to  bridge
    const tradePlan = new V4Planner();
    tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [poolKey, zeroForOne, amountIn, amountOutMinimum, hookData]);
    tradePlan.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
    tradePlan.addAction(Actions.TAKE, [poolKey.currency1, receiver, amountOutMinimum]);

    const swapInput = tradePlan.finalize();

    routePlanner.addCommand(CommandType.V4_SWAP, [swapInput]);

    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        bridgePayment,
        encodeFunctionData({
            abi: HypERC20FlashCollateral.abi,
            functionName: "transferRemoteUnlock",
            args: [destinationChain, padHex(receiver, { size: 32 })],
        }),
    ]);

    return { commands: routePlanner.commands, inputs: routePlanner.inputs };
}
