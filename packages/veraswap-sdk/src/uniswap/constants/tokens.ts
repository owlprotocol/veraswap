// https://github.com/Uniswap/interface/blob/e069322d8afd898185c1177947cc02c5e9919b7/packages/uniswap/src/constants/tokens.ts
// Replaced UnivesreChainId with viem chains ids
import { Currency, UNI_ADDRESSES, WETH9 } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";
import { Address } from "viem";
import {
    arbitrum,
    avalanche,
    base,
    blast,
    bsc,
    celo,
    mainnet,
    optimism,
    polygon,
    sepolia,
    worldchain,
    zksync,
    zora,
} from "viem/chains";

import { unichainSepolia } from "../../chains/index.js";
import { NativeCurrency } from "../../currency/nativeCurrency.js";
import { Token } from "../../currency/token.js";

// export const USDT_MONAD_TESTNET = new Token(
//     monadtestnet.id,
//     monadTestnet.id,
//     "0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149",
//     6,
//     "USDT",
//     "Tether USD",
// );
//
export const usdcData = {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
};

export const usdcBscData = {
    name: "Binance-Peg USD Coin",
    symbol: "USDC",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
};

export const wethData = {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
};

export const USDC_SEPOLIA = new Token({
    chainId: sepolia.id,
    address: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    ...usdcData,
});

// export const USDC_UNICHAIN = new Token(unichain.id, "0x078D782b760474a361dDA0AF3839290b0EF57AD6", 6, "USDC", "USD//C");

export const USDC_UNICHAIN_SEPOLIA = new Token({
    chainId: unichainSepolia.id,
    address: "0x31d0220469e10c4E71834a79b1f276d740d3768F",
    ...usdcData,
});

// export const DAI = new Token(mainnet.id, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18, "DAI", "Dai Stablecoin");

export const usdtData = {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
};

export const usdtBscData = {
    name: "Binance-Peg Tether USD",
    symbol: "USDT",
    decimals: 18,
    logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
};

export const wbtcData = {
    name: "Wrapped BTC",
    symbol: "WBTC",
    decimals: 8,
    logoURI: "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png",
};

export const USDT = new Token({
    chainId: mainnet.id,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ...usdtData,
});

export const USDC_MAINNET = new Token({
    chainId: mainnet.id,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    ...usdcData,
});

export const USDC = new Token({
    chainId: mainnet.id,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ...usdcData,
});

export const USDC_OPTIMISM = new Token({
    chainId: optimism.id,
    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    ...usdcData,
});

export const usdtOptimismAddress = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";

export const USDT_OPTIMISM = new Token({
    chainId: optimism.id,
    address: usdtOptimismAddress,
    ...usdtData,
});

// export const DAI_OPTIMISM = new Token(
//     optimism.id,
//     "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
//     18,
//     "DAI",
//     "Dai stable coin",
// );

// export const WBTC_OPTIMISM = new Token(
//     optimism.id,
//     "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
//     8,
//     "WBTC",
//     "Wrapped BTC",
// );

export const USDC_BASE = new Token({
    chainId: base.id,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    ...usdcData,
});

export const BTC_BSC = new Token({
    chainId: bsc.id,
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    ...wbtcData,
});

export const USDC_BSC = new Token({
    chainId: bsc.id,
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    ...usdcBscData,
});

export const USDT_BSC = new Token({
    chainId: bsc.id,
    address: "0x55d398326f99059fF775485246999027B3197955",
    ...usdtBscData,
});

// export const ETH_BSC = new Token({chainId: bsc.id, address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", ...wethData});

// export const BUSD_BSC = new Token({chainId: bsc.id, address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", ...busdData});

// export const DAI_BSC = new Token({chainId: bsc.id, address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", ...daiData});

// export const DAI_POLYGON = new Token({
// chainId:    polygon.id,
// address:    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
//     ...daiData
// });

export const USDC_POLYGON = new Token({
    chainId: polygon.id,
    address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    ...usdcData,
});

export const USDT_POLYGON = new Token({
    chainId: polygon.id,
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    ...usdtData,
});

export const WBTC_POLYGON = new Token({
    chainId: polygon.id,
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    ...wbtcData,
});

export const WETH_POLYGON = new Token({
    chainId: polygon.id,
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    ...wethData,
});

// export const USDB_BLAST = new Token({chainId: blast.id, address: "0x4300000000000000000000000000000000000003", ...usdbData});

// export const ARB = new Token({chainId: arbitrum.id, address: "0x912CE59144191C1204E64559FE8253a0e49E6548", ...arbData});

export const USDT_ARBITRUM_ONE = new Token({
    chainId: arbitrum.id,
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    ...usdtData,
});

export const USDC_ARBITRUM = new Token({
    chainId: arbitrum.id,
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    ...usdcData,
});

export const WBTC_ARBITRUM_ONE = new Token({
    chainId: arbitrum.id,
    address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    ...wbtcData,
});

// export const DAI_ARBITRUM_ONE = new Token( arbitrum.id, "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", 18, "DAI", "Dai stable coin",);

