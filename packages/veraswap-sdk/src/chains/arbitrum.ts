import { arbitrum as arbitrumChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const arbitrum = {
    ...arbitrumChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=arbitrum&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=arbitrum&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/arbitrum/logo.svg",
    },
} satisfies ChainWithMetadata;
