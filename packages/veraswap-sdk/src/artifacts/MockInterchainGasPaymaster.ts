import { Hex } from "viem";

export const FIXED_GAS_PRICE = {
    type: "function",
    name: "FIXED_GAS_PRICE",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
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
    stateMutability: "pure",
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
export const functions = [FIXED_GAS_PRICE, payForGas, quoteGasPayment] as const;
export const events = [GasPayment] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x6080806040523460155761016e908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c90816311bf2c18146100b45750806311c5f995146100965763a69297931461003d575f80fd5b346100925760403660031901126100925761005661014e565b50602435633b9aca00810290808204633b9aca00149015171561007e57602090604051908152f35b634e487b7160e01b5f52601160045260245ffd5b5f80fd5b34610092575f366003190112610092576020604051633b9aca008152f35b6080366003190112610092576100c861013b565b506064356001600160a01b038116036100925762461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b6024359063ffffffff8216820361009257565b6004359063ffffffff821682036100925756fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f3560e01c90816311bf2c18146100b45750806311c5f995146100965763a69297931461003d575f80fd5b346100925760403660031901126100925761005661014e565b50602435633b9aca00810290808204633b9aca00149015171561007e57602090604051908152f35b634e487b7160e01b5f52601160045260245ffd5b5f80fd5b34610092575f366003190112610092576020604051633b9aca008152f35b6080366003190112610092576100c861013b565b506064356001600160a01b038116036100925762461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b6024359063ffffffff8216820361009257565b6004359063ffffffff821682036100925756fea164736f6c634300081a000a" as Hex;
export const MockInterchainGasPaymaster = {
    abi,
    bytecode,
    deployedBytecode,
};
