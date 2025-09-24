import { base as baseChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const base = {
    ...baseChain,
    rpcUrls: {
        default: {
            // TODO:investigate issue with Chainstack causing a revert error when fetching quote
            // http: ["https://base-mainnet.core.chainstack.com/a3cbc100238b9972f7d4f44c446a2c16"],
            // webSocket: ["wss://base-mainnet.core.chainstack.com/a3cbc100238b9972f7d4f44c446a2c16"],
            http: ["https://base-mainnet.g.alchemy.com/v2/VFO0zUhBMB8WDuge_ro4KzKRkvwyrYas"],
            webSocket: ["wss://base-mainnet.g.alchemy.com/v2/VFO0zUhBMB8WDuge_ro4KzKRkvwyrYas"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/base/logo.svg",
    },
} satisfies ChainWithMetadata;
