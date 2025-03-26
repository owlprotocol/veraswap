export const DOMAIN_SEPARATOR = {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const invalidateUnorderedNonces = {
    type: "function",
    name: "invalidateUnorderedNonces",
    inputs: [
        { name: "wordPos", type: "uint256", internalType: "uint256" },
        { name: "mask", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const nonceBitmap = {
    type: "function",
    name: "nonceBitmap",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const permitTransferFrom = {
    type: "function",
    name: "permitTransferFrom",
    inputs: [
        {
            name: "permit",
            type: "tuple",
            internalType: "struct ISignatureTransfer.PermitTransferFrom",
            components: [
                {
                    name: "permitted",
                    type: "tuple",
                    internalType: "struct ISignatureTransfer.TokenPermissions",
                    components: [
                        { name: "token", type: "address", internalType: "address" },
                        { name: "amount", type: "uint256", internalType: "uint256" },
                    ],
                },
                { name: "nonce", type: "uint256", internalType: "uint256" },
                { name: "deadline", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "transferDetails",
            type: "tuple",
            internalType: "struct ISignatureTransfer.SignatureTransferDetails",
            components: [
                { name: "to", type: "address", internalType: "address" },
                { name: "requestedAmount", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "owner", type: "address", internalType: "address" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const permitTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes = {
    type: "function",
    name: "permitTransferFrom",
    inputs: [
        {
            name: "permit",
            type: "tuple",
            internalType: "struct ISignatureTransfer.PermitBatchTransferFrom",
            components: [
                {
                    name: "permitted",
                    type: "tuple[]",
                    internalType: "struct ISignatureTransfer.TokenPermissions[]",
                    components: [
                        { name: "token", type: "address", internalType: "address" },
                        { name: "amount", type: "uint256", internalType: "uint256" },
                    ],
                },
                { name: "nonce", type: "uint256", internalType: "uint256" },
                { name: "deadline", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "transferDetails",
            type: "tuple[]",
            internalType: "struct ISignatureTransfer.SignatureTransferDetails[]",
            components: [
                { name: "to", type: "address", internalType: "address" },
                { name: "requestedAmount", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "owner", type: "address", internalType: "address" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const permitWitnessTransferFrom = {
    type: "function",
    name: "permitWitnessTransferFrom",
    inputs: [
        {
            name: "permit",
            type: "tuple",
            internalType: "struct ISignatureTransfer.PermitTransferFrom",
            components: [
                {
                    name: "permitted",
                    type: "tuple",
                    internalType: "struct ISignatureTransfer.TokenPermissions",
                    components: [
                        { name: "token", type: "address", internalType: "address" },
                        { name: "amount", type: "uint256", internalType: "uint256" },
                    ],
                },
                { name: "nonce", type: "uint256", internalType: "uint256" },
                { name: "deadline", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "transferDetails",
            type: "tuple",
            internalType: "struct ISignatureTransfer.SignatureTransferDetails",
            components: [
                { name: "to", type: "address", internalType: "address" },
                { name: "requestedAmount", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "owner", type: "address", internalType: "address" },
        { name: "witness", type: "bytes32", internalType: "bytes32" },
        { name: "witnessTypeString", type: "string", internalType: "string" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const permitWitnessTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes32_string_bytes =
    {
        type: "function",
        name: "permitWitnessTransferFrom",
        inputs: [
            {
                name: "permit",
                type: "tuple",
                internalType: "struct ISignatureTransfer.PermitBatchTransferFrom",
                components: [
                    {
                        name: "permitted",
                        type: "tuple[]",
                        internalType: "struct ISignatureTransfer.TokenPermissions[]",
                        components: [
                            { name: "token", type: "address", internalType: "address" },
                            { name: "amount", type: "uint256", internalType: "uint256" },
                        ],
                    },
                    { name: "nonce", type: "uint256", internalType: "uint256" },
                    { name: "deadline", type: "uint256", internalType: "uint256" },
                ],
            },
            {
                name: "transferDetails",
                type: "tuple[]",
                internalType: "struct ISignatureTransfer.SignatureTransferDetails[]",
                components: [
                    { name: "to", type: "address", internalType: "address" },
                    { name: "requestedAmount", type: "uint256", internalType: "uint256" },
                ],
            },
            { name: "owner", type: "address", internalType: "address" },
            { name: "witness", type: "bytes32", internalType: "bytes32" },
            { name: "witnessTypeString", type: "string", internalType: "string" },
            { name: "signature", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    } as const;
export const UnorderedNonceInvalidation = {
    type: "event",
    name: "UnorderedNonceInvalidation",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "word", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "mask", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const InvalidAmount = {
    type: "error",
    name: "InvalidAmount",
    inputs: [{ name: "maxAmount", type: "uint256", internalType: "uint256" }],
} as const;
export const LengthMismatch = { type: "error", name: "LengthMismatch", inputs: [] } as const;
export const functions = [
    DOMAIN_SEPARATOR,
    invalidateUnorderedNonces,
    nonceBitmap,
    permitTransferFrom,
    permitTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes,
    permitWitnessTransferFrom,
    permitWitnessTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes32_string_bytes,
] as const;
export const events = [UnorderedNonceInvalidation] as const;
export const errors = [InvalidAmount, LengthMismatch] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const ISignatureTransfer = {
    abi,
};
