import { Chain, localhost } from "viem/chains";
import { createPublicClient, http } from "viem";

/*** Local Supersim Chains ***/
export const opChainL1Port = 8547;
export const opChainL1 = {
    ...localhost,
    id: 900,
    name: "OP Chain L1",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainL1Port}`] } },
} as const satisfies Chain;
export const opChainL1Client = createPublicClient({ chain: opChainL1, transport: http() });

export const opChainAPort = 9545;
export const opChainA = {
    ...localhost,
    id: 901,
    name: "OP Chain A",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainAPort}`] } },
} as const satisfies Chain;
export const opChainAClient = createPublicClient({ chain: opChainA, transport: http() });

export const opChainBPort = 9546;
export const opChainB = {
    ...localhost,
    id: 902,
    name: "OP Chain B",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainBPort}`] } },
} as const satisfies Chain;
export const opChainBClient = createPublicClient({ chain: opChainB, transport: http() });
