import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { sendToken } from "../artifacts/IStargate.js";
import { StargateETHQuote } from "../query/stargateETHQuote.js";

import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_NATIVE } from "./constants.js";

export function getStargateETHBridgeTransaction({
    srcChain,
    dstChain,
    receiver,
    stargateQuote,
}: {
    srcChain: number;
    dstChain: number;
    receiver: Address;
    stargateQuote: StargateETHQuote;
}) {
    invariant(
        srcChain in STARGATE_POOL_NATIVE && dstChain in CHAIN_ID_TO_ENDPOINT_ID,
        "Chains not supported by Stargate",
    );

    const { amountFeeRemoved, fee, minAmountLDFeeRemoved } = stargateQuote;

    // Shouldn't matter for just bridging
    const refundAddress = receiver;

    return {
        to: STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE],
        value: amountFeeRemoved + fee,
        data: encodeFunctionData({
            abi: [sendToken],
            functionName: "sendToken",
            args: [
                {
                    dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
                    amountLD: amountFeeRemoved,
                    minAmountLD: minAmountLDFeeRemoved,
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
