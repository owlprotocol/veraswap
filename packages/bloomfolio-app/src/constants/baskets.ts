import { DollarSign, Globe, Bitcoin, Rocket, Dog, Coins } from "lucide-react";
import { Address, encodeDeployData, parseUnits, zeroAddress, zeroHash } from "viem";
import { bsc } from "viem/chains";
import { opChainL1 } from "@owlprotocol/veraswap-sdk/chains";
import { BasketFixedUnits } from "@owlprotocol/veraswap-sdk/artifacts";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { BSC_TOKENS, tokenBAddress, tokenAAddress } from "./tokens.js";

export interface BasketAllocation {
    address: Address;
    chainId: number;
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
        address: "0x9066f3d5202181d5838a74ff468d88a6b473d99a",
        title: "Conservative",
        description: "Conservative 50/50 allocation to BTC and ETH.",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: BSC_TOKENS[4].address, chainId: bsc.id, weight: 50, units: 40n }, // WETH

            // { address: BSC_TOKENS[5].address, chainId: bsc.id, weight: 40, units: parseUnits("0.01", 18) }, // WBNB
            { address: BSC_TOKENS[7].address, chainId: bsc.id, weight: 50, units: 1n }, // BTCB
        ],
        symbol: "CB.ETH/BTC.50",
    },
    {
        id: "balanced",
        address: zeroAddress,
        title: "Balanced",
        description: "Mix of BTCB, and established DeFi tokens.",
        gradient: "from-yellow-400 to-orange-500",
        icon: Globe,
        allocations: [
            // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n, weight: 30 }, // WBNB
            { address: BSC_TOKENS[7].address, chainId: bsc.id, units: 1n, weight: 30 }, // BTCB
            { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n, weight: 20 }, // UNI
            { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n, weight: 20 }, // AAVE
        ],
        symbol: "",
    },
    {
        id: "growth",
        address: zeroAddress,
        title: "Growth",
        description: "Higher risk, mix of established and emerging tokens.",
        gradient: "from-pink-500 to-purple-600",
        icon: Bitcoin,
        allocations: [
            { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 1n, weight: 25 }, // SOL
            { address: BSC_TOKENS[1].address, chainId: bsc.id, units: 20n, weight: 25 }, // LINK
            { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 500n, weight: 20 }, // 1INCH
            { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 50n, weight: 15 }, // CAKE
            // { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 15 }, // DOGE
        ],
        symbol: "",
    },
    {
        id: "meme",
        address: zeroAddress,
        title: "Meme Mania",
        description: "High risk, meme coins and viral tokens.",
        gradient: "from-red-500 to-pink-500",
        icon: Dog,
        allocations: [
            { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 40 }, // PEPE
            { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 40 }, // DOGE
            // { address: BSC_TOKENS[5].address, chainId: bsc.id, units: 5n, weight: 20 }, // WBNB
        ],
        symbol: "",
    },
    {
        id: "defi",
        address: zeroAddress,
        title: "DeFi Focus",
        description: "Concentrated in DeFi protocols and governance tokens.",
        gradient: "from-blue-500 to-indigo-600",
        icon: Coins,
        allocations: [
            { address: BSC_TOKENS[2].address, chainId: bsc.id, units: 5n, weight: 30 }, // UNI
            { address: BSC_TOKENS[3].address, chainId: bsc.id, units: 5n, weight: 30 }, // AAVE
            { address: BSC_TOKENS[6].address, chainId: bsc.id, units: 5n, weight: 25 }, // 1INCH
            { address: BSC_TOKENS[9].address, chainId: bsc.id, units: 5n, weight: 15 }, // CAKE
        ],
        symbol: "",
    },
    {
        id: "moon",
        address: zeroAddress,
        title: "Moon Shot",
        description: "Maximum risk, high potential tokens.",
        gradient: "from-purple-600 to-pink-600",
        icon: Rocket,
        allocations: [
            { address: BSC_TOKENS[0].address, chainId: bsc.id, units: 5n, weight: 30 }, // SOL

            // { address: BSC_TOKENS[8].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 30 }, // PEPE
            { address: BSC_TOKENS[10].address, chainId: bsc.id, units: 5n, weight: 20 }, // DOGE
            { address: BSC_TOKENS[9].address, chainId: bsc.id, units: parseUnits("1", 18), weight: 20 }, // CAKE
        ],
        symbol: "",
    },
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
            { address: tokenAAddress, chainId: opChainL1.id, weight: 50, units: 1n },
            { address: tokenBAddress, chainId: opChainL1.id, weight: 50, units: 1n },
        ],
        symbol: "AB50.WF",
    },
] satisfies Basket[];

export const BASKETS = (
    import.meta.env.MODE === "development" ? [...MAINNET_BASKETS, ...LOCAL_BASKETS] : MAINNET_BASKETS
) satisfies Basket[];
