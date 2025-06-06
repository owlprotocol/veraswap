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
        logoURI: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg",
    },
} satisfies ChainWithMetadata;
