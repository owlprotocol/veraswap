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
    rariTestnet,
    appchainTestnet,
} from "@owlprotocol/veraswap-sdk/chains";

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

// TODO: remove later from local chains rari and appchain testnets
export const localChains = [
    opChainL1,
    opChainA,
    opChainB,
    rariTestnet,
    appchainTestnet,
] as const;

export const prodChains = [
    sepolia,
    baseSepolia,
    arbitrumSepolia,
    optimismSepolia,
    inkSepolia,
    unichainSepolia,
    rariTestnet,
    appchainTestnet,
] as const;
