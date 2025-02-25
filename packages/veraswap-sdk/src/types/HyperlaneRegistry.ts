import { ChainAddresses } from "@hyperlane-xyz/registry";
import { type ChainMap, type ChainMetadata } from "@hyperlane-xyz/sdk";

export interface HyperlaneRegistry {
    metadata: ChainMap<ChainMetadata>;
    addresses: ChainMap<ChainAddresses>;
}
