import { Chain, createPublicClient, Hex, http, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { useEffect } from "react";
import { OFTReceived } from "@owlprotocol/veraswap-sdk/artifacts/IStargate";
import { STARGATE_POOL_NATIVE } from "@owlprotocol/veraswap-sdk";

export function useWatchStargateMessageProcessed(
    messageId: Hex | null,
    chainOut: Chain | null,
    setRemoteTransactionHash: (txHash: Hex) => void,
    remoteTransactionHash: Hex | null,
) {
    const address = STARGATE_POOL_NATIVE[chainOut?.id ?? 0] ?? zeroAddress;
    const args = { guid: messageId ?? "0x" };

    // TODO: handle USDC too
    useWatchContractEvent({
        abi: [OFTReceived],
        eventName: "OFTReceived",
        chainId: chainOut?.id ?? 0,
        address,
        args,
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

        const stargateWatchRoutine = async () => {
            const block = await chainOutClient.getBlock({ blockTag: "latest" });

            const fromBlock = block.number > 100n ? block.number - 100n : 0n;
            const [log] = await chainOutClient.getLogs({
                fromBlock,
                address,
                event: OFTReceived,
                strict: true,
                args,
            });

            if (!log) return;

            setRemoteTransactionHash(log.transactionHash);
            return log.transactionHash;
        };

        const stargateWatchRoutineWithRetries = async () => {
            for (let i = 0; i < 6; i++) {
                console.debug(`Attempt ${i + 1} to watch Stargate message with id ${messageId}`);

                const hash = await stargateWatchRoutine();

                if (hash) break;

                // 2s, 4s, 8s, 16s, 32s, ...
                const timeout = 1000 * 2 ** (i + 1);
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        };

        stargateWatchRoutineWithRetries();

        // setRemoteTransactionHash
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainOut, chainOut?.id, messageId, remoteTransactionHash]);
}
