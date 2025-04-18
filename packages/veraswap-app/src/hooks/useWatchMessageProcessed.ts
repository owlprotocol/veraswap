import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { Address, Hex, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { Currency } from "@owlprotocol/veraswap-sdk";

export function useWatchMessageProcessed(
    messageId: Hex | null,
    currencyOut: Currency | null,
    mailbox: Address | null,
    setter: (txHash: Hex) => void,
) {
    useWatchContractEvent({
        abi: [ProcessId],
        eventName: "ProcessId",
        chainId: currencyOut?.chainId ?? 0,
        address: mailbox ?? zeroAddress,
        args: { messageId: messageId ?? "0x" },
        enabled: !!currencyOut && !!messageId && !!mailbox,
        onLogs: (logs) => {
            setter(logs[0].transactionHash);
        },
    });
}
