import { Address, encodeFunctionData } from "viem";

import { ISuperchainTokenBridge } from "../artifacts/ISuperchainTokenBridge.js";
import { SUPERCHAIN_TOKEN_BRIDGE } from "../chains/supersim.js";

export function getSuperchainBridgeTransaction({
    token,
    recipient,
    amount,
    destination,
}: {
    token: Address;
    recipient: Address;
    amount: bigint;
    destination: number;
}) {
    return {
        to: SUPERCHAIN_TOKEN_BRIDGE,
        value: 0n,
        data: encodeFunctionData({
            abi: ISuperchainTokenBridge.abi,
            functionName: "sendERC20",
            args: [token, recipient, amount, BigInt(destination)],
        }),
    };
}
