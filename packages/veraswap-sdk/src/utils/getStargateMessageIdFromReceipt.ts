import { parseEventLogs, TransactionReceipt } from "viem";

import { OFTSent } from "../artifacts/IStargate.js";

export function getStargateMessageIdFromReceipt(receipt: TransactionReceipt) {
    const logsDecoded = parseEventLogs({
        logs: receipt.logs,
        abi: [OFTSent],
        eventName: "OFTSent",
        strict: true,
    });

    const args = logsDecoded[0]?.args;
    if (!args) return args;

    return args.guid;
}
