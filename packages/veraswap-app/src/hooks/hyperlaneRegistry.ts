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

export function hyperlaneRegistryOptions() {
    // TODO: if !isProduction, merge testHyperlaneRegistry with fetched data
    const isProduction = import.meta.env.MODE !== "development"; // TODO: Replace with actual production check

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
    };
}
