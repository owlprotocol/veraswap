import { Address, zeroAddress } from "viem";
import { arbitrum, avalanche, base, bsc, optimism, polygon } from "viem/chains";

import { opChainL1 } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { getUniswapV4Address } from "../currency/currency.js";
import {
    USDC_ARBITRUM,
    USDC_AVALANCHE,
    USDC_BASE,
    USDC_BSC,
    USDC_OPTIMISM,
    USDC_POLYGON,
    USDT_ARBITRUM_ONE,
    USDT_AVALANCHE,
    USDT_BSC,
    USDT_OPTIMISM,
    USDT_POLYGON,
} from "../uniswap/constants/tokens.js";

export function getCurrencyHops(chainId: number): Address[] {
    if (chainId === bsc.id) return [USDC_BSC.address, USDT_BSC.address, zeroAddress];
    if (chainId === base.id) return [USDC_BASE.address, zeroAddress];
    if (chainId === polygon.id) return [USDC_POLYGON.address, USDT_POLYGON.address, zeroAddress];
    if (chainId === arbitrum.id) return [USDC_ARBITRUM.address, USDT_ARBITRUM_ONE.address, zeroAddress];
    if (chainId === avalanche.id) return [USDC_AVALANCHE.address, USDT_AVALANCHE.address, zeroAddress];
    if (chainId === optimism.id) return [USDC_OPTIMISM.address, USDT_OPTIMISM.address, zeroAddress];
    if (chainId === opChainL1.id) return [getUniswapV4Address(LOCAL_CURRENCIES[6]), zeroAddress]; // L34

    return [zeroAddress];
}
