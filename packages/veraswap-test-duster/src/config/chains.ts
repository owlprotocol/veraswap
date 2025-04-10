import {
    inkSepolia,
    interopDevnet0,
    interopDevnet1,
    unichainSepolia,
    opChainA,
    opChainB,
    opChainL1,
} from "@owlprotocol/veraswap-sdk/chains";
import {
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
} from "viem/chains";

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const localChains = [opChainL1, opChainA, opChainB];

export const prodChains = [
    {
        ...sepolia,
        rpcUrls: {
            default: {
                http: ["https://lb.drpc.org/ogrpc?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
                webSocket: ["wss://lb.drpc.org/ogws?network=sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            },
        },
    },
    {
        ...optimismSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=optimism-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    {
        ...arbitrumSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=arbitrum-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    {
        ...baseSepolia,
        rpcUrls: {
            default: {
                http: [
                    "https://lb.drpc.org/ogrpc?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
                webSocket: [
                    "wss://lb.drpc.org/ogws?network=base-sepolia&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB",
                ],
            },
        },
    },
    inkSepolia,
    unichainSepolia,
] as const;
