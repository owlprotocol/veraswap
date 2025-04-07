import { DispatchId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { TransactionReceipt, Hex, parseEventLogs } from "viem";

export function getHyperlaneMessageIdsFromReceipt(receipt: TransactionReceipt): Hex[] {
    const logsDecoded = parseEventLogs({
        logs: receipt.logs,
        abi: [DispatchId],
        eventName: "DispatchId",
    });

    return logsDecoded.map((log) => log.args.messageId);
}
