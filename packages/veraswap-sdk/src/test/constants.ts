import { Chain, localhost } from "viem/chains";

export const port = 8545;
export const port2 = 8546;

export const chainId = 1338;
export const chainId2 = 1338;

export const localhost2 = {
    ...localhost,
    id: chainId2,
    name: "Localhost 2",
    rpcUrls: { default: { http: [`http://127.0.0.1:${port2}`] } },
} as Chain;

/*** Supersim Constants ***/
// Designed to mimic default supersim config
export const opChainL1Port = 8545;
export const opChainL1 = {
    ...localhost,
    id: 900,
    name: "Local",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainL1Port}`] } },
};

export const opChainAPort = 9545;
export const opChainA = {
    ...localhost,
    id: 901,
    name: "OPChainA",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainAPort}`] } },
};

export const opChainBPort = 9546;
export const opChainB = {
    ...localhost,
    id: 902,
    name: "OPChainB",
    rpcUrls: { default: { http: [`http://127.0.0.1:${opChainBPort}`] } },
};
