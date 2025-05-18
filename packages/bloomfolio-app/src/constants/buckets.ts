import { DollarSign, Globe, Bitcoin } from "lucide-react";
import { Address } from "viem";
import { base } from "viem/chains";
import { BASE_TOKENS } from "./tokens.js";

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
        description: "Low risk, mostly stablecoins and ETH.",
        riskLevel: "Low",
        gradient: "from-green-400 to-blue-500",
        icon: DollarSign,
        allocations: [
            { address: BASE_TOKENS[0].address, chainId: base.id, weight: 60 },
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 40 },
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
            { address: BASE_TOKENS[0].address, chainId: base.id, weight: 40 }, // USDC
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 40 }, // ETH
            { address: BASE_TOKENS[2].address, chainId: base.id, weight: 20 }, // cbBTC
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
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 30 }, // ETH
            { address: BASE_TOKENS[2].address, chainId: base.id, weight: 30 }, // cbBTC
            { address: BASE_TOKENS[3].address, chainId: base.id, weight: 40 }, // LINK
        ],
    },
] as const satisfies Bucket[];
