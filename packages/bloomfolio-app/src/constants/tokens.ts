import { Address } from "viem";

export type TokenCategory = "native" | "stable" | "alt" | "commodity";

export interface Token {
    address: Address;
    symbol: string;
    name: string;
    logoURI: string;
    category: TokenCategory;
    chainId: number;
}

export const MAINNET_TOKENS = [
    {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        name: "USD Coin",
        logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        category: "stable",
        chainId: 1,
    },
    {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "ETH",
        name: "Ethereum",
        logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        category: "native",
        chainId: 1,
    },
    {
        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        logoURI: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
        category: "commodity",
        chainId: 1,
    },
    {
        address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        symbol: "LINK",
        name: "Chainlink",
        logoURI: "https://cryptologos.cc/logos/chainlink-link-logo.png",
        category: "alt",
        chainId: 1,
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
