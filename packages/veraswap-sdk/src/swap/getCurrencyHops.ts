import { zeroAddress } from "viem";
import { base, bsc, polygon } from "viem/chains";

import { USDC_BASE, USDC_BSC, USDC_POLYGON, USDT_BSC, USDT_POLYGON } from "../uniswap/constants/tokens.js";

export function getCurrencyHops(chainId: number) {
    if (chainId === bsc.id) return [USDC_BSC.address, USDT_BSC.address, zeroAddress];
    if (chainId === base.id) return [USDC_BASE.address, zeroAddress];
    if (chainId === polygon.id) return [USDC_POLYGON.address, USDT_POLYGON.address, zeroAddress];

    return [zeroAddress];
}
