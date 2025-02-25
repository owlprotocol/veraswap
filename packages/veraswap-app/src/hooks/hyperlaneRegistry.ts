import { GithubRegistry } from "@hyperlane-xyz/registry";
import { testHyperlaneRegistry } from "@owlprotocol/veraswap-sdk";

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
  const isProduction = false; // TODO: Replace with actual production check

  return {
    queryKey: ["hyperlaneRegistry"],
    queryFn: isProduction
      ? fetchGithubRegistryData
      : async () => testHyperlaneRegistry,
  };
}
