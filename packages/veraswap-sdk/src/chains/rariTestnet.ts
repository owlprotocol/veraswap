import { defineChain } from "viem";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const rariTestnet = /* #__PURE__ */ defineChain({
    id: 1918988905,
    name: "Rari Testnet",
    testnet: true,
    rpcUrls: {
        default: {
            http: ["https://testnet.rpc.rarichain.org/http"],
            webSocket: ["wss://rpc.rari.testnet"],
        },
    },
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://testnet.explorer.rarichain.org/",
            apiUrl: "https://testnet.explorer.rarichain.org/api",
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/rarichain/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/rarichain/logo.svg",
}) satisfies ChainWithMetadata;
