import { parseEventLogs, TransactionReceipt } from "viem";

import { Dispatch as dispatchEvent } from "../artifacts/Mailbox.js";

export function getHyperlaneMessagesFromReceipt(receipt: TransactionReceipt) {
    const logsDecoded = parseEventLogs({ logs: receipt.logs, abi: [dispatchEvent], eventName: "Dispatch" });

    return logsDecoded.map((log) => log.args.message);
}
