import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { sendToken } from "../artifacts/IStargate.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_USDC } from "../constants/stargate.js";
import { StargateTokenQuote } from "../query/stargateTokenQuote.js";

export function getStargateTokenBridgeTransaction({
    srcChain,
    dstChain,
    tokenSymbol,
    receiver,
    stargateQuote,
}: {
    srcChain: number;
    dstChain: number;
    tokenSymbol: "USDC";
    receiver: Address;
    stargateQuote: StargateTokenQuote;
}) {
    invariant(tokenSymbol === "USDC", "Only USDC is supported for now");

    // TODO: conditionally pick pools based on tokenSymbol
    const pools: Record<number, Address | undefined> = STARGATE_POOL_USDC;

    const poolAddress = pools[srcChain];
    invariant(!!poolAddress, `Stargate pool for ${tokenSymbol} not found for source chain ${srcChain}`);
    invariant(dstChain in pools, `Stargate pool for ${tokenSymbol} not found for destination chain ${dstChain}`);

    const { fee, minAmountLD, amount } = stargateQuote;

    // Shouldn't matter for just bridging
    const refundAddress = receiver;

    return {
        to: poolAddress,
        value: fee,
        data: encodeFunctionData({
            abi: [sendToken],
            functionName: "sendToken",
            args: [
                {
                    dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
                    amountLD: amount,
                    minAmountLD,
                    to: padHex(receiver, { size: 32 }),
                    extraOptions: "0x",
                    composeMsg: "0x",
                    oftCmd: "0x",
                },
                { lzTokenFee: 0n, nativeFee: fee },
                refundAddress,
            ],
        }),
    };
}
