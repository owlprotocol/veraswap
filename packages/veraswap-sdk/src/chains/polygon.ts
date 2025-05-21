import { polygon as polygonChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const polygon = {
    ...polygonChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=polygon&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=polygon&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/polygon/logo.svg",
    },
} satisfies ChainWithMetadata;
