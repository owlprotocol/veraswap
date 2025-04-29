import { Address, encodeAbiParameters, keccak256 } from "viem";

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

/**
 * Create pool key with validation
 * @param poolKey
 */
export function createPoolKey(
    poolKey: Omit<PoolKey, "tickSpacing" | "fee"> &
        ({ tickSpacing?: number; fee: 100 | 500 | 3000 | 10000 } | { tickSpacing: number; fee: number }),
): PoolKey {
    let tickSpacing = poolKey.tickSpacing;
    if (!poolKey.tickSpacing) {
        if (poolKey.fee === 100) {
            tickSpacing = 1;
        } else if (poolKey.fee === 500) {
            tickSpacing = 10;
        } else if (poolKey.fee === 3000) {
            tickSpacing = 60;
        } else if (poolKey.fee === 10000) {
            tickSpacing = 200;
        } else {
            throw new Error("Invalid fee without tick spacing");
        }
    }

    return {
        ...poolKey,
        tickSpacing: tickSpacing!,
        currency0: poolKey.currency0 < poolKey.currency1 ? poolKey.currency0 : poolKey.currency1,
        currency1: poolKey.currency0 < poolKey.currency1 ? poolKey.currency1 : poolKey.currency0,
    };
}
