import { Address, zeroAddress } from "viem";
import { POOLS } from "../constants.js";
import { PoolKey } from "../types/PoolKey.js";

export function getPoolKey(chainId: number, tokenIn: Address, tokenOut: Address): PoolKey {
    const pools = POOLS[chainId];
    const currency0 = tokenIn < tokenOut ? tokenIn : tokenOut;
    const currency1 = tokenIn < tokenOut ? tokenOut : tokenIn;

    if (!pools) {
        return {
            currency0,
            currency1,
            fee: 3_000,
            tickSpacing: 60,
            hooks: zeroAddress,
        };
    }

    const existingPool = pools.find((pool: PoolKey) => {
        return pool.currency0 === currency0 && pool.currency1 === currency1;
    });

    if (existingPool) {
        return existingPool;
    }

    return {
        currency0,
        currency1,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    };
}
