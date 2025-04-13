import { parseEventLogs, TransactionReceipt } from "viem";

import { SentMessage } from "../artifacts/IL2ToL2CrossDomainMessenger.js";

export function getSuperchainMessageIdFromReceipt(receipt: TransactionReceipt) {
    const logsDecoded = parseEventLogs({
        logs: receipt.logs,
        abi: [SentMessage],
        eventName: "SentMessage",
        strict: true,
    });

    return logsDecoded[0]?.args.message;
}
