import { http, createStorage, createConfig } from "wagmi";
import { Chain } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet, walletConnectWallet, uniswapWallet } from "@rainbow-me/rainbowkit/wallets";
import { chains } from "./atoms/index.js";

export const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet, uniswapWallet],
        },
    ],
    { projectId: "c2ad5c78be369f29fba3daa1799f2028", appName: "VeraSwap" },
);

export const config = createConfig({
    chains,
    // @ts-ignore
    transports: Object.fromEntries(chains.map((chain: Chain) => [chain.id, http()])),
    connectors,
    storage: createStorage({ storage: window.localStorage }),
});
