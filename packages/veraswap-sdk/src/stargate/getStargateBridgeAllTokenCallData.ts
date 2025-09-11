import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { bridgeAllToken } from "../artifacts/StargateBridgeSweep.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";

export function getStargateBridgeAllTokenCallData({
    dstChain,
    srcChain,
    recipient,
    refundAddress,
    tokenAddress,
    tokenSymbol,
}: {
    dstChain: number;
    srcChain: number;
    recipient: Address;
    refundAddress: Address;
    tokenAddress: Address;
    tokenSymbol: keyof typeof STARGATE_TOKEN_POOLS;
}) {
    const pools = STARGATE_TOKEN_POOLS[tokenSymbol];

    const poolAddress = pools[srcChain as keyof typeof pools];
    invariant(!!poolAddress, `Stargate pool for ${tokenSymbol} not found for source chain ${srcChain}`);
    invariant(dstChain in pools, `Stargate pool for ${tokenSymbol} not found for destination chain ${dstChain}`);

    const recipientPadded = padHex(recipient, { size: 32 });

    return encodeFunctionData({
        abi: [bridgeAllToken],
        functionName: "bridgeAllToken",
        args: [
            poolAddress,
            tokenAddress,
            refundAddress,
            {
                recipient,
                recipientPadded,
                dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
                extraOptions: "0x",
                composeMsg: "0x",
                oftCmd: "0x",
            },
        ],
    });
}
