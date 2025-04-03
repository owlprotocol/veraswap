//Transfer(index_topic_1 address to, uint256 amount)
export const Transfer = {
    type: "event",
    name: "Transfer",
    inputs: [
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
