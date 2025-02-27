import { http, createStorage, createConfig } from "wagmi";
import { Chain, localhost } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { chains } from "./atoms/index.js";

export const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [metaMaskWallet],
        },
    ],
    { projectId: "veraswap", appName: "Owl Protocol" },
);

export const config = createConfig({
    chains,
    // @ts-ignore
    transports: Object.fromEntries(chains.map((chain: Chain) => [chain.id, http()])),
    // transports: {
    //   [localhost.id]: http(),
    // },
    connectors,
    storage: createStorage({ storage: window.localStorage }),
});
