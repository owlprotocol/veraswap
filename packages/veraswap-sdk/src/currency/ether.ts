import invariant from "tiny-invariant";

import { Currency } from "./currency.js";
import { NativeCurrency } from "./nativeCurrency.js";
import { Token } from "./token.js";
import { WETH9 } from "./weth9.js";

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
export class Ether extends NativeCurrency {
    protected constructor(chainId: number) {
        super({
            chainId,
            decimals: 18,
            symbol: "ETH",
            name: "Ether",
            logoURI: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png",
        });
    }

    public get wrapped(): Token {
        const weth9 = WETH9[this.chainId];
        invariant(!!weth9, "WRAPPED");
        return weth9;
    }

    private static _etherCache: Record<number, Ether> = {};

    public static onChain(chainId: number): Ether {
        return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Ether(chainId));
    }

    public equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId;
    }
}
