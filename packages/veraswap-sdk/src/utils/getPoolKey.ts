import { Address, zeroAddress } from "viem";
import { POOLS } from "../constants.js";
import { PoolKey } from "../types/PoolKey.js";

export function getPoolKey(chainId: number, tokenIn: Address, tokenOut: Address): PoolKey {
    const pools = POOLS[chainId];
    const curr0 = tokenIn < tokenOut ? tokenIn : tokenOut;
    const curr1 = tokenIn < tokenOut ? tokenOut : tokenIn;

    if (!pools) {
        return {
            currency0: curr0,
            currency1: curr1,
            fee: 3_000,
            tickSpacing: 60,
            hooks: zeroAddress,
        };
    }

    const existingPool = pools.find((pool: PoolKey) => {
        const { currency0, currency1 } = pool;
        return currency0 === curr0 && currency1 === curr1;
    });

    if (existingPool) {
        return existingPool;
    }

    return {
        currency0: curr0,
        currency1: curr1,
        fee: 3000,
        tickSpacing: 60,
        hooks: zeroAddress,
    };
}
