import invariant from "tiny-invariant";
import { Address, encodeFunctionData, padHex } from "viem";

import { bridgeAllETH } from "../artifacts/StargateBridgeSweep.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_NATIVE } from "../constants/stargate.js";

export function getStargateBridgeAllETHCallData({
    dstChain,
    srcChain,
    recipient,
}: {
    dstChain: number;
    srcChain: number;
    recipient: Address;
}) {
    invariant(dstChain in STARGATE_POOL_NATIVE, "Destination chain is not supported by Stargate for ETH");
    invariant(srcChain in STARGATE_POOL_NATIVE, "Source chain is not supported by Stargate for ETH");

    // TODO: conditionally pick pools based on tokenSymbol
    const poolAddress = STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE];

    const recipientPadded = padHex(recipient, { size: 32 });

    return encodeFunctionData({
        abi: [bridgeAllETH],
        functionName: "bridgeAllETH",
        args: [
            poolAddress,
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
