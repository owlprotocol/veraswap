import {
    inkSepolia,
    interopDevnet0,
    interopDevnet1,
    unichainSepolia,
    opChainA,
    opChainB,
    opChainL1,
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
} from "@owlprotocol/veraswap-sdk/chains";

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const localChains = [opChainL1, opChainA, opChainB];

export const prodChains = [
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
    inkSepolia,
    unichainSepolia,
] as const;
