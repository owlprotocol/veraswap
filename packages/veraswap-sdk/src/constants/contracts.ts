import { zeroAddress } from "viem";
import { avalanche } from "viem/chains";

import { arbitrum, base, bsc, opChainL1, optimism, polygon } from "../chains/index.js";
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
} from "../uniswap/index.js";

import { LOCAL_CURRENCIES } from "./tokens.js";

/*
const allChains = [...testnetChains, ...mainnetChains, ...localChains];
const contractsByChain =
    params.contractsByChain ??
    Object.fromEntries(
        allChains.map((chain) => [
            chain.id,
            {
                weth9: UNISWAP_CONTRACTS[chain.id]?.weth9 ?? zeroAddress,
                metaQuoter: UNISWAP_CONTRACTS[chain.id]?.metaQuoter ?? zeroAddress,
            },
        ]),
    );
*/

export const CURRENCY_HOPS = {
    [bsc.id]: [USDC_BSC.address, USDT_BSC.address, zeroAddress],
    [base.id]: [USDC_BASE.address, zeroAddress],
    [polygon.id]: [USDC_POLYGON.address, USDT_POLYGON.address, zeroAddress],
    [arbitrum.id]: [USDC_ARBITRUM.address, USDT_ARBITRUM_ONE.address, zeroAddress],
    [avalanche.id]: [USDC_AVALANCHE.address, USDT_AVALANCHE.address, zeroAddress],
    [optimism.id]: [USDC_OPTIMISM.address, USDT_OPTIMISM.address, zeroAddress],
    [opChainL1.id]: [getUniswapV4Address(LOCAL_CURRENCIES[6]), zeroAddress], // L34
};
