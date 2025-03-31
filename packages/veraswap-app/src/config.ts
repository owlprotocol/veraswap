import { http, createStorage, createConfig, webSocket } from "wagmi";
import { arbitrum, arbitrumSepolia, base, baseSepolia, Chain, mainnet, sepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet, walletConnectWallet, uniswapWallet } from "@rainbow-me/rainbowkit/wallets";
import { inkSepolia, interopDevnet0, interopDevnet1, unichainSepolia } from "@owlprotocol/veraswap-sdk/chains";
import { localOp, localOpChainA, localOpChainB } from "@owlprotocol/veraswap-sdk";

/***** Chains *****/
// List of supported networks
export const localChains = [localOp, localOpChainA, localOpChainB];

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const mainnetChains = [
    mainnet,
    arbitrum,
    {
        ...base,
        rpcUrls: {
            default: {
                http: ["https://lb.drpc.org/ogrpc?network=base&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
                webSocket: ["wss://lb.drpc.org/ogws?network=base&dkey=AhYfrLlxSE3QsswFtgfKNqu1Ait49nQR75sVnqSgS7QB"],
            },
        },
    },
];

export const testnetChains = [
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
];

const allChains = [...interopDevnetChains, ...testnetChains, ...mainnetChains];

export const chains = (import.meta.env.MODE === "development"
    ? [...allChains, ...localChains]
    : allChains) as unknown as [Chain, ...Chain[]];

//TODO: Why not support all wallets even in devmode?
const wallets =
    import.meta.env.MODE === "development"
        ? [metaMaskWallet]
        : [metaMaskWallet, coinbaseWallet, walletConnectWallet, uniswapWallet];

export const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets,
        },
    ],
    { projectId: "c2ad5c78be369f29fba3daa1799f2028", appName: "VeraSwap" },
);

export const config = createConfig({
    chains,
    transports: Object.fromEntries(
        // Use websocket by default
        chains.map((chain: Chain) => [chain.id, !!chain.rpcUrls.default.webSocket?.[0] ? webSocket() : http()]),
    ),
    connectors,
    storage: createStorage({ storage: window.localStorage }),
});
