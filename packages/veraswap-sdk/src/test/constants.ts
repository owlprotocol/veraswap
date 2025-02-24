import { Chain, localhost } from "viem/chains";

export const port = 8545;
export const port2 = 9545;

export const chainId = 1338;
export const chainId2 = 1338;

export const localhost2 = { ...localhost, id: chainId2 } as Chain;
