import { chainConfig } from "viem/op-stack";
import { defineChain } from "viem";
import { localhost } from "viem/chains";

const sourceId = 11_155_111; // sepolia

export const inkSepolia = /* #__PURE__ */ defineChain({
    ...chainConfig,
    id: 763373,
    name: "Ink Sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://ink-sepolia.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
            webSocket: ["wss://ink-mainnet.g.alchemy.com/v2/Gv_RTNzlyImHduWcD2cFjA-UilBLO-gX"],
        },
    },
    blockExplorers: {
        default: {
            name: "Blockscout",
            url: "https://explorer-sepolia.inkonchain.com/",
            apiUrl: "https://explorer-sepolia.inkonchain.com/api/v2",
        },
    },
    contracts: {
        ...chainConfig.contracts,
        disputeGameFactory: {
            [sourceId]: {
                address: "0x860e626c700af381133d9f4af31412a2d1db3d5d",
            },
        },
        portal: {
            [sourceId]: {
                address: "0x5c1d29c6c9c8b0800692acc95d700bcb4966a1d7",
            },
        },
        l1StandardBridge: {
            [sourceId]: {
                address: "0x33f60714bbd74d62b66d79213c348614de51901c",
            },
        },
    },
    testnet: true,
    sourceId,
});

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
});

export const portLocalOp = 8547;
export const portLocalOpChainA = 9545;
export const portLocalOpChainB = 9546;

export const chainIdLocalOp = 900;
export const chainIdLocalOpChainA = 901;
export const chainIdLocalOpChainB = 902;

export const localOp = {
    ...localhost,
    id: chainIdLocalOp,
    name: "Local OP",
    rpcUrls: { default: { http: [`http://127.0.0.1:${portLocalOp}`] } },
};

export const localOpChainA = {
    ...localhost,
    id: chainIdLocalOpChainA,
    name: "OP Chain A",
    rpcUrls: { default: { http: [`http://127.0.0.1:${portLocalOpChainA}`] } },
};

export const localOpChainB = {
    ...localhost,
    id: chainIdLocalOpChainB,
    name: "OP Chain B",
    rpcUrls: { default: { http: [`http://127.0.0.1:${portLocalOpChainB}`] } },
};
