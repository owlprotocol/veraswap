import { Chain, localhost } from "viem/chains";

export const anvilPort0 = 8545;
export const altoPort0 = 8645;
export const anvilPort1 = 9545;

export const chainId = 1338;
export const chainId2 = 1338;

export const localhost2 = {
    ...localhost,
    id: chainId2,
    rpcUrls: { default: { http: [`http://127.0.0.1:${anvilPort1}`] } },
} as Chain;
