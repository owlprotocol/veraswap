import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Address, Hex } from "viem";

import { PathKey, pathKeyToPoolKey } from "../types/PoolKey.js";

/**
 * getV4SwapCommandParams generates the hex-encoded command parameters for a V4 swap.
 */
export function getV4SwapCommandParams({
    receiver,
    amountIn,
    amountOutMinimum,
    currencyIn,
    currencyOut,
    path,
    hookData = "0x",
}: {
    receiver?: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    hookData?: Hex;
}) {
    const tradePlan = new V4Planner();

    if (path.length === 1) {
        const poolKey = pathKeyToPoolKey(path[0], currencyIn);
        const zeroForOne = poolKey.currency0 === currencyIn;

        tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            { poolKey, zeroForOne, amountIn, amountOutMinimum, hookData },
        ]);
    } else {
        tradePlan.addAction(Actions.SWAP_EXACT_IN, [{ currencyIn, path, amountIn, amountOutMinimum }]);
    }

    tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
    if (receiver) {
        tradePlan.addAction(Actions.TAKE, [currencyOut, receiver, 0]);
    } else {
        tradePlan.addAction(Actions.TAKE_ALL, [currencyOut, 0]);
    }

    return tradePlan.finalize() as Hex;
}
