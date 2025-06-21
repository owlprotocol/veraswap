export const burn = {
    type: "function",
    name: "burn",
    inputs: [
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
        { name: "amount", type: "uint128", internalType: "uint128" },
    ],
    outputs: [
        { name: "amount0", type: "uint256", internalType: "uint256" },
        { name: "amount1", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const collect = {
    type: "function",
    name: "collect",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
        { name: "amount0Requested", type: "uint128", internalType: "uint128" },
        { name: "amount1Requested", type: "uint128", internalType: "uint128" },
    ],
    outputs: [
        { name: "amount0", type: "uint128", internalType: "uint128" },
        { name: "amount1", type: "uint128", internalType: "uint128" },
    ],
    stateMutability: "nonpayable",
} as const;
export const collectProtocol = {
    type: "function",
    name: "collectProtocol",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "amount0Requested", type: "uint128", internalType: "uint128" },
        { name: "amount1Requested", type: "uint128", internalType: "uint128" },
    ],
    outputs: [
        { name: "amount0", type: "uint128", internalType: "uint128" },
        { name: "amount1", type: "uint128", internalType: "uint128" },
    ],
    stateMutability: "nonpayable",
} as const;
export const factory = {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const fee = {
    type: "function",
    name: "fee",
    inputs: [],
    outputs: [{ name: "", type: "uint24", internalType: "uint24" }],
    stateMutability: "view",
} as const;
export const feeGrowthGlobal0X128 = {
    type: "function",
    name: "feeGrowthGlobal0X128",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const feeGrowthGlobal1X128 = {
    type: "function",
    name: "feeGrowthGlobal1X128",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const flash = {
    type: "function",
    name: "flash",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "amount0", type: "uint256", internalType: "uint256" },
        { name: "amount1", type: "uint256", internalType: "uint256" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const increaseObservationCardinalityNext = {
    type: "function",
    name: "increaseObservationCardinalityNext",
    inputs: [{ name: "observationCardinalityNext", type: "uint16", internalType: "uint16" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const initialize = {
    type: "function",
    name: "initialize",
    inputs: [{ name: "sqrtPriceX96", type: "uint160", internalType: "uint160" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const liquidity = {
    type: "function",
    name: "liquidity",
    inputs: [],
    outputs: [{ name: "", type: "uint128", internalType: "uint128" }],
    stateMutability: "view",
} as const;
export const maxLiquidityPerTick = {
    type: "function",
    name: "maxLiquidityPerTick",
    inputs: [],
    outputs: [{ name: "", type: "uint128", internalType: "uint128" }],
    stateMutability: "view",
} as const;
export const mint = {
    type: "function",
    name: "mint",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
        { name: "amount", type: "uint128", internalType: "uint128" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        { name: "amount0", type: "uint256", internalType: "uint256" },
        { name: "amount1", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const observations = {
    type: "function",
    name: "observations",
    inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
    outputs: [
        { name: "blockTimestamp", type: "uint32", internalType: "uint32" },
        { name: "tickCumulative", type: "int56", internalType: "int56" },
        { name: "secondsPerLiquidityCumulativeX128", type: "uint160", internalType: "uint160" },
        { name: "initialized", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
} as const;
export const observe = {
    type: "function",
    name: "observe",
    inputs: [{ name: "secondsAgos", type: "uint32[]", internalType: "uint32[]" }],
    outputs: [
        { name: "tickCumulatives", type: "int56[]", internalType: "int56[]" },
        { name: "secondsPerLiquidityCumulativeX128s", type: "uint160[]", internalType: "uint160[]" },
    ],
    stateMutability: "view",
} as const;
export const positions = {
    type: "function",
    name: "positions",
    inputs: [{ name: "key", type: "bytes32", internalType: "bytes32" }],
    outputs: [
        { name: "_liquidity", type: "uint128", internalType: "uint128" },
        { name: "feeGrowthInside0LastX128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthInside1LastX128", type: "uint256", internalType: "uint256" },
        { name: "tokensOwed0", type: "uint128", internalType: "uint128" },
        { name: "tokensOwed1", type: "uint128", internalType: "uint128" },
    ],
    stateMutability: "view",
} as const;
export const protocolFees = {
    type: "function",
    name: "protocolFees",
    inputs: [],
    outputs: [
        { name: "token0", type: "uint128", internalType: "uint128" },
        { name: "token1", type: "uint128", internalType: "uint128" },
    ],
    stateMutability: "view",
} as const;
export const setFeeProtocol = {
    type: "function",
    name: "setFeeProtocol",
    inputs: [
        { name: "feeProtocol0", type: "uint8", internalType: "uint8" },
        { name: "feeProtocol1", type: "uint8", internalType: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const slot0 = {
    type: "function",
    name: "slot0",
    inputs: [],
    outputs: [
        { name: "sqrtPriceX96", type: "uint160", internalType: "uint160" },
        { name: "tick", type: "int24", internalType: "int24" },
        { name: "observationIndex", type: "uint16", internalType: "uint16" },
        { name: "observationCardinality", type: "uint16", internalType: "uint16" },
        { name: "observationCardinalityNext", type: "uint16", internalType: "uint16" },
        { name: "feeProtocol", type: "uint8", internalType: "uint8" },
        { name: "unlocked", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
} as const;
export const snapshotCumulativesInside = {
    type: "function",
    name: "snapshotCumulativesInside",
    inputs: [
        { name: "tickLower", type: "int24", internalType: "int24" },
        { name: "tickUpper", type: "int24", internalType: "int24" },
    ],
    outputs: [
        { name: "tickCumulativeInside", type: "int56", internalType: "int56" },
        { name: "secondsPerLiquidityInsideX128", type: "uint160", internalType: "uint160" },
        { name: "secondsInside", type: "uint32", internalType: "uint32" },
    ],
    stateMutability: "view",
} as const;
export const swap = {
    type: "function",
    name: "swap",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "zeroForOne", type: "bool", internalType: "bool" },
        { name: "amountSpecified", type: "int256", internalType: "int256" },
        { name: "sqrtPriceLimitX96", type: "uint160", internalType: "uint160" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        { name: "amount0", type: "int256", internalType: "int256" },
        { name: "amount1", type: "int256", internalType: "int256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const tickBitmap = {
    type: "function",
    name: "tickBitmap",
    inputs: [{ name: "wordPosition", type: "int16", internalType: "int16" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const tickSpacing = {
    type: "function",
    name: "tickSpacing",
    inputs: [],
    outputs: [{ name: "", type: "int24", internalType: "int24" }],
    stateMutability: "view",
} as const;
export const ticks = {
    type: "function",
    name: "ticks",
    inputs: [{ name: "tick", type: "int24", internalType: "int24" }],
    outputs: [
        { name: "liquidityGross", type: "uint128", internalType: "uint128" },
        { name: "liquidityNet", type: "int128", internalType: "int128" },
        { name: "feeGrowthOutside0X128", type: "uint256", internalType: "uint256" },
        { name: "feeGrowthOutside1X128", type: "uint256", internalType: "uint256" },
        { name: "tickCumulativeOutside", type: "int56", internalType: "int56" },
        { name: "secondsPerLiquidityOutsideX128", type: "uint160", internalType: "uint160" },
        { name: "secondsOutside", type: "uint32", internalType: "uint32" },
        { name: "initialized", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
} as const;
export const token0 = {
    type: "function",
    name: "token0",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const token1 = {
    type: "function",
    name: "token1",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const Burn = {
    type: "event",
    name: "Burn",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "tickLower", type: "int24", indexed: true, internalType: "int24" },
        { name: "tickUpper", type: "int24", indexed: true, internalType: "int24" },
        { name: "amount", type: "uint128", indexed: false, internalType: "uint128" },
        { name: "amount0", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amount1", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const Collect = {
    type: "event",
    name: "Collect",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "recipient", type: "address", indexed: false, internalType: "address" },
        { name: "tickLower", type: "int24", indexed: true, internalType: "int24" },
        { name: "tickUpper", type: "int24", indexed: true, internalType: "int24" },
        { name: "amount0", type: "uint128", indexed: false, internalType: "uint128" },
        { name: "amount1", type: "uint128", indexed: false, internalType: "uint128" },
    ],
    anonymous: false,
} as const;
export const CollectProtocol = {
    type: "event",
    name: "CollectProtocol",
    inputs: [
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "recipient", type: "address", indexed: true, internalType: "address" },
        { name: "amount0", type: "uint128", indexed: false, internalType: "uint128" },
        { name: "amount1", type: "uint128", indexed: false, internalType: "uint128" },
    ],
    anonymous: false,
} as const;
export const Flash = {
    type: "event",
    name: "Flash",
    inputs: [
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "recipient", type: "address", indexed: true, internalType: "address" },
        { name: "amount0", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amount1", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "paid0", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "paid1", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const IncreaseObservationCardinalityNext = {
    type: "event",
    name: "IncreaseObservationCardinalityNext",
    inputs: [
        { name: "observationCardinalityNextOld", type: "uint16", indexed: false, internalType: "uint16" },
        { name: "observationCardinalityNextNew", type: "uint16", indexed: false, internalType: "uint16" },
    ],
    anonymous: false,
} as const;
export const Initialize = {
    type: "event",
    name: "Initialize",
    inputs: [
        { name: "sqrtPriceX96", type: "uint160", indexed: false, internalType: "uint160" },
        { name: "tick", type: "int24", indexed: false, internalType: "int24" },
    ],
    anonymous: false,
} as const;
export const Mint = {
    type: "event",
    name: "Mint",
    inputs: [
        { name: "sender", type: "address", indexed: false, internalType: "address" },
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "tickLower", type: "int24", indexed: true, internalType: "int24" },
        { name: "tickUpper", type: "int24", indexed: true, internalType: "int24" },
        { name: "amount", type: "uint128", indexed: false, internalType: "uint128" },
        { name: "amount0", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amount1", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const SetFeeProtocol = {
    type: "event",
    name: "SetFeeProtocol",
    inputs: [
        { name: "feeProtocol0Old", type: "uint8", indexed: false, internalType: "uint8" },
        { name: "feeProtocol1Old", type: "uint8", indexed: false, internalType: "uint8" },
        { name: "feeProtocol0New", type: "uint8", indexed: false, internalType: "uint8" },
        { name: "feeProtocol1New", type: "uint8", indexed: false, internalType: "uint8" },
    ],
    anonymous: false,
} as const;
export const Swap = {
    type: "event",
    name: "Swap",
    inputs: [
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "recipient", type: "address", indexed: true, internalType: "address" },
        { name: "amount0", type: "int256", indexed: false, internalType: "int256" },
        { name: "amount1", type: "int256", indexed: false, internalType: "int256" },
        { name: "sqrtPriceX96", type: "uint160", indexed: false, internalType: "uint160" },
        { name: "liquidity", type: "uint128", indexed: false, internalType: "uint128" },
        { name: "tick", type: "int24", indexed: false, internalType: "int24" },
    ],
    anonymous: false,
} as const;
export const functions = [
    burn,
    collect,
    collectProtocol,
    factory,
    fee,
    feeGrowthGlobal0X128,
    feeGrowthGlobal1X128,
    flash,
    increaseObservationCardinalityNext,
    initialize,
    liquidity,
    maxLiquidityPerTick,
    mint,
    observations,
    observe,
    positions,
    protocolFees,
    setFeeProtocol,
    slot0,
    snapshotCumulativesInside,
    swap,
    tickBitmap,
    tickSpacing,
    ticks,
    token0,
    token1,
] as const;
export const events = [
    Burn,
    Collect,
    CollectProtocol,
    Flash,
    IncreaseObservationCardinalityNext,
    Initialize,
    Mint,
    SetFeeProtocol,
    Swap,
] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IUniswapV3Pool = {
    abi,
};
