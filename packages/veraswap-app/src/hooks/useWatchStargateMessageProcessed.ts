import { Address, Chain, createPublicClient, Hex, http, zeroAddress } from "viem";
import { useWatchContractEvent } from "wagmi";
import { useEffect, useMemo } from "react";
import { OFTReceived } from "@owlprotocol/veraswap-sdk/artifacts/IStargate";
import {
    STARGATE_POOL_NATIVE,
    STARGATE_TOKEN_POOLS,
    StargateETHQuote,
    StargateTokenQuote,
} from "@owlprotocol/veraswap-sdk";

export function useWatchStargateMessageProcessed(
    stargateQuote: StargateETHQuote | StargateTokenQuote | undefined | null,
    messageId: Hex | null,
    chainOut: Chain | null,
    setRemoteTransactionHash: (txHash: Hex) => void,
    remoteTransactionHash: Hex | null,
    toAddress: Address | null,
) {
    let address: Address = zeroAddress;
    if (stargateQuote && chainOut) {
        if (stargateQuote.type === "TOKEN") {
            address = STARGATE_TOKEN_POOLS[stargateQuote.tokenSymbol][chainOut.id];
        } else {
            address = STARGATE_POOL_NATIVE[chainOut.id];
        }
    }

    const args = useMemo(
        () => ({ guid: messageId ?? "0x", toAddress: toAddress ?? zeroAddress }),
        [messageId, toAddress],
    );

    // TODO: handle USDC too
    useWatchContractEvent({
        abi: [OFTReceived],
        eventName: "OFTReceived",
        chainId: chainOut?.id ?? 0,
        address,
        args,
        enabled: !!stargateQuote && !!chainOut && !!chainOut.rpcUrls.default.webSocket && !!messageId,
        strict: true,
        onLogs: (logs) => {
            setRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    // This is a workaround for watching Superchain messages without websocket
    useEffect(() => {
        if (
            !!stargateQuote ||
            !chainOut ||
            !!chainOut.rpcUrls.default.webSocket ||
            !messageId ||
            !!remoteTransactionHash
        ) {
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
    }, [
        address,
        args,
        chainOut,
        chainOut?.id,
        messageId,
        remoteTransactionHash,
        setRemoteTransactionHash,
        stargateQuote,
    ]);
}
