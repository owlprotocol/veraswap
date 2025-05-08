import { Address } from "viem";

export type RegistryTokenStandard = "ERC20" | "HypERC20" | "SuperERC20" | "Native";

export interface RegistryRemoteToken {
    chainId: number;
    address: Address;
}

export interface RegistryTokenBase {
    standard: RegistryTokenStandard;
    chainId: number;
    decimals: number;
    symbol?: string;
    name?: string;
    logoURI?: string;
}

export interface RegistryNativeToken extends RegistryTokenBase {
    standard: "Native";
}

export interface RegistryErcToken extends RegistryTokenBase {
    standard: "ERC20" | "HypERC20" | "SuperERC20";
    address: Address;
    hypERC20Collateral?: Address;
    remoteTokens?: RegistryRemoteToken[];
}

export type RegistryToken = RegistryNativeToken | RegistryErcToken;
