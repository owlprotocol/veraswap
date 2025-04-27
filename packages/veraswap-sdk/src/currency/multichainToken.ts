import { mapValues } from "lodash-es";
import invariant from "tiny-invariant";
import { Address, getAddress } from "viem";

import { Token2, type TokenData } from "./token.js";

//TODO: Naming conflict with non class
export type TokenStandard2 = "ERC20" | "SuperERC20" | "HypERC20";

export interface MultichainTokenData extends TokenData {
    /**
     * The type of the token
     */
    standard: TokenStandard2;
    /**
     * The address of the HypERC20Collateral, if applicable
     */
    hypERC20Collateral?: Address | null;
    /**
     * The remote tokens of the multichain token
     */
    remoteTokens?: Record<number, MultichainTokenData>;
}

/**
 * Represents a token that exists on multiple chains with the same address.
 * This is useful for tokens like USDC, USDT, etc. that have the same address across multiple chains.
 */
export class MultichainToken extends Token2 {
    public readonly standard: TokenStandard2;
    private hypERC20Collateral: Address | null;

    private remoteTokens: Record<number, MultichainToken>;

    protected constructor(data: MultichainTokenData) {
        super(data);
        const { standard, hypERC20Collateral = null, remoteTokens } = data;

        if (standard === "HypERC20") {
            invariant(hypERC20Collateral === null, "HypERC20 tokens may not be linked to a HypERC20Collateral");
        }

        this.standard = standard;
        this.hypERC20Collateral = hypERC20Collateral ? getAddress(hypERC20Collateral) : null;
        this.remoteTokens = remoteTokens ? mapValues(remoteTokens, (token) => new MultichainToken(token)) : {};
    }

    public static create(data: MultichainTokenData): MultichainToken {
        return new MultichainToken(data);
    }

    public static createHypERC20(data: Omit<MultichainTokenData, "standard" | "hypERC20Collateral">): MultichainToken {
        return this.create({ ...data, standard: "HypERC20" });
    }

    public static createSuperERC20(data: Omit<MultichainTokenData, "standard">): MultichainToken {
        return this.create({ ...data, standard: "SuperERC20" });
    }

    public static createERC20(data: Omit<MultichainTokenData, "standard">): MultichainToken {
        return this.create({ ...data, standard: "ERC20" });
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
        return this.standard === "SuperERC20";
    }

    public isHypERC20(): boolean {
        return this.standard === "HypERC20";
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
