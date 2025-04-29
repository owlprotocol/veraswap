import { Address } from "viem";

import { createPoolKey, DEFAULT_POOL_PARAMS, PoolKey, PoolKeyOptions } from "../types/PoolKey.js";

/**
 * Get all pool keys for 2 tokens & a list of options
 */
export function getPoolKeysForOptions(
    currencyA: Address,
    currencyB: Address,
    options: PoolKeyOptions[] = Object.values(DEFAULT_POOL_PARAMS),
): PoolKey[] {
    return options.map((option) => createPoolKey({ currency0: currencyA, currency1: currencyB, ...option }));
}
