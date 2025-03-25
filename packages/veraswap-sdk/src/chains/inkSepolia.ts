import { chainConfig } from "viem/op-stack";
import { defineChain } from "viem";

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
