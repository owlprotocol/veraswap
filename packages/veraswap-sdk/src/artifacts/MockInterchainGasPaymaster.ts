import { Hex } from "viem";

export const FIXED_GAS_PRICE = {
    type: "function",
    name: "FIXED_GAS_PRICE",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const destinationGasLimit = {
    type: "function",
    name: "destinationGasLimit",
    inputs: [
        { name: "_destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "_gasAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "pure",
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
export const functions = [FIXED_GAS_PRICE, destinationGasLimit, payForGas, quoteGasPayment] as const;
export const events = [GasPayment] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x6080806040523460155761019f908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c90816311bf2c18146100e55750806311c5f995146100c757806326d5b1a6146100a15763a692979314610048575f80fd5b3461009d57604036600319011261009d5761006161017f565b50602435633b9aca00810290808204633b9aca00149015171561008957602090604051908152f35b634e487b7160e01b5f52601160045260245ffd5b5f80fd5b3461009d57604036600319011261009d576100ba61017f565b5060206040516024358152f35b3461009d575f36600319011261009d576020604051633b9aca008152f35b608036600319011261009d576100f961016c565b506064356001600160a01b0381160361009d5762461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b6024359063ffffffff8216820361009d57565b6004359063ffffffff8216820361009d5756fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f3560e01c90816311bf2c18146100e55750806311c5f995146100c757806326d5b1a6146100a15763a692979314610048575f80fd5b3461009d57604036600319011261009d5761006161017f565b50602435633b9aca00810290808204633b9aca00149015171561008957602090604051908152f35b634e487b7160e01b5f52601160045260245ffd5b5f80fd5b3461009d57604036600319011261009d576100ba61017f565b5060206040516024358152f35b3461009d575f36600319011261009d576020604051633b9aca008152f35b608036600319011261009d576100f961016c565b506064356001600160a01b0381160361009d5762461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b6024359063ffffffff8216820361009d57565b6004359063ffffffff8216820361009d5756fea164736f6c634300081a000a" as Hex;
export const MockInterchainGasPaymaster = {
    abi,
    bytecode,
    deployedBytecode,
};
