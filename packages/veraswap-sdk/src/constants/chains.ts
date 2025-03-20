import { Chain, localhost } from "viem/chains";

/*** Supersim Constants ***/
// Designed to mimic default supersim config, can still be used with prool/anvil (if no need for Interop predeploys)
export const opChainL1Port = 8545;
export const opChainL1 = {
    ...localhost,
    id: 900,
    name: "Local",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainL1Port}`] } },
} as const satisfies Chain;

export const opChainAPort = 9545;
export const opChainA = {
    ...localhost,
    id: 901,
    name: "OPChainA",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainAPort}`] } },
} as const satisfies Chain;

export const opChainBPort = 9546;
export const opChainB = {
    ...localhost,
    id: 902,
    name: "OPChainB",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainBPort}`] } },
} as const satisfies Chain;
