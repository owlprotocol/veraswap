import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { Address, Hex, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { Token } from "@owlprotocol/veraswap-sdk";

export function useWatchMessageProcessed(
    messageId: Hex | null,
    tokenOut: Token | null,
    mailbox: Address | null,
    setter: (txHash: Hex) => void,
) {
    useWatchContractEvent({
        abi: [ProcessId],
        eventName: "ProcessId",
        chainId: tokenOut?.chainId ?? 0,
        address: mailbox ?? zeroAddress,
        args: { messageId: messageId ?? "0x" },
        enabled: !!tokenOut && !!messageId && !!mailbox,
        onLogs: (logs) => {
            setter(logs[0].transactionHash);
        },
    });
}
