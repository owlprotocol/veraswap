import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { useAtomValue } from "jotai";
import { Hex, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { tokenOutAtom, hyperlaneMailboxChainOut } from "@/atoms/index.js";

export function useWatchMessageProcessed(messageId: Hex | undefined, setter: (txHash: Hex) => void) {
    const tokenOut = useAtomValue(tokenOutAtom);
    const mailbox = useAtomValue(hyperlaneMailboxChainOut);

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
