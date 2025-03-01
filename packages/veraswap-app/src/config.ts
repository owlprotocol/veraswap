import { http, createStorage, createConfig, webSocket } from "wagmi";
import { arbitrum, arbitrumSepolia, base, Chain, localhost, sepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet, walletConnectWallet, uniswapWallet } from "@rainbow-me/rainbowkit/wallets";
import { interopDevnet0, interopDevnet1 } from "@owlprotocol/veraswap-sdk";

/***** Chains *****/
// List of supported networks

export const localhost2 = {
    ...localhost,
    id: 1338,
    name: "Localhost 2",
    rpcUrls: { default: { http: ["http://127.0.0.1:8546"] } },
} as Chain;

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
    interopDevnet0,
    interopDevnet1,
    base,
    arbitrum,
] as const;
export const localChains = [...prodChains, localhost, localhost2] as const;

export const chains = import.meta.env.MODE != "development" ? prodChains : localChains;

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
    // @ts-ignore
    transports: Object.fromEntries(
        chains.map((chain: Chain) => [chain.id, !!chain.rpcUrls.default.webSocket?.[0] ? webSocket() : http()]),
    ),
    connectors,
    storage: createStorage({ storage: window.localStorage }),
});
