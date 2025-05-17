import { DollarSign, Globe, Bitcoin } from "lucide-react";
import { Address } from "viem";
import { MAINNET_TOKENS } from "./tokens.js";

export interface Bucket {
    id: string;
    title: string;
    description: string;
    riskLevel: "Low" | "Medium" | "High";
    gradient: string;
    icon: any;
    allocations: { address: Address; chainId: number; weight: bigint }[];
}

export const BUCKETS = [
    {
        id: "conservative",
        title: "Conservative",
        description: "Low risk, mostly stablecoins and ETH.",
        riskLevel: "Low",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: MAINNET_TOKENS[0].address, chainId: 1, weight: 60n },
            { address: MAINNET_TOKENS[1].address, chainId: 1, weight: 40n },
        ],
    },
    {
        id: "balanced",
        title: "Balanced",
        description: "Mix of stablecoins, ETH, and some BTC.",
        riskLevel: "Medium",
        gradient: "from-yellow-400 to-orange-500",
        icon: Globe,
        allocations: [
            { address: MAINNET_TOKENS[0].address, chainId: 1, weight: 40n }, // USDC
            { address: MAINNET_TOKENS[1].address, chainId: 1, weight: 40n }, // ETH
            { address: MAINNET_TOKENS[2].address, chainId: 1, weight: 20n }, // WBTC
        ],
    },
    {
        id: "growth",
        title: "Growth",
        description: "Higher risk, more alts and BTC.",
        riskLevel: "High",
        gradient: "from-pink-500 to-purple-600",
        icon: Bitcoin,
        allocations: [
            { address: MAINNET_TOKENS[1].address, chainId: 1, weight: 30n }, // ETH
            { address: MAINNET_TOKENS[2].address, chainId: 1, weight: 30n }, // WBTC
            { address: MAINNET_TOKENS[3].address, chainId: 1, weight: 40n }, // LINK
        ],
    },
] as const satisfies Bucket[];
