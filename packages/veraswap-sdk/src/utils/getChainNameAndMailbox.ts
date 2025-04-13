import { Address } from "viem";

import { HyperlaneRegistry } from "../types/HyperlaneRegistry.js";

export interface ChainMailboxAndName {
    mailbox: Address | null;
    name: string;
}

export const getChainNameAndMailbox = ({
    chainId,
    hyperlaneRegistry,
}: {
    chainId: number;
    hyperlaneRegistry: HyperlaneRegistry;
}): ChainMailboxAndName => {
    const chainMetadata = Object.values(hyperlaneRegistry.metadata).find((chain) => chain.chainId === chainId);

    if (!chainMetadata) return { mailbox: null, name: "" };

    const chainAddresses = hyperlaneRegistry.addresses[chainMetadata.name];
    return {
        mailbox: (chainAddresses.mailbox as Address) || null,
        name: chainMetadata.name,
    };
};
