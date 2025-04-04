import { atom } from "jotai";
import { Chain } from "viem";
import { TOKENS } from "@owlprotocol/veraswap-sdk/constants";
import { tokenInAmountInputAtom, tokenInAtom, tokenOutAtom } from "./tokens.js";
import { localChains, mainnetChains, testnetChains } from "@/config.js";

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
            set(tokenInAtom, null);
            set(tokenInAmountInputAtom, "");
            set(tokenOutAtom, null);
        }
    },
);

/** Filter chains by category */
export const chainsAtom = atom<Chain[]>((get) => {
    const chainsType = get(chainsTypeAtom);
    if (chainsType === "local") return localChains;
    if (chainsType === "testnet") return testnetChains;
    if (chainsType === "mainnet") return mainnetChains;
    return [];
});

/** Filter tokens by enabled chains */
export const tokensAtom = atom((get) => {
    const chains = get(chainsAtom);
    const chainIds = chains.map((c) => c.id);
    return TOKENS.filter((t) => chainIds.includes(t.chainId));
});
