export const allowance = {
    type: "function",
    name: "allowance",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const deposit = {
    type: "function",
    name: "deposit",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
} as const;
export const totalSupply = {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const transfer = {
    type: "function",
    name: "transfer",
    inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const transferFrom = {
    type: "function",
    name: "transferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const withdraw = {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const Transfer = {
    type: "event",
    name: "Transfer",
    inputs: [
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const functions = [
    allowance,
    approve,
    balanceOf,
    deposit,
    totalSupply,
    transfer,
    transferFrom,
    withdraw,
] as const;
export const events = [Approval, Transfer] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IWETH9 = {
    abi,
};
