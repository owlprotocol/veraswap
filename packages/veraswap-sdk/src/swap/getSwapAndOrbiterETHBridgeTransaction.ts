import { Address, encodeFunctionData, Hex } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { getOrbiterBridgeAllETHCallData } from "../orbiter/getOrbiterBridgeAllETHCallData.js";
import { OrbiterQuote } from "../query/orbiterQuote.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { getRouterCommandsForQuote, MetaQuoteBest } from "../uniswap/index.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

/**
 * getSwapAndOrbiterETHBridgeTransaction generates a transaction for the Uniswap Router to swap tokens and bridge ETH to another chain using Orbiter
 */
export function getSwapAndOrbiterETHBridgeTransaction({
    universalRouter,
    amountIn,
    currencyIn,
    currencyOut,
    quote,
    permit2PermitParams,
    orbiterQuote,
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
    orbiterQuote: OrbiterQuote;
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
        recipient: ORBITER_BRIDGE_SWEEP_ADDRESS,
        veraswapFeeRecipient,
        referralFeeRecipient,
    });
    addCommandsToRoutePlanner(routePlanner, commands);

    const orbiterCallData = getOrbiterBridgeAllETHCallData(orbiterQuote);
    routePlanner.addCommand(CommandType.CALL_TARGET, [ORBITER_BRIDGE_SWEEP_ADDRESS, 0n, orbiterCallData]);

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
