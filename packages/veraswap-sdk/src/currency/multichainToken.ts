import { Token } from "./token.js";
import { Address } from "viem";
import invariant from "tiny-invariant";

type TokenType = "ERC20" | "SuperERC20" | "HypERC20";

/**
 * Represents a token that exists on multiple chains with the same address.
 * This is useful for tokens like USDC, USDT, etc. that have the same address across multiple chains.
 */
export class MultichainToken extends Token {
    public readonly type: TokenType;
    private remoteTokens: Record<number, MultichainToken>;
    private hypERC20Collateral: Address | null;

    constructor(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        type: TokenType,
        hypERC20Collateral: Address | null,
    ) {
        super(chainId, address, decimals, symbol, name);
        this.type = type;
        this.remoteTokens = {};
        this.hypERC20Collateral = hypERC20Collateral;
    }

    private static create(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        type: TokenType,
        hypERC20Collateral: Address | null,
    ): MultichainToken {
        invariant(
            (type === "HypERC20" && hypERC20Collateral === null) ||
                (type !== "HypERC20" && hypERC20Collateral !== null),
            "HypERC20 tokens must have null collateral, other tokens must have non-null collateral",
        );

        return new MultichainToken(chainId, address, decimals, symbol, name, type, hypERC20Collateral);
    }

    public static createHypERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
    ): MultichainToken {
        return this.create(chainId, address, decimals, symbol, name, "HypERC20", null);
    }

    public static createSuperERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        hypERC20Collateral: Address,
    ): MultichainToken {
        return this.create(chainId, address, decimals, symbol, name, "SuperERC20", hypERC20Collateral);
    }

    public static createERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        hypERC20Collateral: Address,
    ): MultichainToken {
        return this.create(chainId, address, decimals, symbol, name, "ERC20", hypERC20Collateral);
    }

    public static connect(tokens: MultichainToken[]): void {
        for (let i = 0; i < tokens.length; i++) {
            for (let j = i + 1; j < tokens.length; j++) {
                tokens[i].addRemoteToken(tokens[j]);
                tokens[j].addRemoteToken(tokens[i]);
            }
        }
    }

    public isSuperERC20(): boolean {
        return this.type === "SuperERC20";
    }

    public isHypERC20(): boolean {
        return this.type === "HypERC20";
    }

    public get hyperlaneAddress(): Address {
        return this.hypERC20Collateral ?? this.address;
    }

    public getRemoteToken(chainId: number): MultichainToken | null {
        return this.remoteTokens[chainId] || null;
    }

    public getRemoteTokens(): MultichainToken[] {
        return Object.values(this.remoteTokens);
    }

    public addRemoteToken(token: MultichainToken): void {
        invariant(this.chainId !== token.chainId, "Remote tokens cannot be on the same chain");
        invariant(
            !(this.isSuperERC20() && token.isSuperERC20()) || this.address === token.address,
            "SuperERC20 tokens must have the same address across chains",
        );

        this.remoteTokens[token.chainId] = token;
    }
}