export const USDC_AVALANCHE = new Token({
    chainId: avalanche.id,
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    ...usdcData,
});

export const USDT_AVALANCHE = new Token({
    chainId: avalanche.id,
    address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    ...usdcData,
});
export const WETH_AVALANCHE = new Token({
    chainId: avalanche.id,
    address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    ...wethData,
});
// export const DAI_AVALANCHE = new Token( avalanche.id, "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", 18, "DAI.e", "Dai.e Token",);

const celoData = {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
};
export const CELO_CELO = new Token({
    chainId: celo.id,
    address: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    ...celoData,
});

// export const PORTAL_ETH_CELO = new Token( celo.id, "0x66803FB87aBd4aaC3cbB3fAd7C3aa01f6F3FB207", 18, "ETH", "Portal Ether",);

export const USDC_CELO = new Token({
    chainId: celo.id,
    address: "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
    ...usdcData,
});

// export const CUSD_CELO = new Token({chainId: celo.id, address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", ...usdcData});

export const USDC_ZORA = new Token({
    chainId: zora.id,
    address: "0xCccCCccc7021b32EBb4e8C08314bD62F7c653EC4",
    ...usdcData,
});

export const USDC_WORLD_CHAIN = new Token({
    chainId: worldchain.id,
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    ...usdcData,
});

export const USDC_ZKSYNC = new Token({
    chainId: zksync.id,
    address: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4",
    ...usdcData,
});

export const WBTC = new Token({
    chainId: mainnet.id,
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    ...wbtcData,
});

export const maticData = {
    name: "Polygon Matic",
    symbol: "MATIC",
    decimals: 18,
};
export const MATIC_MAINNET = new Token({
    chainId: mainnet.id,
    address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    ...maticData,
});

export const uniData = {
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png",
};

export const UNI = {
    [mainnet.id]: new Token({ chainId: mainnet.id, address: UNI_ADDRESSES[mainnet.id] as Address, ...uniData }),
    [optimism.id]: new Token({
        chainId: optimism.id,
        address: "0x6fd9d7AD17242c41f7131d257212c54A0e816691",
        ...uniData,
    }),
    [sepolia.id]: new Token({ chainId: sepolia.id, address: UNI_ADDRESSES[sepolia.id] as Address, ...uniData }),
};

export const opData = {
    name: "Optimism",
    symbol: "OP",
    decimals: 18,
    // logoURI: "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png",
    logoURI:
        "https://asset-metadata-service-production.s3.amazonaws.com/asset_icons/87130ebdc82a5b176da5c37544472b327ae498cae6565d4cf1c5912c1f26b603.png",
};

export const optimismOPAddress = "0x4200000000000000000000000000000000000042";
export const OP = new Token({ chainId: optimism.id, address: optimismOPAddress, ...opData });

// export const LDO = new Token(mainnet.id, "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", 18, "LDO", "Lido DAO Token");
// export const NMR = new Token(mainnet.id, "0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671", 18, "NMR", "Numeraire");
// export const MNW = new Token(mainnet.id, "0xd3E4Ba569045546D09CF021ECC5dFe42b1d7f6E4", 18, "MNW", "Morpheus.Network");

export const wavaxData = {
    name: "Wrapped AVAX",
    symbol: "WAVAX",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/avalanchec/info/logo.png",
};

export const wbnbData = {
    name: "Wrapped BSC",
    symbol: "WBNB",
    decimals: 18,
    logoURI: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
};

