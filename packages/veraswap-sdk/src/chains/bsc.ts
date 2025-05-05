import { bsc as bscChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const bsc = {
    ...bscChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=bsc&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=bsc&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/bsc/logo.svg",
    },
} satisfies ChainWithMetadata;
