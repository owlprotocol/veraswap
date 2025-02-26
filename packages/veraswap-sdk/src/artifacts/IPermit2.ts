export const DOMAIN_SEPARATOR = {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const allowance = {
    type: "function",
    name: "allowance",
    inputs: [
        { name: "user", type: "address", internalType: "address" },
        { name: "token", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [
        { name: "amount", type: "uint160", internalType: "uint160" },
        { name: "expiration", type: "uint48", internalType: "uint48" },
        { name: "nonce", type: "uint48", internalType: "uint48" },
    ],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "token", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
        { name: "amount", type: "uint160", internalType: "uint160" },
        { name: "expiration", type: "uint48", internalType: "uint48" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const invalidateNonces = {
    type: "function",
    name: "invalidateNonces",
    inputs: [
        { name: "token", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
        { name: "newNonce", type: "uint48", internalType: "uint48" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
export const lockdown = {
    type: "function",
    name: "lockdown",
    inputs: [
        {
            name: "approvals",
            type: "tuple[]",
            internalType: "struct IAllowanceTransfer.TokenSpenderPair[]",
            components: [
                { name: "token", type: "address", internalType: "address" },
                { name: "spender", type: "address", internalType: "address" },
            ],
        },
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
export const permit = {
    type: "function",
    name: "permit",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        {
            name: "permitBatch",
            type: "tuple",
            internalType: "struct IAllowanceTransfer.PermitBatch",
            components: [
                {
                    name: "details",
                    type: "tuple[]",
                    internalType: "struct IAllowanceTransfer.PermitDetails[]",
                    components: [
                        { name: "token", type: "address", internalType: "address" },
                        { name: "amount", type: "uint160", internalType: "uint160" },
                        { name: "expiration", type: "uint48", internalType: "uint48" },
                        { name: "nonce", type: "uint48", internalType: "uint48" },
                    ],
                },
                { name: "spender", type: "address", internalType: "address" },
                { name: "sigDeadline", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const permit_address___address_uint160_uint48_uint48__address_uint256__bytes = {
    type: "function",
    name: "permit",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        {
            name: "permitSingle",
            type: "tuple",
            internalType: "struct IAllowanceTransfer.PermitSingle",
            components: [
                {
                    name: "details",
                    type: "tuple",
                    internalType: "struct IAllowanceTransfer.PermitDetails",
                    components: [
                        { name: "token", type: "address", internalType: "address" },
                        { name: "amount", type: "uint160", internalType: "uint160" },
                        { name: "expiration", type: "uint48", internalType: "uint48" },
                        { name: "nonce", type: "uint48", internalType: "uint48" },
                    ],
                },
                { name: "spender", type: "address", internalType: "address" },
                { name: "sigDeadline", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
export const transferFrom = {
    type: "function",
    name: "transferFrom",
    inputs: [
        {
            name: "transferDetails",
            type: "tuple[]",
            internalType: "struct IAllowanceTransfer.AllowanceTransferDetails[]",
            components: [
                { name: "from", type: "address", internalType: "address" },
                { name: "to", type: "address", internalType: "address" },
                { name: "amount", type: "uint160", internalType: "uint160" },
                { name: "token", type: "address", internalType: "address" },
            ],
        },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const transferFrom_address_address_uint160_address = {
    type: "function",
    name: "transferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "amount", type: "uint160", internalType: "uint160" },
        { name: "token", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "token", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint160", indexed: false, internalType: "uint160" },
        { name: "expiration", type: "uint48", indexed: false, internalType: "uint48" },
    ],
    anonymous: false,
} as const;
export const Lockdown = {
    type: "event",
    name: "Lockdown",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "token", type: "address", indexed: false, internalType: "address" },
        { name: "spender", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const NonceInvalidation = {
    type: "event",
    name: "NonceInvalidation",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "token", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "newNonce", type: "uint48", indexed: false, internalType: "uint48" },
        { name: "oldNonce", type: "uint48", indexed: false, internalType: "uint48" },
    ],
    anonymous: false,
} as const;
export const Permit = {
    type: "event",
    name: "Permit",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "token", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint160", indexed: false, internalType: "uint160" },
        { name: "expiration", type: "uint48", indexed: false, internalType: "uint48" },
        { name: "nonce", type: "uint48", indexed: false, internalType: "uint48" },
    ],
    anonymous: false,
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
export const AllowanceExpired = {
    type: "error",
    name: "AllowanceExpired",
    inputs: [{ name: "deadline", type: "uint256", internalType: "uint256" }],
} as const;
export const ExcessiveInvalidation = { type: "error", name: "ExcessiveInvalidation", inputs: [] } as const;
export const InsufficientAllowance = {
    type: "error",
    name: "InsufficientAllowance",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
} as const;
export const InvalidAmount = {
    type: "error",
    name: "InvalidAmount",
    inputs: [{ name: "maxAmount", type: "uint256", internalType: "uint256" }],
} as const;
export const LengthMismatch = { type: "error", name: "LengthMismatch", inputs: [] } as const;
export const functions = [
    DOMAIN_SEPARATOR,
    allowance,
    approve,
    invalidateNonces,
    invalidateUnorderedNonces,
    lockdown,
    nonceBitmap,
    permit,
    permit_address___address_uint160_uint48_uint48__address_uint256__bytes,
    permitTransferFrom,
    permitTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes,
    permitWitnessTransferFrom,
    permitWitnessTransferFrom___address_uint256_array_uint256_uint256___address_uint256_array_address_bytes32_string_bytes,
    transferFrom,
    transferFrom_address_address_uint160_address,
] as const;
export const events = [Approval, Lockdown, NonceInvalidation, Permit, UnorderedNonceInvalidation] as const;
export const errors = [
    AllowanceExpired,
    ExcessiveInvalidation,
    InsufficientAllowance,
    InvalidAmount,
    LengthMismatch,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IPermit2 = {
    abi,
};
