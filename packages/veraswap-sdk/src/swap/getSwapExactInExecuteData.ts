import { PoolKey } from "@uniswap/v4-sdk";
import { Address, encodeFunctionData, encodePacked, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { V4_SWAP } from "../constants/index.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapExactInExecuteData creates a trade plan, and returns a router execute call data.
 */
export function getSwapExactInExecuteData({
    universalRouter,
    poolKey,
    zeroForOne,
    amountIn,
    amountOutMinimum,
}: {
    universalRouter: Address;
    poolKey: PoolKey;
    zeroForOne: boolean;
    amountIn: bigint;
    amountOutMinimum: bigint;
}): { to: Address; data: Hex; value: bigint } {
    // Swap Configuration
    const routerInput0 = getV4SwapCommandParams({ amountIn, amountOutMinimum, poolKey, zeroForOne });
    const routerCommands = encodePacked(["uint8"], [V4_SWAP]);
    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const currencyIn = zeroForOne ? poolKey.currency0 : poolKey.currency1;
    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routerCommands, [routerInput0], routerDeadline],
        }),
        value: isNative ? amountIn : 0n,
    };
}