export const WRAPPED_NATIVE_CURRENCY: Record<number, Token> = {
    ...(WETH9 as Record<number, Token>),
    [arbitrum.id]: new Token({
        chainId: arbitrum.id,
        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        ...wethData,
    }),
    [avalanche.id]: new Token({
        chainId: avalanche.id,
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        ...wavaxData,
    }),
    [base.id]: new Token({ chainId: base.id, address: "0x4200000000000000000000000000000000000006", ...wethData }),
    [blast.id]: new Token({ chainId: blast.id, address: "0x4300000000000000000000000000000000000004", ...wethData }),
    [bsc.id]: new Token({ chainId: bsc.id, address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", ...wbnbData }),
    [celo.id]: CELO_CELO,
    [optimism.id]: new Token({
        chainId: optimism.id,
        address: "0x4200000000000000000000000000000000000006",
        ...wethData,
    }),
    // [polygon.id]: new Token(polygon.id, "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", 18, "WMATIC", "Wrapped MATIC"),
    [sepolia.id]: new Token({
        chainId: sepolia.id,
        address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
        ...wethData,
    }),
    // [unichain.id]: new Token({chainId: unichain.id, address: "0x4200000000000000000000000000000000000006", ...wethData}),
    [unichainSepolia.id]: new Token({
        chainId: unichainSepolia.id,
        address: "0x4200000000000000000000000000000000000006",
        ...wethData,
    }),
    [worldchain.id]: new Token({
        chainId: worldchain.id,
        address: "0x4200000000000000000000000000000000000006",
        ...wethData,
    }),
    [zksync.id]: new Token({ chainId: zksync.id, address: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91", ...wethData }),
    [zora.id]: new Token({ chainId: zora.id, address: "0x4200000000000000000000000000000000000006", ...wethData }),
};

export function isCelo(chainId: number) {
    return chainId === celo.id;
}

// Celo has a precompile for its native asset that is fully-compliant with ERC20 interface
// so we can treat it as an ERC20 token. (i.e. $CELO pools are created with its ERC20 precompile)
function getCeloNativeCurrency(chainId: number): Token {
    switch (chainId) {
        case celo.id:
            return CELO_CELO;
        default:
            throw new Error("Not celo");
    }
}

export function isPolygon(chainId: number) {
    return chainId === polygon.id;
}

// Polygon also has a precompile, but its precompile is not fully erc20-compatible.
// So we treat Polygon's native asset as NativeCurrency since we can't treat it like an ERC20 token.
class PolygonNativeCurrency extends NativeCurrency {
    equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId;
    }

    get wrapped(): Token {
        if (!isPolygon(this.chainId)) {
            throw new Error("Not Polygon");
        }
        const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
        invariant(wrapped instanceof Token);
        return wrapped;
    }

    public constructor(chainId: number) {
        if (!isPolygon(chainId)) {
            throw new Error("Not Polygon");
        }
        super({
            chainId,
            decimals: 18,
            symbol: "POL",
            name: "Polygon Ecosystem Token",
            logoURI: "https://coin-images.coingecko.com/coins/images/32440/large/polygon.png",
        });
    }
}

export function isBsc(chainId: number) {
    return chainId === bsc.id;
}

class BscNativeCurrency extends NativeCurrency {
    equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId;
    }

    get wrapped(): Token {
        if (!isBsc(this.chainId)) {
            throw new Error("Not bsc");
        }
        const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
        invariant(wrapped instanceof Token);
        return wrapped;
    }

    public constructor(chainId: number) {
        if (!isBsc(chainId)) {
            throw new Error("Not bsc");
        }
        super({
            chainId,
            decimals: 18,
            name: "BNB",
            symbol: "BNB",
            logoURI: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        });
    }
}

export function isAvalanche(chainId: number) {
    return chainId === avalanche.id;
}

class AvaxNativeCurrency extends NativeCurrency {
    equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId;
    }

    get wrapped(): Token {
        if (!isAvalanche(this.chainId)) {
            throw new Error("Not avalanche");
        }
        const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
        invariant(wrapped instanceof Token);
        return wrapped;
    }

    public constructor(chainId: number) {
        if (!isAvalanche(chainId)) {
            throw new Error("Not avalanche");
        }
        super({
            chainId,
            decimals: 18,
            name: "AVAX",
            symbol: "AVAX",
            logoURI: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/avalanchec/info/logo.png",
        });
    }
}

// function isMonadTestnet(chainId: number) {
//     return chainId === monadTestnet.id;
// }

// can reuse for monad mainnet when we add support
// class MonadTestnetNativeCurrency extends NativeCurrency {
//     equals(other: Currency): boolean {
//         return other.isNative && other.chainId === this.chainId;
//     }
//
//     get wrapped(): Token {
//         if (!isMonadTestnet(this.chainId)) {
//             throw new Error("Not monad testnet");
//         }
//         const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
//         invariant(wrapped instanceof Token);
//         return wrapped;
//     }
//
//     public constructor(chainId: number) {
//         if (!isMonadTestnet(chainId)) {
//             throw new Error("Not monad testnet");
//         }
//         super(chainId, 18, "MON", "MON");
//     }
// }

class ExtendedEther extends NativeCurrency {
    public get wrapped(): Token {
        const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId];
        if (wrapped) {
            return wrapped;
        }
        throw new Error(`Unsupported chain ID: ${this.chainId}`);
    }

    protected constructor(chainId: number) {
        super({ chainId, decimals: 18, symbol: "ETH", name: "Ethereum" });
    }

    private static _cachedExtendedEther: Record<number, NativeCurrency> = {};

    public static onChain(chainId: number): ExtendedEther {
        return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId));
    }

    public equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId;
    }
}

const cachedNativeCurrency: Record<number, NativeCurrency | Token> = {};
export function nativeOnChain(chainId: number): NativeCurrency | Token {
    if (cachedNativeCurrency[chainId]) {
        return cachedNativeCurrency[chainId] as NativeCurrency;
    }
    let nativeCurrency: NativeCurrency | Token;
    if (isPolygon(chainId)) {
        nativeCurrency = new PolygonNativeCurrency(chainId);
    } else if (isCelo(chainId)) {
        nativeCurrency = getCeloNativeCurrency(chainId);
    } else if (isBsc(chainId)) {
        nativeCurrency = new BscNativeCurrency(chainId);
    } else if (isAvalanche(chainId)) {
        nativeCurrency = new AvaxNativeCurrency(chainId);
        // } else if (isMonadTestnet(chainId)) {
        //     nativeCurrency = new MonadTestnetNativeCurrency(chainId);
    } else {
        nativeCurrency = ExtendedEther.onChain(chainId);
    }
    return (cachedNativeCurrency[chainId] = nativeCurrency);
}
