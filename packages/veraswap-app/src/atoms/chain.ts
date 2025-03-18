import { interopDevnet0, interopDevnet1 } from "@owlprotocol/veraswap-sdk";
import { atom } from "jotai";
import { Chain } from "viem";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { tokenInAmountInputAtom } from "./index.js";
import { chains } from "@/config.js";

export const networkTypeAtom = atom<"mainnet" | "testnet" | "superchain">("mainnet");

export const chainsAtom = atom((get) => filterChainsByNetworkType(get(networkTypeAtom)));

export const networkTypeWithResetAtom = atom(
    (get) => get(networkTypeAtom),
    (_, set, newNetworkType: "mainnet" | "testnet" | "superchain") => {
        set(networkTypeAtom, newNetworkType);
        resetNetworkDependentAtoms(set);
    },
);

const filterChainsByNetworkType = (networkType: "mainnet" | "testnet" | "superchain") => {
    return chains.filter((chain) => {
        const isInteropDevnet = chain.id === interopDevnet0.id || chain.id === interopDevnet1.id;
        if (networkType === "testnet") return chain.testnet === true && !isInteropDevnet;
        if (networkType === "superchain") return isInteropDevnet;
        return !chain.testnet;
    });
};

const resetNetworkDependentAtoms = (set: any) => {
    set(tokenInAtom, null);
    set(tokenOutAtom, null);
    set(tokenInAmountInputAtom, "");
};

export const chainInAtom = atom<Chain | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const availableChains = get(chainsAtom);
    return tokenIn ? availableChains.find((chain) => chain.id === tokenIn.chainId) || null : null;
});

export const chainOutAtom = atom<Chain | null>((get) => {
    const tokenOut = get(tokenOutAtom);
    const availableChains = get(chainsAtom);
    return tokenOut ? availableChains.find((chain) => chain.id === tokenOut.chainId) || null : null;
});
