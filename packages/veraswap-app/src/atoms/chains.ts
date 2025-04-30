import { atom } from "jotai";
import { ChainWithMetadata } from "@owlprotocol/veraswap-sdk/chains";
import { localChains, mainnetChains, testnetChains } from "@owlprotocol/veraswap-sdk/chains";
import { currencyInAtom, currencyOutAtom } from "./tokens.js";

export type ChainsType = "local" | "testnet" | "mainnet";

/** Enabled chains category */
export const chainsTypeAtom = atom<ChainsType>("mainnet");
/** Set enabled chains category  */
export const chainsTypeWriteAtom = atom(
    (get) => get(chainsTypeAtom),
    (get, set, update: ChainsType) => {
        const currChainsType = get(chainsTypeAtom);
        if (currChainsType != update) {
            set(chainsTypeAtom, update);
            set(currencyInAtom, null);
            set(currencyOutAtom, null);
        }
    },
);

/** Filter chains by category */
export const chainsAtom = atom<ChainWithMetadata[]>((get) => {
    const chainsType = get(chainsTypeAtom);
    if (chainsType === "local") return localChains;
    if (chainsType === "testnet") return testnetChains;
    if (chainsType === "mainnet") return mainnetChains;
    return [];
});
