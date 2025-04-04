import { createPublicClient, http } from "viem";
import { Chain, localhost } from "viem/chains";
// TODO: delete?
export const SUPERCHAIN_SWEEP_ADDRESS = "0x7eF899a107a9a98002E23910838731562A3e8dC4";
export const SUPERCHAIN_TOKEN_BRIDGE = "0x4200000000000000000000000000000000000028";

/*** Local Supersim Chains ***/
export const opChainL1Port = 8545;
export const opChainL1 = {
    ...localhost,
    id: 900,
    name: "OP Chain L1",
    testnet: true,
    rpcUrls: {
        default: { http: [`http://127.0.0.1:${opChainL1Port}`], webSocket: [`ws://127.0.0.1:${opChainL1Port}`] },
    },
} as const satisfies Chain;
export const opChainL1Client = createPublicClient({ chain: opChainL1, transport: http() });

export const opChainAPort = 9545;
export const opChainA = {
    ...localhost,
    id: 901,
    name: "OP Chain A",
    testnet: true,
    rpcUrls: {
        default: { http: [`http://127.0.0.1:${opChainAPort}`], webSocket: [`ws://127.0.0.1:${opChainAPort}`] },
    },
} as const satisfies Chain;
export const opChainAClient = createPublicClient({ chain: opChainA, transport: http() });

export const opChainBPort = 9546;
export const opChainB = {
    ...localhost,
    id: 902,
    name: "OP Chain B",
    testnet: true,
    rpcUrls: {
        default: { http: [`http://127.0.0.1:${opChainBPort}`], webSocket: [`ws://127.0.0.1:${opChainBPort}`] },
    },
} as const satisfies Chain;
export const opChainBClient = createPublicClient({ chain: opChainB, transport: http() });
