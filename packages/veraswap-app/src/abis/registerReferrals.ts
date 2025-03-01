export const registerReferrals = {
    inputs: [
        {
            internalType: "bytes32",
            name: "referrerId",
            type: "bytes32",
        },
        {
            internalType: "bytes32[]",
            name: "protocolIds",
            type: "bytes32[]",
        },
    ],
    name: "registerReferrals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
};
