import { Address } from "viem";

export interface VeraSwapToken {
    chainId: number;
    symbol: string;
    name: string;
    address: Address;
    decimals: number;
    logoURI?: string;
    collateralAddress?: Address;
    standard?: string; // TODO: replace with Hyperlane type
    connections?: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
    [key: string]: unknown;
}
