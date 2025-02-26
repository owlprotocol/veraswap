export const multicall = {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]", internalType: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
} as const;
export const functions = [multicall] as const;
export const events = [] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IMulticall_v4 = {
    abi,
};
