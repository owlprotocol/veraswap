export const quoteGasPayment = {
    type: "function",
    name: "quoteGasPayment",
    intputs: [
        { name: "_destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "_gasLimit", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
};
