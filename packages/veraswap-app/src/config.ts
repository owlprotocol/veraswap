import { http, createStorage, createConfig, webSocket } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet, walletConnectWallet, uniswapWallet } from "@rainbow-me/rainbowkit/wallets";
import {
    inkSepolia,
    interopDevnet0,
    interopDevnet1,
    opChainA,
    opChainB,
    opChainL1,
    unichainSepolia,
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    bsc,
    optimismSepolia,
    sepolia,
    optimism,
    ChainWithMetadata,
    superseed,
} from "@owlprotocol/veraswap-sdk/chains";
import { Chain } from "viem";

/***** Chains *****/
// List of supported networks
export const localChains = [opChainL1, opChainA, opChainB];

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const mainnetChains = [arbitrum, bsc, base, optimism, superseed];

export const testnetChains = [
    sepolia,
    optimismSepolia,
    arbitrumSepolia,
    baseSepolia,
    inkSepolia,
    unichainSepolia,
    ...interopDevnetChains,
];

const allChains = [...testnetChains, ...mainnetChains];

export const chains = (import.meta.env.MODE === "development"
    ? [...allChains, ...localChains]
    : allChains) as unknown as [ChainWithMetadata, ...ChainWithMetadata[]];

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
