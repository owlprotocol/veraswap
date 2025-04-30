import { Address, createPublicClient, defineChain, http } from "viem";
import { localhost } from "viem/chains";

import { ChainWithMetadata } from "./chainWithMetadata.js";
// TODO: delete?
export const SUPERCHAIN_SWEEP_ADDRESS = "0xf3DEC025df343CE374EB2dD316f08FC8B3Ce3b48" as Address;
export const SUPERCHAIN_TOKEN_BRIDGE = "0x4200000000000000000000000000000000000028" as Address;
export const SUPERCHAIN_L2_TO_L2_CROSS_DOMAIN_MESSENGER = "0x4200000000000000000000000000000000000023" as Address;

/*** Local Supersim Chains ***/
export const opChainL1Port = 8547;
export const opChainL1 = defineChain({
    ...localhost,
    id: 900,
    name: "OP Chain L1",
    testnet: true,
    rpcUrls: {
        default: { http: [`http://127.0.0.1:${opChainL1Port}`], webSocket: [`ws://127.0.0.1:${opChainL1Port}`] },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainL1Client = createPublicClient({ chain: opChainL1, transport: http() });

export const opChainAPort = 9545;
export const opChainA = defineChain({
    ...localhost,
    id: 901,
    name: "OP Chain A",
    testnet: true,
    rpcUrls: {
        // default: { http: [`http://127.0.0.1:${opChainAPort}`], webSocket: [`ws://127.0.0.1:${opChainAPort}`] },
        default: { http: [`http://127.0.0.1:${opChainAPort}`] },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainAClient = createPublicClient({ chain: opChainA, transport: http() });

export const opChainBPort = 9546;
export const opChainB = defineChain({
    ...localhost,
    id: 902,
    name: "OP Chain B",
    testnet: true,
    rpcUrls: {
        // default: { http: [`http://127.0.0.1:${opChainBPort}`], webSocket: [`ws://127.0.0.1:${opChainBPort}`] },
        default: { http: [`http://127.0.0.1:${opChainBPort}`] },
    },
    custom: {
        logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
    },
    iconUrl: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/main/chains/optimism/logo.svg",
}) satisfies ChainWithMetadata;
export const opChainBClient = createPublicClient({ chain: opChainB, transport: http() });
