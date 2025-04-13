import invariant from "tiny-invariant";
import { Address } from "viem";

import { Token } from "./token.js";

type TokenType = "ERC20" | "SuperERC20" | "HypERC20";

/**
 * Represents a token that exists on multiple chains with the same address.
 * This is useful for tokens like USDC, USDT, etc. that have the same address across multiple chains.
 */
export class MultichainToken extends Token {
    public readonly type: TokenType;

    private remoteTokens: Record<number, MultichainToken>;
    private hypERC20Collateral: Address | null;

    protected constructor(
        chainId: number,
        address: Address,
        decimals: number,
        type: TokenType,
        hypERC20Collateral: Address | null = null,
        symbol?: string,
        name?: string,
    ) {
        super(chainId, address, decimals, symbol, name);
        if (type === "HypERC20") {
            invariant(hypERC20Collateral === null, "HypERC20 tokens may not be linked to a HypERC20Collateral");
        }

        this.type = type;
        this.remoteTokens = {};
        this.hypERC20Collateral = hypERC20Collateral;
    }

    private static create(
        chainId: number,
        address: Address,
        decimals: number,
        type: TokenType,
        hypERC20Collateral: Address | null = null,
        symbol?: string,
        name?: string,
    ): MultichainToken {
        return new MultichainToken(chainId, address, decimals, type, hypERC20Collateral, symbol, name);
    }

    public static createHypERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
    ): MultichainToken {
        return this.create(chainId, address, decimals, "HypERC20", null, symbol, name);
    }

    public static createSuperERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        hypERC20Collateral: Address,
    ): MultichainToken {
        return this.create(chainId, address, decimals, "SuperERC20", hypERC20Collateral, symbol, name);
    }

    public static createERC20(
        chainId: number,
        address: Address,
        decimals: number,
        symbol: string,
        name: string,
        hypERC20Collateral: Address,
    ): MultichainToken {
        return this.create(chainId, address, decimals, "ERC20", hypERC20Collateral, symbol, name);
    }

    public static connect(tokens: MultichainToken[]): void {
        for (let i = 0; i < tokens.length; i++) {
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[i].equals(tokens[j])) {
                    continue;
                }

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

    public get hyperlaneAddress(): Address | null {
        if (this.isHypERC20()) return this.address;

        return this.hypERC20Collateral;
    }

    public getRemoteToken(chainId: number): MultichainToken | null {
        return this.remoteTokens[chainId] || null;
    }

    public getRemoteTokens(): MultichainToken[] {
        return Object.values(this.remoteTokens);
    }

    public addRemoteToken(token: MultichainToken): void {
        invariant(this.chainId !== token.chainId, "Remote tokens cannot be on the same chain");

        if (this.isSuperERC20() && token.isSuperERC20()) {
            invariant(this.address === token.address, "SuperERC20 tokens must have the same address across chains");
        }

        this.remoteTokens[token.chainId] = token;
    }
}
