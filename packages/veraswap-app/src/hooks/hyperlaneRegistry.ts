import { GithubRegistry } from "@hyperlane-xyz/registry";
import { testHyperlaneRegistry } from "@owlprotocol/veraswap-sdk/constants";

const fetchGithubRegistryData = async () => {
    const registry = new GithubRegistry();

    const chainMetadata = await registry.getMetadata();
    const chainAddresses = await registry.getAddresses();

    return {
        metadata: chainMetadata,
        addresses: chainAddresses,
    };
};

// TODO: if !isProduction, merge testHyperlaneRegistry with fetched data
const isProduction = import.meta.env.MODE !== "development"; // TODO: Replace with actual production check

export function hyperlaneRegistryOptions() {
    // Merge testHyperlaneRegistry with fetched data
    const fetchAndMergeRegistries = async () => {
        const githubRegistryData = await fetchGithubRegistryData();
        return {
            metadata: { ...githubRegistryData.metadata, ...testHyperlaneRegistry.metadata },
            addresses: { ...githubRegistryData.addresses, ...testHyperlaneRegistry.addresses },
        };
    };

    return {
        queryKey: ["hyperlaneRegistry"],
        queryFn: isProduction ? fetchGithubRegistryData : fetchAndMergeRegistries,
        staleTime: 1000 * 60 * 60, // 1 hour
        refetchInterval: 1000 * 60 * 60, // 1 hour
    };
}
