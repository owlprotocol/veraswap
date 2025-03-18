import { getChainNameAndMailbox } from "@owlprotocol/veraswap-sdk";
import { atom } from "jotai";
import { chainOutAtom, networkTypeAtom } from "./chain.js";
import { hyperlaneRegistryQueryAtom } from "./index.js";

export const hyperlaneMailboxChainOut = atom((get) => {
    const chainOut = get(chainOutAtom);
    const networkType = get(networkTypeAtom);
    if (!chainOut || networkType == "superchain") return null;

    const { data: hyperlaneRegistry } = get(hyperlaneRegistryQueryAtom);
    if (!hyperlaneRegistry) return null;
    const { mailbox } = getChainNameAndMailbox({ chainId: chainOut.id, hyperlaneRegistry });
    return mailbox;
});
