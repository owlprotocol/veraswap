import { optimismSepolia as optimismSepoliaChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const optimismSepolia = {
    ...optimismSepoliaChain,
    rpcUrls: {
        default: {
            http: [
                "https://lb.drpc.org/ogrpc?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
} satisfies ChainWithMetadata;
