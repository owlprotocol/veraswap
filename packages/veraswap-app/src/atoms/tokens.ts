import { TOKEN_LIST } from "@owlprotocol/veraswap-sdk";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { chainsAtom } from "./chain.js";
import { TokenWithChainId } from "@/types.js";

// TODO: move it all in one file?
const fetchTokens = async () => {
    const [tokensResponse, bridgedTokensResponse] = await Promise.all([
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens-list.json"),
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/bridged-tokens.json"),
    ]);

    if (!tokensResponse.ok || !bridgedTokensResponse.ok) {
        throw new Error("Failed to fetch tokens");
    }

    const standardTokens = await tokensResponse.json();
    const bridgedTokens = await bridgedTokensResponse.json();

    return [...standardTokens, ...bridgedTokens];
};

export const fetchedTokensAtom = atomWithQuery(() => ({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
}));

export const tokensAtom = atom((get) => {
    const fetchedTokensState = get(fetchedTokensAtom);

    const fetchedTokens = fetchedTokensState.data ?? [];
    const localTokens = Object.values(TOKEN_LIST);

    const combinedTokens = Array.from(
        new Map(
            [...localTokens, ...fetchedTokens].map((token) =>
                // ensures no duplicate tokens on same chain
                [`${token.chainId}-${token.address.toLowerCase()}`, token],
            ),
        ).values(),
    );

    return combinedTokens;
});

export const tokensInAtom = atom((get) => {
    const networkChains = get(chainsAtom);
    const combinedTokens = get(tokensAtom);

    if (!combinedTokens) return [];

    return networkChains.flatMap((chain) =>
        combinedTokens
            .filter((token) => token.chainId === chain.id)
            .map((token) => ({
                key: `${token.chainId}-${token.address}`,
                ...token,
            })),
    );
});

export const tokensOutAtom = atom((get) => {
    const networkChains = get(chainsAtom);
    const combinedTokens = get(tokensAtom);
    if (!combinedTokens) return [];

    return networkChains.flatMap((chain) =>
        combinedTokens
            .filter((token) => token.chainId === chain.id)
            .map((token) => ({
                key: `${token.chainId}-${token.address}`,
                ...token,
            })),
    );
});

// Selected tokenIn
export const tokenInAtom = atom<TokenWithChainId | null>(null);
// Selected tokenOut
export const tokenOutAtom = atom<TokenWithChainId | null>(null);
