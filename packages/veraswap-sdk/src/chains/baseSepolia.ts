import { baseSepolia as baseSepoliaChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const baseSepolia = {
    ...baseSepoliaChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/base/logo.svg",
    },
} satisfies ChainWithMetadata;
