import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { base, baseSepolia, optimism, optimismSepolia, sepolia } from "viem/chains";

import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
import { interopDevnet0, interopDevnet1 } from "../chains/interopDevnet.js";
import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";

export const V4_SWAP = 0x10;

/*** Uniswap Constants ***/
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
/**
 * Get Uniswap contracts using deterministic deployment
 * @param params deploy params such as owner, fee_rate
 * @returns Uniswap contract addresses
 */
export function getUniswapContracts(params?: { owner?: Address }) {
    const permit2: Address = PERMIT2_ADDRESS;
    const unsupported = getDeployDeterministicAddress({
        bytecode: UnsupportedProtocol.bytecode,
        salt: zeroHash,
    });
    const v4PoolManager = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: PoolManager.abi,
            bytecode: PoolManager.bytecode,
            args: [params?.owner ?? zeroAddress],
        }),
        salt: zeroHash,
    });

    const positionDescriptor = zeroAddress;
    const weth9 = zeroAddress;
    const v4PositionManager = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: PositionManager.abi,
            bytecode: PositionManager.bytecode,
            args: [v4PoolManager, permit2, 300_000n, positionDescriptor, weth9],
        }),
        salt: zeroHash,
    });
    const v4StateView = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: StateView.abi,
            bytecode: StateView.bytecode,
            args: [v4PoolManager],
        }),
        salt: zeroHash,
    });
    const v4Quoter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: V4Quoter.abi,
            bytecode: V4Quoter.bytecode,
            args: [v4PoolManager],
        }),
        salt: zeroHash,
    });

    // Universal Router
    const routerParams = {
        permit2,
        weth9: "0x4200000000000000000000000000000000000006",
        v2Factory: unsupported,
        v3Factory: unsupported,
        pairInitCodeHash: zeroHash,
        poolInitCodeHash: zeroHash,
        v4PoolManager,
        v3NFTPositionManager: unsupported,
        v4PositionManager,
    } as const;
    const universalRouter = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: UniversalRouter.abi,
            bytecode: UniversalRouter.bytecode,
            args: [routerParams],
        }),
        salt: zeroHash,
    });

    return {
        v4PoolManager,
        v4PositionManager,
        v4StateView,
        v4Quoter,
        universalRouter,
    };
}

/** Uniswap contracts for local deployment via CREATE2 & salt = bytes32(0) */
export const LOCAL_UNISWAP_CONTRACTS = getUniswapContracts();

/** Uniswap contracts by chain */
export const UNISWAP_CONTRACTS: Record<
    number,
    | {
        v4PoolManager: `0x${string}`;
        v4PositionManager: `0x${string}`;
        v4StateView: `0x${string}`;
        v4Quoter: `0x${string}`;
        universalRouter: `0x${string}`;
    }
    | undefined
> = {
    [opChainL1.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainA.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainB.id]: LOCAL_UNISWAP_CONTRACTS,
    [optimism.id]: {
        v4PoolManager: "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
        v4PositionManager: "0x3C3Ea4B57a46241e54610e5f022E5c45859A1017",
        v4StateView: "0x97337d1C732FC10C809Ac28C6d2D787c8cA2dFC9",
        v4Quoter: "0xCDe42b22b921554558f2257a7D519E27b4140ac1",
        universalRouter: "0x0ad4F5c45F4ad1BcB1c0284dFe9bAb22dC08Dccc",
    },
    [base.id]: {
        v4PoolManager: "0x498581fF718922c3f8e6A244956aF099B2652b2b",
        v4PositionManager: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
        v4StateView: "0x4DA860C1bA78a330391fE9c1106841389F1aEC01",
        v4Quoter: "0x25Ba53B6288B05B099A2771C94EDF593C85a428e",
        universalRouter: "0xC3A4b98A8a279D0c84492c3C76e33Da812daCC2f",
    },
    [sepolia.id]: {
        v4PoolManager: "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543",
        v4PositionManager: "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4",
        v4StateView: "0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C",
        v4Quoter: "0x61B3f2011A92d183C7dbaDBdA940a7555Ccf9227",
        universalRouter: "0x6fc36029136a0c9585306190387597d14f4c80a2",
    },
    [optimismSepolia.id]: {
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0x5e35454eb1b26dd1ce18668d81eacdcb6c38b7d7",
        universalRouter: "0x5fb0c37c53ccf5445ef0bac4eea32da4258d5278",
    },
    [baseSepolia.id]: {
        v4PoolManager: "0xf7F5aB3DcA35e17dE187b459159BC643853B3c67",
        v4PositionManager: "0x0B32f74f8365d535783949E014B7754047B64e31",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0x5e35454eb1b26dd1ce18668d81eacdcb6c38b7d7",
        universalRouter: "0x2a229f4f81d0b9a434584d6ebc2ffa9e30b8d82d",
    },
    // TODO: add when uniswap supports
    // [superseed.id]: {
    //     v4PoolManager: "",
    //     v4PositionManager: "",
    //     v4StateView: "",
    //     v4Quoter: "",
    //     universalRouter: "",
    // },
    [interopDevnet0.id]: {
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0xb1163e279741D353540afF310ffAb329fbd78C08",
        v4StateView: "0x0e603cb829ced810efc69a037335e7566c192959",
        v4Quoter: "0x27fCc8497f32B6D046ed433D633535E59Cf02dc7",
        universalRouter: "0x5e654ADc08b75846bCa12a7FB88eD74309776605",
    },
    [interopDevnet1.id]: {
        v4PoolManager: "0x4e8C56BeC0907f8e70E2341fF28fcfD8589E3a2d",
        v4PositionManager: "0xb1163e279741D353540afF310ffAb329fbd78C08",
        v4StateView: "0xF3c2E547e8da2052E2fC997ee94d54FbE59a6375",
        v4Quoter: "0x27fCc8497f32B6D046ed433D633535E59Cf02dc7",
        universalRouter: "0x5e654ADc08b75846bCa12a7FB88eD74309776605",
    },
} as const;
