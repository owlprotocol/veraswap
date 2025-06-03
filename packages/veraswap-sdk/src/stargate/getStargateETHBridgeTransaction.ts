import invariant from "tiny-invariant";
import { Address, encodeFunctionData } from "viem";

import { sendToken } from "../artifacts/IStargate.js";

import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_NATIVE } from "./constants.js";

export function getStargateETHBridgeTransaction({
    srcChain,
    dstChain,
    receiver,
    amount,
    fee,
}: {
    srcChain: number;
    dstChain: number;
    receiver: Address;
    amount: bigint;
    fee: bigint;
}) {
    invariant(
        srcChain in STARGATE_POOL_NATIVE && dstChain in CHAIN_ID_TO_ENDPOINT_ID,
        "Chains not supported by Stargate",
    );

    // Shoudln't matter for just bridging
    const refundAddress = receiver;

    return {
        to: STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE],
        value: amount + fee,
        data: encodeFunctionData({
            abi: [sendToken],
            functionName: "sendToken",
            args: [
                {
                    dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
                    amountLD: amount,
                    minAmountLD: amount,
                    to: receiver,
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
