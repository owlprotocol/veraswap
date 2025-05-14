export const addStake = {
    type: "function",
    name: "addStake",
    inputs: [{ name: "_unstakeDelaySec", type: "uint32", internalType: "uint32" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const delegateAndRevert = {
    type: "function",
    name: "delegateAndRevert",
    inputs: [
        { name: "target", type: "address", internalType: "address" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const depositTo = {
    type: "function",
    name: "depositTo",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const getDepositInfo = {
    type: "function",
    name: "getDepositInfo",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
        {
            name: "info",
            type: "tuple",
            internalType: "struct IStakeManager.DepositInfo",
            components: [
                { name: "deposit", type: "uint256", internalType: "uint256" },
                { name: "staked", type: "bool", internalType: "bool" },
                { name: "stake", type: "uint112", internalType: "uint112" },
                { name: "unstakeDelaySec", type: "uint32", internalType: "uint32" },
                { name: "withdrawTime", type: "uint48", internalType: "uint48" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const getNonce = {
    type: "function",
    name: "getNonce",
    inputs: [
        { name: "sender", type: "address", internalType: "address" },
        { name: "key", type: "uint192", internalType: "uint192" },
    ],
    outputs: [{ name: "nonce", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const getSenderAddress = {
    type: "function",
    name: "getSenderAddress",
    inputs: [{ name: "initCode", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const getUserOpHash = {
    type: "function",
    name: "getUserOpHash",
    inputs: [
        {
            name: "userOp",
            type: "tuple",
            internalType: "struct PackedUserOperation",
            components: [
                { name: "sender", type: "address", internalType: "address" },
                { name: "nonce", type: "uint256", internalType: "uint256" },
                { name: "initCode", type: "bytes", internalType: "bytes" },
                { name: "callData", type: "bytes", internalType: "bytes" },
                { name: "accountGasLimits", type: "bytes32", internalType: "bytes32" },
                { name: "preVerificationGas", type: "uint256", internalType: "uint256" },
                { name: "gasFees", type: "bytes32", internalType: "bytes32" },
                { name: "paymasterAndData", type: "bytes", internalType: "bytes" },
                { name: "signature", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const handleAggregatedOps = {
    type: "function",
    name: "handleAggregatedOps",
    inputs: [
        {
            name: "opsPerAggregator",
            type: "tuple[]",
            internalType: "struct IEntryPoint.UserOpsPerAggregator[]",
            components: [
                {
                    name: "userOps",
                    type: "tuple[]",
                    internalType: "struct PackedUserOperation[]",
                    components: [
                        { name: "sender", type: "address", internalType: "address" },
                        { name: "nonce", type: "uint256", internalType: "uint256" },
                        { name: "initCode", type: "bytes", internalType: "bytes" },
                        { name: "callData", type: "bytes", internalType: "bytes" },
                        { name: "accountGasLimits", type: "bytes32", internalType: "bytes32" },
                        { name: "preVerificationGas", type: "uint256", internalType: "uint256" },
                        { name: "gasFees", type: "bytes32", internalType: "bytes32" },
                        { name: "paymasterAndData", type: "bytes", internalType: "bytes" },
                        { name: "signature", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "aggregator", type: "address", internalType: "contract IAggregator" },
                { name: "signature", type: "bytes", internalType: "bytes" },
            ],
        },
        { name: "beneficiary", type: "address", internalType: "address payable" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const handleOps = {
    type: "function",
    name: "handleOps",
    inputs: [
        {
            name: "ops",
            type: "tuple[]",
            internalType: "struct PackedUserOperation[]",
            components: [
                { name: "sender", type: "address", internalType: "address" },
                { name: "nonce", type: "uint256", internalType: "uint256" },
                { name: "initCode", type: "bytes", internalType: "bytes" },
                { name: "callData", type: "bytes", internalType: "bytes" },
                { name: "accountGasLimits", type: "bytes32", internalType: "bytes32" },
                { name: "preVerificationGas", type: "uint256", internalType: "uint256" },
                { name: "gasFees", type: "bytes32", internalType: "bytes32" },
                { name: "paymasterAndData", type: "bytes", internalType: "bytes" },
                { name: "signature", type: "bytes", internalType: "bytes" },
            ],
        },
        { name: "beneficiary", type: "address", internalType: "address payable" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const incrementNonce = {
    type: "function",
    name: "incrementNonce",
    inputs: [{ name: "key", type: "uint192", internalType: "uint192" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unlockStake = {
    type: "function",
    name: "unlockStake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const withdrawStake = {
    type: "function",
    name: "withdrawStake",
    inputs: [{ name: "withdrawAddress", type: "address", internalType: "address payable" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const withdrawTo = {
    type: "function",
    name: "withdrawTo",
    inputs: [
        { name: "withdrawAddress", type: "address", internalType: "address payable" },
        { name: "withdrawAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const AccountDeployed = {
    type: "event",
    name: "AccountDeployed",
    inputs: [
        { name: "userOpHash", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "factory", type: "address", indexed: false, internalType: "address" },
        { name: "paymaster", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const BeforeExecution = { type: "event", name: "BeforeExecution", inputs: [], anonymous: false } as const;
export const Deposited = {
    type: "event",
    name: "Deposited",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "totalDeposit", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const PostOpRevertReason = {
    type: "event",
    name: "PostOpRevertReason",
    inputs: [
        { name: "userOpHash", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "nonce", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "revertReason", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const SignatureAggregatorChanged = {
    type: "event",
    name: "SignatureAggregatorChanged",
    inputs: [{ name: "aggregator", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const StakeLocked = {
    type: "event",
    name: "StakeLocked",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "totalStaked", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "unstakeDelaySec", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const StakeUnlocked = {
    type: "event",
    name: "StakeUnlocked",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "withdrawTime", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const StakeWithdrawn = {
    type: "event",
    name: "StakeWithdrawn",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "withdrawAddress", type: "address", indexed: false, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const UserOperationEvent = {
    type: "event",
    name: "UserOperationEvent",
    inputs: [
        { name: "userOpHash", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "paymaster", type: "address", indexed: true, internalType: "address" },
        { name: "nonce", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "success", type: "bool", indexed: false, internalType: "bool" },
        { name: "actualGasCost", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "actualGasUsed", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const UserOperationRevertReason = {
    type: "event",
    name: "UserOperationRevertReason",
    inputs: [
        { name: "userOpHash", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "nonce", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "revertReason", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const Withdrawn = {
    type: "event",
    name: "Withdrawn",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "withdrawAddress", type: "address", indexed: false, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const DelegateAndRevert = {
    type: "error",
    name: "DelegateAndRevert",
    inputs: [
        { name: "success", type: "bool", internalType: "bool" },
        { name: "ret", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const FailedOp = {
    type: "error",
    name: "FailedOp",
    inputs: [
        { name: "opIndex", type: "uint256", internalType: "uint256" },
        { name: "reason", type: "string", internalType: "string" },
    ],
} as const;
export const FailedOpWithRevert = {
    type: "error",
    name: "FailedOpWithRevert",
    inputs: [
        { name: "opIndex", type: "uint256", internalType: "uint256" },
        { name: "reason", type: "string", internalType: "string" },
        { name: "inner", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const PostOpReverted = {
    type: "error",
    name: "PostOpReverted",
    inputs: [{ name: "returnData", type: "bytes", internalType: "bytes" }],
} as const;
export const SenderAddressResult = {
    type: "error",
    name: "SenderAddressResult",
    inputs: [{ name: "sender", type: "address", internalType: "address" }],
} as const;
export const SignatureValidationFailed = {
    type: "error",
    name: "SignatureValidationFailed",
    inputs: [{ name: "aggregator", type: "address", internalType: "address" }],
} as const;
export const functions = [
    addStake,
    balanceOf,
    delegateAndRevert,
    depositTo,
    getDepositInfo,
    getNonce,
    getSenderAddress,
    getUserOpHash,
    handleAggregatedOps,
    handleOps,
    incrementNonce,
    unlockStake,
    withdrawStake,
    withdrawTo,
] as const;
export const events = [
    AccountDeployed,
    BeforeExecution,
    Deposited,
    PostOpRevertReason,
    SignatureAggregatorChanged,
    StakeLocked,
    StakeUnlocked,
    StakeWithdrawn,
    UserOperationEvent,
    UserOperationRevertReason,
    Withdrawn,
] as const;
export const errors = [
    DelegateAndRevert,
    FailedOp,
    FailedOpWithRevert,
    PostOpReverted,
    SenderAddressResult,
    SignatureValidationFailed,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IEntryPoint = {
    abi,
};
