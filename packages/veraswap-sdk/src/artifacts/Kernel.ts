import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [{ name: "_entrypoint", type: "address", internalType: "contract IEntryPoint" }],
    stateMutability: "nonpayable",
} as const;
export const fallback = { type: "fallback", stateMutability: "payable" } as const;
export const receive = { type: "receive", stateMutability: "payable" } as const;
export const accountId = {
    type: "function",
    name: "accountId",
    inputs: [],
    outputs: [{ name: "accountImplementationId", type: "string", internalType: "string" }],
    stateMutability: "pure",
} as const;
export const changeRootValidator = {
    type: "function",
    name: "changeRootValidator",
    inputs: [
        { name: "_rootValidator", type: "bytes21", internalType: "ValidationId" },
        { name: "hook", type: "address", internalType: "contract IHook" },
        { name: "validatorData", type: "bytes", internalType: "bytes" },
        { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const currentNonce = {
    type: "function",
    name: "currentNonce",
    inputs: [],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
} as const;
export const eip712Domain = {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
        { name: "fields", type: "bytes1", internalType: "bytes1" },
        { name: "name", type: "string", internalType: "string" },
        { name: "version", type: "string", internalType: "string" },
        { name: "chainId", type: "uint256", internalType: "uint256" },
        { name: "verifyingContract", type: "address", internalType: "address" },
        { name: "salt", type: "bytes32", internalType: "bytes32" },
        { name: "extensions", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
} as const;
export const entrypoint = {
    type: "function",
    name: "entrypoint",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IEntryPoint" }],
    stateMutability: "view",
} as const;
export const execute = {
    type: "function",
    name: "execute",
    inputs: [
        { name: "execMode", type: "bytes32", internalType: "ExecMode" },
        { name: "executionCalldata", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const executeFromExecutor = {
    type: "function",
    name: "executeFromExecutor",
    inputs: [
        { name: "execMode", type: "bytes32", internalType: "ExecMode" },
        { name: "executionCalldata", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "returnData", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
} as const;
export const executeUserOp = {
    type: "function",
    name: "executeUserOp",
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
        { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const executorConfig = {
    type: "function",
    name: "executorConfig",
    inputs: [{ name: "executor", type: "address", internalType: "contract IExecutor" }],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct ExecutorManager.ExecutorConfig",
            components: [{ name: "hook", type: "address", internalType: "contract IHook" }],
        },
    ],
    stateMutability: "view",
} as const;
export const initialize = {
    type: "function",
    name: "initialize",
    inputs: [
        { name: "_rootValidator", type: "bytes21", internalType: "ValidationId" },
        { name: "hook", type: "address", internalType: "contract IHook" },
        { name: "validatorData", type: "bytes", internalType: "bytes" },
        { name: "hookData", type: "bytes", internalType: "bytes" },
        { name: "initConfig", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const installModule = {
    type: "function",
    name: "installModule",
    inputs: [
        { name: "moduleType", type: "uint256", internalType: "uint256" },
        { name: "module", type: "address", internalType: "address" },
        { name: "initData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const installValidations = {
    type: "function",
    name: "installValidations",
    inputs: [
        { name: "vIds", type: "bytes21[]", internalType: "ValidationId[]" },
        {
            name: "configs",
            type: "tuple[]",
            internalType: "struct ValidationManager.ValidationConfig[]",
            components: [
                { name: "nonce", type: "uint32", internalType: "uint32" },
                { name: "hook", type: "address", internalType: "contract IHook" },
            ],
        },
        { name: "validationData", type: "bytes[]", internalType: "bytes[]" },
        { name: "hookData", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const invalidateNonce = {
    type: "function",
    name: "invalidateNonce",
    inputs: [{ name: "nonce", type: "uint32", internalType: "uint32" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const isAllowedSelector = {
    type: "function",
    name: "isAllowedSelector",
    inputs: [
        { name: "vId", type: "bytes21", internalType: "ValidationId" },
        { name: "selector", type: "bytes4", internalType: "bytes4" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const isModuleInstalled = {
    type: "function",
    name: "isModuleInstalled",
    inputs: [
        { name: "moduleType", type: "uint256", internalType: "uint256" },
        { name: "module", type: "address", internalType: "address" },
        { name: "additionalContext", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const isValidSignature = {
    type: "function",
    name: "isValidSignature",
    inputs: [
        { name: "hash", type: "bytes32", internalType: "bytes32" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "view",
} as const;
export const onERC1155BatchReceived = {
    type: "function",
    name: "onERC1155BatchReceived",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "uint256[]", internalType: "uint256[]" },
        { name: "", type: "uint256[]", internalType: "uint256[]" },
        { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "pure",
} as const;
export const onERC1155Received = {
    type: "function",
    name: "onERC1155Received",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "uint256", internalType: "uint256" },
        { name: "", type: "uint256", internalType: "uint256" },
        { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "pure",
} as const;
export const onERC721Received = {
    type: "function",
    name: "onERC721Received",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "uint256", internalType: "uint256" },
        { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "pure",
} as const;
export const permissionConfig = {
    type: "function",
    name: "permissionConfig",
    inputs: [{ name: "pId", type: "bytes4", internalType: "PermissionId" }],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct ValidationManager.PermissionConfig",
            components: [
                { name: "permissionFlag", type: "bytes2", internalType: "PassFlag" },
                { name: "signer", type: "address", internalType: "contract ISigner" },
                { name: "policyData", type: "bytes22[]", internalType: "PolicyData[]" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const rootValidator = {
    type: "function",
    name: "rootValidator",
    inputs: [],
    outputs: [{ name: "", type: "bytes21", internalType: "ValidationId" }],
    stateMutability: "view",
} as const;
export const selectorConfig = {
    type: "function",
    name: "selectorConfig",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct SelectorManager.SelectorConfig",
            components: [
                { name: "hook", type: "address", internalType: "contract IHook" },
                { name: "target", type: "address", internalType: "address" },
                { name: "callType", type: "bytes1", internalType: "CallType" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const supportsExecutionMode = {
    type: "function",
    name: "supportsExecutionMode",
    inputs: [{ name: "mode", type: "bytes32", internalType: "ExecMode" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "pure",
} as const;
export const supportsModule = {
    type: "function",
    name: "supportsModule",
    inputs: [{ name: "moduleTypeId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "pure",
} as const;
export const uninstallModule = {
    type: "function",
    name: "uninstallModule",
    inputs: [
        { name: "moduleType", type: "uint256", internalType: "uint256" },
        { name: "module", type: "address", internalType: "address" },
        { name: "deInitData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const uninstallValidation = {
    type: "function",
    name: "uninstallValidation",
    inputs: [
        { name: "vId", type: "bytes21", internalType: "ValidationId" },
        { name: "deinitData", type: "bytes", internalType: "bytes" },
        { name: "hookDeinitData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const upgradeTo = {
    type: "function",
    name: "upgradeTo",
    inputs: [{ name: "_newImplementation", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const validNonceFrom = {
    type: "function",
    name: "validNonceFrom",
    inputs: [],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
} as const;
export const validateUserOp = {
    type: "function",
    name: "validateUserOp",
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
        { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
        { name: "missingAccountFunds", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "validationData", type: "uint256", internalType: "ValidationData" }],
    stateMutability: "payable",
} as const;
export const validationConfig = {
    type: "function",
    name: "validationConfig",
    inputs: [{ name: "vId", type: "bytes21", internalType: "ValidationId" }],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct ValidationManager.ValidationConfig",
            components: [
                { name: "nonce", type: "uint32", internalType: "uint32" },
                { name: "hook", type: "address", internalType: "contract IHook" },
            ],
        },
    ],
    stateMutability: "view",
} as const;
export const ModuleInstalled = {
    type: "event",
    name: "ModuleInstalled",
    inputs: [
        { name: "moduleTypeId", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "module", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const ModuleUninstallResult = {
    type: "event",
    name: "ModuleUninstallResult",
    inputs: [
        { name: "module", type: "address", indexed: false, internalType: "address" },
        { name: "result", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
} as const;
export const ModuleUninstalled = {
    type: "event",
    name: "ModuleUninstalled",
    inputs: [
        { name: "moduleTypeId", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "module", type: "address", indexed: false, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const NonceInvalidated = {
    type: "event",
    name: "NonceInvalidated",
    inputs: [{ name: "nonce", type: "uint32", indexed: false, internalType: "uint32" }],
    anonymous: false,
} as const;
export const PermissionInstalled = {
    type: "event",
    name: "PermissionInstalled",
    inputs: [
        { name: "permission", type: "bytes4", indexed: false, internalType: "PermissionId" },
        { name: "nonce", type: "uint32", indexed: false, internalType: "uint32" },
    ],
    anonymous: false,
} as const;
export const PermissionUninstalled = {
    type: "event",
    name: "PermissionUninstalled",
    inputs: [{ name: "permission", type: "bytes4", indexed: false, internalType: "PermissionId" }],
    anonymous: false,
} as const;
export const Received = {
    type: "event",
    name: "Received",
    inputs: [
        { name: "sender", type: "address", indexed: false, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const RootValidatorUpdated = {
    type: "event",
    name: "RootValidatorUpdated",
    inputs: [{ name: "rootValidator", type: "bytes21", indexed: false, internalType: "ValidationId" }],
    anonymous: false,
} as const;
export const SelectorSet = {
    type: "event",
    name: "SelectorSet",
    inputs: [
        { name: "selector", type: "bytes4", indexed: false, internalType: "bytes4" },
        { name: "vId", type: "bytes21", indexed: false, internalType: "ValidationId" },
        { name: "allowed", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
} as const;
export const TryExecuteUnsuccessful = {
    type: "event",
    name: "TryExecuteUnsuccessful",
    inputs: [
        { name: "batchExecutionindex", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "result", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const Upgraded = {
    type: "event",
    name: "Upgraded",
    inputs: [{ name: "implementation", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const ValidatorInstalled = {
    type: "event",
    name: "ValidatorInstalled",
    inputs: [
        { name: "validator", type: "address", indexed: false, internalType: "contract IValidator" },
        { name: "nonce", type: "uint32", indexed: false, internalType: "uint32" },
    ],
    anonymous: false,
} as const;
export const ValidatorUninstalled = {
    type: "event",
    name: "ValidatorUninstalled",
    inputs: [{ name: "validator", type: "address", indexed: false, internalType: "contract IValidator" }],
    anonymous: false,
} as const;
export const EnableNotApproved = { type: "error", name: "EnableNotApproved", inputs: [] } as const;
export const ExecutionReverted = { type: "error", name: "ExecutionReverted", inputs: [] } as const;
export const InitConfigError = {
    type: "error",
    name: "InitConfigError",
    inputs: [{ name: "idx", type: "uint256", internalType: "uint256" }],
} as const;
export const InvalidCallType = { type: "error", name: "InvalidCallType", inputs: [] } as const;
export const InvalidCaller = { type: "error", name: "InvalidCaller", inputs: [] } as const;
export const InvalidExecutor = { type: "error", name: "InvalidExecutor", inputs: [] } as const;
export const InvalidFallback = { type: "error", name: "InvalidFallback", inputs: [] } as const;
export const InvalidMode = { type: "error", name: "InvalidMode", inputs: [] } as const;
export const InvalidModuleType = { type: "error", name: "InvalidModuleType", inputs: [] } as const;
export const InvalidNonce = { type: "error", name: "InvalidNonce", inputs: [] } as const;
export const InvalidSelector = { type: "error", name: "InvalidSelector", inputs: [] } as const;
export const InvalidSignature = { type: "error", name: "InvalidSignature", inputs: [] } as const;
export const InvalidValidationType = { type: "error", name: "InvalidValidationType", inputs: [] } as const;
export const InvalidValidator = { type: "error", name: "InvalidValidator", inputs: [] } as const;
export const NonceInvalidationError = { type: "error", name: "NonceInvalidationError", inputs: [] } as const;
export const NotSupportedCallType = { type: "error", name: "NotSupportedCallType", inputs: [] } as const;
export const OnlyExecuteUserOp = { type: "error", name: "OnlyExecuteUserOp", inputs: [] } as const;
export const PermissionDataLengthMismatch = {
    type: "error",
    name: "PermissionDataLengthMismatch",
    inputs: [],
} as const;
export const PermissionNotAlllowedForSignature = {
    type: "error",
    name: "PermissionNotAlllowedForSignature",
    inputs: [],
} as const;
export const PermissionNotAlllowedForUserOp = {
    type: "error",
    name: "PermissionNotAlllowedForUserOp",
    inputs: [],
} as const;
export const PolicyDataTooLarge = { type: "error", name: "PolicyDataTooLarge", inputs: [] } as const;
export const PolicyFailed = {
    type: "error",
    name: "PolicyFailed",
    inputs: [{ name: "i", type: "uint256", internalType: "uint256" }],
} as const;
export const PolicySignatureOrderError = { type: "error", name: "PolicySignatureOrderError", inputs: [] } as const;
export const RootValidatorCannotBeRemoved = {
    type: "error",
    name: "RootValidatorCannotBeRemoved",
    inputs: [],
} as const;
export const SignerPrefixNotPresent = { type: "error", name: "SignerPrefixNotPresent", inputs: [] } as const;
export const functions = [
    _constructor,
    fallback,
    receive,
    accountId,
    changeRootValidator,
    currentNonce,
    eip712Domain,
    entrypoint,
    execute,
    executeFromExecutor,
    executeUserOp,
    executorConfig,
    initialize,
    installModule,
    installValidations,
    invalidateNonce,
    isAllowedSelector,
    isModuleInstalled,
    isValidSignature,
    onERC1155BatchReceived,
    onERC1155Received,
    onERC721Received,
    permissionConfig,
    rootValidator,
    selectorConfig,
    supportsExecutionMode,
    supportsModule,
    uninstallModule,
    uninstallValidation,
    upgradeTo,
    validNonceFrom,
    validateUserOp,
    validationConfig,
] as const;
export const events = [
    ModuleInstalled,
    ModuleUninstallResult,
    ModuleUninstalled,
    NonceInvalidated,
    PermissionInstalled,
    PermissionUninstalled,
    Received,
    RootValidatorUpdated,
    SelectorSet,
    TryExecuteUnsuccessful,
    Upgraded,
    ValidatorInstalled,
    ValidatorUninstalled,
] as const;
export const errors = [
    EnableNotApproved,
    ExecutionReverted,
    InitConfigError,
    InvalidCallType,
    InvalidCaller,
    InvalidExecutor,
    InvalidFallback,
    InvalidMode,
    InvalidModuleType,
    InvalidNonce,
    InvalidSelector,
    InvalidSignature,
    InvalidValidationType,
    InvalidValidator,
    NonceInvalidationError,
    NotSupportedCallType,
    OnlyExecuteUserOp,
    PermissionDataLengthMismatch,
    PermissionNotAlllowedForSignature,
    PermissionNotAlllowedForUserOp,
    PolicyDataTooLarge,
    PolicyFailed,
    PolicySignatureOrderError,
    RootValidatorCannotBeRemoved,
    SignerPrefixNotPresent,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x610140806040523461020357602081615a9680380380916100208285610207565b83398101031261020357516001600160a01b038116810361020357306080524660a05260a0604051610053604082610207565b6006815260208101906512d95c9b995b60d21b825260405191610077604084610207565b60058352602083019164302e332e3160d81b8352519020915190208160c0528060e052604051917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260208301526040820152466060820152306080820152206101005261012052604051602081019063deadbeef60e01b825260048152610101602482610207565b5190516001600160581b031981169190601582106101e3575b7f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f84f80546001600160a81b031916605885901c179055604051615857908161023f823960805181614497015260a051816144ba015260c0518161452a015260e05181614550015261010051816144760152610120518181816103a40152818161068d0152818161083301528181610a8f01528181610e0e015281816111260152818161129a015281816112f00152818161181d0152818161194d015281816124a80152612e290152f35b6001600160581b031960159290920360031b82901b161690505f8061011a565b5f80fd5b601f909101601f19168101906001600160401b0382119082101761022a57604052565b634e487b7160e01b5f52604160045260245ffdfe6080604052600436101561001d575b36612cd75761001b612ca6565b005b5f3560e01c8063112d3a7d146101fc578063150b7a02146101f75780631626ba7e146101f257806319822f7c146101ed5780631f1b92e3146101e85780633659cfe6146101e35780633c3b752b146101de57806352141cd9146101d957806357b3a5f4146101d45780636e6fa0c6146101cf578063721e67f4146101ca57806384b0196e146101c55780638dd7712f146101c057806390ef8862146101bb5780639198bdf5146101b65780639517e29f146101b15780639cfd7cff146101ac578063a65d69d4146101a7578063a71763a8146101a2578063adb610a31461019d578063b8afe17d14610198578063bc197c8114610193578063c3e589781461018e578063d03c791414610189578063d691c96414610184578063e6f3d50a1461017f578063e9ae5c531461017a578063f1f7f0f914610175578063f23a6e61146101705763f2dc691d0361000e57611ae4565b611a8a565b611a54565b611926565b6117a8565b6116c6565b611679565b6115a6565b611495565b611429565b6113f7565b6112c9565b611285565b61122d565b6110ff565b610fe8565b610ed9565b610dde565b610d40565b610cba565b610c5f565b610bac565b610a0e565b610978565b6107fd565b610655565b610370565b61030f565b6102b5565b61028f565b6001600160a01b0381160361021257565b5f80fd5b359061022182610201565b565b9181601f84011215610212578235916001600160401b038311610212576020838186019501011161021257565b6060600319820112610212576004359160243561026c81610201565b91604435906001600160401b0382116102125761028b91600401610223565b9091565b346102125760206102ab6102a236610250565b92919091611ce9565b6040519015158152f35b34610212576080366003190112610212576102d1600435610201565b6102dc602435610201565b6064356001600160401b038111610212576102fb903690600401610223565b5050604051630a85bd0160e11b8152602090f35b34610212576040366003190112610212576004356024356001600160401b0381116102125760209161034861034e923690600401610223565b91611e92565b6040516001600160e01b03199091168152f35b90816101209103126102125790565b6060366003190112610212576004356001600160401b0381116102125761039b903690600401610361565b602435604435917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610622576103df6020820135613038565b9092919084836001600160f81b0319861615610609575b826104019394613231565b9361042661041661041184611c7b565b611fc6565b946001600160f81b031916151590565b9384806105c8575b6105b957602001516001600160a01b031690819081156104c15760019261045f61047e925f525f60205260405f2090565b80546001600160a01b0319166001600160a01b03909216919091179055565b0361052c57826104d0575b50506104c157816104ab925b6104af575b506040519081529081906020820190565b0390f35b3490349034903490335af1505f61049a565b631a0a9b9f60e21b5f5260045ffd5b6105259250610521916105056104ff6104f96104ee61051a95611cb2565b936060810190611ff2565b90611b13565b90611c45565b63ffffffff60e01b165f5260205260405f2090565b5460ff1690565b1590565b5f80610489565b82919291610586575b506104c1576104f981606061054b930190611ff2565b638dd7712f60e01b916001600160e01b03199161056791611c45565b160361057757816104ab92610495565b63dbbb044b60e01b5f5260045ffd5b6105b3915061051a61059a61052192611cb2565b6105056104ff6105ad6060880188611ff2565b90611b02565b5f610535565b633ab3447f60e11b5f5260045ffd5b50805163ffffffff1663ffffffff6106016105f85f8051602061582b8339815191525463ffffffff9060c81c1690565b63ffffffff1690565b91161061042e565b5f8051602061582b8339815191525460581b92506103f6565b6348f5c3ed60e01b5f5260045ffd5b6004359063ffffffff8216820361021257565b359063ffffffff8216820361021257565b602036600319011261021257610669610631565b61068a6106845f8051602061582b8339815191525460581b90565b60581c90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806107f3575b156107e95760405163ecd0596160e01b81526004808201526001600160a01b039190911690602081602481855afa90811561078d575f916107ba575b50156106225760405163d68f602560e01b8152915f838061071f363433600485016120b9565b038183865af192831561078d575f93610792575b5061073d906133d8565b803b1561021257604051630b9dfbed60e11b8152915f91839182908490829061076990600483016120de565b03925af1801561078d5761077957005b806107875f61001b93610f91565b80610d12565b611e87565b61073d9193506107b3903d805f833e6107ab8183610f91565b810190612057565b9290610733565b6107dc915060203d6020116107e2575b6107d48183610f91565b810190612024565b5f6106f9565b503d6107ca565b5061001b906133d8565b50303314156106bd565b60203660031901126102125760043561081581610201565b6108306106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614158061092c575b156109225760405163ecd0596160e01b81526004808201526001600160a01b039190911690602081602481855afa90811561078d575f91610903575b50156106225760405163d68f602560e01b8152915f83806108c5363433600485016120b9565b038183865af192831561078d575f936108e3575b5061073d906120ef565b61073d9193506108fc903d805f833e6107ab8183610f91565b92906108d9565b61091c915060203d6020116107e2576107d48183610f91565b5f61089f565b5061001b906120ef565b5030331415610863565b6001600160581b031981160361021257565b9181601f84011215610212578235916001600160401b038311610212576020808501948460051b01011161021257565b346102125760a03660031901126102125760043561099581610936565b6024356109a181610201565b6044356001600160401b038111610212576109c0903690600401610223565b6064939193356001600160401b038111610212576109e2903690600401610223565b91608435956001600160401b03871161021257610a0661001b973690600401610948565b969095612235565b608036600319011261021257600435610a2681610936565b602435610a3281610201565b6044356001600160401b03811161021257610a51903690600401610223565b6064356001600160401b03811161021257610a70903690600401610223565b91610a8c6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580610b90575b15610b815760405163ecd0596160e01b81526004808201526001600160a01b03919091169490602081602481895afa90811561078d575f91610b62575b50156106225760405163d68f602560e01b8152955f8780610b22363433600485016120b9565b0381838a5af196871561078d575f97610b42575b5061073d95969761237e565b61073d969750610b5b903d805f833e6107ab8183610f91565b9695610b36565b610b7b915060203d6020116107e2576107d48183610f91565b5f610afc565b50919361001b9593919361237e565b5030331415610abf565b6001600160e01b031981160361021257565b34610212576020366003190112610212576104ab610bed600435610bcf81610b9a565b5f60408051610bdd81610f1f565b8281528260208201520152611dbf565b600160405191610bfc83610f1f565b805460a083901b839003168084529101546001600160a01b0380821660208086019182526001600160f81b031960589490941b84166040968701908152865195841686529151909216918401919091525116918101919091529081906060820190565b3461021257604036600319011261021257602060ff610cae600435610c8381610936565b610c9860243591610c9383610b9a565b611cb2565b9063ffffffff60e01b165f5260205260405f2090565b54166040519015158152f35b34610212576020366003190112610212576020610cef600435610cdc81610201565b5f604051610ce981610f3f565b52612e85565b60405190610cfc82610f3f565b546001600160a01b031690819052604051908152f35b5f91031261021257565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b34610212575f36600319011261021257610d7f610d8d610d5e613725565b604092919251938493600f60f81b855260e0602086015260e0850190610d1c565b908382036040850152610d1c565b4660608301523060808301525f60a083015281810360c083015260206060519182815201906080905f5b818110610dc5575050500390f35b8251845285945060209384019390920191600101610db7565b6040366003190112610212576004356001600160401b03811161021257610e09903690600401610361565b6024357f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610622575f908152602081905260409020546001600160a01b03169060609060018314159081610ea9575b610e7e610e77826060610e85940190611ff2565b8091611b21565b903061380d565b5015610e9a57610e9157005b61001b91613832565b63f21e646b60e01b5f5260045ffd5b9150610e85610e7e610e77610ecf610ec7610e776060880188611ff2565b9034896137c2565b9492505050610e63565b34610212575f36600319011261021257602063ffffffff5f8051602061582b8339815191525460c81c16604051908152f35b634e487b7160e01b5f52604160045260245ffd5b606081019081106001600160401b03821117610f3a57604052565b610f0b565b602081019081106001600160401b03821117610f3a57604052565b604081019081106001600160401b03821117610f3a57604052565b61012081019081106001600160401b03821117610f3a57604052565b90601f801991011681019081106001600160401b03821117610f3a57604052565b60405190610221604083610f91565b6040519061022161012083610f91565b6001600160401b038111610f3a5760051b60200190565b6080366003190112610212576004356001600160401b03811161021257611013903690600401610948565b602435916001600160401b038311610212573660238401121561021257826004013561103e81610fd1565b9361104c6040519586610f91565b8185526024602086019260061b8201019036821161021257602401915b8183106110be575050506044356001600160401b03811161021257611092903690600401610948565b90606435946001600160401b038611610212576110b661001b963690600401610948565b959094612483565b60408336031261021257602060409182516110d881610f5a565b6110e186610644565b8152828601356110f081610201565b83820152815201920191611069565b61110836610250565b6111236106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580611223575b156112185760405163ecd0596160e01b81526004808201526001600160a01b03919091169290602081602481875afa90811561078d575f916111f9575b50156106225760405163d68f602560e01b8152935f85806111b9363433600485016120b9565b038183885af194851561078d575f956111d9575b5061073d939495612650565b61073d9495506111f2903d805f833e6107ab8183610f91565b94936111cd565b611212915060203d6020116107e2576107d48183610f91565b5f611193565b509161001b93612650565b5030331415611156565b34610212575f366003190112610212576104ab60405161124e604082610f91565b60168152756b65726e656c2e616476616e6365642e76302e332e3160501b6020820152604051918291602083526020830190610d1c565b34610212575f366003190112610212576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b6112d236610250565b6112ed6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806113ed575b156113e25760405163ecd0596160e01b81526004808201526001600160a01b03919091169290602081602481875afa90811561078d575f916113c3575b50156106225760405163d68f602560e01b8152935f8580611383363433600485016120b9565b038183885af194851561078d575f956113a3575b5061073d9394956129db565b61073d9495506113bc903d805f833e6107ab8183610f91565b9493611397565b6113dc915060203d6020116107e2576107d48183610f91565b5f61135d565b509161001b936129db565b5030331415611320565b34610212575f36600319011261021257602063ffffffff5f8051602061582b8339815191525460a81c16604051908152f35b3461021257602036600319011261021257604061145960043561144b81610936565b611453612b89565b50611c7b565b81519061146582610f5a565b5463ffffffff81168083526001600160a01b03602092831c81169383019384528451918252925190921690820152f35b346102125760a0366003190112610212576114b1600435610201565b6114bc602435610201565b6044356001600160401b038111610212576114db903690600401610948565b50506064356001600160401b038111610212576114fc903690600401610948565b50506084356001600160401b0381116102125761151d903690600401610223565b505060405163bc197c8160e01b8152602090f35b602080825282516001600160f01b03191681830152808301516001600160a01b03166040808401919091529092015160608083015280516080830181905260a09092019201905f5b8181106115865750505090565b82516001600160501b031916845260209384019390920191600101611579565b34610212576020366003190112610212576115e56004356115c681610b9a565b6060604080516115d581610f1f565b5f81525f60208201520152611df5565b6001604051916115f483610f1f565b805461ffff60f01b8160f01b168452828060a01b039060101c16602084015201906040519182602082549182815201915f5260205f20905f5b818110611656576104ab858761164581880382610f91565b604082015260405191829182611531565b825460501b6001600160501b03191684526020909301926001928301920161162d565b346102125760203660031901126102125760206102ab600435612ba1565b9060406003198301126102125760043591602435906001600160401b0382116102125761028b91600401610223565b6116cf36611697565b90916001600160a01b036116e233612e85565b54169182156117995760609060018414159485611782575b611704929361404b565b92611772575b50506040518091602082016020835281518091526040830190602060408260051b8601019301915f905b82821061174357505050500390f35b919360019193955060206117628192603f198a82030186528851610d1c565b9601920192018594939192611734565b61177b91613832565b5f8061170a565b6117049250611792363487613769565b92506116fa565b63710c949760e01b5f5260045ffd5b6060366003190112610212576004356117c081610936565b6024356001600160401b038111610212576117df903690600401610223565b6044356001600160401b038111610212576117fe903690600401610223565b9061181a6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614158061191c575b1561190f5760405163ecd0596160e01b81526004808201526001600160a01b03919091169390602081602481885afa90811561078d575f916118f0575b50156106225760405163d68f602560e01b8152945f86806118b0363433600485016120b9565b038183895af195861561078d575f966118d0575b5061073d949596612c79565b61073d9596506118e9903d805f833e6107ab8183610f91565b95946118c4565b611909915060203d6020116107e2576107d48183610f91565b5f61188a565b5091909261001b94612c79565b503033141561184d565b61192f36611697565b61194a6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580611a4a575b15611a3f5760405163ecd0596160e01b81526004808201526001600160a01b03919091169190602081602481865afa90811561078d575f91611a20575b50156106225760405163d68f602560e01b8152925f84806119e0363433600485016120b9565b038183875af193841561078d575f94611a00575b5061073d929394612c8e565b61073d939450611a19903d805f833e6107ab8183610f91565b93926119f4565b611a39915060203d6020116107e2576107d48183610f91565b5f6119ba565b509061001b92612c8e565b503033141561197d565b34610212575f3660031901126102125760205f8051602061582b8339815191525460581b604051906001600160581b0319168152f35b346102125760a036600319011261021257611aa6600435610201565b611ab1602435610201565b6084356001600160401b03811161021257611ad0903690600401610223565b505060405163f23a6e6160e01b8152602090f35b346102125760203660031901126102125760206102ab600435612c99565b906008116102125760040190600490565b906004116102125790600490565b909291928360041161021257831161021257600401916003190190565b906018116102125760040190601490565b906014116102125790601490565b906020116102125790602090565b909291928360011161021257831161021257600101915f190190565b909291928360141161021257831161021257601401916013190190565b906009116102125760010190600890565b909291928360091161021257831161021257600901916008190190565b906016116102125790601690565b906016116102125760020190601490565b909291928360161161021257831161021257601601916015190190565b906002116102125790600290565b90602c116102125760180190601490565b90939293848311610212578411610212578101920390565b356001600160e01b0319811692919060048210611c60575050565b6001600160e01b031960049290920360031b82901b16169150565b6001600160581b0319165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85060205260405f2090565b6001600160581b0319165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85160205260405f2090565b90929060018103611d3857506001600160a01b0392611d329250611d22915060581b600160581b600160f81b0316600160f81b17611c7b565b5460201c6001600160a01b031690565b16151590565b60028103611d7857506001600160a01b0392611d329250611d6c9150611d5f908416612e85565b546001600160a01b031690565b6001600160a01b031690565b600303611db857611d99611d946104ff600193611da795611b13565b611dbf565b01546001600160a01b031690565b6001600160a01b0390811691161490565b5050505f90565b63ffffffff60e01b165f527f7c341349a4360fdd5d5bc07e69f325dc6aaea3eb018b3e0ea7e53cc0bb0d6f3b60205260405f2090565b63ffffffff60e01b165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85260205260405f2090565b908160209103126102125751611e4081610b9a565b90565b908060209392818452848401375f828201840152601f01601f1916010190565b611e40949260609260018060a01b0316825260208201528160408201520191611e43565b6040513d5f823e3d90fd5b91611e9c91612ebd565b91926001600160f81b0319841615611fa6575b6001600160a01b03611ec6611d6c611d2287611c7b565b16156104c1576001600160f81b03198416600160f81b03611f5a579260209291611ef2611f1095612fed565b604051637aa8f17760e11b8152958694859384933360048601611e63565b039160581c6001600160a01b03165afa90811561078d575f91611f31575090565b611e40915060203d602011611f53575b611f4b8183610f91565b810190611e2b565b503d611f41565b9260081b92600160f11b611f87611f7a611f7387611df5565b5460f01b90565b6001600160f01b03191690565b16611f9757611e40933390612f3a565b635b71057960e01b5f5260045ffd5b9250611fc05f8051602061582b8339815191525460581b90565b92611eaf565b90604051611fd381610f5a565b915463ffffffff81168352602090811c6001600160a01b031690830152565b903590601e198136030182121561021257018035906001600160401b0382116102125760200191813603831361021257565b90816020910312610212575180151581036102125790565b6001600160401b038111610f3a57601f01601f191660200190565b602081830312610212578051906001600160401b038211610212570181601f820112156102125780519061208a8261203c565b926120986040519485610f91565b8284526020838301011161021257815f9260208093018386015e8301015290565b611e40939260609260018060a01b03168252602082015281604082015201905f611e43565b906020611e40928181520190610d1c565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc8190556001600160a01b03167fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2565b1561214957565b60405162461bcd60e51b8152602060048201526013602482015272185b1c9958591e481a5b9a5d1a585b1a5e9959606a1b6044820152606490fd5b5f8051602061582b833981519152805463ffffffff60a81b191660a89290921b63ffffffff60a81b16919091179055565b634e487b7160e01b5f52603260045260245ffd5b908210156121e05761028b9160051b810190611ff2565b6121b5565b908092918237015f815290565b60405190612201602083610f91565b5f8252565b3d15612230573d906122178261203c565b916122256040519384610f91565b82523d5f602084013e565b606090565b94939291909695966122786001600160581b03196122716122645f8051602061582b8339815191525460581b90565b6001600160581b03191690565b1615612142565b6001600160581b03198616156104c1576001600160f81b03198616600160f81b141580612366575b61235757856122b16122fe9761349d565b6122d26122bc610fb2565b60018152925b6001600160a01b03166020840152565b5f8051602061582b833981519152805463ffffffff60a81b1916600160a81b179055613503565b613503565b5f5b81811061230c57505050565b5f806123198385876121c9565b90612329604051809381936121e5565b039082305af1612337612206565b501561234557600101612300565b636534eae560e11b5f5260045260245ffd5b6361c4e91b60e11b5f5260045ffd5b506001600160f81b03198616600160f91b14156122a0565b94939291906001600160581b03198616156104c1576001600160f81b03198616600160f81b141580612429575b612357576123b88661349d565b6001600160a01b036123cc611d2288611c7b565b16156123db575b505050505050565b61241e956122f96124015f8051602061582b8339815191525463ffffffff9060a81c1690565b926122c260405194612414604087610f91565b63ffffffff168552565b5f80808080806123d3565b506001600160f81b03198616600160f91b14156123ab565b9060405161244e81610f1f565b82546001600160a01b03908116825260019390930154928316602082015260589290921b6001600160f81b0319166040830152565b959294919390946124a56106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806125f5575b156125e65760405163ecd0596160e01b81526004808201526001600160a01b039190911695906020816024818a5afa90811561078d575f916125c7575b50156106225760405163d68f602560e01b8152965f888061253b363433600485016120b9565b0381838b5af197881561078d575f986125a7575b5061255b9697986138ab565b803b1561021257604051630b9dfbed60e11b8152915f91839182908490829061258790600483016120de565b03925af1801561078d57612599575b50565b806107875f61022193610f91565b61255b9798506125c0903d805f833e6107ab8183610f91565b979661254f565b6125e0915060203d6020116107e2576107d48183610f91565b5f612515565b509193909294610221966138ab565b50303314156124d8565b916020611e40938181520191611e43565b356bffffffffffffffffffffffff19811692919060148210612630575050565b6bffffffffffffffffffffffff1960149290920360031b82901b16169150565b60018103612790575060581b600160581b600160f81b0316600160f81b179061268561267b83611c7b565b5463ffffffff1690565b5f8051602061582b8339815191525460a81c63ffffffff169063ffffffff808316911614612778575b506127176126f0611d6c6126ea6126e46126dd5f8051602061582b8339815191525463ffffffff9060a81c1690565b9786611b4f565b90612610565b60601c90565b6127076126fb610fb2565b63ffffffff9096168652565b6001600160a01b03166020850152565b6127516014820135820191603481013581019060548101350194601486013593603460148401359301916034601483013592019087613503565b6004811461275f575b505050565b6104ff6127729160346102219501611b13565b90613c96565b61278a9060010163ffffffff16612184565b5f6126ae565b600281036127ec5750916127dd610221936127c2611d6c6126ea6126e460148801358801966034890135890198611b4f565b928391601482013591603401906001600160a01b0316613c4f565b60346014830135920190613aa0565b9091906003810361286c5750612867611d6c612857610221958461285260186126ea97013582016126ea603884013584019961282b6104ff8787611b13565b9061284c611d6c61283c8989611b3e565b6018880135976038019691612610565b91613918565b611b3e565b6018860135956038019491612610565b613aa0565b9060048203612900576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b03925af192831561078d575f805160206157eb833981519152936128ec575b50604080519182526001600160a01b03909216602082015290819081015b0390a1565b806107875f6128fa93610f91565b5f6128c9565b6005820361293d576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b6006820361297a576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b631092ef5760e11b5f5260045ffd5b359060208110612997575090565b5f199060200360031b1b1690565b9291926129b18261203c565b916129bf6040519384610f91565b829481845281830111610212578281602093845f960137010152565b60018103612a04575061259692919060581b600160581b600160f81b0316600160f81b17613eea565b60028103612a2157506125969291906001600160a01b0316613e67565b60038103612a4c575050612a468280612a406104ff6125969686611b13565b93611b21565b91613db9565b909160048203612ade57612aab6128c9915f8051602061580b83398151915295612a845f8051602061582b8339815191525460581b90565b612a90611d2282611c7b565b6001600160a01b03888116911614612ab1575b5036916129a5565b83613cfb565b612abd612ad891611c7b565b8054640100000000600160c01b031916640100000000179055565b5f612aa3565b60058203612b6a575f8051602061582b8339815191525460581b5b612b0c612b068684611b5d565b90612989565b906001600160f81b03198116600160f91b14612b42575b5050612aab6128c9915f8051602061580b8339815191529536916129a5565b60081b6001600160e01b03191614612b5b575f80612b23565b6313002bdd60e31b5f5260045ffd5b6006820361297a575f8051602061582b8339815191525460581b612af9565b60405190612b9682610f5a565b5f6020838281520152565b612bb5818060081b918160301b9160501b90565b929091906001600160f81b03198116600160f81b14159081612c65575b81612c50575b81612c37575b50611db85760ff60f81b16600160f81b8114159081612c2d575b50612c27576001600160e01b031916612c22576001600160501b031916612c1e57600190565b5f90565b505f90565b50505f90565b905015155f612bf8565b6001600160f81b031916607f60f91b141590505f612bde565b6001600160f81b031980821614159150612bd8565b6001600160f81b0319811615159150612bd2565b91612c8991610221959493613eea565b614285565b90612596929161404b565b60071115612c1e57600190565b7f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f8852587460408051338152346020820152a1565b612cf3612cee5f356001600160e01b031916611dbf565b612441565b80516001600160a01b0390612d09908216611d6c565b1615612e765780516060906001600160a01b0390612d28908216611d6c565b16600181141580612e65575b15612e195750508051612d53906001600160a01b031636903490613769565b60408201516001600160f81b03191680612dd957506020820151612d7f906001600160a01b0316614317565b92905b15612dd157516001600160a01b03169060018214158281612dbc575b50612dac575b825160208401f35b612db591613832565b5f80612da4565b6001600160a01b03908116141590505f612d9e565b825160208401fd5b6001600160f81b031990811603612e0a576020820151612e03906001600160a01b031636906137e8565b9290612d82565b632d6a6bb760e01b5f5260045ffd5b6001600160a01b0303612d5357337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614612d53576348f5c3ed60e01b5f5260045ffd5b506001600160a01b03811415612d34565b631cd4b64760e21b5f5260045ffd5b6001600160a01b03165f9081527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b866020526040902090565b9182358060f81c805f14612f015780600114612ef457600214612ede575f80fd5b6001600160d81b03191692600501916004190190565b5092601501916014190190565b505060015f9301915f190190565b9092608092611e409694835260018060a01b0316602083015260408201528160608201520191611e43565b919290612f54612f609565ffffffffffff93868487614359565b95929491979097614448565b5091164210908115612fdb575b50612fc857612faa612f80602096612fed565b60405163392dffaf60e01b8152978896879586959193916001600160e01b03191660048701612f0f565b03916001600160a01b03165afa90811561078d575f91611f31575090565b506001600160e01b031995945050505050565b65ffffffffffff91501642115f612f6d565b611e409060405160208101917f1547321c374afde8a591d972a084b071c594c275e36724931ff96c25f2999c838352604082015260408152613030606082610f91565b519020614474565b90818060081b9160ff839260f01c1660021461305057565b6001600160d81b031983169150565b9080601f8301121561021257816020611e40933591016129a5565b9190916101208184031261021257613090610fc1565b9261309a82610216565b84526020820135602085015260408201356001600160401b03811161021257816130c591840161305f565b604085015260608201356001600160401b03811161021257816130e991840161305f565b60608501526080820135608085015260a082013560a085015260c082013560c085015260e08201356001600160401b038111610212578161312b91840161305f565b60e08501526101008201356001600160401b0381116102125761314e920161305f565b610100830152565b90816020910312610212575190565b80516001600160a01b03168252611e4091602082015160208201526101006131e66131b66131a460408601516101206040870152610120860190610d1c565b60608601518582036060870152610d1c565b6080850151608085015260a085015160a085015260c085015160c085015260e085015184820360e0860152610d1c565b92015190610100818403910152610d1c565b939291613215906040928652606060208701526060860190613165565b930152565b929190613215602091604086526040860190613165565b9192909261326c5f93613244368461307a565b926101008101906132558282611ff2565b909490936001600160f81b031916600160f81b1490565b6133a3575b50506001600160f81b03198616600160f81b03613309575050604051639700320360e01b815293602092859283915f9183916132b0916004840161321a565b039260581c6001600160a01b03165af190811561078d57611e40925f926132d8575b50614962565b6132fb91925060203d602011613302575b6132f38183610f91565b810190613156565b905f6132d2565b503d6132e9565b909460081b93909291600160f01b613326611f7a611f7388611df5565b16613394575f61334661334060209661337099858a614783565b94614962565b604051630ccab7a160e01b8152979096889586948593926001600160e01b031916600485016131f8565b03926001600160a01b03165af190811561078d57611e40925f926132d85750614962565b6314b9743f60e01b5f5260045ffd5b9091506133bd9395506133b69250611ff2565b9085614586565b9193916133cb3682846129a5565b6101008401525f80613271565b5f8051602061582b83398151915254600a63ffffffff8260a81c16019063ffffffff82116134895763ffffffff8381169216821161347a576134229060c81c63ffffffff166105f8565b10156105b9575f8051602061582b833981519152805463ffffffff60c81b60c893841b1663ffffffff60c81b1990911617908190559081901c63ffffffff9081169160a81c1681116134715750565b61022190612184565b63e60fd64760e01b5f5260045ffd5b634e487b7160e01b5f52601160045260245ffd5b60207f6789ec0c85d6458d897a36a70129b101f8b4d84c6e218046c3107373dbcbae88918060581c6001600160581b0360a81b5f8051602061582b8339815191525416175f8051602061582b83398151915255604051906001600160581b0319168152a1565b92949093919361351561267b85611c7b565b5f8051602061582b8339815191525460a81c63ffffffff169063ffffffff80831691161461370d575b506020810180516001600160a01b031615613704575b5f8051602061582b8339815191525460a81c63ffffffff1663ffffffff6135826105f8855163ffffffff1690565b9116148015906136d8575b6105b9576135db6135e8926135a187611c7b565b815181546020938401516001600160c01b031990911663ffffffff9290921691909117921b640100000000600160c01b0316919091179055565b516001600160a01b031690565b915f196001600160a01b038416016136c7575b5050506001600160f81b03198116600160f81b036136a45760581c6001600160a01b031690813b15610212576040516306d61fe760e41b8152925f91849182916136499190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613690575b5060408051600181526001600160a01b03909216602083015290918291820190565b806107875f61369e93610f91565b5f61366e565b91506001600160f81b03198216600160f91b03612357576102219160081b614b15565b6136d092613aa0565b5f80806135fb565b506136e561267b86611c7b565b63ffffffff6136fb6105f8855163ffffffff1690565b9116101561358d565b60018152613554565b61371f9060010163ffffffff16612184565b5f61353e565b60409081516137348382610f91565b600681526512d95c9b995b60d21b60208201529161375481519182610f91565b6005815264302e332e3160d81b602082015290565b91613790925f8080946040519687958694859363d68f602560e01b85523360048601611e63565b03926001600160a01b03165af190811561078d575f916137ae575090565b611e4091503d805f833e6107ab8183610f91565b5f928361379095936040519687958694859363d68f602560e01b85523360048601611e63565b5f9060405192808385378338925af4913d82523d5f602084013e60203d830101604052565b5f9192806040519485378338925af4913d82523d5f602084013e60203d830101604052565b6001600160a01b0316803b1561021257604051630b9dfbed60e11b815260206004820152915f91839182908490829061386f906024830190610d1c565b03925af1801561078d576138805750565b5f61022191610f91565b8051156121e05760200190565b80518210156121e05760209160051b010190565b909593919492965f5b87811015613904576001906138fe8a896138ea84896138e3828060051b8c0135956138de87610936565b613897565b51946121c9565b906138f6868d8d6121c9565b949093613503565b016138b4565b509650505050505050565b90156121e05790565b9293929091906001600160a01b03821615613a91575b61393790611dbf565b93613963613956613948868461390f565b356001600160f81b03191690565b6001600160f81b03191690565b936001600160f81b03198516613a69576001600160a01b0384169161398a91908190611b6b565b823b15610212576139b4925f92836040518096819582946306d61fe760e41b8452600484016125ff565b03925af194851561078d57613a18613a389360019361022198613a55575b5060408051600381526001600160a01b03881660208201525f805160206157eb8339815191529190a15b82546001600160a01b0319166001600160a01b03909116178255565b0180546001600160a01b0319166001600160a01b03909316929092178255565b805460ff60a01b191660589290921c60ff60a01b16919091179055565b806107875f613a6393610f91565b5f6139d2565b50909390506001600160f81b031980841603612e0a576001613a3891613a18610221966139fc565b6001600160a01b03915061392e565b6001600160a01b0316919082158015613c45575b61275a5760405163d60b347f60e01b8152306004820152602081602481875afa90811561078d575f91613c26575b50613b79579080613af292611b6b565b9190813b15610212576040516306d61fe760e41b8152925f9184918291613b1d9190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613b65575b505b60408051600481526001600160a01b03909216602083015290918291820190565b806107875f613b7393610f91565b5f613b42565b6001600160f81b031980613b90613948858561390f565b1614613bb0575b50506128e75f805160206157eb83398151915291613b44565b9080613bbb92611b6b565b9190813b15610212576040516306d61fe760e41b8152925f9184918291613be69190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613c12575b5091613b97565b806107875f613c2093610f91565b5f613c0b565b613c3f915060203d6020116107e2576107d48183610f91565b5f613ae2565b5060018314613ab4565b9092613c5b9082614e20565b6001600160a01b031691823b156102125761386f925f92836040518096819582946306d61fe760e41b84526020600485018181520191611e43565b7f9d17cd6d095ac90a655405ab29f30a7ee7e88ef3974c1bf7544bf591043bb71a91606091613cc882610c9883611cb2565b600160ff198254161790556040519163ffffffff60e01b1682526001600160581b031916602082015260016040820152a1565b91907f2b82f87bf66300af618a9621d3f221edfab735f5bacb4e004cce1b62375396c3905a905f8060405193613d5b85613d4d6020820196638a91b0e360e01b88526020602484018181520190610d1c565b03601f198101875286610f91565b60405193613d6a602086610f91565b828552602085019583908a905f368a375193f1913d9081613db1575b815f9293523e604080516001600160a01b0390951685528115156020860152909390819081016128e7565b5f9150613d86565b613dc69093929193611dbf565b80546001600160a01b031981168255600190910180546001600160a01b039092169490929091906001600160f81b0319605883901b1615613e16575b505081546001600160a81b03191690915550565b613e3492613e259136916129a5565b906001600160a01b0316613cfb565b50805460408051600381526001600160a01b0390921660208301525f8051602061580b83398151915291a15f8080613e02565b6001600160a01b039081165f8181527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b8660205260409081902080546001600160a01b0319811690915590921694935f8051602061580b83398151915293613eda91613ed4913691906129a5565b82613cfb565b50815190600282526020820152a1565b929190613f1a613f085f8051602061582b8339815191525460581b90565b6001600160581b031980871691161490565b612b5b57613f2a611d2285611c7b565b93613f4b613f3782611c7b565b8054640100000000600160c01b0319169055565b6001600160f81b03198116600160f81b03613f8e579161366e613ed46128e7935f8051602061580b8339815191529560018060a01b039060581c169336916129a5565b91506001600160f81b03198216600160f91b03612357576102219160081b614ea6565b60408051909190613fc28382610f91565b6001815291601f1901825f5b828110613fda57505050565b806060602080938501015201613fce565b90613ff582610fd1565b6140026040519182610f91565b8281528092614013601f1991610fd1565b01905f5b82811061402357505050565b806060602080938501015201614017565b906040611e40925f81528160208201520190610d1c565b9291600884901b91906001600160f81b03198516600160f81b036140e9575061407e919293508035019060208201913590565b90916001600160f81b031981166140995750611e409161518b565b6001600160f81b031916600160f81b036140b657611e40916150d1565b60405162461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b91936001600160f81b031981166141a05750906141059161502a565b9161410e613fb1565b956001600160f81b0319811661413b575061412893615079565b6141318361388a565b526125968261388a565b6001600160f81b031916600160f81b036140b65761415893615052565b6141618461388a565b52610221577fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76128e76141938461388a565b5160405191829182614034565b9193916001600160f81b0319908116036140b6576141e1906141db6141c3613fb1565b95806141d56126ea6126e48387611b4f565b93611b87565b9161380d565b6141ed8593929361388a565b526001600160f81b03198116600160f81b0361423857501561420b57565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76128e76141938461388a565b6001600160f81b0319166140b6576102215760405162461bcd60e51b815260206004820152601360248201527211195b1959d85d1958d85b1b0819985a5b1959606a1b6044820152606490fd5b9091906001600160a01b03168015801561430d575b61275a5781156121e0575f8051602061580b833981519152926128e7926001600160f81b031982358116146142ed575b505060408051600481526001600160a01b03909216602083015290918291820190565b6142fe81613ed49261430594611b6b565b36916129a5565b505f806142ca565b506001811461429a565b5f809160405136810160405236838237604051601481016040523360601b90528260143601925af190604051903d82523d5f602084013e60203d830101604052565b949184846143da92969593966040519061437282610f75565b5f82525f602083015260408201995f8b526143d4606084019a8b925f84525f60808701525f60a0870152606060c08701526143c560e08701915f83526101008801955f87529063ffffffff60e01b169052565b6001600160a01b039091169052565b52615224565b60ff806143f36143ed613948878661390f565b60f81c90565b16036144395761442261440d8461441d9561443294611b6b565b9490955163ffffffff60e01b1690565b611df5565b5460101c6001600160a01b031690565b9351929190565b63b32eeb6960e01b5f5260045ffd5b8065ffffffffffff8260a01c16918215600114614466575b60d01c92565b65ffffffffffff9250614460565b7f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000030147f0000000000000000000000000000000000000000000000000000000000000000461416156144ff575b6719010000000000005f52601a52603a526042601820905f603a52565b5060a06040517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81527f000000000000000000000000000000000000000000000000000000000000000060208201527f00000000000000000000000000000000000000000000000000000000000000006040820152466060820152306080820152206144e2565b61458e612b89565b926145999083611b4f565b6145a291612610565b60601c602084018190525f8051602061582b8339815191525460a81c63ffffffff168085526034601485810135860182810197605488013588018085019690840135959194808a01358a018086013595910193013591889161460536858e6129a5565b8051906020012091366146199088886129a5565b805190602001203661462c908b8d6129a5565b8051602091820120604080517fb17ab1224aca0d4255ef8161acaf2ac121b8faa32a4b2258c912cc5f8308c5059381019384526001600160581b0319989098169088015263ffffffff9390931660608701526001600160a01b0393909316608086015260a085019390935260c084019290925260e080840192909252908252906146b861010082610f91565b5190206146c490614474565b607489013589016014810135906034016146dd92615492565b986146e89488613503565b6146f28183615631565b6146fb91611b13565b61470491611c45565b61470d91613c96565b609481013501909160348201916014013590565b80548210156121e0575f5260205f2001905f90565b356001600160c01b0319811692919060088210614751575050565b6001600160c01b031960089290920360031b82901b16169150565b604090611e40939281528160208201520190613165565b93929190935f92600161479583611df5565b015f5b8154811015614925576147c66147be6147b18385614721565b90549060031b1c60501b90565b908160501c90565b9390956147e26147dc6143ed613948858561390f565b60ff1690565b8084036148f7575090818161481b61480f6148096148038461483998611ba4565b90614736565b60c01c90565b6001600160401b031690565b600901918c6101006148316142fe868686611bb5565b910152611c2d565b939093955b600160f01b1615614856575b50600101939193614798565b604051633894f6e760e11b81529196906020908390815f816148868f6001600160e01b03198d166004840161476c565b03926001600160a01b03165af191821561078d575f926148d7575b506001600160a01b0382166148c3576001916148bc91614962565b959061484a565b631f24c1fb60e11b5f52600487905260245ffd5b6148f091925060203d8111613302576132f38183610f91565b905f6148a1565b919690949183111561491257630760bdcf60e11b5f5260045ffd5b61491a6121f2565b6101008b015261483e565b505091929460ff8061493d6143ed613948878961390f565b16036144395761010061495a6142fe8561442296611e4098611b6b565b910152611df5565b908082186001600160a01b031615606083811b838501821b9081149184901b141717600114614992575050600190565b65ffffffffffff60a01b8216916001600160d01b03198082169083168415614a12575b65ffffffffffff60a01b84168015614a02575b8581109086180280861895146149f1575b81811190821802189160018060a01b03911716171790565b65ffffffffffff60a01b94506149d9565b5065ffffffffffff60a01b6149c8565b65ffffffffffff60a01b94506149b5565b8054905f815581614a32575050565b5f5260205f20908101905b818110614a48575050565b5f8155600101614a3d565b356001600160501b0319811692919060168210614a6e575050565b6001600160501b031960169290920360031b82901b16169150565b805468010000000000000000811015610f3a57614aab91600182018155614721565b819291549060031b9160501c821b9160018060b01b03901b1916179055565b9092809260209483528483013701015f815290565b356001600160f01b0319811692919060028210614afa575050565b6001600160f01b031960029290920360031b82901b16169150565b91908035016020810190359260fe84118015614e18575b614e09576001614b3b82611df5565b0154614df0575b5f1984015f5b818110614cb2575090614c07614c008387614ba0614bf1614bd8611f7a614bd2614bcc87614c239e9f8e614bc7614c319f8f90611d6c6126ea6126e4614b92614b989489896121c9565b90611be0565b9a8b91611df5565b805462010000600160b01b03191660109290921b62010000600160b01b0316919091179055565b6121c9565b90611c0e565b90614adf565b614be188611df5565b9060f01c61ffff19825416179055565b6001600160a01b0316966121c9565b8091611bf1565b6040519586939092906001600160e01b03191660208501614aca565b03601f198101845283610f91565b803b15610212575f614c5792604051809481926306d61fe760e41b8352600483016120de565b038183855af190811561078d575f805160206157eb833981519152926128e792614c9e575b5060408051600681526001600160a01b03909216602083015290918291820190565b806107875f614cac93610f91565b5f614c7c565b614d4d90614cf86001614cc486611df5565b01614cf2614ce5614cdf614cd9868d8c6121c9565b90611bd2565b90614a53565b6001600160501b03191690565b90614a89565b614d12611d6c611d6c6126ea6126e4614b92868d8c6121c9565b614d20614c00838a896121c9565b60405194918591614d3f916001600160e01b03198a1660208501614aca565b03601f198101855284610f91565b803b15610212576040516306d61fe760e41b8152925f918491829084908290614d7990600483016120de565b03925af191821561078d57600192614ddc575b505f805160206157eb833981519152614dd3614db26126ea6126e4614b92868d8c6121c9565b60408051600581526001600160a01b03909216602083015290918291820190565b0390a101614b48565b806107875f614dea93610f91565b5f614d8c565b614e046001614dfe83611df5565b01614a23565b614b42565b63b62d956d60e01b5f5260045ffd5b508315614b2c565b5f805160206157eb833981519152916040916001600160a01b03821615614e9d575b6001600160a01b039081165f8181527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b8660205284902080546001600160a01b03191693909216929092179055815190600282526020820152a1565b60019150614e42565b919080350191602083019235614ebb82611df5565b9260018401906001825401830361501b575f5b8254811015614f7057805f8051602061580b833981519152614f6789614f45614f37613ed48b614f1b888d614f0c6147be8f60019e6147b191614721565b90508c8060a01b0316976121c9565b6040519485939092906001600160e01b03191660208501614aca565b03601f198101835282610f91565b5060408051600581526001600160a01b03909216602083015290918291820190565b0390a101614ece565b5094614c23915091614fb76102219594614c07614fbc95614f956001614dfe85611df5565b8754614fac9060101c6001600160a01b0316611d6c565b945f198101916121c9565b613cfb565b5080545f8051602061580b8339815191529061500890614fe79060101c6001600160a01b0316611d6c565b60408051600681526001600160a01b03909216602083015290918291820190565b0390a180546001600160b01b0319169055565b63013dcc8d60e31b5f5260045ffd5b908060141161021257813560601c926034821061021257601483013592603401916033190190565b905f928491604051958692833738935af1913d82523d5f602084013e60203d830101604052565b90925f92819594604051968792833738935af1156150a6573d82523d5f602084013e60203d830101604052565b503d5f823e3d90fd5b91908110156121e05760051b81013590605e1981360301821215610212570190565b9190916150dd83613feb565b925f5b8181106150ec57505050565b806151236150fd60019385876150af565b803561510881610201565b61511b6020830135926040810190611ff2565b929091615052565b61512d8389613897565b521561513a575b016150e0565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76151836151688389613897565b51604051918291858352604060208401526040830190610d1c565b0390a1615134565b91909161519783613feb565b925f5b8181106151a657505050565b806151dd6151b760019385876150af565b80356151c281610201565b6151d56020830135926040810190611ff2565b929091615079565b6151e78288613897565b526151f28187613897565b500161519a565b9092608092611e409594835260018060a01b0316602083015260408201528160608201520190610d1c565b9160608301906001615279615240845163ffffffff60e01b1690565b6001600160e01b0319165f9081527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f8526020526040902090565b01805493905f5b8581106152905750505050505050565b6152a06147be6147b18385614721565b6001600160a01b031660a08901908152608089019490916152c9906001600160f01b0319168652565b6152e36152dc6143ed613948898561390f565b60ff168a52565b6152f16147dc8a5160ff1690565b808403615460575085818161531661480f61480961480361536b9b9c61533e98611ba4565b8c60c06153316142fe60208401948086526009018688611bb5565b9101525160090191611c2d565b949094955b51600160f11b9061535d906001600160f01b031916611f7a565b166001600160f01b03191690565b1561537a575b50600101615280565b5161538d906001600160a01b0316611d6c565b60206153b36153a66153a6895163ffffffff60e01b1690565b6001600160e01b03191690565b60e08a01516101008b015160c08c015160405163184dfdbb60e11b81529586949093859384936153f29390926001600160a01b031690600486016151f9565b03915afa90811561078d575f91615442575b506001600160a01b03811661542e579060019161542660408a01918251614962565b905290615371565b631f24c1fb60e11b5f52600482905260245ffd5b61545a915060203d8111613302576132f38183610f91565b5f615404565b90949083111561547957630760bdcf60e11b5f5260045ffd5b61536b90615488365f886129a5565b60c08b0152615343565b5f8051602061582b833981519152545f9493929060581b6001600160f81b03198116600160f81b0361554d57916154f293916154d3611d6c60209560581c90565b9160405195869485938493637aa8f17760e11b85523060048601611e63565b03915afa90811561078d575f9161552e575b505b6001600160e01b0319166374eca2c160e11b0161551f57565b6362467c7760e11b5f5260045ffd5b615547915060203d602011611f5357611f4b8183610f91565b5f615504565b9094509091906001600160f81b03198116600160f91b036123575760209161557b9160081b95843088614359565b60405163392dffaf60e01b815292979295869493859384936155ae93909230906001600160e01b03191660048701612f0f565b03916001600160a01b03165afa90811561078d575f916155cf575b50615506565b6155e8915060203d602011611f5357611f4b8183610f91565b5f6155c9565b156155f557565b60405162461bcd60e51b8152602060048201526014602482015273496e76616c69642073656c6563746f724461746160601b6044820152606490fd5b61563e6104ff8383611b13565b90600483101561564d57505050565b602c83106157dc57615668611d6c6126ea6126e48685611b3e565b602c8201358201602c604c820191013591604c8401358401946156a2615694613956613948878761390f565b6001600160f81b0319161590565b8061574c575b946156e961286795611d6c956156ee956102219b956126ea9a6156fe575b6156d9611d6c6126ea6126e48a8a611c1c565b916001600160a01b031690613918565b611c1c565b602c86013595604c019491612610565b615747606c8701358701615741602c604c830192013580615728611d6c6126ea6126e48488611b4f565b9361573c856001600160a01b038a16614e20565b611b87565b91613aa0565b6156c6565b5091939092956040519163ecd0596160e01b83526020838061577660048201906002602083019252565b03816001600160a01b0389165afa92831561078d57610221986126ea9761286797611d6c976156ee976156e9955f916157bd575b50959a50959b50955095509550506156a8565b6157d6915060203d6020116107e2576107d48183610f91565b5f6157aa565b5050600461022191146155ee56fed21d0b289f126c4b473ea641963e766833c2f13866e4ff480abd787c100ef123341347516a9de374859dfda710fa4828b2d48cb57d4fbe4c1149612b8e02276e7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f84fa164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080604052600436101561001d575b36612cd75761001b612ca6565b005b5f3560e01c8063112d3a7d146101fc578063150b7a02146101f75780631626ba7e146101f257806319822f7c146101ed5780631f1b92e3146101e85780633659cfe6146101e35780633c3b752b146101de57806352141cd9146101d957806357b3a5f4146101d45780636e6fa0c6146101cf578063721e67f4146101ca57806384b0196e146101c55780638dd7712f146101c057806390ef8862146101bb5780639198bdf5146101b65780639517e29f146101b15780639cfd7cff146101ac578063a65d69d4146101a7578063a71763a8146101a2578063adb610a31461019d578063b8afe17d14610198578063bc197c8114610193578063c3e589781461018e578063d03c791414610189578063d691c96414610184578063e6f3d50a1461017f578063e9ae5c531461017a578063f1f7f0f914610175578063f23a6e61146101705763f2dc691d0361000e57611ae4565b611a8a565b611a54565b611926565b6117a8565b6116c6565b611679565b6115a6565b611495565b611429565b6113f7565b6112c9565b611285565b61122d565b6110ff565b610fe8565b610ed9565b610dde565b610d40565b610cba565b610c5f565b610bac565b610a0e565b610978565b6107fd565b610655565b610370565b61030f565b6102b5565b61028f565b6001600160a01b0381160361021257565b5f80fd5b359061022182610201565b565b9181601f84011215610212578235916001600160401b038311610212576020838186019501011161021257565b6060600319820112610212576004359160243561026c81610201565b91604435906001600160401b0382116102125761028b91600401610223565b9091565b346102125760206102ab6102a236610250565b92919091611ce9565b6040519015158152f35b34610212576080366003190112610212576102d1600435610201565b6102dc602435610201565b6064356001600160401b038111610212576102fb903690600401610223565b5050604051630a85bd0160e11b8152602090f35b34610212576040366003190112610212576004356024356001600160401b0381116102125760209161034861034e923690600401610223565b91611e92565b6040516001600160e01b03199091168152f35b90816101209103126102125790565b6060366003190112610212576004356001600160401b0381116102125761039b903690600401610361565b602435604435917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610622576103df6020820135613038565b9092919084836001600160f81b0319861615610609575b826104019394613231565b9361042661041661041184611c7b565b611fc6565b946001600160f81b031916151590565b9384806105c8575b6105b957602001516001600160a01b031690819081156104c15760019261045f61047e925f525f60205260405f2090565b80546001600160a01b0319166001600160a01b03909216919091179055565b0361052c57826104d0575b50506104c157816104ab925b6104af575b506040519081529081906020820190565b0390f35b3490349034903490335af1505f61049a565b631a0a9b9f60e21b5f5260045ffd5b6105259250610521916105056104ff6104f96104ee61051a95611cb2565b936060810190611ff2565b90611b13565b90611c45565b63ffffffff60e01b165f5260205260405f2090565b5460ff1690565b1590565b5f80610489565b82919291610586575b506104c1576104f981606061054b930190611ff2565b638dd7712f60e01b916001600160e01b03199161056791611c45565b160361057757816104ab92610495565b63dbbb044b60e01b5f5260045ffd5b6105b3915061051a61059a61052192611cb2565b6105056104ff6105ad6060880188611ff2565b90611b02565b5f610535565b633ab3447f60e11b5f5260045ffd5b50805163ffffffff1663ffffffff6106016105f85f8051602061582b8339815191525463ffffffff9060c81c1690565b63ffffffff1690565b91161061042e565b5f8051602061582b8339815191525460581b92506103f6565b6348f5c3ed60e01b5f5260045ffd5b6004359063ffffffff8216820361021257565b359063ffffffff8216820361021257565b602036600319011261021257610669610631565b61068a6106845f8051602061582b8339815191525460581b90565b60581c90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806107f3575b156107e95760405163ecd0596160e01b81526004808201526001600160a01b039190911690602081602481855afa90811561078d575f916107ba575b50156106225760405163d68f602560e01b8152915f838061071f363433600485016120b9565b038183865af192831561078d575f93610792575b5061073d906133d8565b803b1561021257604051630b9dfbed60e11b8152915f91839182908490829061076990600483016120de565b03925af1801561078d5761077957005b806107875f61001b93610f91565b80610d12565b611e87565b61073d9193506107b3903d805f833e6107ab8183610f91565b810190612057565b9290610733565b6107dc915060203d6020116107e2575b6107d48183610f91565b810190612024565b5f6106f9565b503d6107ca565b5061001b906133d8565b50303314156106bd565b60203660031901126102125760043561081581610201565b6108306106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614158061092c575b156109225760405163ecd0596160e01b81526004808201526001600160a01b039190911690602081602481855afa90811561078d575f91610903575b50156106225760405163d68f602560e01b8152915f83806108c5363433600485016120b9565b038183865af192831561078d575f936108e3575b5061073d906120ef565b61073d9193506108fc903d805f833e6107ab8183610f91565b92906108d9565b61091c915060203d6020116107e2576107d48183610f91565b5f61089f565b5061001b906120ef565b5030331415610863565b6001600160581b031981160361021257565b9181601f84011215610212578235916001600160401b038311610212576020808501948460051b01011161021257565b346102125760a03660031901126102125760043561099581610936565b6024356109a181610201565b6044356001600160401b038111610212576109c0903690600401610223565b6064939193356001600160401b038111610212576109e2903690600401610223565b91608435956001600160401b03871161021257610a0661001b973690600401610948565b969095612235565b608036600319011261021257600435610a2681610936565b602435610a3281610201565b6044356001600160401b03811161021257610a51903690600401610223565b6064356001600160401b03811161021257610a70903690600401610223565b91610a8c6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580610b90575b15610b815760405163ecd0596160e01b81526004808201526001600160a01b03919091169490602081602481895afa90811561078d575f91610b62575b50156106225760405163d68f602560e01b8152955f8780610b22363433600485016120b9565b0381838a5af196871561078d575f97610b42575b5061073d95969761237e565b61073d969750610b5b903d805f833e6107ab8183610f91565b9695610b36565b610b7b915060203d6020116107e2576107d48183610f91565b5f610afc565b50919361001b9593919361237e565b5030331415610abf565b6001600160e01b031981160361021257565b34610212576020366003190112610212576104ab610bed600435610bcf81610b9a565b5f60408051610bdd81610f1f565b8281528260208201520152611dbf565b600160405191610bfc83610f1f565b805460a083901b839003168084529101546001600160a01b0380821660208086019182526001600160f81b031960589490941b84166040968701908152865195841686529151909216918401919091525116918101919091529081906060820190565b3461021257604036600319011261021257602060ff610cae600435610c8381610936565b610c9860243591610c9383610b9a565b611cb2565b9063ffffffff60e01b165f5260205260405f2090565b54166040519015158152f35b34610212576020366003190112610212576020610cef600435610cdc81610201565b5f604051610ce981610f3f565b52612e85565b60405190610cfc82610f3f565b546001600160a01b031690819052604051908152f35b5f91031261021257565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b34610212575f36600319011261021257610d7f610d8d610d5e613725565b604092919251938493600f60f81b855260e0602086015260e0850190610d1c565b908382036040850152610d1c565b4660608301523060808301525f60a083015281810360c083015260206060519182815201906080905f5b818110610dc5575050500390f35b8251845285945060209384019390920191600101610db7565b6040366003190112610212576004356001600160401b03811161021257610e09903690600401610361565b6024357f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610622575f908152602081905260409020546001600160a01b03169060609060018314159081610ea9575b610e7e610e77826060610e85940190611ff2565b8091611b21565b903061380d565b5015610e9a57610e9157005b61001b91613832565b63f21e646b60e01b5f5260045ffd5b9150610e85610e7e610e77610ecf610ec7610e776060880188611ff2565b9034896137c2565b9492505050610e63565b34610212575f36600319011261021257602063ffffffff5f8051602061582b8339815191525460c81c16604051908152f35b634e487b7160e01b5f52604160045260245ffd5b606081019081106001600160401b03821117610f3a57604052565b610f0b565b602081019081106001600160401b03821117610f3a57604052565b604081019081106001600160401b03821117610f3a57604052565b61012081019081106001600160401b03821117610f3a57604052565b90601f801991011681019081106001600160401b03821117610f3a57604052565b60405190610221604083610f91565b6040519061022161012083610f91565b6001600160401b038111610f3a5760051b60200190565b6080366003190112610212576004356001600160401b03811161021257611013903690600401610948565b602435916001600160401b038311610212573660238401121561021257826004013561103e81610fd1565b9361104c6040519586610f91565b8185526024602086019260061b8201019036821161021257602401915b8183106110be575050506044356001600160401b03811161021257611092903690600401610948565b90606435946001600160401b038611610212576110b661001b963690600401610948565b959094612483565b60408336031261021257602060409182516110d881610f5a565b6110e186610644565b8152828601356110f081610201565b83820152815201920191611069565b61110836610250565b6111236106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580611223575b156112185760405163ecd0596160e01b81526004808201526001600160a01b03919091169290602081602481875afa90811561078d575f916111f9575b50156106225760405163d68f602560e01b8152935f85806111b9363433600485016120b9565b038183885af194851561078d575f956111d9575b5061073d939495612650565b61073d9495506111f2903d805f833e6107ab8183610f91565b94936111cd565b611212915060203d6020116107e2576107d48183610f91565b5f611193565b509161001b93612650565b5030331415611156565b34610212575f366003190112610212576104ab60405161124e604082610f91565b60168152756b65726e656c2e616476616e6365642e76302e332e3160501b6020820152604051918291602083526020830190610d1c565b34610212575f366003190112610212576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b6112d236610250565b6112ed6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806113ed575b156113e25760405163ecd0596160e01b81526004808201526001600160a01b03919091169290602081602481875afa90811561078d575f916113c3575b50156106225760405163d68f602560e01b8152935f8580611383363433600485016120b9565b038183885af194851561078d575f956113a3575b5061073d9394956129db565b61073d9495506113bc903d805f833e6107ab8183610f91565b9493611397565b6113dc915060203d6020116107e2576107d48183610f91565b5f61135d565b509161001b936129db565b5030331415611320565b34610212575f36600319011261021257602063ffffffff5f8051602061582b8339815191525460a81c16604051908152f35b3461021257602036600319011261021257604061145960043561144b81610936565b611453612b89565b50611c7b565b81519061146582610f5a565b5463ffffffff81168083526001600160a01b03602092831c81169383019384528451918252925190921690820152f35b346102125760a0366003190112610212576114b1600435610201565b6114bc602435610201565b6044356001600160401b038111610212576114db903690600401610948565b50506064356001600160401b038111610212576114fc903690600401610948565b50506084356001600160401b0381116102125761151d903690600401610223565b505060405163bc197c8160e01b8152602090f35b602080825282516001600160f01b03191681830152808301516001600160a01b03166040808401919091529092015160608083015280516080830181905260a09092019201905f5b8181106115865750505090565b82516001600160501b031916845260209384019390920191600101611579565b34610212576020366003190112610212576115e56004356115c681610b9a565b6060604080516115d581610f1f565b5f81525f60208201520152611df5565b6001604051916115f483610f1f565b805461ffff60f01b8160f01b168452828060a01b039060101c16602084015201906040519182602082549182815201915f5260205f20905f5b818110611656576104ab858761164581880382610f91565b604082015260405191829182611531565b825460501b6001600160501b03191684526020909301926001928301920161162d565b346102125760203660031901126102125760206102ab600435612ba1565b9060406003198301126102125760043591602435906001600160401b0382116102125761028b91600401610223565b6116cf36611697565b90916001600160a01b036116e233612e85565b54169182156117995760609060018414159485611782575b611704929361404b565b92611772575b50506040518091602082016020835281518091526040830190602060408260051b8601019301915f905b82821061174357505050500390f35b919360019193955060206117628192603f198a82030186528851610d1c565b9601920192018594939192611734565b61177b91613832565b5f8061170a565b6117049250611792363487613769565b92506116fa565b63710c949760e01b5f5260045ffd5b6060366003190112610212576004356117c081610936565b6024356001600160401b038111610212576117df903690600401610223565b6044356001600160401b038111610212576117fe903690600401610223565b9061181a6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614158061191c575b1561190f5760405163ecd0596160e01b81526004808201526001600160a01b03919091169390602081602481885afa90811561078d575f916118f0575b50156106225760405163d68f602560e01b8152945f86806118b0363433600485016120b9565b038183895af195861561078d575f966118d0575b5061073d949596612c79565b61073d9596506118e9903d805f833e6107ab8183610f91565b95946118c4565b611909915060203d6020116107e2576107d48183610f91565b5f61188a565b5091909261001b94612c79565b503033141561184d565b61192f36611697565b61194a6106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316141580611a4a575b15611a3f5760405163ecd0596160e01b81526004808201526001600160a01b03919091169190602081602481865afa90811561078d575f91611a20575b50156106225760405163d68f602560e01b8152925f84806119e0363433600485016120b9565b038183875af193841561078d575f94611a00575b5061073d929394612c8e565b61073d939450611a19903d805f833e6107ab8183610f91565b93926119f4565b611a39915060203d6020116107e2576107d48183610f91565b5f6119ba565b509061001b92612c8e565b503033141561197d565b34610212575f3660031901126102125760205f8051602061582b8339815191525460581b604051906001600160581b0319168152f35b346102125760a036600319011261021257611aa6600435610201565b611ab1602435610201565b6084356001600160401b03811161021257611ad0903690600401610223565b505060405163f23a6e6160e01b8152602090f35b346102125760203660031901126102125760206102ab600435612c99565b906008116102125760040190600490565b906004116102125790600490565b909291928360041161021257831161021257600401916003190190565b906018116102125760040190601490565b906014116102125790601490565b906020116102125790602090565b909291928360011161021257831161021257600101915f190190565b909291928360141161021257831161021257601401916013190190565b906009116102125760010190600890565b909291928360091161021257831161021257600901916008190190565b906016116102125790601690565b906016116102125760020190601490565b909291928360161161021257831161021257601601916015190190565b906002116102125790600290565b90602c116102125760180190601490565b90939293848311610212578411610212578101920390565b356001600160e01b0319811692919060048210611c60575050565b6001600160e01b031960049290920360031b82901b16169150565b6001600160581b0319165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85060205260405f2090565b6001600160581b0319165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85160205260405f2090565b90929060018103611d3857506001600160a01b0392611d329250611d22915060581b600160581b600160f81b0316600160f81b17611c7b565b5460201c6001600160a01b031690565b16151590565b60028103611d7857506001600160a01b0392611d329250611d6c9150611d5f908416612e85565b546001600160a01b031690565b6001600160a01b031690565b600303611db857611d99611d946104ff600193611da795611b13565b611dbf565b01546001600160a01b031690565b6001600160a01b0390811691161490565b5050505f90565b63ffffffff60e01b165f527f7c341349a4360fdd5d5bc07e69f325dc6aaea3eb018b3e0ea7e53cc0bb0d6f3b60205260405f2090565b63ffffffff60e01b165f527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f85260205260405f2090565b908160209103126102125751611e4081610b9a565b90565b908060209392818452848401375f828201840152601f01601f1916010190565b611e40949260609260018060a01b0316825260208201528160408201520191611e43565b6040513d5f823e3d90fd5b91611e9c91612ebd565b91926001600160f81b0319841615611fa6575b6001600160a01b03611ec6611d6c611d2287611c7b565b16156104c1576001600160f81b03198416600160f81b03611f5a579260209291611ef2611f1095612fed565b604051637aa8f17760e11b8152958694859384933360048601611e63565b039160581c6001600160a01b03165afa90811561078d575f91611f31575090565b611e40915060203d602011611f53575b611f4b8183610f91565b810190611e2b565b503d611f41565b9260081b92600160f11b611f87611f7a611f7387611df5565b5460f01b90565b6001600160f01b03191690565b16611f9757611e40933390612f3a565b635b71057960e01b5f5260045ffd5b9250611fc05f8051602061582b8339815191525460581b90565b92611eaf565b90604051611fd381610f5a565b915463ffffffff81168352602090811c6001600160a01b031690830152565b903590601e198136030182121561021257018035906001600160401b0382116102125760200191813603831361021257565b90816020910312610212575180151581036102125790565b6001600160401b038111610f3a57601f01601f191660200190565b602081830312610212578051906001600160401b038211610212570181601f820112156102125780519061208a8261203c565b926120986040519485610f91565b8284526020838301011161021257815f9260208093018386015e8301015290565b611e40939260609260018060a01b03168252602082015281604082015201905f611e43565b906020611e40928181520190610d1c565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc8190556001600160a01b03167fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2565b1561214957565b60405162461bcd60e51b8152602060048201526013602482015272185b1c9958591e481a5b9a5d1a585b1a5e9959606a1b6044820152606490fd5b5f8051602061582b833981519152805463ffffffff60a81b191660a89290921b63ffffffff60a81b16919091179055565b634e487b7160e01b5f52603260045260245ffd5b908210156121e05761028b9160051b810190611ff2565b6121b5565b908092918237015f815290565b60405190612201602083610f91565b5f8252565b3d15612230573d906122178261203c565b916122256040519384610f91565b82523d5f602084013e565b606090565b94939291909695966122786001600160581b03196122716122645f8051602061582b8339815191525460581b90565b6001600160581b03191690565b1615612142565b6001600160581b03198616156104c1576001600160f81b03198616600160f81b141580612366575b61235757856122b16122fe9761349d565b6122d26122bc610fb2565b60018152925b6001600160a01b03166020840152565b5f8051602061582b833981519152805463ffffffff60a81b1916600160a81b179055613503565b613503565b5f5b81811061230c57505050565b5f806123198385876121c9565b90612329604051809381936121e5565b039082305af1612337612206565b501561234557600101612300565b636534eae560e11b5f5260045260245ffd5b6361c4e91b60e11b5f5260045ffd5b506001600160f81b03198616600160f91b14156122a0565b94939291906001600160581b03198616156104c1576001600160f81b03198616600160f81b141580612429575b612357576123b88661349d565b6001600160a01b036123cc611d2288611c7b565b16156123db575b505050505050565b61241e956122f96124015f8051602061582b8339815191525463ffffffff9060a81c1690565b926122c260405194612414604087610f91565b63ffffffff168552565b5f80808080806123d3565b506001600160f81b03198616600160f91b14156123ab565b9060405161244e81610f1f565b82546001600160a01b03908116825260019390930154928316602082015260589290921b6001600160f81b0319166040830152565b959294919390946124a56106845f8051602061582b8339815191525460581b90565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806125f5575b156125e65760405163ecd0596160e01b81526004808201526001600160a01b039190911695906020816024818a5afa90811561078d575f916125c7575b50156106225760405163d68f602560e01b8152965f888061253b363433600485016120b9565b0381838b5af197881561078d575f986125a7575b5061255b9697986138ab565b803b1561021257604051630b9dfbed60e11b8152915f91839182908490829061258790600483016120de565b03925af1801561078d57612599575b50565b806107875f61022193610f91565b61255b9798506125c0903d805f833e6107ab8183610f91565b979661254f565b6125e0915060203d6020116107e2576107d48183610f91565b5f612515565b509193909294610221966138ab565b50303314156124d8565b916020611e40938181520191611e43565b356bffffffffffffffffffffffff19811692919060148210612630575050565b6bffffffffffffffffffffffff1960149290920360031b82901b16169150565b60018103612790575060581b600160581b600160f81b0316600160f81b179061268561267b83611c7b565b5463ffffffff1690565b5f8051602061582b8339815191525460a81c63ffffffff169063ffffffff808316911614612778575b506127176126f0611d6c6126ea6126e46126dd5f8051602061582b8339815191525463ffffffff9060a81c1690565b9786611b4f565b90612610565b60601c90565b6127076126fb610fb2565b63ffffffff9096168652565b6001600160a01b03166020850152565b6127516014820135820191603481013581019060548101350194601486013593603460148401359301916034601483013592019087613503565b6004811461275f575b505050565b6104ff6127729160346102219501611b13565b90613c96565b61278a9060010163ffffffff16612184565b5f6126ae565b600281036127ec5750916127dd610221936127c2611d6c6126ea6126e460148801358801966034890135890198611b4f565b928391601482013591603401906001600160a01b0316613c4f565b60346014830135920190613aa0565b9091906003810361286c5750612867611d6c612857610221958461285260186126ea97013582016126ea603884013584019961282b6104ff8787611b13565b9061284c611d6c61283c8989611b3e565b6018880135976038019691612610565b91613918565b611b3e565b6018860135956038019491612610565b613aa0565b9060048203612900576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b03925af192831561078d575f805160206157eb833981519152936128ec575b50604080519182526001600160a01b03909216602082015290819081015b0390a1565b806107875f6128fa93610f91565b5f6128c9565b6005820361293d576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b6006820361297a576001600160a01b03831693843b15610212576128aa945f92836040518098819582946306d61fe760e41b8452600484016125ff565b631092ef5760e11b5f5260045ffd5b359060208110612997575090565b5f199060200360031b1b1690565b9291926129b18261203c565b916129bf6040519384610f91565b829481845281830111610212578281602093845f960137010152565b60018103612a04575061259692919060581b600160581b600160f81b0316600160f81b17613eea565b60028103612a2157506125969291906001600160a01b0316613e67565b60038103612a4c575050612a468280612a406104ff6125969686611b13565b93611b21565b91613db9565b909160048203612ade57612aab6128c9915f8051602061580b83398151915295612a845f8051602061582b8339815191525460581b90565b612a90611d2282611c7b565b6001600160a01b03888116911614612ab1575b5036916129a5565b83613cfb565b612abd612ad891611c7b565b8054640100000000600160c01b031916640100000000179055565b5f612aa3565b60058203612b6a575f8051602061582b8339815191525460581b5b612b0c612b068684611b5d565b90612989565b906001600160f81b03198116600160f91b14612b42575b5050612aab6128c9915f8051602061580b8339815191529536916129a5565b60081b6001600160e01b03191614612b5b575f80612b23565b6313002bdd60e31b5f5260045ffd5b6006820361297a575f8051602061582b8339815191525460581b612af9565b60405190612b9682610f5a565b5f6020838281520152565b612bb5818060081b918160301b9160501b90565b929091906001600160f81b03198116600160f81b14159081612c65575b81612c50575b81612c37575b50611db85760ff60f81b16600160f81b8114159081612c2d575b50612c27576001600160e01b031916612c22576001600160501b031916612c1e57600190565b5f90565b505f90565b50505f90565b905015155f612bf8565b6001600160f81b031916607f60f91b141590505f612bde565b6001600160f81b031980821614159150612bd8565b6001600160f81b0319811615159150612bd2565b91612c8991610221959493613eea565b614285565b90612596929161404b565b60071115612c1e57600190565b7f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f8852587460408051338152346020820152a1565b612cf3612cee5f356001600160e01b031916611dbf565b612441565b80516001600160a01b0390612d09908216611d6c565b1615612e765780516060906001600160a01b0390612d28908216611d6c565b16600181141580612e65575b15612e195750508051612d53906001600160a01b031636903490613769565b60408201516001600160f81b03191680612dd957506020820151612d7f906001600160a01b0316614317565b92905b15612dd157516001600160a01b03169060018214158281612dbc575b50612dac575b825160208401f35b612db591613832565b5f80612da4565b6001600160a01b03908116141590505f612d9e565b825160208401fd5b6001600160f81b031990811603612e0a576020820151612e03906001600160a01b031636906137e8565b9290612d82565b632d6a6bb760e01b5f5260045ffd5b6001600160a01b0303612d5357337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614612d53576348f5c3ed60e01b5f5260045ffd5b506001600160a01b03811415612d34565b631cd4b64760e21b5f5260045ffd5b6001600160a01b03165f9081527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b866020526040902090565b9182358060f81c805f14612f015780600114612ef457600214612ede575f80fd5b6001600160d81b03191692600501916004190190565b5092601501916014190190565b505060015f9301915f190190565b9092608092611e409694835260018060a01b0316602083015260408201528160608201520191611e43565b919290612f54612f609565ffffffffffff93868487614359565b95929491979097614448565b5091164210908115612fdb575b50612fc857612faa612f80602096612fed565b60405163392dffaf60e01b8152978896879586959193916001600160e01b03191660048701612f0f565b03916001600160a01b03165afa90811561078d575f91611f31575090565b506001600160e01b031995945050505050565b65ffffffffffff91501642115f612f6d565b611e409060405160208101917f1547321c374afde8a591d972a084b071c594c275e36724931ff96c25f2999c838352604082015260408152613030606082610f91565b519020614474565b90818060081b9160ff839260f01c1660021461305057565b6001600160d81b031983169150565b9080601f8301121561021257816020611e40933591016129a5565b9190916101208184031261021257613090610fc1565b9261309a82610216565b84526020820135602085015260408201356001600160401b03811161021257816130c591840161305f565b604085015260608201356001600160401b03811161021257816130e991840161305f565b60608501526080820135608085015260a082013560a085015260c082013560c085015260e08201356001600160401b038111610212578161312b91840161305f565b60e08501526101008201356001600160401b0381116102125761314e920161305f565b610100830152565b90816020910312610212575190565b80516001600160a01b03168252611e4091602082015160208201526101006131e66131b66131a460408601516101206040870152610120860190610d1c565b60608601518582036060870152610d1c565b6080850151608085015260a085015160a085015260c085015160c085015260e085015184820360e0860152610d1c565b92015190610100818403910152610d1c565b939291613215906040928652606060208701526060860190613165565b930152565b929190613215602091604086526040860190613165565b9192909261326c5f93613244368461307a565b926101008101906132558282611ff2565b909490936001600160f81b031916600160f81b1490565b6133a3575b50506001600160f81b03198616600160f81b03613309575050604051639700320360e01b815293602092859283915f9183916132b0916004840161321a565b039260581c6001600160a01b03165af190811561078d57611e40925f926132d8575b50614962565b6132fb91925060203d602011613302575b6132f38183610f91565b810190613156565b905f6132d2565b503d6132e9565b909460081b93909291600160f01b613326611f7a611f7388611df5565b16613394575f61334661334060209661337099858a614783565b94614962565b604051630ccab7a160e01b8152979096889586948593926001600160e01b031916600485016131f8565b03926001600160a01b03165af190811561078d57611e40925f926132d85750614962565b6314b9743f60e01b5f5260045ffd5b9091506133bd9395506133b69250611ff2565b9085614586565b9193916133cb3682846129a5565b6101008401525f80613271565b5f8051602061582b83398151915254600a63ffffffff8260a81c16019063ffffffff82116134895763ffffffff8381169216821161347a576134229060c81c63ffffffff166105f8565b10156105b9575f8051602061582b833981519152805463ffffffff60c81b60c893841b1663ffffffff60c81b1990911617908190559081901c63ffffffff9081169160a81c1681116134715750565b61022190612184565b63e60fd64760e01b5f5260045ffd5b634e487b7160e01b5f52601160045260245ffd5b60207f6789ec0c85d6458d897a36a70129b101f8b4d84c6e218046c3107373dbcbae88918060581c6001600160581b0360a81b5f8051602061582b8339815191525416175f8051602061582b83398151915255604051906001600160581b0319168152a1565b92949093919361351561267b85611c7b565b5f8051602061582b8339815191525460a81c63ffffffff169063ffffffff80831691161461370d575b506020810180516001600160a01b031615613704575b5f8051602061582b8339815191525460a81c63ffffffff1663ffffffff6135826105f8855163ffffffff1690565b9116148015906136d8575b6105b9576135db6135e8926135a187611c7b565b815181546020938401516001600160c01b031990911663ffffffff9290921691909117921b640100000000600160c01b0316919091179055565b516001600160a01b031690565b915f196001600160a01b038416016136c7575b5050506001600160f81b03198116600160f81b036136a45760581c6001600160a01b031690813b15610212576040516306d61fe760e41b8152925f91849182916136499190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613690575b5060408051600181526001600160a01b03909216602083015290918291820190565b806107875f61369e93610f91565b5f61366e565b91506001600160f81b03198216600160f91b03612357576102219160081b614b15565b6136d092613aa0565b5f80806135fb565b506136e561267b86611c7b565b63ffffffff6136fb6105f8855163ffffffff1690565b9116101561358d565b60018152613554565b61371f9060010163ffffffff16612184565b5f61353e565b60409081516137348382610f91565b600681526512d95c9b995b60d21b60208201529161375481519182610f91565b6005815264302e332e3160d81b602082015290565b91613790925f8080946040519687958694859363d68f602560e01b85523360048601611e63565b03926001600160a01b03165af190811561078d575f916137ae575090565b611e4091503d805f833e6107ab8183610f91565b5f928361379095936040519687958694859363d68f602560e01b85523360048601611e63565b5f9060405192808385378338925af4913d82523d5f602084013e60203d830101604052565b5f9192806040519485378338925af4913d82523d5f602084013e60203d830101604052565b6001600160a01b0316803b1561021257604051630b9dfbed60e11b815260206004820152915f91839182908490829061386f906024830190610d1c565b03925af1801561078d576138805750565b5f61022191610f91565b8051156121e05760200190565b80518210156121e05760209160051b010190565b909593919492965f5b87811015613904576001906138fe8a896138ea84896138e3828060051b8c0135956138de87610936565b613897565b51946121c9565b906138f6868d8d6121c9565b949093613503565b016138b4565b509650505050505050565b90156121e05790565b9293929091906001600160a01b03821615613a91575b61393790611dbf565b93613963613956613948868461390f565b356001600160f81b03191690565b6001600160f81b03191690565b936001600160f81b03198516613a69576001600160a01b0384169161398a91908190611b6b565b823b15610212576139b4925f92836040518096819582946306d61fe760e41b8452600484016125ff565b03925af194851561078d57613a18613a389360019361022198613a55575b5060408051600381526001600160a01b03881660208201525f805160206157eb8339815191529190a15b82546001600160a01b0319166001600160a01b03909116178255565b0180546001600160a01b0319166001600160a01b03909316929092178255565b805460ff60a01b191660589290921c60ff60a01b16919091179055565b806107875f613a6393610f91565b5f6139d2565b50909390506001600160f81b031980841603612e0a576001613a3891613a18610221966139fc565b6001600160a01b03915061392e565b6001600160a01b0316919082158015613c45575b61275a5760405163d60b347f60e01b8152306004820152602081602481875afa90811561078d575f91613c26575b50613b79579080613af292611b6b565b9190813b15610212576040516306d61fe760e41b8152925f9184918291613b1d9190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613b65575b505b60408051600481526001600160a01b03909216602083015290918291820190565b806107875f613b7393610f91565b5f613b42565b6001600160f81b031980613b90613948858561390f565b1614613bb0575b50506128e75f805160206157eb83398151915291613b44565b9080613bbb92611b6b565b9190813b15610212576040516306d61fe760e41b8152925f9184918291613be69190600484016125ff565b038183855af190811561078d575f805160206157eb833981519152926128e792613c12575b5091613b97565b806107875f613c2093610f91565b5f613c0b565b613c3f915060203d6020116107e2576107d48183610f91565b5f613ae2565b5060018314613ab4565b9092613c5b9082614e20565b6001600160a01b031691823b156102125761386f925f92836040518096819582946306d61fe760e41b84526020600485018181520191611e43565b7f9d17cd6d095ac90a655405ab29f30a7ee7e88ef3974c1bf7544bf591043bb71a91606091613cc882610c9883611cb2565b600160ff198254161790556040519163ffffffff60e01b1682526001600160581b031916602082015260016040820152a1565b91907f2b82f87bf66300af618a9621d3f221edfab735f5bacb4e004cce1b62375396c3905a905f8060405193613d5b85613d4d6020820196638a91b0e360e01b88526020602484018181520190610d1c565b03601f198101875286610f91565b60405193613d6a602086610f91565b828552602085019583908a905f368a375193f1913d9081613db1575b815f9293523e604080516001600160a01b0390951685528115156020860152909390819081016128e7565b5f9150613d86565b613dc69093929193611dbf565b80546001600160a01b031981168255600190910180546001600160a01b039092169490929091906001600160f81b0319605883901b1615613e16575b505081546001600160a81b03191690915550565b613e3492613e259136916129a5565b906001600160a01b0316613cfb565b50805460408051600381526001600160a01b0390921660208301525f8051602061580b83398151915291a15f8080613e02565b6001600160a01b039081165f8181527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b8660205260409081902080546001600160a01b0319811690915590921694935f8051602061580b83398151915293613eda91613ed4913691906129a5565b82613cfb565b50815190600282526020820152a1565b929190613f1a613f085f8051602061582b8339815191525460581b90565b6001600160581b031980871691161490565b612b5b57613f2a611d2285611c7b565b93613f4b613f3782611c7b565b8054640100000000600160c01b0319169055565b6001600160f81b03198116600160f81b03613f8e579161366e613ed46128e7935f8051602061580b8339815191529560018060a01b039060581c169336916129a5565b91506001600160f81b03198216600160f91b03612357576102219160081b614ea6565b60408051909190613fc28382610f91565b6001815291601f1901825f5b828110613fda57505050565b806060602080938501015201613fce565b90613ff582610fd1565b6140026040519182610f91565b8281528092614013601f1991610fd1565b01905f5b82811061402357505050565b806060602080938501015201614017565b906040611e40925f81528160208201520190610d1c565b9291600884901b91906001600160f81b03198516600160f81b036140e9575061407e919293508035019060208201913590565b90916001600160f81b031981166140995750611e409161518b565b6001600160f81b031916600160f81b036140b657611e40916150d1565b60405162461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b91936001600160f81b031981166141a05750906141059161502a565b9161410e613fb1565b956001600160f81b0319811661413b575061412893615079565b6141318361388a565b526125968261388a565b6001600160f81b031916600160f81b036140b65761415893615052565b6141618461388a565b52610221577fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76128e76141938461388a565b5160405191829182614034565b9193916001600160f81b0319908116036140b6576141e1906141db6141c3613fb1565b95806141d56126ea6126e48387611b4f565b93611b87565b9161380d565b6141ed8593929361388a565b526001600160f81b03198116600160f81b0361423857501561420b57565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76128e76141938461388a565b6001600160f81b0319166140b6576102215760405162461bcd60e51b815260206004820152601360248201527211195b1959d85d1958d85b1b0819985a5b1959606a1b6044820152606490fd5b9091906001600160a01b03168015801561430d575b61275a5781156121e0575f8051602061580b833981519152926128e7926001600160f81b031982358116146142ed575b505060408051600481526001600160a01b03909216602083015290918291820190565b6142fe81613ed49261430594611b6b565b36916129a5565b505f806142ca565b506001811461429a565b5f809160405136810160405236838237604051601481016040523360601b90528260143601925af190604051903d82523d5f602084013e60203d830101604052565b949184846143da92969593966040519061437282610f75565b5f82525f602083015260408201995f8b526143d4606084019a8b925f84525f60808701525f60a0870152606060c08701526143c560e08701915f83526101008801955f87529063ffffffff60e01b169052565b6001600160a01b039091169052565b52615224565b60ff806143f36143ed613948878661390f565b60f81c90565b16036144395761442261440d8461441d9561443294611b6b565b9490955163ffffffff60e01b1690565b611df5565b5460101c6001600160a01b031690565b9351929190565b63b32eeb6960e01b5f5260045ffd5b8065ffffffffffff8260a01c16918215600114614466575b60d01c92565b65ffffffffffff9250614460565b7f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000030147f0000000000000000000000000000000000000000000000000000000000000000461416156144ff575b6719010000000000005f52601a52603a526042601820905f603a52565b5060a06040517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f81527f000000000000000000000000000000000000000000000000000000000000000060208201527f00000000000000000000000000000000000000000000000000000000000000006040820152466060820152306080820152206144e2565b61458e612b89565b926145999083611b4f565b6145a291612610565b60601c602084018190525f8051602061582b8339815191525460a81c63ffffffff168085526034601485810135860182810197605488013588018085019690840135959194808a01358a018086013595910193013591889161460536858e6129a5565b8051906020012091366146199088886129a5565b805190602001203661462c908b8d6129a5565b8051602091820120604080517fb17ab1224aca0d4255ef8161acaf2ac121b8faa32a4b2258c912cc5f8308c5059381019384526001600160581b0319989098169088015263ffffffff9390931660608701526001600160a01b0393909316608086015260a085019390935260c084019290925260e080840192909252908252906146b861010082610f91565b5190206146c490614474565b607489013589016014810135906034016146dd92615492565b986146e89488613503565b6146f28183615631565b6146fb91611b13565b61470491611c45565b61470d91613c96565b609481013501909160348201916014013590565b80548210156121e0575f5260205f2001905f90565b356001600160c01b0319811692919060088210614751575050565b6001600160c01b031960089290920360031b82901b16169150565b604090611e40939281528160208201520190613165565b93929190935f92600161479583611df5565b015f5b8154811015614925576147c66147be6147b18385614721565b90549060031b1c60501b90565b908160501c90565b9390956147e26147dc6143ed613948858561390f565b60ff1690565b8084036148f7575090818161481b61480f6148096148038461483998611ba4565b90614736565b60c01c90565b6001600160401b031690565b600901918c6101006148316142fe868686611bb5565b910152611c2d565b939093955b600160f01b1615614856575b50600101939193614798565b604051633894f6e760e11b81529196906020908390815f816148868f6001600160e01b03198d166004840161476c565b03926001600160a01b03165af191821561078d575f926148d7575b506001600160a01b0382166148c3576001916148bc91614962565b959061484a565b631f24c1fb60e11b5f52600487905260245ffd5b6148f091925060203d8111613302576132f38183610f91565b905f6148a1565b919690949183111561491257630760bdcf60e11b5f5260045ffd5b61491a6121f2565b6101008b015261483e565b505091929460ff8061493d6143ed613948878961390f565b16036144395761010061495a6142fe8561442296611e4098611b6b565b910152611df5565b908082186001600160a01b031615606083811b838501821b9081149184901b141717600114614992575050600190565b65ffffffffffff60a01b8216916001600160d01b03198082169083168415614a12575b65ffffffffffff60a01b84168015614a02575b8581109086180280861895146149f1575b81811190821802189160018060a01b03911716171790565b65ffffffffffff60a01b94506149d9565b5065ffffffffffff60a01b6149c8565b65ffffffffffff60a01b94506149b5565b8054905f815581614a32575050565b5f5260205f20908101905b818110614a48575050565b5f8155600101614a3d565b356001600160501b0319811692919060168210614a6e575050565b6001600160501b031960169290920360031b82901b16169150565b805468010000000000000000811015610f3a57614aab91600182018155614721565b819291549060031b9160501c821b9160018060b01b03901b1916179055565b9092809260209483528483013701015f815290565b356001600160f01b0319811692919060028210614afa575050565b6001600160f01b031960029290920360031b82901b16169150565b91908035016020810190359260fe84118015614e18575b614e09576001614b3b82611df5565b0154614df0575b5f1984015f5b818110614cb2575090614c07614c008387614ba0614bf1614bd8611f7a614bd2614bcc87614c239e9f8e614bc7614c319f8f90611d6c6126ea6126e4614b92614b989489896121c9565b90611be0565b9a8b91611df5565b805462010000600160b01b03191660109290921b62010000600160b01b0316919091179055565b6121c9565b90611c0e565b90614adf565b614be188611df5565b9060f01c61ffff19825416179055565b6001600160a01b0316966121c9565b8091611bf1565b6040519586939092906001600160e01b03191660208501614aca565b03601f198101845283610f91565b803b15610212575f614c5792604051809481926306d61fe760e41b8352600483016120de565b038183855af190811561078d575f805160206157eb833981519152926128e792614c9e575b5060408051600681526001600160a01b03909216602083015290918291820190565b806107875f614cac93610f91565b5f614c7c565b614d4d90614cf86001614cc486611df5565b01614cf2614ce5614cdf614cd9868d8c6121c9565b90611bd2565b90614a53565b6001600160501b03191690565b90614a89565b614d12611d6c611d6c6126ea6126e4614b92868d8c6121c9565b614d20614c00838a896121c9565b60405194918591614d3f916001600160e01b03198a1660208501614aca565b03601f198101855284610f91565b803b15610212576040516306d61fe760e41b8152925f918491829084908290614d7990600483016120de565b03925af191821561078d57600192614ddc575b505f805160206157eb833981519152614dd3614db26126ea6126e4614b92868d8c6121c9565b60408051600581526001600160a01b03909216602083015290918291820190565b0390a101614b48565b806107875f614dea93610f91565b5f614d8c565b614e046001614dfe83611df5565b01614a23565b614b42565b63b62d956d60e01b5f5260045ffd5b508315614b2c565b5f805160206157eb833981519152916040916001600160a01b03821615614e9d575b6001600160a01b039081165f8181527f1bbee3173dbdc223633258c9f337a0fff8115f206d302bea0ed3eac003b68b8660205284902080546001600160a01b03191693909216929092179055815190600282526020820152a1565b60019150614e42565b919080350191602083019235614ebb82611df5565b9260018401906001825401830361501b575f5b8254811015614f7057805f8051602061580b833981519152614f6789614f45614f37613ed48b614f1b888d614f0c6147be8f60019e6147b191614721565b90508c8060a01b0316976121c9565b6040519485939092906001600160e01b03191660208501614aca565b03601f198101835282610f91565b5060408051600581526001600160a01b03909216602083015290918291820190565b0390a101614ece565b5094614c23915091614fb76102219594614c07614fbc95614f956001614dfe85611df5565b8754614fac9060101c6001600160a01b0316611d6c565b945f198101916121c9565b613cfb565b5080545f8051602061580b8339815191529061500890614fe79060101c6001600160a01b0316611d6c565b60408051600681526001600160a01b03909216602083015290918291820190565b0390a180546001600160b01b0319169055565b63013dcc8d60e31b5f5260045ffd5b908060141161021257813560601c926034821061021257601483013592603401916033190190565b905f928491604051958692833738935af1913d82523d5f602084013e60203d830101604052565b90925f92819594604051968792833738935af1156150a6573d82523d5f602084013e60203d830101604052565b503d5f823e3d90fd5b91908110156121e05760051b81013590605e1981360301821215610212570190565b9190916150dd83613feb565b925f5b8181106150ec57505050565b806151236150fd60019385876150af565b803561510881610201565b61511b6020830135926040810190611ff2565b929091615052565b61512d8389613897565b521561513a575b016150e0565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb76151836151688389613897565b51604051918291858352604060208401526040830190610d1c565b0390a1615134565b91909161519783613feb565b925f5b8181106151a657505050565b806151dd6151b760019385876150af565b80356151c281610201565b6151d56020830135926040810190611ff2565b929091615079565b6151e78288613897565b526151f28187613897565b500161519a565b9092608092611e409594835260018060a01b0316602083015260408201528160608201520190610d1c565b9160608301906001615279615240845163ffffffff60e01b1690565b6001600160e01b0319165f9081527f7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f8526020526040902090565b01805493905f5b8581106152905750505050505050565b6152a06147be6147b18385614721565b6001600160a01b031660a08901908152608089019490916152c9906001600160f01b0319168652565b6152e36152dc6143ed613948898561390f565b60ff168a52565b6152f16147dc8a5160ff1690565b808403615460575085818161531661480f61480961480361536b9b9c61533e98611ba4565b8c60c06153316142fe60208401948086526009018688611bb5565b9101525160090191611c2d565b949094955b51600160f11b9061535d906001600160f01b031916611f7a565b166001600160f01b03191690565b1561537a575b50600101615280565b5161538d906001600160a01b0316611d6c565b60206153b36153a66153a6895163ffffffff60e01b1690565b6001600160e01b03191690565b60e08a01516101008b015160c08c015160405163184dfdbb60e11b81529586949093859384936153f29390926001600160a01b031690600486016151f9565b03915afa90811561078d575f91615442575b506001600160a01b03811661542e579060019161542660408a01918251614962565b905290615371565b631f24c1fb60e11b5f52600482905260245ffd5b61545a915060203d8111613302576132f38183610f91565b5f615404565b90949083111561547957630760bdcf60e11b5f5260045ffd5b61536b90615488365f886129a5565b60c08b0152615343565b5f8051602061582b833981519152545f9493929060581b6001600160f81b03198116600160f81b0361554d57916154f293916154d3611d6c60209560581c90565b9160405195869485938493637aa8f17760e11b85523060048601611e63565b03915afa90811561078d575f9161552e575b505b6001600160e01b0319166374eca2c160e11b0161551f57565b6362467c7760e11b5f5260045ffd5b615547915060203d602011611f5357611f4b8183610f91565b5f615504565b9094509091906001600160f81b03198116600160f91b036123575760209161557b9160081b95843088614359565b60405163392dffaf60e01b815292979295869493859384936155ae93909230906001600160e01b03191660048701612f0f565b03916001600160a01b03165afa90811561078d575f916155cf575b50615506565b6155e8915060203d602011611f5357611f4b8183610f91565b5f6155c9565b156155f557565b60405162461bcd60e51b8152602060048201526014602482015273496e76616c69642073656c6563746f724461746160601b6044820152606490fd5b61563e6104ff8383611b13565b90600483101561564d57505050565b602c83106157dc57615668611d6c6126ea6126e48685611b3e565b602c8201358201602c604c820191013591604c8401358401946156a2615694613956613948878761390f565b6001600160f81b0319161590565b8061574c575b946156e961286795611d6c956156ee956102219b956126ea9a6156fe575b6156d9611d6c6126ea6126e48a8a611c1c565b916001600160a01b031690613918565b611c1c565b602c86013595604c019491612610565b615747606c8701358701615741602c604c830192013580615728611d6c6126ea6126e48488611b4f565b9361573c856001600160a01b038a16614e20565b611b87565b91613aa0565b6156c6565b5091939092956040519163ecd0596160e01b83526020838061577660048201906002602083019252565b03816001600160a01b0389165afa92831561078d57610221986126ea9761286797611d6c976156ee976156e9955f916157bd575b50959a50959b50955095509550506156a8565b6157d6915060203d6020116107e2576107d48183610f91565b5f6157aa565b5050600461022191146155ee56fed21d0b289f126c4b473ea641963e766833c2f13866e4ff480abd787c100ef123341347516a9de374859dfda710fa4828b2d48cb57d4fbe4c1149612b8e02276e7bcaa2ced2a71450ed5a9a1b4848e8e5206dbc3f06011e595f7f55428cc6f84fa164736f6c634300081a000a" as Hex;
export const Kernel = {
    abi,
    bytecode,
    deployedBytecode,
};
