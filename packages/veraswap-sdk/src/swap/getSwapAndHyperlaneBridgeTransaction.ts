import { Address, encodeFunctionData, Hex, padHex, zeroAddress } from "viem";

import { HypERC20FlashCollateral } from "../artifacts/HypERC20FlashCollateral.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { PathKey } from "../types/PoolKey.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";

/**
 * getSwapAndHyperlaneBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Hyperlane
 */
export function getSwapAndHyperlaneBridgeTransaction({
    universalRouter,
    bridgeAddress,
    bridgePayment,
    destinationChain,
    receiver,
    amountIn,
    amountOutMinimum,
    currencyIn,
    currencyOut,
    path,
    permit2PermitParams,
    hookData = "0x",
}: {
    universalRouter: Address;
    bridgeAddress: Address;
    bridgePayment: bigint;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    path: PathKey[];
    permit2PermitParams?: [PermitSingle, Hex];
    hookData?: Hex;
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        0n,
        encodeFunctionData({ abi: HypERC20FlashCollateral.abi, functionName: "transferRemoteLock" }),
    ]);

    const v4SwapParams = getV4SwapCommandParams({
        receiver: bridgeAddress,
        amountIn,
        amountOutMinimum,
        currencyIn,
        currencyOut,
        path,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    routePlanner.addCommand(CommandType.CALL_TARGET, [
        bridgeAddress,
        bridgePayment,
        encodeFunctionData({
            abi: HypERC20FlashCollateral.abi,
            functionName: "transferRemoteUnlock",
            args: [destinationChain, padHex(receiver, { size: 32 })],
        }),
    ]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        value: isNative ? amountIn + bridgePayment : bridgePayment,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
