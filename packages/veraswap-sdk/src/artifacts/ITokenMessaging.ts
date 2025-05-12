export const driveBus = {
    type: "function",
    name: "driveBus",
    inputs: [
        { name: "_dstEid", type: "uint32", internalType: "uint32" },
        { name: "_passengers", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        {
            name: "receipt",
            type: "tuple",
            internalType: "struct MessagingReceipt",
            components: [
                { name: "guid", type: "bytes32", internalType: "bytes32" },
                { name: "nonce", type: "uint64", internalType: "uint64" },
                {
                    name: "fee",
                    type: "tuple",
                    internalType: "struct MessagingFee",
                    components: [
                        { name: "nativeFee", type: "uint256", internalType: "uint256" },
                        { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
                    ],
                },
            ],
        },
    ],
    stateMutability: "payable",
} as const;
export const quoteDriveBus = {
    type: "function",
    name: "quoteDriveBus",
    inputs: [
        { name: "_dstEid", type: "uint32", internalType: "uint32" },
        { name: "_passengers", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        {
            name: "fee",
            type: "tuple",
            internalType: "struct MessagingFee",
            components: [
                { name: "nativeFee", type: "uint256", internalType: "uint256" },
                { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const quoteRideBus = {
    type: "function",
    name: "quoteRideBus",
    inputs: [
        { name: "_dstEid", type: "uint32", internalType: "uint32" },
        { name: "_nativeDrop", type: "bool", internalType: "bool" },
    ],
    outputs: [
        {
            name: "fee",
            type: "tuple",
            internalType: "struct MessagingFee",
            components: [
                { name: "nativeFee", type: "uint256", internalType: "uint256" },
                { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const quoteTaxi = {
    type: "function",
    name: "quoteTaxi",
    inputs: [
        {
            name: "_params",
            type: "tuple",
            internalType: "struct TaxiParams",
            components: [
                { name: "sender", type: "address", internalType: "address" },
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "receiver", type: "bytes32", internalType: "bytes32" },
                { name: "amountSD", type: "uint64", internalType: "uint64" },
                { name: "composeMsg", type: "bytes", internalType: "bytes" },
                { name: "extraOptions", type: "bytes", internalType: "bytes" },
            ],
        },
        { name: "_payInLzToken", type: "bool", internalType: "bool" },
    ],
    outputs: [
        {
            name: "fee",
            type: "tuple",
            internalType: "struct MessagingFee",
            components: [
                { name: "nativeFee", type: "uint256", internalType: "uint256" },
                { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const rideBus = {
    type: "function",
    name: "rideBus",
    inputs: [
        {
            name: "_params",
            type: "tuple",
            internalType: "struct RideBusParams",
            components: [
                { name: "sender", type: "address", internalType: "address" },
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "receiver", type: "bytes32", internalType: "bytes32" },
                { name: "amountSD", type: "uint64", internalType: "uint64" },
                { name: "nativeDrop", type: "bool", internalType: "bool" },
            ],
        },
    ],
    outputs: [
        {
            name: "receipt",
            type: "tuple",
            internalType: "struct MessagingReceipt",
            components: [
                { name: "guid", type: "bytes32", internalType: "bytes32" },
                { name: "nonce", type: "uint64", internalType: "uint64" },
                {
                    name: "fee",
                    type: "tuple",
                    internalType: "struct MessagingFee",
                    components: [
                        { name: "nativeFee", type: "uint256", internalType: "uint256" },
                        { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
                    ],
                },
            ],
        },
        {
            name: "ticket",
            type: "tuple",
            internalType: "struct Ticket",
            components: [
                { name: "ticketId", type: "uint72", internalType: "uint72" },
                { name: "passengerBytes", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    stateMutability: "nonpayable",
} as const;
export const taxi = {
    type: "function",
    name: "taxi",
    inputs: [
        {
            name: "_params",
            type: "tuple",
            internalType: "struct TaxiParams",
            components: [
                { name: "sender", type: "address", internalType: "address" },
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "receiver", type: "bytes32", internalType: "bytes32" },
                { name: "amountSD", type: "uint64", internalType: "uint64" },
                { name: "composeMsg", type: "bytes", internalType: "bytes" },
                { name: "extraOptions", type: "bytes", internalType: "bytes" },
            ],
        },
        {
            name: "_messagingFee",
            type: "tuple",
            internalType: "struct MessagingFee",
            components: [
                { name: "nativeFee", type: "uint256", internalType: "uint256" },
                { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_refundAddress", type: "address", internalType: "address" },
    ],
    outputs: [
        {
            name: "receipt",
            type: "tuple",
            internalType: "struct MessagingReceipt",
            components: [
                { name: "guid", type: "bytes32", internalType: "bytes32" },
                { name: "nonce", type: "uint64", internalType: "uint64" },
                {
                    name: "fee",
                    type: "tuple",
                    internalType: "struct MessagingFee",
                    components: [
                        { name: "nativeFee", type: "uint256", internalType: "uint256" },
                        { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
                    ],
                },
            ],
        },
    ],
    stateMutability: "payable",
} as const;
export const functions = [driveBus, quoteDriveBus, quoteRideBus, quoteTaxi, rideBus, taxi] as const;
export const events = [] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const ITokenMessaging = {
    abi,
};
