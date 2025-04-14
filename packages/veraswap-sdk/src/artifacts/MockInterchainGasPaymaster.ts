import { Hex } from "viem";

export const FIXED_GAS_PAYMENT = {
    type: "function",
    name: "FIXED_GAS_PAYMENT",
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
export const functions = [FIXED_GAS_PAYMENT, payForGas, quoteGasPayment] as const;
export const events = [GasPayment] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60808060405234601557610148908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c9081630a9a4dbb146100f65750806311bf2c181461006c5763a69297931461003d575f80fd5b3461006857604036600319011261006857610056610128565b506020604051662386f26fc100008152f35b5f80fd5b608036600319011261006857610080610115565b506064356001600160a01b038116036100685760405162461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b34610068575f3660031901126100685780662386f26fc1000060209252f35b6024359063ffffffff8216820361006857565b6004359063ffffffff821682036100685756fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f3560e01c9081630a9a4dbb146100f65750806311bf2c181461006c5763a69297931461003d575f80fd5b3461006857604036600319011261006857610056610128565b506020604051662386f26fc100008152f35b5f80fd5b608036600319011261006857610080610115565b506064356001600160a01b038116036100685760405162461bcd60e51b815260206004820152603560248201527f4d6f636b496e746572636861696e4761735061796d61737465723a20706179466044820152741bdc91d85cc81b9bdd081a5b5c1b195b595b9d1959605a1b6064820152608490fd5b34610068575f3660031901126100685780662386f26fc1000060209252f35b6024359063ffffffff8216820361006857565b6004359063ffffffff821682036100685756fea164736f6c634300081a000a" as Hex;
export const MockInterchainGasPaymaster = {
    abi,
    bytecode,
    deployedBytecode,
};
