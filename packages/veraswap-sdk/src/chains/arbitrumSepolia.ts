import { arbitrumSepolia as arbitrumSepoliaChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const arbitrumSepolia = {
    ...arbitrumSepoliaChain,
    rpcUrls: {
        default: {
            http: [
                "https://lb.drpc.org/ogrpc?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/arbitrum/logo.svg",
    },
} satisfies ChainWithMetadata;
