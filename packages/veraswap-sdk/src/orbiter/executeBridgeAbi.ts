export const executeBridgeAbi = {
    inputs: [
        {
            components: [
                { internalType: "address", name: "recipient", type: "address" },
                { internalType: "address", name: "inputToken", type: "address" },
                { internalType: "uint256", name: "inputAmount", type: "uint256" },
                { internalType: "bytes", name: "extData", type: "bytes" },
                { internalType: "bool", name: "unwrapped", type: "bool" },
                { internalType: "address", name: "feeRecipient", type: "address" },
                { internalType: "uint256", name: "feeAmount", type: "uint256" },
            ],
            internalType: "struct Types.BridgeRequest",
            name: "request",
            type: "tuple",
        },
    ],
    name: "executeBridge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
} as const;
