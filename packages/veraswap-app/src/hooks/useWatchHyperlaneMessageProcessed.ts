import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { Address, Chain, createPublicClient, Hex, http, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { useEffect } from "react";

export function useWatchHyperlaneMessageProcessed(
    messageId: Hex | null,
    chainOut: Chain | null,
    mailbox: Address | null,
    setRemoteTransactionHash: (txHash: Hex) => void,
    remoteTransactionHash: Hex | null,
) {
    useWatchContractEvent({
        abi: [ProcessId],
        eventName: "ProcessId",
        chainId: chainOut?.id ?? 0,
        address: mailbox ?? zeroAddress,
        args: { messageId: messageId ?? "0x" },
        enabled:
            !!chainOut && !!chainOut.rpcUrls.default.webSocket && !!messageId && !!mailbox && !remoteTransactionHash,
        onLogs: (logs) => {
            setRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    // This is a workaround for watching Hyperlane messages without websocket
    useEffect(() => {
        if (!chainOut || !!chainOut.rpcUrls.default.webSocket || !messageId || !mailbox || !!remoteTransactionHash) {
            return;
        }

        const chainOutClient = createPublicClient({ chain: chainOut!, transport: http() });

        const hyperlaneMessageWatchRoutine = async () => {
            const block = await chainOutClient.getBlock({ blockTag: "latest" });

            const fromBlock = block.number > 100n ? block.number - 100n : 0n;
            const [log] = await chainOutClient.getLogs({
                fromBlock,
                address: mailbox ?? zeroAddress,
                event: ProcessId,
                strict: true,
                args: { messageId: messageId ?? "0x" },
            });

            if (!log) return;

            setRemoteTransactionHash(log.transactionHash);
            return log.transactionHash;
        };

        const hyperlaneMessageWatchRoutineWithRetries = async () => {
            for (let i = 0; i < 6; i++) {
                console.debug(`Attempt ${i + 1} to watch hyperlane message with id ${messageId}`);

                const hash = await hyperlaneMessageWatchRoutine();

                if (hash) break;

                // 2s, 4s, 8s, 16s, 32s, ...
                const timeout = 1000 * 2 ** (i + 1);
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        };

        hyperlaneMessageWatchRoutineWithRetries();

        // setRemoteTransactionHash
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainOut, chainOut?.id, messageId, mailbox, remoteTransactionHash]);
}
