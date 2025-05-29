import { DollarSign, Rocket, Dog } from "lucide-react";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { base, bsc, polygon } from "viem/chains";
import { opChainL1 } from "@owlprotocol/veraswap-sdk/chains";
import { BasketFixedUnits } from "@owlprotocol/veraswap-sdk/artifacts";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import {
    tokenBAddress,
    tokenAAddress,
    aavePolygonAddress,
    ldoPolygonAddress,
    linkPolygonAddress,
    uniPolygonAddress,
    BSC_TOKENS,
} from "./tokens.js";

export interface BasketAllocation {
    address: Address;
    chainId: number;
}

export interface BasketPercentageAllocation {
    address: Address;
    chainId: number;
    percentage: string;
    weight: number;
    units: bigint;
}

export interface Basket {
    id: string;
    title: string;
    description: string;
    gradient: string;
    icon: any;
    address: Address;
    allocations: BasketAllocation[];
    symbol: string;
}

export const MAINNET_BASKETS = [
    {
        id: "conservative",
        address: "0x7e1228f7113c2F4127D4cC66622578850Fb538F7",
        title: "Conservative BSC",
        description: "Conservative 50/50 allocation to BTC and ETH on BSC.",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: BSC_TOKENS[4].address, chainId: bsc.id },

            // { address: BSC_TOKENS[5].address, chainId: bsc.id},
            { address: BSC_TOKENS[7].address, chainId: bsc.id },
        ],
        symbol: "CB.ETH/BTC.50",
    },
    // TODO: enable again once quoting uses V3. Seems to have issues because of liquidity
    // {
    //     id: "conservative-polygon",
    //     address: "0xEe78aEC0596010a55F3e7f4c8Ad377E5ea5bFA80",
    //     title: "Conservative Polygon",
    //     description: "Conservative 50/50 allocation to BTC and ETH on Polygon.",
    //     gradient: "from-green-400 to-blue-500",
    //     icon: DollarSign,
    //     allocations: [
    //         { address: WETH_POLYGON.address, chainId: polygon.id},
    //
    //         { address: WBTC_POLYGON.address, chainId: polygon.id},
    //     ],
    //     symbol: "CB.ETH/BTC.50",
    // },
    {
        id: "polygon-infra-market-cap",
        address: "0x15C82107170f048D56DFF7831c564389b7501fc8",
        title: "Polygon Infra Basket Market Cap",
        description: "Polygon infrastructure basket allocated by market cap.",
        gradient: "from-purple-400 to-red-500",
        icon: DollarSign,
        allocations: [
            { address: linkPolygonAddress, chainId: polygon.id },
            { address: uniPolygonAddress, chainId: polygon.id },
            { address: ldoPolygonAddress, chainId: polygon.id },
            { address: aavePolygonAddress, chainId: polygon.id },
        ],
        symbol: "PIB.MC",
    },
    {
        id: "khan",
        address: "0xa38A81F01096Bf94FB7D3CAC20Bb479B06e5F17D",
        title: "Emperor Khan Super Special",
        description: "",
        gradient: "from-red-700 to-green-400",
        icon: Rocket,
        allocations: [
            {
                address: "0x1111111111166b7FE7bd91427724B487980aFc69",
                chainId: base.id,
            }, // ZORA
            {
                address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
                chainId: base.id,
            }, // VIRTUAL
            {
                address: "0x98d0baa52b2D063E780DE12F615f963Fe8537553",
                chainId: base.id,
            }, // KAITO
        ],
        symbol: "EKSS",
    },
    // {
    //     id: "balanced",
    //     address: zeroAddress,
    //     title: "Balanced",
    //     description: "Mix of BTCB, and established DeFi tokens.",
    //     gradient: "from-yellow-400 to-orange-500",
    //     icon: Globe,
    //     allocations: [
    //         // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[7].address, chainId: bsc.id, units: 1n},
    //         { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n},
    //     ],
    //     symbol: "",
    // },
    // {
    //     id: "growth",
    //     address: zeroAddress,
    //     title: "Growth",
    //     description: "Higher risk, mix of established and emerging tokens.",
    //     gradient: "from-pink-500 to-purple-600",
    //     icon: Bitcoin,
    //     allocations: [
    //         { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 1n},
    //         { address: BSC_TOKENS[1].address, chainId: bsc.id, units: 20n},
    //         { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 500n},
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 50n},
    //         // { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n},
    //     ],
    //     symbol: "",
    // },
    // {
    //     id: "meme",
    //     address: zeroAddress,
    //     title: "Meme Mania",
    //     description: "High risk, meme coins and viral tokens.",
    //     gradient: "from-red-500 to-pink-500",
    //     icon: Dog,
    //     allocations: [
    //         { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18)},
    //         { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n},
    //         // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n},
    //     ],
    //     symbol: "",
    // },
    // {
    //     id: "defi",
    //     address: zeroAddress,
    //     title: "DeFi Focus",
    //     description: "Concentrated in DeFi protocols and governance tokens.",
    //     gradient: "from-blue-500 to-indigo-600",
    //     icon: Coins,
    //     allocations: [
    //         { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 5n},
    //     ],
    //     symbol: "",
    // },
    // {
    //     id: "moon",
    //     address: zeroAddress,
    //     title: "Moon Shot",
    //     description: "Maximum risk, high potential tokens.",
    //     gradient: "from-purple-600 to-pink-600",
    //     icon: Rocket,
    //     allocations: [
    //         { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 5n},

    //         // { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18)},
    //         { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n},
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: parseUnits("1", 18)},
    //     ],
    //     symbol: "",
    // },
] satisfies Basket[];

const basketAddr0 = tokenAAddress < tokenBAddress ? tokenAAddress : tokenBAddress;
const basketAddr1 = tokenAAddress > tokenBAddress ? tokenAAddress : tokenBAddress;
const basket = [
    { addr: basketAddr0, units: 10n ** 18n },
    { addr: basketAddr1, units: 10n ** 18n },
];

const indexAB50NoFeeAddress = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: BasketFixedUnits.bytecode,
        abi: BasketFixedUnits.abi,
        args: ["Index AB50", "AB50.NF", zeroAddress, 0n, basket],
    }),
    salt: zeroHash,
});

const indexAB50WithFeeAddress = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: BasketFixedUnits.bytecode,
        abi: BasketFixedUnits.abi,
        args: ["Index AB50", "AB50.WF", "0x0000000000000000000000000000000000000001", 10_000n, basket],
    }),
    salt: zeroHash,
});

export const LOCAL_BASKETS = [
    {
        id: "test-0",
        gradient: "from-purple-600 to-pink-600",
        icon: Rocket,
        address: indexAB50NoFeeAddress,
        title: "Index AB50 No Fee",
        description: "Index AB50 No Fee for testing purposes",
        allocations: [
            { address: tokenAAddress, chainId: opChainL1.id },
            { address: tokenBAddress, chainId: opChainL1.id },
        ],
        symbol: "AB50.NF",
    },
    {
        id: "test-1",

        gradient: "from-green-600 to-red-600",
        icon: Dog,
        address: indexAB50WithFeeAddress,
        title: "Index AB50 With Fee",
        description: "Index AB50 With Fee for testing purposes",
        allocations: [
            { address: tokenAAddress, chainId: opChainL1.id },
            { address: tokenBAddress, chainId: opChainL1.id },
        ],
        symbol: "AB50.WF",
    },
] satisfies Basket[];

export const BASKETS = (
    import.meta.env.MODE === "development" ? [...MAINNET_BASKETS, ...LOCAL_BASKETS] : MAINNET_BASKETS
) satisfies Basket[];
