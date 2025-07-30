import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../chains/supersim.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { getRouterCommandsForQuote, MetaQuoteBest } from "../uniswap/index.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getSuperchainBridgeCallTargetParams } from "./getSuperchainBridgeCallTargetParams.js";

/**
 * getSwapAndSuperchainBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge them to another chain using Superchain Interop
 */
export function getSwapAndSuperchainBridgeTransaction({
    universalRouter,
    destinationChain,
    receiver,
    amountIn,
    currencyIn,
    currencyOut,
    quote,
    permit2PermitParams,
    contracts,
    feeRecipients,
}: {
    universalRouter: Address;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    currencyIn: Address;
    currencyOut: Address;
    quote: MetaQuoteBest;
    permit2PermitParams?: [PermitSingle, Hex];
    contracts: {
        weth9: Address;
    };
    feeRecipients?: { address: Address; bips: bigint }[];
}) {
    const routePlanner = new RoutePlanner();

    if (permit2PermitParams) {
        routePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
    }

    const commands = getRouterCommandsForQuote({
        amountIn,
        contracts,
        currencyIn,
        currencyOut,
        ...quote,
        recipient: SUPERCHAIN_SWEEP_ADDRESS,
        feeRecipients,
    });
    addCommandsToRoutePlanner(routePlanner, commands);

    routePlanner.addCommand(
        CommandType.CALL_TARGET,
        getSuperchainBridgeCallTargetParams({
            destinationChain,
            receiver,
            outputTokenAddress: currencyOut,
        }),
    );

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const inputIsNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        value: inputIsNative ? amountIn : 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
