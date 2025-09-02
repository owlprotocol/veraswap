import { mainnet as mainnetChain } from "wagmi/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const ethereum = {
    ...mainnetChain,
    rpcUrls: {
        default: {
            http: ["https://ethereum-mainnet.core.chainstack.com/d03a7e03830bb3bd3ed00bb032bdb097"],
            webSocket: ["wss://ethereum-mainnet.core.chainstack.com/d03a7e03830bb3bd3ed00bb032bdb097"],
        },
    },
    custom: {
        logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    },
} satisfies ChainWithMetadata;
