import { Address } from "viem";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "viem/chains";

import {
    USDC,
    USDC_ARBITRUM,
    USDC_BASE,
    USDC_MAINNET,
    USDC_OPTIMISM,
    USDC_POLYGON,
    USDT,
    USDT_BSC,
} from "../uniswap/constants/tokens.js";

export const USD_CURRENCIES = {
    [mainnet.id]: { address: USDC_MAINNET.address, decimals: USDC.decimals },
    [bsc.id]: { address: USDT_BSC.address, decimals: USDT.decimals },
    [optimism.id]: { address: USDC_OPTIMISM.address, decimals: USDC.decimals },
    [base.id]: { address: USDC_BASE.address, decimals: USDC.decimals },
    [polygon.id]: { address: USDC_POLYGON.address, decimals: USDC.decimals },
    [arbitrum.id]: { address: USDC_ARBITRUM.address, decimals: USDC.decimals },
} as const as Record<number, { address: Address; decimals: number } | undefined>;
