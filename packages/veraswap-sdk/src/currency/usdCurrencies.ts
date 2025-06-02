import { Address } from "viem";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "viem/chains";

import {
    USDC_ARBITRUM,
    USDC_BASE,
    USDC_BSC,
    USDC_MAINNET,
    USDC_OPTIMISM,
    USDC_POLYGON,
} from "../uniswap/constants/tokens.js";

export const USD_CURRENCIES = {
    [mainnet.id]: { address: USDC_MAINNET.address, decimals: USDC_MAINNET.decimals },
    [bsc.id]: { address: USDC_BSC.address, decimals: USDC_BSC.decimals },
    [optimism.id]: { address: USDC_OPTIMISM.address, decimals: USDC_OPTIMISM.decimals },
    [base.id]: { address: USDC_BASE.address, decimals: USDC_BASE.decimals },
    [polygon.id]: { address: USDC_POLYGON.address, decimals: USDC_POLYGON.decimals },
    [arbitrum.id]: { address: USDC_ARBITRUM.address, decimals: USDC_ARBITRUM.decimals },
} as const as Record<number, { address: Address; decimals: number } | undefined>;
