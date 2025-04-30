import { arbitrum } from "./arbitrum.js";
import { arbitrumSepolia } from "./arbitrumSepolia.js";
import { base } from "./base.js";
import { baseSepolia } from "./baseSepolia.js";
import { bsc } from "./bsc.js";
import { inkSepolia } from "./inkSepolia.js";
import { interopDevnet0, interopDevnet1 } from "./interopDevnet.js";
import { optimism } from "./optimism.js";
import { optimismSepolia } from "./optimismSepolia.js";
import { sepolia } from "./sepolia.js";
import { superseed } from "./superseed.js";
import { opChainA, opChainB, opChainL1 } from "./supersim.js";
import { unichainSepolia } from "./unichainSepolia.js";

export const localChains = [opChainL1, opChainA, opChainB];

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const mainnetChains = [arbitrum, bsc, base, optimism, superseed];

export const testnetChains = [
    sepolia,
    optimismSepolia,
    arbitrumSepolia,
    baseSepolia,
    inkSepolia,
    unichainSepolia,
    ...interopDevnetChains,
];
