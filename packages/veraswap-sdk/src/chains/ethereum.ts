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
        logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    },
} satisfies ChainWithMetadata;
