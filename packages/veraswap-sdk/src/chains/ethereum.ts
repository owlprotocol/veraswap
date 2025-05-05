import { mainnet as mainnetChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const ethereum = {
    ...mainnetChain,
    rpcUrls: {
        default: {
            http: ["https://eth-mainnet.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
            webSocket: ["wss://eth-mainnet.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/ethereum/logo.svg",
    },
} satisfies ChainWithMetadata;
