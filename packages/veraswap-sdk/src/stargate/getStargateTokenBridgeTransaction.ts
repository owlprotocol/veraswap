import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { sendToken } from "../artifacts/IStargate.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { StargateTokenQuote } from "../query/stargateTokenQuote.js";

type SupportedTokenSymbol = keyof typeof STARGATE_TOKEN_POOLS;

export function getStargateTokenBridgeTransaction({
    srcChain,
    dstChain,
    tokenSymbol,
    receiver,
    stargateQuote,
}: {
    srcChain: number;
    dstChain: number;
    tokenSymbol: SupportedTokenSymbol;
    receiver: Address;
    stargateQuote: StargateTokenQuote;
}) {
    const pools = STARGATE_TOKEN_POOLS[tokenSymbol];
    invariant(pools, `Stargate pool for ${tokenSymbol} not found`);

    const poolAddress = pools[srcChain as keyof typeof pools];
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
