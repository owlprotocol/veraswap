import { Address, createPublicClient, defineChain, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";

import { ChainWithMetadata } from "./chainWithMetadata.js";
// TODO: delete?
export const SUPERCHAIN_SWEEP_ADDRESS = "0xf3DEC025df343CE374EB2dD316f08FC8B3Ce3b48" as Address;
export const SUPERCHAIN_TOKEN_BRIDGE = "0x4200000000000000000000000000000000000028" as Address;
export const SUPERCHAIN_L2_TO_L2_CROSS_DOMAIN_MESSENGER = "0x4200000000000000000000000000000000000023" as Address;

/*** Local Supersim Chains ***/
export const opChainL1Port = 8547;
export const opChainL1BundlerPort = 9900;
export const opChainL1 = defineChain({
    id: 900,
    name: "OP Chain L1",
    testnet: true,
    rpcUrls: {
        default: { http: [`http://127.0.0.1:${opChainL1Port}`], webSocket: [`ws://127.0.0.1:${opChainL1Port}`] },
    },
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainL1Client = createPublicClient({ chain: opChainL1, transport: http() });
export const opChainL1BundlerClient = createBundlerClient({
    chain: opChainL1,
    transport: http(`http://127.0.0.1:${opChainL1BundlerPort}`),
});

export const opChainAPort = 9545;
export const opChainABundlerPort = 9901;
export const opChainA = defineChain({
    id: 901,
    // name: "OP Chain A",
    name: "Local Unichain",
    testnet: true,
    rpcUrls: {
        // default: { http: [`http://127.0.0.1:${opChainAPort}`], webSocket: [`ws://127.0.0.1:${opChainAPort}`] },
        default: { http: [`http://127.0.0.1:${opChainAPort}`] },
    },
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    custom: {
        // logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
        logoURI: "https://icons.llamao.fi/icons/chains/rsz_unichain.jpg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainAClient = createPublicClient({ chain: opChainA, transport: http() });
export const opChainABundlerClient = createBundlerClient({
    chain: opChainA,
    transport: http(`http://127.0.0.1:${opChainABundlerPort}`),
});

export const opChainBPort = 9546;
export const opChainBBundlerPort = 9902;
export const opChainB = defineChain({
    id: 902,
    // name: "OP Chain B",
    name: "Local Base",
    testnet: true,
    rpcUrls: {
        // default: { http: [`http://127.0.0.1:${opChainBPort}`], webSocket: [`ws://127.0.0.1:${opChainBPort}`] },
        default: { http: [`http://127.0.0.1:${opChainBPort}`] },
    },
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    custom: {
        // logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/base/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainBClient = createPublicClient({ chain: opChainB, transport: http() });
export const opChainBBundlerClient = createBundlerClient({
    chain: opChainB,
    transport: http(`http://127.0.0.1:${opChainBBundlerPort}`),
});
