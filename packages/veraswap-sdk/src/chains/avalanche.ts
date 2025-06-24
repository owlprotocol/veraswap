import { avalanche as avalancheChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const avalanche = {
    ...avalancheChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=avalanche&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=avalanche&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/avalanche/logo.svg",
    },
} satisfies ChainWithMetadata;
