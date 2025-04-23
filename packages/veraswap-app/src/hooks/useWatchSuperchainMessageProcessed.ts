import { Chain, createPublicClient, Hex, http } from "viem";
import { useWatchContractEvent } from "wagmi";
import { useEffect } from "react";
import { RelayedMessage } from "@owlprotocol/veraswap-sdk/artifacts/IL2ToL2CrossDomainMessenger";
import { SUPERCHAIN_L2_TO_L2_CROSS_DOMAIN_MESSENGER } from "@owlprotocol/veraswap-sdk/chains";

export function useWatchSuperchainMessageProcessed(
    messageId: Hex | null,
    chainOut: Chain | null,
    setRemoteTransactionHash: (txHash: Hex) => void,
    remoteTransactionHash: Hex | null,
) {
    useWatchContractEvent({
        abi: [RelayedMessage],
        eventName: "RelayedMessage",
        chainId: chainOut?.id ?? 0,
        address: SUPERCHAIN_L2_TO_L2_CROSS_DOMAIN_MESSENGER,
        args: { messageHash: messageId ?? "0x" },
        enabled: !!chainOut && !!chainOut.rpcUrls.default.webSocket && !!messageId,
        strict: true,
        onLogs: (logs) => {
            setRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    // This is a workaround for watching Superchain messages without websocket
    useEffect(() => {
        if (!chainOut || !!chainOut.rpcUrls.default.webSocket || !messageId || !!remoteTransactionHash) {
            return;
        }

        const chainOutClient = createPublicClient({ chain: chainOut!, transport: http() });

        const superchainWatchRoutine = async () => {
            const block = await chainOutClient.getBlock({ blockTag: "latest" });

            const fromBlock = block.number > 100n ? block.number - 100n : 0n;
            const [log] = await chainOutClient.getLogs({
                fromBlock,
                address: SUPERCHAIN_L2_TO_L2_CROSS_DOMAIN_MESSENGER,
                event: RelayedMessage,
                strict: true,
                args: { messageHash: messageId ?? "0x" },
            });

            if (!log) return;

            setRemoteTransactionHash(log.transactionHash);
            return log.transactionHash;
        };

        const superchainWatchRoutineWithRetries = async () => {
            for (let i = 0; i < 6; i++) {
                console.debug(`Attempt ${i + 1} to watch Superchain message with id ${messageId}`);

                const hash = await superchainWatchRoutine();

                if (hash) break;

                // 2s, 4s, 8s, 16s, 32s, ...
                const timeout = 1000 * 2 ** (i + 1);
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        };

        superchainWatchRoutineWithRetries();

        // setRemoteTransactionHash
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainOut, chainOut?.id, messageId, remoteTransactionHash]);
}
