import { encodeAbiParameters, keccak256, parseEventLogs, TransactionReceipt } from "viem";

import { SentMessage } from "../artifacts/IL2ToL2CrossDomainMessenger.js";

// TODO: refactor to use a common function to extra message id
export function getSuperchainMessageIdsFromReceipt(receipt: TransactionReceipt, chainId: number) {
    const logsDecoded = parseEventLogs({
        logs: receipt.logs,
        abi: [SentMessage],
        eventName: "SentMessage",
        strict: true,
    });

    return logsDecoded.map(({ args }) => {
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
    });
}
