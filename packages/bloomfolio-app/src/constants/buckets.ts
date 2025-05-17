import { DollarSign, Globe, Bitcoin } from "lucide-react";
import { Address } from "viem";
import { base } from "viem/chains";
import { BASE_TOKENS } from "./tokens.js";

export interface BucketAllocation {
    address: Address;
    chainId: number;
    weight: bigint;
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
            { address: BASE_TOKENS[0].address, chainId: base.id, weight: 60n },
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 40n },
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
            { address: BASE_TOKENS[0].address, chainId: base.id, weight: 40n }, // USDC
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 40n }, // ETH
            { address: BASE_TOKENS[2].address, chainId: base.id, weight: 20n }, // cbBTC
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
            { address: BASE_TOKENS[1].address, chainId: base.id, weight: 30n }, // ETH
            { address: BASE_TOKENS[2].address, chainId: base.id, weight: 30n }, // cbBTC
            { address: BASE_TOKENS[3].address, chainId: base.id, weight: 40n }, // LINK
        ],
    },
] as const satisfies Bucket[];
