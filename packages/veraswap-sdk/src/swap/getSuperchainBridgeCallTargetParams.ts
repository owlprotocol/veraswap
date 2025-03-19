import { Address, encodeFunctionData, Hex } from "viem";
import { SUPERCHAIN_SWEEP_ADDRESS } from "../constants.js";
import { SuperchainTokenBridgeSweep } from "../artifacts/SuperchainTokenBridgeSweep.js";

export function getSuperchainBridgeCallTargetParams({
    destinationChain,
    receiver,
    outputTokenAddress,
}: {
    destinationChain: number;
    receiver: Address;
    outputTokenAddress: Address;
}) {
    return [
        SUPERCHAIN_SWEEP_ADDRESS,
        0n,
        encodeFunctionData({
            abi: SuperchainTokenBridgeSweep.abi,
            functionName: "sendAllERC20",
            args: [outputTokenAddress, receiver, BigInt(destinationChain)],
        }),
    ] as readonly [Address, bigint, Hex];
}
