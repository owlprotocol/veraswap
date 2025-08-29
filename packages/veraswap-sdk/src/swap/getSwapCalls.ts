import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { GetCallsParams, GetCallsReturnType } from "../calls/getCalls.js";
import { getPermit2ApproveCalls } from "../calls/Permit2/getPermit2ApproveCalls.js";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { getRouterCommandsForQuote } from "../uniswap/quote/getUniswapRoute.js";
import { MetaQuoteBest } from "../uniswap/quote/MetaQuoter.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

export interface GetSwapCallsParams extends GetCallsParams {
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    quote: MetaQuoteBest;
    universalRouter: Address;
    receiver: Address;
    callTargetBefore?: [Address, bigint, Hex];
    callTargetAfter?: [Address, bigint, Hex];
    routerPayment?: bigint;
    approveExpiration?: number | "MAX_UINT_48";
    contracts: {
        weth9: Address;
    };
    veraswapFeeRecipient?: { address: Address; bips: bigint };
    referralFeeRecipient?: { address?: Address; bips: bigint };
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
        quote,
        currencyIn,
        currencyOut,
        universalRouter,
        receiver,
        callTargetBefore,
        callTargetAfter,
        approveExpiration,
        contracts,
        veraswapFeeRecipient,
        referralFeeRecipient,
    } = params;
    const routerPayment = params.routerPayment ?? 0n;

    const calls: (CallArgs & { account: Address })[] = [];

    // Only need approval for ERC20 tokens
    if (currencyIn !== zeroAddress) {
        const permit2Calls = await getPermit2ApproveCalls(queryClient, wagmiConfig, {
            chainId,
            token: currencyIn,
            account,
            spender: universalRouter,
            minAmount: amountIn,
            approveExpiration: approveExpiration ?? "MAX_UINT_48",
        });
        calls.push(...permit2Calls.calls.map((call) => ({ ...call, account }))); //override account of Permit2.permit call (anyone can submit this)
    }

    const routePlanner = new RoutePlanner();

    if (callTargetBefore) {
        routePlanner.addCommand(CommandType.CALL_TARGET, callTargetBefore);
    }

    const commands = getRouterCommandsForQuote({
        amountIn,
        contracts,
        currencyIn,
        currencyOut,
        ...quote,
        recipient: receiver,
        veraswapFeeRecipient,
        referralFeeRecipient,
    });
    addCommandsToRoutePlanner(routePlanner, commands);

    if (callTargetAfter) {
        routePlanner.addCommand(CommandType.CALL_TARGET, callTargetAfter);
    }

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    const isNative = currencyIn === zeroAddress;
    const routerExecuteValue = isNative ? amountIn + routerPayment : routerPayment;

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
