import { OrbiterQuote, StargateETHQuote, StargateTokenQuote } from "@owlprotocol/veraswap-sdk";
import { zeroAddress, Hex, Chain, Address } from "viem";
import { getBlock } from "@wagmi/core";
import { useWatchContractEvent, useWatchBlocks } from "wagmi";
import { useAtomValue } from "jotai";
import { Transfer } from "@/abis/events.js";
import { config } from "@/config.js";
import { orbiterRoutersEndpointContractsAtom, orbiterRoutersEndpointsAtom } from "@/atoms/orbiter.js";

export function useWatchOrbiterMessageProcessed(
    chainOut: Chain | null,
    hash: Hex | undefined,
    to: Address,
    orbiterQuote: OrbiterQuote | undefined,
    stargateQuote: StargateETHQuote | StargateTokenQuote | null | undefined,
    withSuperchain: boolean | undefined,
    setRemoteTransactionHash: (txHash: Hex) => void,
    remoteTransactionHash: Hex | null,
) {
    const orbiterRoutersEndpointContracts = useAtomValue(orbiterRoutersEndpointContractsAtom);
    const orbiterRoutersEndpoints = useAtomValue(orbiterRoutersEndpointsAtom);

    const chainId = chainOut?.id ?? 0;

    useWatchContractEvent({
        abi: [Transfer],
        eventName: "Transfer",
        chainId,
        address: orbiterRoutersEndpointContracts[chainId] ?? zeroAddress,
        args: { to },
        enabled:
            !!chainOut &&
            !stargateQuote &&
            !!orbiterQuote &&
            !!orbiterRoutersEndpointContracts[chainId] &&
            !!hash &&
            !withSuperchain,
        strict: true,
        onLogs: (logs) => {
            setRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    useWatchBlocks({
        chainId,
        enabled: !!chainOut && !!orbiterQuote && !!hash && !remoteTransactionHash && !!orbiterRoutersEndpoints[chainId],
        onBlock(block) {
            const from = orbiterRoutersEndpoints[chainId] ?? zeroAddress;

            // TODO: Keep track of estimated value out and check that transaction value approximately matches to avoid issue if the address is receiving two bridging transactions from orbiter somewhat simultaneously
            // TODO: use includeTransactions in useWatchBlocks when we figure out why block.transactions is undefined
            // NOTE: This is a workaround for the issue with useWatchBlocks not returning transactions, even without includeTransactions
            getBlock(config, {
                blockNumber: block.number,
                includeTransactions: true,
                chainId: chainId,
            }).then((block) => {
                const tx = block.transactions.find(
                    (tx) => tx.from === from.toLowerCase() && tx.to === to.toLowerCase(),
                );
                if (tx) {
                    setRemoteTransactionHash(tx.hash);
                }
            });
        },
    });
}
