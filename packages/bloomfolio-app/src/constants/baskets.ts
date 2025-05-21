import { DollarSign, Rocket, Dog } from "lucide-react";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { base, bsc, polygon } from "viem/chains";
import { opChainL1 } from "@owlprotocol/veraswap-sdk/chains";
import { BasketFixedUnits } from "@owlprotocol/veraswap-sdk/artifacts";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { WBTC_POLYGON, WETH_POLYGON } from "@owlprotocol/veraswap-sdk";
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
    weight: number;
    units: bigint;
}

export interface BasketPercentageAllocation {
    address: Address;
    chainId: number;
    percentage: string;
    weight: number;
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
        address: "0x9066f3d5202181d5838a74ff468d88a6b473d99a",
        title: "Conservative BSC",
        description: "Conservative 50/50 allocation to BTC and ETH on BSC.",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: BSC_TOKENS[4].address, chainId: bsc.id, weight: 50, units: 40n }, // WETH

            // { address: BSC_TOKENS[5].address, chainId: bsc.id, weight: 40, units: 5n }, // WBNB
            { address: BSC_TOKENS[7].address, chainId: bsc.id, weight: 50, units: 1n }, // BTCB
        ],
        symbol: "CB.ETH/BTC.50",
    },
    {
        id: "conservative-polygon",
        address: "0xeDb81715d649D07852f9C10B05aAC7e87b898c32",
        title: "Conservative Polygon",
        description: "Conservative 50/50 allocation to BTC and ETH on Polygon.",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: WETH_POLYGON.address, chainId: polygon.id, weight: 50, units: 40n }, // WETH

            { address: WBTC_POLYGON.address, chainId: polygon.id, weight: 50, units: 1n }, // WBTC
        ],
        symbol: "CB.ETH/BTC.50",
    },
    {
        id: "polygon-infra-market-cap",
        address: "0x5516234F75f184205396F2cA854ee7c2Ae367252",
        title: "Polyong Infra Basket Market Cap",
        description: "Polygon infrastructure basket allocated with market cap weights.",
        gradient: "from-purple-400 to-red-500",
        icon: DollarSign,
        allocations: [
            { address: linkPolygonAddress, chainId: polygon.id, weight: 55, units: 1000n },
            { address: uniPolygonAddress, chainId: polygon.id, weight: 20, units: 1000n },
            { address: ldoPolygonAddress, chainId: polygon.id, weight: 20, units: 7000n },
            { address: aavePolygonAddress, chainId: polygon.id, weight: 5, units: 6n },
        ],
        symbol: "PIB.MC",
    },
    {
        id: "khan",
        address: "0xd6dc30f62e6ddf44f890e6bc9be48ddc9302f685",
        title: "Emperor Khan Super Special",
        description: "",
        gradient: "from-red-700 to-green-400",
        icon: Rocket,
        allocations: [
            { address: "0x1111111111166b7FE7bd91427724B487980aFc69", chainId: base.id, units: 1000n, weight: 3449 }, // ZORA
            { address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", chainId: base.id, units: 5n, weight: 3354 }, // VIRTUAL
            { address: "0x98d0baa52b2D063E780DE12F615f963Fe8537553", chainId: base.id, units: 5n, weight: 3198 }, // KAITO
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
    //         // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n, weight: 30 }, // WBNB
    //         { address: BSC_TOKENS[7].address, chainId: bsc.id, units: 1n, weight: 30 }, // BTCB
    //         { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n, weight: 20 }, // UNI
    //         { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n, weight: 20 }, // AAVE
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
    //         { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 1n, weight: 25 }, // SOL
    //         { address: BSC_TOKENS[1].address, chainId: bsc.id, units: 20n, weight: 25 }, // LINK
    //         { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 500n, weight: 20 }, // 1INCH
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 50n, weight: 15 }, // CAKE
    //         // { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 15 }, // DOGE
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
    //         { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 40 }, // PEPE
    //         { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 40 }, // DOGE
    //         // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n, weight: 20 }, // WBNB
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
    //         { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n, weight: 30 }, // UNI
    //         { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n, weight: 30 }, // AAVE
    //         { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 5n, weight: 25 }, // 1INCH
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 5n, weight: 15 }, // CAKE
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
    //         { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 5n, weight: 30 }, // SOL

    //         // { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 30 }, // PEPE
    //         { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 20 }, // DOGE
    //         { address: BSC_TOKENS[9].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 20 }, // CAKE
    //     ],
    //     symbol: "",
    // },
] satisfies Basket[];

const basketAddr0 = tokenAAddress < tokenBAddress ? tokenAAddress : tokenBAddress;
const basketAddr1 = tokenAAddress > tokenBAddress ? tokenAAddress : tokenBAddress;
const basket = [
    { addr: basketAddr0, units: 1n },
    { addr: basketAddr1, units: 1n },
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
            { address: tokenAAddress, chainId: opChainL1.id, weight: 50, units: 1n },
            { address: tokenBAddress, chainId: opChainL1.id, weight: 50, units: 1n },
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
            { address: tokenAAddress, chainId: opChainL1.id, weight: 50, units: 2n },
            { address: tokenBAddress, chainId: opChainL1.id, weight: 50, units: 2n },
        ],
        symbol: "AB50.WF",
    },
] satisfies Basket[];

export const BASKETS = (
    import.meta.env.MODE === "development" ? [...MAINNET_BASKETS, ...LOCAL_BASKETS] : MAINNET_BASKETS
) satisfies Basket[];
