export const isUserRegistered = {
    inputs: [
        {
            internalType: "address",
            name: "userAddress",
            type: "address",
        },
        {
            internalType: "bytes32[]",
            name: "protocolIds",
            type: "bytes32[]",
        },
    ],
    name: "isUserRegistered",
    outputs: [
        {
            internalType: "bool[]",
            name: "",
            type: "bool[]",
        },
    ],
    stateMutability: "view",
    type: "function",
};
