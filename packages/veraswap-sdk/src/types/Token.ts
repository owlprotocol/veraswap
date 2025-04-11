import { Address, zeroAddress } from "viem";

/** Common Token Standards */
export type TokenStandard =
    | "ERC20"
    | "MockERC20"
    | "MockSuperchainERC20"
    | "HypERC20"
    | "HypERC20Collateral"
    | "SuperchainERC20"
    | "NativeToken";

/** Base Token interface with standard ERC20 metadata */
export interface TokenBase<T extends string = TokenStandard> {
    standard: T;
    chainId: number;
    address: Address;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
    connections?: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
}

export interface NativeToken extends TokenBase<"NativeToken"> {
    // TODO: find a better way to do this
    address: typeof zeroAddress;
}

/** HypERC20 Token with remote connections */
export interface HypERC20Token extends TokenBase<"HypERC20"> {
    connections: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
}

/** HypERC20Collateral Token with remote connections and collateral */
export interface HypERC20CollateralToken extends TokenBase<"HypERC20Collateral"> {
    collateralAddress: Address;
    connections: {
        vm: string;
        chainId: number;
        address: Address;
    }[];
}

export type Token =
    | TokenBase<"ERC20">
    | TokenBase<"MockERC20">
    | TokenBase<"MockSuperchainERC20">
    | TokenBase<"SuperchainERC20">
    | HypERC20Token
    | HypERC20CollateralToken
    | NativeToken;
