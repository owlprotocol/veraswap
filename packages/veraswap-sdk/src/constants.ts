import { zeroAddress, zeroHash, encodeDeployData } from "viem";
import { getDeployDeterministicAddress } from "@owlprotocol/create-deterministic";
import { type ChainMap, type ChainMetadata } from "@hyperlane-xyz/sdk";

import {
    UnsupportedProtocol,
    PoolManager,
    PositionManager,
    UniversalRouter,
    V4Quoter,
    StateView,
    MockERC20,
} from "./artifacts/index.js";
import { HyperlaneRegistry } from "./types/index.js";

export const MAX_UINT_256 = 2n ** 256n - 1n;
export const MAX_UINT_160 = 2n ** 160n - 1n;
export const MAX_UINT_48 = 2 ** 48 - 1;
export const V4_SWAP = 0x10;

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const UNSUPPORTED_PROTOCOL = getDeployDeterministicAddress({
    bytecode: UnsupportedProtocol.bytecode,
    salt: zeroHash,
});
export const POOL_MANAGER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: PoolManager.bytecode,
        abi: PoolManager.abi,
        args: [zeroAddress],
    }),
    salt: zeroHash,
});
export const POSITION_MANAGER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: PositionManager.bytecode,
        abi: PositionManager.abi,
        args: [POOL_MANAGER, PERMIT2_ADDRESS, 300_000n, zeroAddress, zeroAddress],
    }),
    salt: zeroHash,
});
export const UNIVERSAL_ROUTER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: UniversalRouter.bytecode,
        abi: UniversalRouter.abi,
        args: [
            {
                permit2: PERMIT2_ADDRESS,
                weth9: zeroAddress,
                v2Factory: zeroAddress,
                v3Factory: zeroAddress,
                pairInitCodeHash: zeroHash,
                poolInitCodeHash: zeroHash,
                v4PoolManager: POOL_MANAGER,
                v3NFTPositionManager: zeroAddress,
                v4PositionManager: POSITION_MANAGER,
            },
        ],
    }),
    salt: zeroHash,
});
export const QUOTER = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: V4Quoter.bytecode,
        abi: V4Quoter.abi,
        args: [POOL_MANAGER],
    }),
    salt: zeroHash,
});
export const STATE_VIEW = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: StateView.bytecode,
        abi: StateView.abi,
        args: [POOL_MANAGER],
    }),
    salt: zeroHash,
});
export const MOCK_A = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["MockA", "A", 18],
    }),
    salt: zeroHash,
});
export const MOCK_B = getDeployDeterministicAddress({
    bytecode: encodeDeployData({
        bytecode: MockERC20.bytecode,
        abi: MockERC20.abi,
        args: ["MockB", "B", 18],
    }),
    salt: zeroHash,
});

export const UNISWAP_CONTRACTS = {
    [1337]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
    [1338]: {
        UNSUPPORTED_PROTOCOL,
        POOL_MANAGER,
        POSITION_MANAGER,
        UNIVERSAL_ROUTER,
        QUOTER,
        STATE_VIEW,
    },
} as const;

export const MOCK_TOKENS = {
    [1337]: {
        MOCK_A,
        MOCK_B,
    },
    [1338]: {
        MOCK_A,
        MOCK_B,
    },
} as const;

export const MOCK_POOLS = {
    [1337]: {
        currency0:
            MOCK_TOKENS[1337].MOCK_A < MOCK_TOKENS[1337].MOCK_B ? MOCK_TOKENS[1337].MOCK_A : MOCK_TOKENS[1337].MOCK_B,
        currency1:
            MOCK_TOKENS[1337].MOCK_A < MOCK_TOKENS[1337].MOCK_B ? MOCK_TOKENS[1337].MOCK_B : MOCK_TOKENS[1337].MOCK_A,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
    [1338]: {
        currency0:
            MOCK_TOKENS[1338].MOCK_A < MOCK_TOKENS[1338].MOCK_B ? MOCK_TOKENS[1338].MOCK_A : MOCK_TOKENS[1338].MOCK_B,
        currency1:
            MOCK_TOKENS[1338].MOCK_A < MOCK_TOKENS[1338].MOCK_B ? MOCK_TOKENS[1338].MOCK_B : MOCK_TOKENS[1338].MOCK_A,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
};

console.debug(UNISWAP_CONTRACTS);
console.debug(MOCK_TOKENS);

// TODO: Fix values
export const testHyperlaneRegistry: HyperlaneRegistry = {
    metadata: {
        "localhost-1337": {
            chainId: 1337,
            name: "localhost-1337",
        } as ChainMetadata,
        "localhost-1338": {
            chainId: 1338,
            name: "localhost-1338",
        } as ChainMetadata,
    } as ChainMap<ChainMetadata>,
    addresses: {
        "localhost-1337": {
            mailbox: "0x8794e76f46289f1F8C433cCe4259C455335346aa",
        },
        "localhost-1338": {
            mailbox: "0x1e8fC27Af09d117Df6B931433e29fCF6463f3a95",
        },
    },
};
