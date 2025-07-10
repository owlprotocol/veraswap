import { localChains, mainnetChains, testnetChains } from "../chains/chainType.js";
import { CURRENCIES, localSupersimCurrencies } from "../constants/index.js";
import { Currency, isToken } from "../currency/currency.js";
import { RegistryToken } from "../types/RegistryToken.js";
import { convertRegistryTokens } from "../utils/index.js";

const registryTokenUrls = {
    mainnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/refactor-registry/tokens.mainnet.json",
    testnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/refactor-registry/tokens.testnet.json",
};

function deduplicateTokens(tokens: Currency[]): Currency[] {
    const seen = new Map<string, Currency>();
    for (const token of tokens) {
        if (token.isNative) {
            const key = `${token.chainId}-native`;
            if (!seen.has(key)) seen.set(key, token);
        } else if (isToken(token)) {
            const key = `${token.chainId}-${token.address}`;
            if (!seen.has(key)) seen.set(key, token);
        }
    }
    return Array.from(seen.values());
}

export function registryTokenQueryKey(chainsType: "mainnet" | "testnet" | "local") {
    return ["registryTokens", chainsType];
}

export function registryTokensQueryOptions(chainsType: "mainnet" | "testnet" | "local", includeSupersim = false) {
    const chains = chainsType === "local" ? localChains : chainsType === "testnet" ? testnetChains : mainnetChains;

    const chainIds = chains.map((c) => c.id) as number[];
    const localCurrencies = CURRENCIES.filter((t) => chainIds.includes(t.chainId));

    if (chainsType === "local") {
        return {
            queryKey: registryTokenQueryKey("local"),
            queryFn: () => (includeSupersim ? [...localCurrencies, ...localSupersimCurrencies] : localCurrencies),
            staleTime: Infinity,
        };
    }

    return {
        queryKey: registryTokenQueryKey(chainsType),
        queryFn: async () => {
            const url = registryTokenUrls[chainsType];

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch registry tokens for ${chainsType}`);

            const tokens = (await res.json()) as RegistryToken[];

            const supportedChainTokens = tokens.filter((token) => chainIds.includes(token.chainId));

            const filteredTokens = supportedChainTokens.map((token) => {
                if ("remoteTokens" in token && token.remoteTokens) {
                    return {
                        ...token,
                        remoteTokens: token.remoteTokens.filter((remoteToken) =>
                            chainIds.includes(remoteToken.chainId),
                        ),
                    };
                }
                return token;
            });

            const converted = convertRegistryTokens(filteredTokens);
            return deduplicateTokens([...converted, ...localCurrencies]);
        },
        staleTime: 5 * 60 * 1000,
    };
}
