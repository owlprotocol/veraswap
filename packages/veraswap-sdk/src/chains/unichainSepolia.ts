import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

import { ChainWithMetadata } from "./chainWithMetadata.js";

const sourceId = 11_155_111; // sepolia

export const unichainSepolia = /* #__PURE__ */ defineChain({
    ...chainConfig,
    id: 1301,
    name: "Unichain Sepolia",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [
                "https://lb.drpc.org/ogrpc?network=unichain-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
            webSocket: [
                "wss://lb.drpc.org/ogws?network=unichain-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
            ],
        },
    },
    blockExplorers: {
        default: {
            name: "Uniscan",
            url: "https://sepolia.uniscan.xyz",
            apiUrl: "https://api-sepolia.uniscan.xyz/api",
        },
    },
    contracts: {
        ...chainConfig.contracts,
        multicall3: {
            address: "0xca11bde05977b3631167028862be2a173976ca11",
            blockCreated: 0,
        },
        portal: {
            [sourceId]: {
                address: "0x0d83dab629f0e0F9d36c0Cbc89B69a489f0751bD",
            },
        },
        l1StandardBridge: {
            [sourceId]: {
                address: "0xea58fcA6849d79EAd1f26608855c2D6407d54Ce2",
            },
        },
        disputeGameFactory: {
            [sourceId]: {
                address: "0xeff73e5aa3B9AEC32c659Aa3E00444d20a84394b",
            },
        },
    },
    testnet: true,
    sourceId,
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/unichain/logo.svg",
    },
}) satisfies ChainWithMetadata;
