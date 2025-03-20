import { Chain, localhost } from "viem/chains";

export const port = 8545;
export const port2 = 8546;

export const chainId = 1338;
export const chainId2 = 1338;

export const portLocalOpChainA = 9545;
export const portLocalOpChainB = 9546;

export const chainIdLocalOp = 900;
export const chainIdLocalOpChainA = 901;
export const chainIdLocalOpChainB = 902;

export const localhost2 = {
    ...localhost,
    id: chainId2,
    name: "Localhost 2",
    rpcUrls: { default: { http: [`http://127.0.0.1:${port2}`] } },
} as Chain;

export const localOp = {
    ...localhost,
    id: chainIdLocalOp,
    name: "Local OP",
    rpcUrls: { default: { http: [`http://127.0.0.1:${port}`] } },
};

export const localOpChainA = {
    ...localhost,
    id: chainIdLocalOpChainA,
    name: "OP Chain A",
    rpcUrls: { default: { http: [`http://127.0.0.1:${portLocalOpChainA}`] } },
};

export const localOpChainB = {
    ...localhost,
    id: chainIdLocalOpChainB,
    name: "OP Chain B",
    rpcUrls: { default: { http: [`http://127.0.0.1:${portLocalOpChainB}`] } },
};
