import { atom } from "jotai";
import { ChainWithMetadata } from "@owlprotocol/veraswap-sdk/chains";
import { localChains, mainnetChains, testnetChains } from "@owlprotocol/veraswap-sdk/chains";
import { Currency, getUniswapV4Address } from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { registryTokensQueryOptions } from "@owlprotocol/veraswap-sdk";
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

const includeSupersim = import.meta.env.MODE === "development" && import.meta.env.VITE_SUPERSIM === "true";

export const customCurrenciesAtom = atom<Currency[]>([]);

export const currenciesQueryAtom = atomWithQuery((get) => {
    const chainsType = get(chainsTypeAtom);
    return registryTokensQueryOptions(chainsType, includeSupersim);
});

export const currenciesAtom = atom<Currency[]>((get) => {
    const queryResult = get(currenciesQueryAtom);
    const customTokens = get(customCurrenciesAtom);
    const registryTokens = queryResult.data ?? [];

    // Prevent duplicates
    const tokenMap = new Map<string, Currency>();

    customTokens.forEach((token) => {
        const key = `${getUniswapV4Address(token).toLowerCase()}-${token.chainId}`;
        tokenMap.set(key, token);
    });

    registryTokens.forEach((token) => {
        const key = `${getUniswapV4Address(token).toLowerCase()}-${token.chainId}`;
        tokenMap.set(key, token);
    });

    return Array.from(tokenMap.values());
});
