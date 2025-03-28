import { Address, encodeFunctionData, Hex, padHex } from "viem";

import { HypTokenRouterSweep } from "../artifacts/HypTokenRouterSweep.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../constants/index.js";

export function getHyperlaneSweepBridgeCallTargetParams({
    bridgeAddress,
    bridgePayment,
    destinationChain,
    receiver,
}: {
    bridgeAddress: Address;
    bridgePayment: bigint;
    destinationChain: number;
    receiver: Address;
}) {
    return [
        HYPERLANE_ROUTER_SWEEP_ADDRESS,
        bridgePayment,
        encodeFunctionData({
            abi: HypTokenRouterSweep.abi,
            functionName: "transferRemote",
            args: [bridgeAddress, destinationChain, padHex(receiver, { size: 32 })],
        }),
    ] as readonly [Address, bigint, Hex];
}
