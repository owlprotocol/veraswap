import { Address, encodeFunctionData, Hex, padHex } from "viem";

import { transferRemote_address_uint32_bytes32_uint256 } from "../artifacts/HypTokenRouterSweep.js";
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
        0n,
        encodeFunctionData({
            abi: [transferRemote_address_uint32_bytes32_uint256],
            functionName: "transferRemote",
            args: [bridgeAddress, destinationChain, padHex(receiver, { size: 32 }), bridgePayment],
        }),
    ] as readonly [Address, bigint, Hex];
}
