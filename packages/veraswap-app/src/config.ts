import { http, createStorage, createConfig, webSocket } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
    coinbaseWallet,
    metaMaskWallet,
    walletConnectWallet,
    uniswapWallet,
    okxWallet,
    binanceWallet,
    trustWallet,
    phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { ChainWithMetadata, localChains, mainnetChains, testnetChains } from "@owlprotocol/veraswap-sdk/chains";
import { Address, Chain } from "viem";

/***** Chains *****/
// List of supported networks

const allChains = [...testnetChains, ...mainnetChains];

export const chains = (import.meta.env.MODE === "development"
    ? [...allChains, ...localChains]
    : allChains) as unknown as [ChainWithMetadata, ...ChainWithMetadata[]];

//TODO: Why not support all wallets even in devmode?
const wallets =
    import.meta.env.MODE === "development"
        ? [metaMaskWallet]
        : [
              metaMaskWallet,
              coinbaseWallet,
              walletConnectWallet,
              uniswapWallet,
              okxWallet,
              binanceWallet,
              trustWallet,
              phantomWallet,
          ];

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

export const VERASWAP_FEE_BIPS = BigInt(import.meta.env.VITE_VERASWAP_FEE_BIPS);
export const VERASWAP_FEE_RECIPIENT = import.meta.env.VITE_VERASWAP_FEE_RECIPIENT as Address;
export const REFERRER_FEE_BIPS = BigInt(import.meta.env.VITE_REFERRER_FEE_BIPS);
