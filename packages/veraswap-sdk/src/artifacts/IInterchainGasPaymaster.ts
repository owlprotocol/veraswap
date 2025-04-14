export const payForGas = {
    type: "function",
    name: "payForGas",
    inputs: [
        { name: "_messageId", type: "bytes32", internalType: "bytes32" },
        { name: "_destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "_gasAmount", type: "uint256", internalType: "uint256" },
        { name: "_refundAddress", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const quoteGasPayment = {
    type: "function",
    name: "quoteGasPayment",
    inputs: [
        { name: "_destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "_gasAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const GasPayment = {
    type: "event",
    name: "GasPayment",
    inputs: [
        { name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "destinationDomain", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "gasAmount", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "payment", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const functions = [payForGas, quoteGasPayment] as const;
export const events = [GasPayment] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IInterchainGasPaymaster = {
    abi,
};
