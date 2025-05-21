import { polygon as polygonChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const polygon = {
    ...polygonChain,
    rpcUrls: {
        default: {
            http: ["https://polygon-mainnet.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
            webSocket: ["wss://polygon-mainnet.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/polygon/logo.svg",
    },
} satisfies ChainWithMetadata;
