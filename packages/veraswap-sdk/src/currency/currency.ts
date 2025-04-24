import { Address, zeroAddress } from "viem";

import { MultichainToken } from "./multichainToken.js";
import { type NativeCurrency } from "./nativeCurrency.js";
import { type Token2 } from "./token.js";

export type Currency = NativeCurrency | Token2 | MultichainToken;

/**
 * Typeguard to determinie if Currency is NativeCurrency
 * This one is not really needed for now because you can just check token.isNative() but could be different in future
 */
export function isNativeCurrency(currency: Currency): currency is NativeCurrency {
    return currency.isNative;
}

/**
 * Typeguard to determine if Currency is Token
 * This one is not really needed because you can just check !token.isNative()
 */
export function isToken(currency: Currency): currency is Token2 {
    return !currency.isNative;
}

/**
 * Typeguard to determine if Currency is MultichainToken
 * Simply implemented as `currency instanceof MutlichainToken` for now but could be different in future
 */
export function isMultichainToken(currency: Currency): currency is MultichainToken {
    return currency instanceof MultichainToken;
}

/**
 * Return Uniswap V4 Address for Currency
 * Unlike previous versions, Uniswap v4 uses native tokens directly using `address(0)`
 */
export function getUniswapV4Address(currency: Currency): Address {
    return isNativeCurrency(currency) ? zeroAddress : currency.address;
}
