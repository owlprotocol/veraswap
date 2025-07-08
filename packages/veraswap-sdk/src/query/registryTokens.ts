import { localChains, mainnetChains, testnetChains } from "../chains/chainType.js";
import { CURRENCIES, localSupersimCurrencies } from "../constants/index.js";
import { RegistryToken } from "../types/RegistryToken.js";
import { convertRegistryTokens } from "../utils/index.js";

const registryTokenUrls = {
    mainnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/refactor-registry/tokens.mainnet.json",
    testnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/refactor-registry/tokens.testnet.json",
};

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
            return [...converted, ...localCurrencies];
        },
        staleTime: 5 * 60 * 1000,
    };
}
