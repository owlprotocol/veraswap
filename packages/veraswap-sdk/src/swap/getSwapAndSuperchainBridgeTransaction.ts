import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
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
    routePlanner,
    permit2PermitParams,
}: {
    universalRouter: Address;
    destinationChain: number;
    receiver: Address;
    amountIn: bigint;
    currencyIn: Address;
    currencyOut: Address;
    routePlanner: RoutePlanner;
    permit2PermitParams?: [PermitSingle, Hex];
}) {
    const finalRoutePlanner = permit2PermitParams ? new RoutePlanner() : routePlanner;

    if (permit2PermitParams) {
        finalRoutePlanner.addCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams);
        const hexCommands = routePlanner.commands.slice(2); // remove "0x"
        const commands: CommandType[] = [];
        for (let i = 0; i < hexCommands.length; i += 2) {
            commands.push(Number(hexCommands.slice(i, i + 2)));
        }
        commands.forEach((commandType, i) => {
            finalRoutePlanner.addCommand(commandType, [routePlanner.inputs[i]]);
        });
    }

    finalRoutePlanner.addCommand(
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
            args: [finalRoutePlanner.commands, finalRoutePlanner.inputs, routerDeadline],
        }),
    };
}
