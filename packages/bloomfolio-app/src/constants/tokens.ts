import { Address, zeroAddress } from "viem";
import { base } from "viem/chains";

export type TokenCategory = "native" | "stable" | "alt" | "commodity";

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
] as const satisfies Token[];

export function getTokenDetailsForAllocation(
    allocation: { address: Address; chainId: number; weight: bigint },
    tokens: Token[],
) {
    return tokens.find(
        (t) => t.address.toLowerCase() === allocation.address.toLowerCase() && t.chainId === allocation.chainId,
    );
}
