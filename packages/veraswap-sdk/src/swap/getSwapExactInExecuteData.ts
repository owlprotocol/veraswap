import { PoolKey, V4Planner, Actions } from "@uniswap/v4-sdk";
import { Hex, encodePacked, encodeFunctionData, Address } from "viem";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { V4_SWAP } from "../constants.js";

/**
 * getSwapExactInExecuteData creates a trade plan, and returns a router execute call data.
 */
export function getSwapExactInExecuteData({
    universalRouter,
    poolKey,
    currencyIn,
    currencyOut,
    zeroForOne,
    amountIn,
    amountOutMinimum,
}: {
    universalRouter: Address;
    poolKey: PoolKey;
    currencyIn: Address;
    currencyOut: Address;
    zeroForOne: boolean;
    amountIn: bigint;
    amountOutMinimum: bigint;
}): { to: Address; data: Hex; value: bigint } {
    // Higher-level abstraction, no built-in helpers exist for the actions we use
    // Unfortunately, there are no type checks, and tuples expect key-value inputs.
    const tradePlan = new V4Planner();
    tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
        { poolKey, zeroForOne, amountIn, amountOutMinimum: amountOutMinimum, hookData: "0x" },
    ]);
    tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, amountIn]);
    tradePlan.addAction(Actions.TAKE_ALL, [currencyOut, amountOutMinimum]);

    // Swap Configuration
    const routerInput0 = tradePlan.finalize() as Hex;
    const routerCommands = encodePacked(["uint8"], [V4_SWAP]);
    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routerCommands, [routerInput0], routerDeadline],
        }),
        value: 0n,
    };
}
