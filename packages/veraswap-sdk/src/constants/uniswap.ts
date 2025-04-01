import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";

import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { opChainA, opChainB, opChainL1 } from "../chains/supersim.js";
import { arbitrum, arbitrumSepolia, base, bsc, mainnet, sepolia } from "viem/chains";

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
    [mainnet.id]: {
        v4PoolManager: "0x000000000004444c5dc75cB358380D2e3dE08A90",
        v4PositionManager: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
        v4StateView: "0x7ffe42c4a5deea5b0fec41c94c136cf115597227",
        v4Quoter: "0x52f0e24d1c21c8a0cb1e5a5dd6198556bd9e1203",
        universalRouter: "0x66a9893cc07d91d95644aedd05d03f95e1dba8af",
    },
    [bsc.id]: {
        v4PoolManager: "0x28e2ea090877bf75740558f6bfb36a5ffee9e9df",
        v4PositionManager: "0x7a4a5c919ae2541aed11041a1aeee68f1287f95b",
        v4StateView: "0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4",
        v4Quoter: "0x9f75dd27d6664c475b90e105573e550ff69437b0",
        universalRouter: "0x1906c1d672b88cd1b9ac7593301ca990f94eae07",
    },
    [base.id]: {
        v4PoolManager: "0x498581ff718922c3f8e6a244956af099b2652b2b",
        v4PositionManager: "0x7c5f5a4bbd8fd63184577525326123b519429bdc",
        v4StateView: "0xa3c0c9b65bad0b08107aa264b0f3db444b867a71",
        v4Quoter: "0x0d5e0f971ed27fbff6c2837bf31316121532048d",
        universalRouter: "0x6ff5693b99212da76ad316178a184ab56d299b43",
    },
    [arbitrum.id]: {
        v4PoolManager: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
        v4PositionManager: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
        v4StateView: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990",
        v4Quoter: "0x3972c00f7ed4885e145823eb7c655375d275a1c5",
        universalRouter: "0xa51afafe0263b40edaef0df8781ea9aa03e381a3",
    },
    [sepolia.id]: {
        v4PoolManager: "0x6aa638fe70021cf4a9ce34c2e7718b99d4360efd",
        v4PositionManager: "0x97b4242a6cde1437e7c8b3e79f3f2e99cf90899a",
        v4StateView: "0xc3e8977ebab56512e16194ee84a895b15987fb22",
        v4Quoter: "0x97a52483ebc89e1e5ef69df01f3f01142e03e192",
        universalRouter: "0x8c082e9cba8b2f1171ef12a31e02a8fe99f1db43",
    },
    [arbitrumSepolia.id]: {
        v4PoolManager: "0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317",
        v4PositionManager: "0xAc631556d3d4019C95769033B5E719dD77124BAc",
        v4StateView: "0x9d467fa9062b6e9b1a46e26007ad82db116c67cb",
        v4Quoter: "0x7de51022d70a725b508085468052e25e22b5c4c9",
        universalRouter: "0xefd1d4bd4cf1e86da286bb4cb1b8bced9c10ba47",
    },
} as const;
