import {
    arbitrum,
    arbitrumNova,
    arbitrumSepolia,
    base,
    baseSepolia,
    bsc,
    bscTestnet,
    mainnet,
    optimism,
    optimismSepolia,
    polygon,
    sepolia,
} from "viem/chains";

export const chainIdToOrbiterChainId = {
    [mainnet.id]: 1,
    [arbitrum.id]: 2,
    [polygon.id]: 6,
    [optimism.id]: 7,
    [bsc.id]: 15,
    [arbitrumNova.id]: 16,
    [base.id]: 21,
    [optimismSepolia.id]: 77,
    [sepolia.id]: 526,
    [baseSepolia.id]: 521,
    [arbitrumSepolia.id]: 525,
    [bscTestnet.id]: 515,
} as const satisfies Record<number, number>;
