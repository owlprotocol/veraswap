import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { bridgeAllToken } from "../artifacts/StargateBridgeSweep.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_USDC } from "../constants/stargate.js";

export function getStargateBridgeAllTokenCallData({
    dstChain,
    srcChain,
    recipient,
    tokenAddress,
    tokenSymbol,
}: {
    dstChain: number;
    srcChain: number;
    recipient: Address;
    tokenAddress: Address;
    tokenSymbol: "USDC";
}) {
    invariant(tokenSymbol === "USDC", "Only USDC is supported for now");

    // TODO: conditionally pick pools based on tokenSymbol
    const pools: Record<number, Address | undefined> = STARGATE_POOL_USDC;

    const poolAddress = pools[srcChain];
    invariant(!!poolAddress, `Stargate pool for ${tokenSymbol} not found for source chain ${srcChain}`);
    invariant(dstChain in pools, `Stargate pool for ${tokenSymbol} not found for destination chain ${dstChain}`);

    const recipientPadded = padHex(recipient, { size: 32 });

    return encodeFunctionData({
        abi: [bridgeAllToken],
        functionName: "bridgeAllToken",
        args: [
            poolAddress,
            tokenAddress,
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
