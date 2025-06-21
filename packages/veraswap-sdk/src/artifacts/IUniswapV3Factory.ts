export const createPool = {
    type: "function",
    name: "createPool",
    inputs: [
        { name: "tokenA", type: "address", internalType: "address" },
        { name: "tokenB", type: "address", internalType: "address" },
        { name: "fee", type: "uint24", internalType: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
} as const;
export const enableFeeAmount = {
    type: "function",
    name: "enableFeeAmount",
    inputs: [
        { name: "fee", type: "uint24", internalType: "uint24" },
        { name: "tickSpacing", type: "int24", internalType: "int24" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const feeAmountTickSpacing = {
    type: "function",
    name: "feeAmountTickSpacing",
    inputs: [{ name: "fee", type: "uint24", internalType: "uint24" }],
    outputs: [{ name: "", type: "int24", internalType: "int24" }],
    stateMutability: "view",
} as const;
export const getPool = {
    type: "function",
    name: "getPool",
    inputs: [
        { name: "tokenA", type: "address", internalType: "address" },
        { name: "tokenB", type: "address", internalType: "address" },
        { name: "fee", type: "uint24", internalType: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const owner = {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const setOwner = {
    type: "function",
    name: "setOwner",
    inputs: [{ name: "_owner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const FeeAmountEnabled = {
    type: "event",
    name: "FeeAmountEnabled",
    inputs: [
        { name: "fee", type: "uint24", indexed: true, internalType: "uint24" },
        { name: "tickSpacing", type: "int24", indexed: true, internalType: "int24" },
    ],
    anonymous: false,
} as const;
export const OwnerChanged = {
    type: "event",
    name: "OwnerChanged",
    inputs: [
        { name: "oldOwner", type: "address", indexed: true, internalType: "address" },
        { name: "newOwner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const PoolCreated = {
    type: "event",
    name: "PoolCreated",
    inputs: [
        { name: "token0", type: "address", indexed: true, internalType: "address" },
        { name: "token1", type: "address", indexed: true, internalType: "address" },
        { name: "fee", type: "uint24", indexed: true, internalType: "uint24" },
        { name: "tickSpacing", type: "int24", indexed: false, internalType: "int24" },
        { name: "pool", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const functions = [createPool, enableFeeAmount, feeAmountTickSpacing, getPool, owner, setOwner] as const;
export const events = [FeeAmountEnabled, OwnerChanged, PoolCreated] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IUniswapV3Factory = {
    abi,
};
