import { Token2 } from "./token.js";

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const WETH9: Record<number, Token2> = {
    [1]: new Token2({
        chainId: 1,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [3]: new Token2({
        chainId: 3,
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [4]: new Token2({
        chainId: 4,
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [5]: new Token2({
        chainId: 5,
        address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [42]: new Token2({
        chainId: 42,
        address: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [10]: new Token2({
        chainId: 10,
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [69]: new Token2({
        chainId: 69,
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [11155420]: new Token2({
        chainId: 11155420,
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [42161]: new Token2({
        chainId: 42161,
        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [421611]: new Token2({
        chainId: 421611,
        address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [421614]: new Token2({
        chainId: 421614,
        address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [8453]: new Token2({
        chainId: 8453,
        address: "0x4200000000000000000000000000000000000006",
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ether",
    }),
    [56]: new Token2({
        chainId: 56,
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        decimals: 18,
        symbol: "WBNB",
        name: "Wrapped BNB",
    }),
    [137]: new Token2({
        chainId: 137,
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        decimals: 18,
        symbol: "WMATIC",
        name: "Wrapped MATIC",
    }),
    [43114]: new Token2({
        chainId: 43114,
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        decimals: 18,
        symbol: "WAVAX",
        name: "Wrapped AVAX",
    }),
};
