import invariant from "tiny-invariant";
import { Address, encodeAbiParameters, Hash, Hex, keccak256, zeroAddress } from "viem";

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

export function getPoolKeyEncoding(poolKey: PoolKey): Hex {
    return encodeAbiParameters([PoolKeyAbi], [poolKey]);
}

export function getPoolId(poolKey: PoolKey): Hash {
    return keccak256(getPoolKeyEncoding(poolKey));
}

export interface PoolKeyOptions {
    fee: number;
    tickSpacing: number;
    hooks: Address;
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
        tickSpacing: 200,
        hooks: zeroAddress,
    },
} satisfies Record<string, PoolKeyOptions>;

/**
 * Create pool key with validation
 * @param poolKey
 */
export function createPoolKey(poolKey: PoolKey): PoolKey {
    invariant(poolKey.currency0 != poolKey.currency1, "poolKey currency0 must be != currency1");
    return {
        ...poolKey,
        currency0: poolKey.currency0 < poolKey.currency1 ? poolKey.currency0 : poolKey.currency1,
        currency1: poolKey.currency0 < poolKey.currency1 ? poolKey.currency1 : poolKey.currency0,
    };
}

export function poolKeyEqual(a: PoolKey, b: PoolKey): boolean {
    return (
        a.currency0 === b.currency0 &&
        a.currency1 === b.currency1 &&
        a.fee === b.fee &&
        a.tickSpacing === b.tickSpacing &&
        a.hooks === b.hooks
    );
}

/**
 * Path Key for multihop quoting
 */
export interface PathKey {
    intermediateCurrency: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
    hookData: Hex;
}

// TODO: Temporary alias for poolKeysToPathExactIn
export const poolKeysToPath = poolKeysToPathExactIn;
/**
 * Convert list of pool keys to a path for multihop quoting
 * @param exactCurrency
 * @param poolKeys
 */
export function poolKeysToPathExactIn(exactCurrency: Address, poolKeys: PoolKey[]): PathKey[] {
    const path: PathKey[] = [];

    let currentCurrency = exactCurrency;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < poolKeys.length; i++) {
        const poolKey = poolKeys[i];
        invariant(
            poolKey.currency0 === currentCurrency || poolKey.currency1 === currentCurrency,
            "Invalid Pool Key for Path",
        );
        // Intermediate currency is whichever isn't current
        const intermediateCurrency = poolKey.currency0 != currentCurrency ? poolKey.currency0 : poolKey.currency1;
        path.push({
            intermediateCurrency,
            fee: poolKey.fee,
            tickSpacing: poolKey.tickSpacing,
            hooks: poolKey.hooks,
            hookData: "0x",
        });
        // Update currentCurrency
        currentCurrency = intermediateCurrency;
    }

    return path;
}

/**
 * Convert list of pool keys to a path for multihop quoting
 * @param exactCurrency
 * @param poolKeys
 */
export function poolKeysToPathExactOut(exactCurrency: Address, poolKeys: PoolKey[]): PathKey[] {
    const path: PathKey[] = [];

    let currentCurrency = exactCurrency;

    for (let i = poolKeys.length; i > 0; i--) {
        const poolKey = poolKeys[i - 1];
        invariant(
            poolKey.currency0 === currentCurrency || poolKey.currency1 === currentCurrency,
            "Invalid Pool Key for Path",
        );
        // Intermediate currency is whichever isn't current
        const intermediateCurrency = poolKey.currency0 != currentCurrency ? poolKey.currency0 : poolKey.currency1;
        path.splice(0, 0, {
            intermediateCurrency,
            fee: poolKey.fee,
            tickSpacing: poolKey.tickSpacing,
            hooks: poolKey.hooks,
            hookData: "0x",
        });
        // Update currentCurrency
        currentCurrency = intermediateCurrency;
    }

    return path;
}

/**
 * Convert a single path key to a pool key
 */
export function pathKeyToPoolKey(pathKey: PathKey, currencyIn: Address): PoolKey {
    return {
        currency0: currencyIn < pathKey.intermediateCurrency ? currencyIn : pathKey.intermediateCurrency,
        currency1: currencyIn < pathKey.intermediateCurrency ? pathKey.intermediateCurrency : currencyIn,
        fee: pathKey.fee,
        tickSpacing: pathKey.tickSpacing,
        hooks: pathKey.hooks,
    };
}

//Not really used rn but nice to have a 1:1 implementation of Solidity logic used in Uniswap
/**
 * Typescript implementation of `PathKeyLibrary.getPoolAndSwapDirection`
 */
export function getPoolAndSwapDirection(
    pathKey: PathKey,
    currencyIn: Address,
): [poolKey: PoolKey, zeroForOne: boolean] {
    const currencyOut = pathKey.intermediateCurrency;
    const [currency0, currency1] = currencyIn < currencyOut ? [currencyIn, currencyOut] : [currencyOut, currencyIn];

    const zeroForOne = currencyIn == currency0;
    const poolKey = {
        currency0,
        currency1,
        fee: pathKey.fee,
        tickSpacing: pathKey.tickSpacing,
        hooks: pathKey.hooks,
    };

    return [poolKey, zeroForOne];
}
