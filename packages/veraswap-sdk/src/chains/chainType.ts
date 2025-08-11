import { appchainTestnet } from "./appchainTestnet.js";
import { arbitrum } from "./arbitrum.js";
import { arbitrumSepolia } from "./arbitrumSepolia.js";
import { avalanche } from "./avalanche.js";
import { base } from "./base.js";
import { baseSepolia } from "./baseSepolia.js";
import { bsc } from "./bsc.js";
import { ethereum } from "./ethereum.js";
import { inkSepolia } from "./inkSepolia.js";
import { interopDevnet0, interopDevnet1 } from "./interopDevnet.js";
import { optimism } from "./optimism.js";
import { optimismSepolia } from "./optimismSepolia.js";
import { polygon } from "./polygon.js";
import { rariTestnet } from "./rariTestnet.js";
import { sepolia } from "./sepolia.js";
import { story } from "./story.js";
import { superseed } from "./superseed.js";
import { opChainA, opChainB, opChainL1 } from "./supersim.js";
import { unichainSepolia } from "./unichainSepolia.js";

export const localChains = [opChainL1, opChainA, opChainB];

export const interopDevnetChains = [interopDevnet0, interopDevnet1];

export const mainnetChains = [ethereum, arbitrum, bsc, base, optimism, superseed, polygon, story, avalanche];

export const testnetChains = [
    sepolia,
    optimismSepolia,
    arbitrumSepolia,
    baseSepolia,
    inkSepolia,
    unichainSepolia,
    rariTestnet,
    appchainTestnet,
    ...interopDevnetChains,
];
