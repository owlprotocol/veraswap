import { sepolia as sepoliaChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const sepolia = {
    ...sepoliaChain,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/ethereum/logo.svg",
    },
} satisfies ChainWithMetadata;
