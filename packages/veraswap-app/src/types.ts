import { Address } from "viem";

export interface Token {
    address: Address;
    name: string;
    symbol: string;
    decimals?: number;
    logo?: string;
}

export interface TokenWithChainId {
    chainId: number;
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
}

export interface Network {
    id: string;
    name: string;
    logo: string;
}

export const networks: Network[] = [
    {
        id: "1337",
        name: "Localhost",
        logo: "/placeholder.svg",
    },
    {
        id: "1338",
        name: "Localhost 2",
        logo: "/placeholder.svg",
    },
];
