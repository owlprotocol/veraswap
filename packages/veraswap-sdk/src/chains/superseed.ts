import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

import { ChainWithMetadata } from "./chainWithMetadata.js";

// import { superseed as superseedChain } from "viem/chains";
// TODO: update viem

const sourceId = 1; // mainnet

export const superseedViem = /*#__PURE__*/ defineChain({
    ...chainConfig,
    id: 5330,
    name: "Superseed",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://mainnet.superseed.xyz"],
        },
    },
    blockExplorers: {
        default: {
            name: "Superseed Explorer",
            url: "https://explorer.superseed.xyz",
            apiUrl: "https://explorer.superseed.xyz/api/v2",
        },
    },
    contracts: {
        ...chainConfig.contracts,
        disputeGameFactory: {
            [sourceId]: {
                address: "0x8b097CF1f9BbD9cbFD0DD561858a1FCbC8857Be0",
                blockCreated: 20737481,
            },
        },
        l2OutputOracle: {
            [sourceId]: {
                address: "0x693A0F8854F458D282DE3C5b69E8eE5EEE8aA949",
                blockCreated: 20737481,
            },
        },
        portal: {
            [sourceId]: {
                address: "0x2c2150aa5c75A24fB93d4fD2F2a895D618054f07",
                blockCreated: 20737481,
            },
        },
        l1StandardBridge: {
            [sourceId]: {
                address: "0x8b0576E39F1233679109F9b40cFcC2a7E0901Ede",
                blockCreated: 20737481,
            },
        },
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        },
    },
    sourceId,
});

export const superseed = {
    ...superseedViem,
    rpcUrls: {
        default: {
            http: ["https://lb.drpc.org/ogrpc?network=superseed&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            webSocket: ["wss://lb.drpc.org/ogws?network=superseed&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
        },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/superseed/logo.svg",
    },
} satisfies ChainWithMetadata;
