import { encodeAbiParameters, keccak256, parseEventLogs, TransactionReceipt } from "viem";

import { SentMessage } from "../artifacts/IL2ToL2CrossDomainMessenger.js";

export function getSuperchainMessageIdFromReceipt(receipt: TransactionReceipt, chainId: number) {
    const logsDecoded = parseEventLogs({
        logs: receipt.logs,
        abi: [SentMessage],
        eventName: "SentMessage",
        strict: true,
    });

    const args = logsDecoded[0]?.args;
    if (!args) return args;

    const { message, messageNonce, sender, target, destination } = args;
    const encodedParams = encodeAbiParameters(
        [
            { name: "_destination", type: "uint256" },
            { name: "_source", type: "uint256" },
            { name: "_nonce", type: "uint256" },
            { name: "_sender", type: "address" },
            { name: "_target", type: "address" },
            { name: "_message", type: "bytes" },
        ],
        [destination, BigInt(chainId), messageNonce, sender, target, message],
    );
    return keccak256(encodedParams);
}
