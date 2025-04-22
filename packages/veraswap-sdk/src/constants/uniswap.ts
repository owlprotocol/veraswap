import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { baseSepolia, optimismSepolia, sepolia } from "viem/chains";

import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
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
    {
        v4PoolManager: `0x${string}`;
        v4PositionManager: `0x${string}`;
        v4StateView: `0x${string}`;
        v4Quoter: `0x${string}`;
        universalRouter: `0x${string}`;
    }
> = {
    [opChainL1.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainA.id]: LOCAL_UNISWAP_CONTRACTS,
    [opChainB.id]: LOCAL_UNISWAP_CONTRACTS,
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
} as const;
