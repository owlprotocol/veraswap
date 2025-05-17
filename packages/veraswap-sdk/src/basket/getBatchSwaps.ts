import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Address, Hex } from "viem";

import { PoolKey, poolKeysToPathExactIn } from "../types/PoolKey.js";

interface Swap {
    currencyIn: Address;
    currencyOut: Address;
    route: PoolKey[];
    amountIn: bigint;
    amountOutMinimum: bigint;
    receiver: Address;
}

//TODO: Need to add approvals
/**
 * Encode a batch of swaps
 * @param swaps
 * @returns encoded trade plan
 */
export function getBatchSwaps(swaps: Swap[]): Hex {
    const tradePlan = new V4Planner();
    swaps.forEach((swap) => {
        const { currencyIn, currencyOut, route, amountIn, amountOutMinimum, receiver } = swap;

        if (route.length === 1) {
            const poolKey = route[0];
            const zeroForOne = poolKey.currency0 === currencyIn;

            tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
                { poolKey, zeroForOne, amountIn, amountOutMinimum, hookData: "0x" },
            ]);
        } else {
            const path = poolKeysToPathExactIn(currencyIn, route);
            tradePlan.addAction(Actions.SWAP_EXACT_IN, [{ currencyIn, path, amountIn, amountOutMinimum }]);
        }

        tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
        if (receiver) {
            tradePlan.addAction(Actions.TAKE, [currencyOut, receiver, 0]);
        } else {
            tradePlan.addAction(Actions.TAKE_ALL, [currencyOut, 0]);
        }
    });

    return tradePlan.finalize() as Hex;
}
