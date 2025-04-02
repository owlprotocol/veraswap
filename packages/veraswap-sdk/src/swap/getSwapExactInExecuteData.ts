import { PoolKey } from "@uniswap/v4-sdk";
import { Hex, encodePacked, encodeFunctionData, Address, zeroAddress } from "viem";
import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { V4_SWAP } from "../constants/index.js";

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
