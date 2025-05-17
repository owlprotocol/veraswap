import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { Address, Hex } from "viem";

import { PoolKey, poolKeysToPathExactIn } from "../types/PoolKey.js";

interface Swap {
    currencyIn: Address;
    currencyOut: Address;
    route: PoolKey[];
    amountIn: bigint;
    amountOutMinimum: bigint;
}

//TODO: Need to add approvals
//TODO: Need to add fee for referrals
/**
 * Encode a batch of swaps to a single receiver
 * @param swaps
 * @returns encoded trade plan
 */
export function getBatchSwaps({ swaps, receiver }: { swaps: Swap[]; receiver?: Address }): Hex {
    const tradePlan = new V4Planner();
    const currencyInAmounts: Record<Address, bigint> = {};

    // Add swaps
    swaps.forEach((swap) => {
        const { currencyIn, route, amountIn, amountOutMinimum } = swap;

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

        // Increase input settlement
        if (!currencyInAmounts[currencyIn]) {
            currencyInAmounts[currencyIn] = 0n;
        }
        currencyInAmounts[currencyIn] += amountIn;
    });

    // Settle all inputs
    Object.entries(currencyInAmounts).forEach(([currencyIn, amountIn]) => {
        tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
    });

    // Take all outputs
    const uniqueCurrencyOut = new Set(swaps.map((swap) => swap.currencyOut));
    uniqueCurrencyOut.forEach((currencyOut) => {
        if (receiver) {
            tradePlan.addAction(Actions.TAKE, [currencyOut, receiver, 0]);
        } else {
            tradePlan.addAction(Actions.TAKE_ALL, [currencyOut, 0]);
        }
    });

    return tradePlan.finalize() as Hex;
}
