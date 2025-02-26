export const getFeeGrowthGlobals = {
    type: "function",
    name: "getFeeGrowthGlobals",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
    outputs: [
        { name: "feeGrowthGlobal0", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthGlobal1", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getFeeGrowthInside = {
    type: "function",
    name: "getFeeGrowthInside",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
    ],
    outputs: [
        { name: "feeGrowthInside0X128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthInside1X128", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getLiquidity = {
    type: "function",
    name: "getLiquidity",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
    outputs: [{ name: "liquidity", type: "uint128", internalType: "uint128" }],
    stateMutability: "view",
} as const;
export const getPositionInfo = {
    type: "function",
    name: "getPositionInfo",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "positionId", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [
        { name: "liquidity", type: "uint128", internalType: "uint128" },
        { name: "feeGrowthInside0LastX128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthInside1LastX128", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getPositionInfo_bytes32_address_int24_int24_bytes32 = {
    type: "function",
    name: "getPositionInfo",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "owner", type: "address", internalType: "address" },
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
        { name: "salt", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [
        { name: "liquidity", type: "uint128", internalType: "uint128" },
        { name: "feeGrowthInside0LastX128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthInside1LastX128", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getPositionLiquidity = {
    type: "function",
    name: "getPositionLiquidity",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "positionId", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "liquidity", type: "uint128", internalType: "uint128" }],
    stateMutability: "view",
} as const;
export const getSlot0 = {
    type: "function",
    name: "getSlot0",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
    outputs: [
        { name: "sqrtPriceX96", type: "uint160", internalType: "uint160" },
        { name: "tick", type: "int24", internalType: "int24" },
        { name: "protocolFee", type: "uint24", internalType: "uint24" },
        { name: "lpFee", type: "uint24", internalType: "uint24" },
    ],
    stateMutability: "view",
} as const;
export const getTickBitmap = {
    type: "function",
    name: "getTickBitmap",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "tick", type: "int16", internalType: "int16" },
    ],
    outputs: [{ name: "tickBitmap", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const getTickFeeGrowthOutside = {
    type: "function",
    name: "getTickFeeGrowthOutside",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "tick", type: "int24", internalType: "int24" },
    ],
    outputs: [
        { name: "feeGrowthOutside0X128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthOutside1X128", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getTickInfo = {
    type: "function",
    name: "getTickInfo",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "tick", type: "int24", internalType: "int24" },
    ],
    outputs: [
        { name: "liquidityGross", type: "uint128", internalType: "uint128" },
        { name: "liquidityNet", type: "int128", internalType: "int128" },
        { name: "feeGrowthOutside0X128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthOutside1X128", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const getTickLiquidity = {
    type: "function",
    name: "getTickLiquidity",
    inputs: [
        { name: "poolId", type: "bytes32", internalType: "PoolId" },
        { name: "tick", type: "int24", internalType: "int24" },
    ],
    outputs: [
        { name: "liquidityGross", type: "uint128", internalType: "uint128" },
        { name: "liquidityNet", type: "int128", internalType: "int128" },
    ],
    stateMutability: "view",
} as const;
export const poolManager = {
    type: "function",
    name: "poolManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPoolManager" }],
    stateMutability: "view",
} as const;
export const functions = [
    getFeeGrowthGlobals,
    getFeeGrowthInside,
    getLiquidity,
    getPositionInfo,
    getPositionInfo_bytes32_address_int24_int24_bytes32,
    getPositionLiquidity,
    getSlot0,
    getTickBitmap,
    getTickFeeGrowthOutside,
    getTickInfo,
    getTickLiquidity,
    poolManager,
] as const;
export const events = [] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IStateView = {
    abi,
};
