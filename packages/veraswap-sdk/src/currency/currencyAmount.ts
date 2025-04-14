import invariant from "tiny-invariant";
import { formatUnits } from "viem";

import { MAX_UINT_256 } from "../constants/uint256.js";

import { Currency } from "./currency.js";
import { Token } from "./token.js";

//TODO: Replace with bignumber.js library for fractional computations such as substracting a percentage?
export class CurrencyAmount<T extends Currency> {
    public readonly currency: T;
    private readonly rawAmount: bigint;

    /**
     * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
     * @param currency the currency in the amount
     * @param rawAmount the raw token or ether amount
     */
    public static fromRawAmount<T extends Currency>(currency: T, rawAmount: bigint): CurrencyAmount<T> {
        return new CurrencyAmount(currency, rawAmount);
    }

    protected constructor(currency: T, rawAmount: bigint) {
        invariant(rawAmount <= MAX_UINT_256, "AMOUNT");
        this.currency = currency;
        this.rawAmount = rawAmount;
    }

    public toFixed(decimalPlaces: number = this.currency.decimals): string {
        invariant(decimalPlaces <= this.currency.decimals, "DECIMALS");
        return formatUnits(this.rawAmount, decimalPlaces);
    }

    public get wrapped(): CurrencyAmount<Token> {
        if (this.currency.isToken) return this as CurrencyAmount<Token>;
        return CurrencyAmount.fromRawAmount(this.currency.wrapped, this.rawAmount);
    }
}
