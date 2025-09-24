import { arbitrum as arbitrumChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const arbitrum = {
    ...arbitrumChain,
    rpcUrls: {
        default: {
            http: ["https://arbitrum-mainnet.core.chainstack.com/db36c07f913d8dbb8cdf6a8831c1bd23"],
            webSocket: ["wss://arbitrum-mainnet.core.chainstack.com/db36c07f913d8dbb8cdf6a8831c1bd23"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/arbitrum/logo.svg",
    },
} satisfies ChainWithMetadata;
