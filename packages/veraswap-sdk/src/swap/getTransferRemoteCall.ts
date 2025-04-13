import { Address, encodeFunctionData, Hex, padHex, zeroAddress } from "viem";

import { HypERC20 } from "../artifacts/HypERC20.js";

export interface GetTransferRemoteCallParams {
    address: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    bridgePayment: bigint;
}

export function getTransferRemoteCall({
    address,
    destination,
    recipient,
    amount,
    hookMetadata,
    hook,
    bridgePayment,
}: GetTransferRemoteCallParams): { to: Address; data: Hex; value: bigint } {
    let data: Hex;
    if (!hook && !hookMetadata) {
        // Slightly more gas efficient (smaller data)
        data = encodeFunctionData({
            abi: HypERC20.abi,
            functionName: "transferRemote",
            args: [destination, padHex(recipient, { size: 32 }), amount],
        });
    } else {
        data = encodeFunctionData({
            abi: HypERC20.abi,
            functionName: "transferRemote",
            args: [destination, padHex(recipient, { size: 32 }), amount, hookMetadata ?? "0x", hook ?? zeroAddress],
        });
    }

    return {
        to: address,
        data,
        value: bridgePayment,
    };
}
