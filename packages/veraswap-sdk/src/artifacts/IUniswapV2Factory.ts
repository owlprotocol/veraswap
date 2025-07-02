export const allPairs = {
    type: "function",
    name: "allPairs",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "pair", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const allPairsLength = {
    type: "function",
    name: "allPairsLength",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const createPair = {
    type: "function",
    name: "createPair",
    inputs: [
        { name: "tokenA", type: "address", internalType: "address" },
        { name: "tokenB", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "pair", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
} as const;
export const feeTo = {
    type: "function",
    name: "feeTo",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const feeToSetter = {
    type: "function",
    name: "feeToSetter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const getPair = {
    type: "function",
    name: "getPair",
    inputs: [
        { name: "tokenA", type: "address", internalType: "address" },
        { name: "tokenB", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "pair", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const setFeeTo = {
    type: "function",
    name: "setFeeTo",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setFeeToSetter = {
    type: "function",
    name: "setFeeToSetter",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const PairCreated = {
    type: "event",
    name: "PairCreated",
    inputs: [
        { name: "token0", type: "address", indexed: true, internalType: "address" },
        { name: "token1", type: "address", indexed: true, internalType: "address" },
        { name: "pair", type: "address", indexed: false, internalType: "address" },
        { name: "", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const functions = [
    allPairs,
    allPairsLength,
    createPair,
    feeTo,
    feeToSetter,
    getPair,
    setFeeTo,
    setFeeToSetter,
] as const;
export const events = [PairCreated] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IUniswapV2Factory = {
    abi,
};
