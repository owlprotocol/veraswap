import { Address, encodeAbiParameters, keccak256, zeroAddress } from "viem";

export interface PoolKey {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
}

export const PoolKeyAbi = {
    components: [
        { internalType: "address", name: "currency0", type: "address" },
        { internalType: "address", name: "currency1", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
        { internalType: "int24", name: "tickSpacing", type: "int24" },
        { internalType: "address", name: "hooks", type: "address" },
    ],
    internalType: "struct PoolKey",
    type: "tuple",
} as const;

export function getPoolId(poolKey: PoolKey) {
    return keccak256(encodeAbiParameters([PoolKeyAbi], [poolKey]));
}

export const DEFAULT_POOL_PARAMS = {
    FEE_100_TICK_1: {
        fee: 100,
        tickSpacing: 1,
        hooks: zeroAddress,
    },
    FEE_500_TICK_10: {
        fee: 500,
        tickSpacing: 10,
        hooks: zeroAddress,
    },
    FEE_3000_TICK_60: {
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    },
    FEE_10_000_TICK_200: {
        fee: 10_000,
        tickspacing: 200,
        hooks: zeroAddress,
    },
};

/**
 * Create pool key with validation
 * @param poolKey
 */
export function createPoolKey(poolKey: PoolKey): PoolKey {
    return {
        ...poolKey,
        currency0: poolKey.currency0 < poolKey.currency1 ? poolKey.currency0 : poolKey.currency1,
        currency1: poolKey.currency0 < poolKey.currency1 ? poolKey.currency1 : poolKey.currency0,
    };
}
