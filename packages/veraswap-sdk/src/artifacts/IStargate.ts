export const msgInspector = {
    type: "function",
    name: "msgInspector",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const oftVersion = {
    type: "function",
    name: "oftVersion",
    inputs: [],
    outputs: [
        { name: "major", type: "uint64", internalType: "uint64" },
        { name: "minor", type: "uint64", internalType: "uint64" },
    ],
    stateMutability: "view",
} as const;
export const quoteOFT = {
    type: "function",
    name: "quoteOFT",
    inputs: [
        {
            name: "_sendParam",
            type: "tuple",
            internalType: "struct SendParam",
            components: [
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "to", type: "bytes32", internalType: "bytes32" },
                { name: "amountToSendLD", type: "uint256", internalType: "uint256" },
                { name: "minAmountToCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_oftCmd", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct OFTLimit",
            components: [
                { name: "minAmountLD", type: "uint256", internalType: "uint256" },
                { name: "maxAmountLD", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "oftFeeDetails",
            type: "tuple[]",
            internalType: "struct OFTFeeDetail[]",
            components: [
                { name: "feeAmountLD", type: "uint256", internalType: "uint256" },
                { name: "description", type: "string", internalType: "string" },
            ],
        },
        {
            name: "",
            type: "tuple",
            internalType: "struct OFTReceipt",
            components: [
                { name: "amountDebitLD", type: "uint256", internalType: "uint256" },
                { name: "amountCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const quoteSend = {
    type: "function",
    name: "quoteSend",
    inputs: [
        {
            name: "_sendParam",
            type: "tuple",
            internalType: "struct SendParam",
            components: [
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "to", type: "bytes32", internalType: "bytes32" },
                { name: "amountToSendLD", type: "uint256", internalType: "uint256" },
                { name: "minAmountToCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_extraOptions", type: "bytes", internalType: "bytes" },
        { name: "_payInLzToken", type: "bool", internalType: "bool" },
        { name: "_composeMsg", type: "bytes", internalType: "bytes" },
        { name: "_oftCmd", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        {
            name: "",
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
export const send = {
    type: "function",
    name: "send",
    inputs: [
        {
            name: "_sendParam",
            type: "tuple",
            internalType: "struct SendParam",
            components: [
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "to", type: "bytes32", internalType: "bytes32" },
                { name: "amountToSendLD", type: "uint256", internalType: "uint256" },
                { name: "minAmountToCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_extraOptions", type: "bytes", internalType: "bytes" },
        {
            name: "_fee",
            type: "tuple",
            internalType: "struct MessagingFee",
            components: [
                { name: "nativeFee", type: "uint256", internalType: "uint256" },
                { name: "lzTokenFee", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_refundAddress", type: "address", internalType: "address" },
        { name: "_composeMsg", type: "bytes", internalType: "bytes" },
        { name: "_oftCmd", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        {
            name: "",
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
            name: "",
            type: "tuple",
            internalType: "struct OFTReceipt",
            components: [
                { name: "amountDebitLD", type: "uint256", internalType: "uint256" },
                { name: "amountCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "payable",
} as const;
export const sendToken = {
    type: "function",
    name: "sendToken",
    inputs: [
        {
            name: "_sendParam",
            type: "tuple",
            internalType: "struct SendParam",
            components: [
                { name: "dstEid", type: "uint32", internalType: "uint32" },
                { name: "to", type: "bytes32", internalType: "bytes32" },
                { name: "amountToSendLD", type: "uint256", internalType: "uint256" },
                { name: "minAmountToCreditLD", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "_fee",
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
            name: "msgReceipt",
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
            name: "oftReceipt",
            type: "tuple",
            internalType: "struct OFTReceipt",
            components: [
                { name: "amountDebitLD", type: "uint256", internalType: "uint256" },
                { name: "amountCreditLD", type: "uint256", internalType: "uint256" },
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
    stateMutability: "payable",
} as const;
export const setMsgInspector = {
    type: "function",
    name: "setMsgInspector",
    inputs: [{ name: "_msgInspector", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const sharedDecimals = {
    type: "function",
    name: "sharedDecimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
} as const;
export const stargateType = {
    type: "function",
    name: "stargateType",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "enum StargateType" }],
    stateMutability: "pure",
} as const;
export const token = {
    type: "function",
    name: "token",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const MsgInspectorSet = {
    type: "event",
    name: "MsgInspectorSet",
    inputs: [{ name: "inspector", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const OFTReceived = {
    type: "event",
    name: "OFTReceived",
    inputs: [
        { name: "guid", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "toAddress", type: "address", indexed: true, internalType: "address" },
        { name: "amountToCreditLD", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amountReceivedLD", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const OFTSent = {
    type: "event",
    name: "OFTSent",
    inputs: [
        { name: "guid", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "fromAddress", type: "address", indexed: true, internalType: "address" },
        { name: "amountDebitedLD", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amountToCreditLD", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "composeMsg", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const InvalidLocalDecimals = { type: "error", name: "InvalidLocalDecimals", inputs: [] } as const;
export const SlippageExceeded = {
    type: "error",
    name: "SlippageExceeded",
    inputs: [
        { name: "amountToCreditLD", type: "uint256", internalType: "uint256" },
        { name: "minAmountToCreditLD", type: "uint256", internalType: "uint256" },
    ],
} as const;
export const functions = [
    msgInspector,
    oftVersion,
    quoteOFT,
    quoteSend,
    send,
    sendToken,
    setMsgInspector,
    sharedDecimals,
    stargateType,
    token,
] as const;
export const events = [MsgInspectorSet, OFTReceived, OFTSent] as const;
export const errors = [InvalidLocalDecimals, SlippageExceeded] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IStargate = {
    abi,
};
