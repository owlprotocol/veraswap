import { Address, zeroAddress } from "viem";
import { base, bsc } from "viem/chains";
import { opChainL1 } from "@owlprotocol/veraswap-sdk/chains";
import {
    getMockERC20Address,
    USDC_BASE,
    USDC_BSC,
    USDT_BSC,
    WBTC_POLYGON,
    WETH_POLYGON,
} from "@owlprotocol/veraswap-sdk";

export type TokenCategory = "native" | "stable" | "alt" | "commodity" | "basket";

export interface Token {
    address: Address;
    symbol: string;
    name: string;
    logoURI?: string;
    category: TokenCategory;
    decimals?: number;
    chainId: number;
}

export const MAINNET_TOKENS = [
    {
        category: "stable",
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
        chainId: base.id,
    },
    {
        address: zeroAddress,
        symbol: "ETH",
        name: "Ethereum",
        logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
        category: "native",
        chainId: base.id,
    },
    {
        category: "commodity",
        address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
        decimals: 8,
        name: "Coinbase Wrapped BTC",
        symbol: "cbBTC",
        logoURI: "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
        chainId: base.id,
    },
    {
        address: "0x88fb150bdc53a65fe94dea0c9ba0a6daf8c6e196",
        symbol: "LINK",
        name: "Chainlink",
        logoURI: "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        category: "alt",
        chainId: base.id,
    },
    {
        address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
        symbol: "VIRTUAL",
        name: "Virtual Protocol",
        logoURI: "https://coin-images.coingecko.com/coins/images/34057/large/LOGOMARK.png",
        category: "alt",
        chainId: base.id,
    },
    {
        address: "0x1111111111166b7FE7bd91427724B487980aFc69",
        symbol: "ZORA",
        name: "Zora",
        logoURI: "https://coin-images.coingecko.com/coins/images/54693/large/zora.jpg",
        category: "alt",
        chainId: base.id,
    },
    {
        address: "0x98d0baa52b2D063E780DE12F615f963Fe8537553",
        symbol: "KAITO",
        name: "Kaito",
        logoURI: "https://coin-images.coingecko.com/coins/images/54411/large/Qm4DW488_400x400.jpg",
        category: "alt",
        chainId: base.id,
    },
    {
        address: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
        symbol: "SOL",
        name: "SOLANA",
        logoURI: "https://coin-images.coingecko.com/coins/images/54582/large/wsol.png?1740542147",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
        symbol: "LINK",
        name: "Chainlink",
        logoURI: "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
        symbol: "UNI",
        name: "Uniswap",
        logoURI:
            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
        symbol: "AAVE",
        name: "Aave",
        logoURI: "https://coin-images.coingecko.com/coins/images/12645/large/aave-token-round.png?1720472354",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        symbol: "WETH",
        name: "Wrapped Ether",
        logoURI: "https://token-icons.s3.amazonaws.com/eth.png",
        category: "native",
        chainId: bsc.id,
    },
    {
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        symbol: "WBNB",
        name: "Wrapped BNB",
        logoURI: "https://coin-images.coingecko.com/coins/images/12591/large/binance-coin-logo.png?1696512401",
        category: "native",
        chainId: bsc.id,
    },
    {
        address: "0x111111111117dC0aa78b770fA6A738034120C302",
        symbol: "1INCH",
        name: "1inch",
        logoURI: "https://coin-images.coingecko.com/coins/images/13469/large/1inch-token.png?1696513230",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
        symbol: "BTCB",
        name: "BTCB Token",
        logoURI: "https://coin-images.coingecko.com/coins/images/14108/large/Binance-bitcoin.png?1696513829",
        category: "commodity",
        chainId: bsc.id,
    },
    {
        address: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
        symbol: "PEPE",
        name: "Pepe",
        logoURI: "https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        symbol: "CAKE",
        name: "PancakeSwap Token",
        logoURI:
            "https://coin-images.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo_%281%29.png?1696512440",
        category: "alt",
        chainId: bsc.id,
    },
    {
        address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
        symbol: "DOGE",
        name: "Dogecoin",
        logoURI: "https://coin-images.coingecko.com/coins/images/15768/large/dogecoin.png?1696515392",
        category: "alt",
        chainId: bsc.id,
    },
    { ...WETH_POLYGON, name: WETH_POLYGON.name!, symbol: WETH_POLYGON.symbol!, category: "native" },
    { ...WBTC_POLYGON, name: WBTC_POLYGON.name!, symbol: WBTC_POLYGON.symbol!, category: "native" },
] as const satisfies Token[];

export const tokenAAddress = getMockERC20Address({ name: "Token A", symbol: "A", decimals: 18 });
export const tokenBAddress = getMockERC20Address({ name: "Token B", symbol: "B", decimals: 18 });

export const LOCAL_TOKENS = [
    {
        address: tokenAAddress,
        name: "Token A",
        symbol: "A",
        category: "alt",
        chainId: opChainL1.id,
        logoURI: "https://coin-images.coingecko.com/coins/images/15768/large/dogecoin.png?1696515392",
    },
    {
        address: tokenBAddress,
        name: "Token B",
        symbol: "B",
        category: "alt",
        chainId: opChainL1.id,
        logoURI: "https://coin-images.coingecko.com/coins/images/15768/large/dogecoin.png?1696515392",
    },
] as const satisfies Token[];

export const TOKENS = import.meta.env.MODE === "development" ? [...MAINNET_TOKENS, ...LOCAL_TOKENS] : MAINNET_TOKENS;

export function getCurrencyHops(chainId: number) {
    if (chainId === bsc.id) return [USDC_BSC.address, USDT_BSC.address, zeroAddress];
    if (chainId === base.id) return [USDC_BASE.address, zeroAddress];

    return [zeroAddress];
}

export function getTokenDetailsForAllocation(allocation: { address: Address; chainId: number }, tokens: Token[]) {
    return tokens.find(
        (t) => t.address.toLowerCase() === allocation.address.toLowerCase() && t.chainId === allocation.chainId,
    );
}
