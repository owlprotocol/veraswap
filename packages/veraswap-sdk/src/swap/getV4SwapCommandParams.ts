import { Actions, PoolKey, V4Planner } from "@uniswap/v4-sdk";
import { Address, Hex } from "viem";

/**
 * getV4SwapCommandParams generates the hex-encoded command parameters for a V4 swap.
 */
export function getV4SwapCommandParams({
    receiver,
    amountIn,
    amountOutMinimum,
    poolKey,
    zeroForOne,
    hookData = "0x",
}: {
    receiver?: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    poolKey: PoolKey;
    zeroForOne: boolean;
    hookData?: Hex;
}) {
    const tradePlan = new V4Planner();
    tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [{ poolKey, zeroForOne, amountIn, amountOutMinimum, hookData }]);
    tradePlan.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
    if (receiver) {
        tradePlan.addAction(Actions.TAKE, [poolKey.currency1, receiver, 0]);
    } else {
        tradePlan.addAction(Actions.TAKE_ALL, [poolKey.currency1, 0]);
    }

    return tradePlan.finalize() as Hex;
}
