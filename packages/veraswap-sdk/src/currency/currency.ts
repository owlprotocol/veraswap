import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { STARGATE_CURRENCIES } from "../constants/stargate.js";
import { nativeOnChain } from "../uniswap/index.js";

import { Ether } from "./ether.js";
import { MultichainToken } from "./multichainToken.js";
import { type NativeCurrency } from "./nativeCurrency.js";
import { type Token } from "./token.js";

export type Currency = NativeCurrency | Token | MultichainToken;

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
export function isToken(currency: Currency): currency is Token {
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

/**
 * Helper function to check if a currency is a SuperERC20 or is linked to one.
 */
export function isSuperOrLinkedToSuper(currency: Currency): boolean {
    if (!isMultichainToken(currency)) {
        return false;
    }
    if (currency.isSuperERC20()) {
        return true;
    }
    const remoteTokens = currency.getRemoteTokens();
    return remoteTokens.some((remote) => remote.isSuperERC20());
}

/**
 * Take token pair and return list of token pairs on same chain using their remote tokens
 * @param currencyA
 * @param currencyB
 */
export function getSharedChainTokenPairs(currencyA: Currency, currencyB: Currency): [Currency, Currency][] {
    invariant(currencyA.equals(currencyB) === false, "Cannot find pairs for same token");

    const currenciesA: Currency[] = [];
    const currenciesB: Currency[] = [];

    if (currencyA instanceof MultichainToken) {
        // Add all versions of currencyA
        currenciesA.push(currencyA, ...currencyA.getRemoteTokens());
    } else if (!currencyA.isNative) {
        currenciesA.push(currencyA);
    }

    if (currencyB instanceof MultichainToken) {
        // Add all versions of currencyB
        currenciesB.push(currencyB, ...currencyB.getRemoteTokens());
    } else if (!currencyB.isNative) {
        currenciesB.push(currencyB);
    }

    if (currencyA.symbol && currencyA.symbol in STARGATE_CURRENCIES) {
        const stargateCurrency = STARGATE_CURRENCIES[currencyA.symbol as keyof typeof STARGATE_CURRENCIES];

        if (currencyB instanceof Ether) {
            Object.keys(stargateCurrency).forEach((chainIdStr) => {
                const chainId = Number(chainIdStr);
                if (nativeOnChain(Number(chainId)).symbol === "ETH") {
                    currenciesA.push(stargateCurrency[chainId as keyof typeof stargateCurrency]);
                }
            });
        } else {
            currenciesB.forEach((currB) => {
                if (currB.chainId in stargateCurrency) {
                    currenciesA.push(stargateCurrency[currB.chainId as keyof typeof stargateCurrency]);
                }
            });
        }
    }

    if (currencyB.symbol && currencyB.symbol in STARGATE_CURRENCIES) {
        const stargateCurrency = STARGATE_CURRENCIES[currencyB.symbol as keyof typeof STARGATE_CURRENCIES];

        if (currencyA instanceof Ether) {
            Object.keys(stargateCurrency).forEach((chainIdStr) => {
                const chainId = Number(chainIdStr);
                if (nativeOnChain(Number(chainId)).symbol === "ETH") {
                    currenciesB.push(stargateCurrency[chainId as keyof typeof stargateCurrency]);
                }
            });
        } else {
            currenciesA.forEach((currA) => {
                if (currA.chainId in stargateCurrency) {
                    currenciesB.push(stargateCurrency[currA.chainId as keyof typeof stargateCurrency]);
                }
            });
        }
    }

    // Native Tokens: Assume native tokens are the same (Ether) on all chains
    if (currencyA.isNative) {
        // Add native token for each chain of B
        if (currencyA instanceof Ether) {
            currenciesB.forEach((currB) => {
                const { chainId } = currB;
                const native = nativeOnChain(chainId);
                if (native.symbol === "ETH") {
                    currenciesA.push(native);
                }
            });
        } else {
            currenciesA.push(currencyA); // If it's not Ether, just add it as is
        }
    }

    if (currencyB.isNative) {
        // Add native token for each chain of A
        if (currencyB instanceof Ether) {
            currenciesA.forEach((currA) => {
                const { chainId } = currA;
                const native = nativeOnChain(chainId);
                if (native.symbol === "ETH") {
                    currenciesB.push(native);
                }
            });
        } else {
            currenciesB.push(currencyB); // If it's not Ether, just add it as is
        }
    }

    const result: [Currency, Currency][] = [];

    currenciesA.forEach((currA) => {
        // Find tokenOut on same chain
        const currB = currenciesB.find((currency) => currency.chainId === currA.chainId);
        if (currB) result.push([currA, currB]);
    });

    return result;
}
