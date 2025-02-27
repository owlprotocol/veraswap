import { http, createStorage, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

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
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
  connectors,
  storage: createStorage({ storage: window.localStorage }),
});
