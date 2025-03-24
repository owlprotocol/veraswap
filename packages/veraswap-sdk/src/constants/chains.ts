import { Chain, localhost } from "viem/chains";
import { createPublicClient, defineChain, http } from "viem";

/*** Local Supersim Chains ***/
export const opChainL1Port = 8547;
export const opChainL1 = {
    ...localhost,
    id: 900,
    name: "Local",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainL1Port}`] } },
} as const satisfies Chain;
export const opChainL1Client = createPublicClient({ chain: opChainL1, transport: http() });

export const opChainAPort = 9545;
export const opChainA = {
    ...localhost,
    id: 901,
    name: "OPChainA",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainAPort}`] } },
} as const satisfies Chain;
export const opChainAClient = createPublicClient({ chain: opChainA, transport: http() });

export const opChainBPort = 9546;
export const opChainB = {
    ...localhost,
    id: 902,
    name: "OPChainB",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainBPort}`] } },
} as const satisfies Chain;
export const opChainBClient = createPublicClient({ chain: opChainB, transport: http() });

/*** Devnet chains with Sepolia L1 ***/
export const interopDevnet0 = defineChain({
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
        OptimismPortal: {
            address: "0x7385d89d38ab79984e7c84fab9ce5e6f4815468a",
        },
    },
    testnet: true,
});

export const interopDevnet1 = defineChain({
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
        OptimismPortal: {
            address: "0x55f5c4653dbcde7d1254f9c690a5d761b315500c",
        },
    },
    testnet: true,
});
