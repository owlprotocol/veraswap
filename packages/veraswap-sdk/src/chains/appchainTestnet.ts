import { defineChain } from "viem";

import { ChainWithMetadata } from "./chainWithMetadata.js";

export const appchainTestnet = /* #__PURE__ */ defineChain({
    id: 4661,
    name: "Appchain Testnet",
    testnet: true,
    rpcUrls: {
        default: {
            http: ["https://appchaintestnet.rpc.caldera.xyz/http"],
            webSocket: ["wss://appchaintestnet.rpc.caldera.xyz/ws"],
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
            url: "https://appchaintestnet.explorer.caldera.xyz/",
            apiUrl: "https://appchaintestnet.explorer.caldera.xyz/api",
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/appchain/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/appchain/logo.svg",
}) satisfies ChainWithMetadata;
