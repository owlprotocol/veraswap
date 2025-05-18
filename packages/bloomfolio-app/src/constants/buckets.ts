import { DollarSign, Globe, Bitcoin, Rocket, TrendingUp, Dog, Sparkles, Coins } from "lucide-react";
import { Address } from "viem";
import { bsc } from "viem/chains";
import { BSC_TOKENS } from "./tokens.js";

export interface BucketAllocation {
    address: Address;
    chainId: number;
    weight: number;
}

export interface Bucket {
    id: string;
    title: string;
    description: string;
    riskLevel: "Low" | "Medium" | "High";
    gradient: string;
    icon: any;
    allocations: BucketAllocation[];
}

export const BUCKETS = [
    {
        id: "conservative",
        title: "Conservative",
        description: "Low risk, mostly stablecoins, WBNB, and BTCB.",
        riskLevel: "Low",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: BSC_TOKENS[4].address, chainId: bsc.id, weight: 30 }, // WETH
            { address: BSC_TOKENS[5].address, chainId: bsc.id, weight: 40 }, // WBNB
            { address: BSC_TOKENS[7].address, chainId: bsc.id, weight: 30 }, // BTCB
        ],
    },
    {
        id: "balanced",
        title: "Balanced",
        description: "Mix of WBNB, BTCB, and established DeFi tokens.",
        riskLevel: "Medium",
        gradient: "from-yellow-400 to-orange-500",
        icon: Globe,
        allocations: [
            { address: BSC_TOKENS[5].address, chainId: bsc.id, weight: 30 }, // WBNB
            { address: BSC_TOKENS[7].address, chainId: bsc.id, weight: 30 }, // BTCB
            { address: BSC_TOKENS[2].address, chainId: bsc.id, weight: 20 }, // UNI
            { address: BSC_TOKENS[3].address, chainId: bsc.id, weight: 20 }, // AAVE
        ],
    },
    {
        id: "growth",
        title: "Growth",
        description: "Higher risk, mix of established and emerging tokens.",
        riskLevel: "High",
        gradient: "from-pink-500 to-purple-600",
        icon: Bitcoin,
        allocations: [
            { address: BSC_TOKENS[0].address, chainId: bsc.id, weight: 25 }, // SOL
            { address: BSC_TOKENS[1].address, chainId: bsc.id, weight: 25 }, // LINK
            { address: BSC_TOKENS[6].address, chainId: bsc.id, weight: 20 }, // 1INCH
            { address: BSC_TOKENS[9].address, chainId: bsc.id, weight: 15 }, // CAKE
            { address: BSC_TOKENS[10].address, chainId: bsc.id, weight: 15 }, // DOGE
        ],
    },
    {
        id: "meme",
        title: "Meme Mania",
        description: "High risk, meme coins and viral tokens.",
        riskLevel: "High",
        gradient: "from-red-500 to-pink-500",
        icon: Dog,
        allocations: [
            { address: BSC_TOKENS[8].address, chainId: bsc.id, weight: 40 }, // PEPE
            { address: BSC_TOKENS[10].address, chainId: bsc.id, weight: 40 }, // DOGE
            { address: BSC_TOKENS[5].address, chainId: bsc.id, weight: 20 }, // WBNB
        ],
    },
    {
        id: "defi",
        title: "DeFi Focus",
        description: "Concentrated in DeFi protocols and governance tokens.",
        riskLevel: "Medium",
        gradient: "from-blue-500 to-indigo-600",
        icon: Coins,
        allocations: [
            { address: BSC_TOKENS[2].address, chainId: bsc.id, weight: 30 }, // UNI
            { address: BSC_TOKENS[3].address, chainId: bsc.id, weight: 30 }, // AAVE
            { address: BSC_TOKENS[6].address, chainId: bsc.id, weight: 25 }, // 1INCH
            { address: BSC_TOKENS[9].address, chainId: bsc.id, weight: 15 }, // CAKE
        ],
    },
    {
        id: "moon",
        title: "Moon Shot",
        description: "Maximum risk, high potential tokens.",
        riskLevel: "High",
        gradient: "from-purple-600 to-pink-600",
        icon: Rocket,
        allocations: [
            { address: BSC_TOKENS[0].address, chainId: bsc.id, weight: 30 }, // SOL
            { address: BSC_TOKENS[8].address, chainId: bsc.id, weight: 30 }, // PEPE
            { address: BSC_TOKENS[10].address, chainId: bsc.id, weight: 20 }, // DOGE
            { address: BSC_TOKENS[9].address, chainId: bsc.id, weight: 20 }, // CAKE
        ],
    },
] as const satisfies Bucket[];
