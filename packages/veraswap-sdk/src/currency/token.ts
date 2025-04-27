import invariant from "tiny-invariant";
import { Address, getAddress } from "viem";

import { BaseCurrency, type BaseCurrencyData } from "./baseCurrency.js";
import { type Currency } from "./currency.js";

/**
 * The token data
 */
export interface TokenData extends BaseCurrencyData {
    /**
     * The contract address on the chain on which this token lives
     */
    address: Address;
}

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
//TODO: Naming conflict
export class Token2 extends BaseCurrency {
    public readonly isNative = false as const;
    public readonly isToken = true as const;

    /**
     * The contract address on the chain on which this token lives
     */
    public readonly address: Address;

    /**
     *
     * @param data the token data
     */
    public constructor(data: TokenData) {
        super(data);
        this.address = getAddress(data.address);
    }

    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    public equals(other: Currency): boolean {
        return other.isToken && this.chainId === other.chainId && this.address === other.address;
    }

    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    public sortsBefore(other: Token2): boolean {
        invariant(this.chainId === other.chainId, "CHAIN_IDS");
        invariant(this.address.toLowerCase() !== other.address.toLowerCase(), "ADDRESSES");
        return this.address.toLowerCase() < other.address.toLowerCase();
    }

    /**
     * Return this token, which does not need to be wrapped
     */
    public get wrapped(): Token2 {
        return this;
    }
}
