import { Address, encodeFunctionData, Hex, zeroAddress } from "viem";

import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { STARGATE_BRIDGE_SWEEP_ADDRESS, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { getStargateBridgeAllTokenCallData } from "../stargate/getStargateBridgeAllTokenCallData.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { addCommandsToRoutePlanner } from "../uniswap/addCommandsToRoutePlanner.js";
import { getRouterCommandsForQuote, MetaQuoteBest } from "../uniswap/index.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

export function getSwapAndStargateTokenBridgeTransaction({
    universalRouter,
    amountIn,
    currencyIn,
    currencyOut,
    quote,
    stargateQuoteFee,
    permit2PermitParams,
    dstChain,
    srcChain,
    recipient,
    tokenSymbol,
    contracts,
    veraswapFeeRecipient,
    referralFeeRecipient,
}: {
    universalRouter: Address;
    amountIn: bigint;
    currencyIn: Address;
    currencyOut: Address;
    quote: MetaQuoteBest;
    stargateQuoteFee: bigint;
    permit2PermitParams?: [PermitSingle, Hex];
    dstChain: number;
    srcChain: number;
    recipient: Address;
    tokenSymbol: keyof typeof STARGATE_TOKEN_POOLS;
    contracts: {
        weth9: Address;
    };
    veraswapFeeRecipient?: { address: Address; bips: bigint };
    referralFeeRecipient?: { address?: Address; bips: bigint };
}) {
    const routePlanner = new RoutePlanner();

    routePlanner.addCommand(CommandType.CALL_TARGET, [STARGATE_BRIDGE_SWEEP_ADDRESS, stargateQuoteFee, "0x"]);

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

    const stargateCallData = getStargateBridgeAllTokenCallData({
        dstChain,
        srcChain,
        recipient,
        tokenAddress: currencyOut,
        tokenSymbol: tokenSymbol,
    });
    routePlanner.addCommand(CommandType.CALL_TARGET, [STARGATE_BRIDGE_SWEEP_ADDRESS, 0n, stargateCallData]);

    const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    const isNative = currencyIn === zeroAddress;

    return {
        to: universalRouter,
        data: encodeFunctionData({
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
        }),
        value: isNative ? amountIn + stargateQuoteFee : stargateQuoteFee,
    };
}
