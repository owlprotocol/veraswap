import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS } from "../constants/stargate.js";
import { getStargateBridgeAllETHCallData } from "../stargate/getStargateBridgeAllETHCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { getRouterCommandsForQuote, MetaQuoteBest } from "../uniswap/index.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndStargateETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Stargate
 */
export function getSwapAndStargateETHBridgeTransaction({
    universalRouter,
    amountIn,
    currencyIn,
    currencyOut,
    quote,
    permit2PermitParams,
    dstChain,
    srcChain,
    recipient,
    contracts,
    veraswapFeeRecipient,
    referralFeeRecipient,
}: {
    universalRouter: Address;
    amountIn: bigint;
    currencyIn: Address;
    currencyOut: Address;
    quote: MetaQuoteBest;
    permit2PermitParams?: [PermitSingle, Hex];
    dstChain: number;
    srcChain: number;
    recipient: Address;
    contracts: {
        weth9: Address;
    };
    veraswapFeeRecipient?: { address: Address; bips: bigint };
    referralFeeRecipient?: { address?: Address; bips: bigint };
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
        recipient: STARGATE_BRIDGE_SWEEP_ADDRESS,
        veraswapFeeRecipient,
        referralFeeRecipient,
    });
    addCommandsToRoutePlanner(routePlanner, commands);

    const stargateCallData = getStargateBridgeAllETHCallData({
        dstChain,
        srcChain,
        recipient,
        // TODO: customize here if we eventually want a different refund / recipient address
        refundAddress: recipient,
    });
    routePlanner.addCommand(CommandType.CALL_TARGET, [STARGATE_BRIDGE_SWEEP_ADDRESS, 0n, stargateCallData]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    return {
        to: universalRouter,
        value: 0n,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
    };
}
