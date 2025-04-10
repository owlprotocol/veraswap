import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";
import { PoolKey } from "@uniswap/v4-sdk";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";
import { getV4SwapCommandParams } from "./getV4SwapCommandParams.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { GetCallsParams, GetCallsReturnType } from "../calls/getCalls.js";
import { QueryClient } from "@tanstack/react-query";
import { Config } from "wagmi";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { getPermit2ApproveCalls } from "../calls/index.js";

export interface GetSwapCallsParams extends GetCallsParams {
    amountIn: bigint;
    amountOutMinimum: bigint;
    zeroForOne: boolean;
    poolKey: PoolKey;
    universalRouter: Address;
    receiver: Address;
    callTargetAfter?: [Address, bigint, Hex];
    routerPayment: bigint;
    hookData?: Hex;
    approveExpiration?: number | "MAX_UINT_48";
}

export async function getSwapCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetSwapCallsParams,
): Promise<GetCallsReturnType> {
    const {
        chainId,
        account,
        amountIn,
        amountOutMinimum,
        poolKey,
        universalRouter,
        receiver,
        zeroForOne,
        callTargetAfter,
        routerPayment,
        hookData,
        approveExpiration,
    } = params;
    const currencyIn = (zeroForOne ? poolKey.currency0 : poolKey.currency1) as Address;

    const calls: (CallArgs & { account: Address })[] = [];

    const permit2Calls = await getPermit2ApproveCalls(queryClient, wagmiConfig, {
        chainId,
        token: currencyIn,
        account,
        spender: universalRouter,
        minAmount: amountIn,
        approveExpiration: approveExpiration ?? "MAX_UINT_48",
    });
    calls.push(...permit2Calls.calls.map((call) => ({ ...call, account }))); //override account of Permit2.permit call (anyone can submit this)

    const routePlanner = new RoutePlanner();

    const v4SwapParams = getV4SwapCommandParams({
        receiver,
        amountIn,
        amountOutMinimum,
        poolKey,
        zeroForOne,
        hookData,
    });
    routePlanner.addCommand(CommandType.V4_SWAP, [v4SwapParams]);

    if (callTargetAfter) {
        routePlanner.addCommand(CommandType.CALL_TARGET, callTargetAfter);
    }

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const isNative = currencyIn === zeroAddress;
    let routerExecuteValue = isNative ? amountIn : 0n;
    if (routerPayment) {
        routerExecuteValue += routerPayment + 10n;
    }

    const routerExecuteData: (typeof calls)[number] = {
        account,
        to: universalRouter,
        value: routerExecuteValue,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
    calls.push(routerExecuteData);

    return { calls };
}
