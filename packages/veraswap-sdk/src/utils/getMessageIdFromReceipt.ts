import { DispatchId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { TransactionReceipt, Hex, parseEventLogs } from "viem";

export function getMessageIdFromReceipt(receipt: TransactionReceipt): Hex | undefined {
    const logsDecoded = parseEventLogs({ logs: receipt.logs, abi: [DispatchId], eventName: "DispatchId" });

    return logsDecoded[0]?.args.messageId;
}
