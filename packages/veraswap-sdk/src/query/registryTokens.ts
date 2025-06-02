import { localChains, mainnetChains, testnetChains } from "../chains/chainType.js";
import { CURRENCIES } from "../constants/index.js";
import { RegistryToken } from "../types/RegistryToken.js";
import { convertRegistryTokens } from "../utils/index.js";

const registryTokenUrls = {
    mainnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens.mainnet.json",
    testnet: "https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens.testnet.json",
};

export function registryTokenQueryKey(chainsType: "mainnet" | "testnet" | "local") {
    return ["registryTokens", chainsType];
}

export function registryTokensQueryOptions(chainsType: "mainnet" | "testnet" | "local") {
    const chains = chainsType === "local" ? localChains : chainsType === "testnet" ? testnetChains : mainnetChains;

    const chainIds = chains.map((c) => c.id) as number[];
    const localCurrencies = CURRENCIES.filter((t) => chainIds.includes(t.chainId));

    if (chainsType === "local") {
        return {
            queryKey: registryTokenQueryKey("local"),
            queryFn: () => localCurrencies,
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
            const filteredTokens = tokens.filter((token) => chainIds.includes(token.chainId));
            const converted = convertRegistryTokens(filteredTokens);
            return [...converted, ...localCurrencies];
        },
        staleTime: 5 * 60 * 1000,
    };
}
