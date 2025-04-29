import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

import { ChainWithMetadata } from "./chainWithMetadata.js";

const sourceId = 11_155_111; // sepolia

/*** Devnet chains with Sepolia L1 ***/
export const interopDevnet0 = defineChain({
    ...chainConfig,
    id: 420120000,
    name: "Interop Devnet 0",
    network: "interop-alpha-0",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://interop-alpha-0.optimism.io"],
        },
        public: {
            http: ["https://interop-alpha-0.optimism.io"],
        },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://optimism-interop-alpha-0.blockscout.com/" },
        routescan: { name: "RouteScan", url: "https://420120000.testnet.routescan.io/" },
    },
    contracts: {
        ...chainConfig.contracts,
        OptimismPortal: {
            address: "0x7385d89d38ab79984e7c84fab9ce5e6f4815468a",
        },
    },
    testnet: true,
    sourceId,
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;

export const interopDevnet1 = defineChain({
    ...chainConfig,
    id: 420120001,
    name: "Interop Devnet 1",
    network: "interop-alpha-1",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://interop-alpha-1.optimism.io"],
        },
        public: {
            http: ["https://interop-alpha-1.optimism.io"],
        },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://optimism-interop-alpha-1.blockscout.com/" },
        routescan: { name: "RouteScan", url: "https://420120001.testnet.routescan.io/" },
    },
    contracts: {
        ...chainConfig.contracts,
        OptimismPortal: {
            address: "0x55f5c4653dbcde7d1254f9c690a5d761b315500c",
        },
    },
    testnet: true,
    sourceId,
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
