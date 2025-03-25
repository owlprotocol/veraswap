import { Address, encodeDeployData, zeroAddress, zeroHash } from "viem";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";

import { UnsupportedProtocol } from "../artifacts/UnsupportedProtocol.js";
import { PoolManager } from "../artifacts/PoolManager.js";
import { PositionManager } from "../artifacts/PositionManager.js";
import { StateView } from "../artifacts/StateView.js";
import { V4Quoter } from "../artifacts/V4Quoter.js";
import { UniversalRouterApprovedReentrant as UniversalRouter } from "../artifacts/UniversalRouterApprovedReentrant.js";

/*** Uniswap Constants ***/

/**
 * Get Uniswap contracts using deterministic deployment
 * @param params deploy params such as owner, fee_rate
 * @returns Uniswap contract addresses
 */
export function getUniswapContracts(params?: { owner?: Address }) {
    const permit2: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
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
    const router = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: UniversalRouter.abi,
            bytecode: UniversalRouter.bytecode,
            args: [routerParams],
        }),
        salt: zeroHash,
    });

    return {
        permit2,
        unsupported,
        v4PoolManager,
        v4PositionManager,
        v4StateView,
        v4Quoter,
        router,
    };
}

// For default local deployment with anvil(0) address
export const LOCAL_UNISWAP_CONTRACTS = getUniswapContracts();
