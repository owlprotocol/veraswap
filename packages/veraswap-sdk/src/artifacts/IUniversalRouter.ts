export const execute = {
    type: "function",
    name: "execute",
    inputs: [
        { name: "commands", type: "bytes", internalType: "bytes" },
        { name: "inputs", type: "bytes[]", internalType: "bytes[]" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const ETHNotAccepted = { type: "error", name: "ETHNotAccepted", inputs: [] } as const;
export const ExecutionFailed = {
    type: "error",
    name: "ExecutionFailed",
    inputs: [
        { name: "commandIndex", type: "uint256", internalType: "uint256" },
        { name: "message", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const InvalidEthSender = { type: "error", name: "InvalidEthSender", inputs: [] } as const;
export const LengthMismatch = { type: "error", name: "LengthMismatch", inputs: [] } as const;
export const TransactionDeadlinePassed = { type: "error", name: "TransactionDeadlinePassed", inputs: [] } as const;
export const functions = [execute] as const;
export const events = [] as const;
export const errors = [
    ETHNotAccepted,
    ExecutionFailed,
    InvalidEthSender,
    LengthMismatch,
    TransactionDeadlinePassed,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IUniversalRouter = {
    abi,
};
