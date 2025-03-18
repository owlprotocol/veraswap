import { Address, encodeFunctionData, Hex, padHex } from "viem";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../constants.js";
import { HypTokenRouterSweep } from "../artifacts/HypTokenRouterSweep.js";

export function getHyperlaneSweepBridgeCallTargetParams({
    bridgeAddress,
    destinationChain,
    receiver,
}: {
    bridgeAddress: Address;
    destinationChain: number;
    receiver: Address;
}) {
    return [
        HYPERLANE_ROUTER_SWEEP_ADDRESS,
        0n,
        encodeFunctionData({
            abi: HypTokenRouterSweep.abi,
            functionName: "transferRemote",
            args: [bridgeAddress, destinationChain, padHex(receiver, { size: 32 })],
        }),
    ] as readonly [Address, bigint, Hex];
}
