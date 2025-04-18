export const events = [
    {
        type: "event",
        name: "Approval",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "spender", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Transfer",
        inputs: [
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
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
    },
    {
        type: "event",
        name: "Lockdown",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "token", type: "address", indexed: false, internalType: "address" },
            { name: "spender", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
    {
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
    },
    {
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
    },
    {
        type: "event",
        name: "UnorderedNonceInvalidation",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "word", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "mask", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Subscription",
        inputs: [
            { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "subscriber", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Unsubscription",
        inputs: [
            { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "subscriber", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Approval",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "spender", type: "address", indexed: true, internalType: "address" },
            { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Donate",
        inputs: [
            { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
            { name: "sender", type: "address", indexed: true, internalType: "address" },
            { name: "amount0", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "amount1", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Initialize",
        inputs: [
            { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
            { name: "currency0", type: "address", indexed: true, internalType: "Currency" },
            { name: "currency1", type: "address", indexed: true, internalType: "Currency" },
            { name: "fee", type: "uint24", indexed: false, internalType: "uint24" },
            { name: "tickSpacing", type: "int24", indexed: false, internalType: "int24" },
            { name: "hooks", type: "address", indexed: false, internalType: "contract IHooks" },
            { name: "sqrtPriceX96", type: "uint160", indexed: false, internalType: "uint160" },
            { name: "tick", type: "int24", indexed: false, internalType: "int24" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModifyLiquidity",
        inputs: [
            { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
            { name: "sender", type: "address", indexed: true, internalType: "address" },
            { name: "tickLower", type: "int24", indexed: false, internalType: "int24" },
            { name: "tickUpper", type: "int24", indexed: false, internalType: "int24" },
            { name: "liquidityDelta", type: "int256", indexed: false, internalType: "int256" },
            { name: "salt", type: "bytes32", indexed: false, internalType: "bytes32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OperatorSet",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "operator", type: "address", indexed: true, internalType: "address" },
            { name: "approved", type: "bool", indexed: false, internalType: "bool" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ProtocolFeeControllerUpdated",
        inputs: [{ name: "protocolFeeController", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "ProtocolFeeUpdated",
        inputs: [
            { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
            { name: "protocolFee", type: "uint24", indexed: false, internalType: "uint24" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Swap",
        inputs: [
            { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
            { name: "sender", type: "address", indexed: true, internalType: "address" },
            { name: "amount0", type: "int128", indexed: false, internalType: "int128" },
            { name: "amount1", type: "int128", indexed: false, internalType: "int128" },
            { name: "sqrtPriceX96", type: "uint160", indexed: false, internalType: "uint160" },
            { name: "liquidity", type: "uint128", indexed: false, internalType: "uint128" },
            { name: "tick", type: "int24", indexed: false, internalType: "int24" },
            { name: "fee", type: "uint24", indexed: false, internalType: "uint24" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Transfer",
        inputs: [
            { name: "caller", type: "address", indexed: false, internalType: "address" },
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnershipTransferred",
        inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "newOwner", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Approval",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "spender", type: "address", indexed: true, internalType: "address" },
            { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ApprovalForAll",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "operator", type: "address", indexed: true, internalType: "address" },
            { name: "approved", type: "bool", indexed: false, internalType: "bool" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Transfer",
        inputs: [
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "GasSet",
        inputs: [
            { name: "domain", type: "uint32", indexed: false, internalType: "uint32" },
            { name: "gas", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "HookSet",
        inputs: [{ name: "_hook", type: "address", indexed: false, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Initialized",
        inputs: [{ name: "version", type: "uint8", indexed: false, internalType: "uint8" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "IsmSet",
        inputs: [{ name: "_ism", type: "address", indexed: false, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "ReceivedTransferRemote",
        inputs: [
            { name: "origin", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "recipient", type: "bytes32", indexed: true, internalType: "bytes32" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "SentTransferRemote",
        inputs: [
            { name: "destination", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "recipient", type: "bytes32", indexed: true, internalType: "bytes32" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultHookSet",
        inputs: [{ name: "hook", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "DefaultIsmSet",
        inputs: [{ name: "module", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Dispatch",
        inputs: [
            { name: "sender", type: "address", indexed: true, internalType: "address" },
            { name: "destination", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "recipient", type: "bytes32", indexed: true, internalType: "bytes32" },
            { name: "message", type: "bytes", indexed: false, internalType: "bytes" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "DispatchId",
        inputs: [{ name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Process",
        inputs: [
            { name: "origin", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "sender", type: "bytes32", indexed: true, internalType: "bytes32" },
            { name: "recipient", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ProcessId",
        inputs: [{ name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "RequiredHookSet",
        inputs: [{ name: "hook", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Paused",
        inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Unpaused",
        inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "AccountCreated",
        inputs: [{ name: "account", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "AccountRemoteRouterOwnerSet",
        inputs: [
            { name: "account", type: "address", indexed: true, internalType: "address" },
            { name: "domain", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "router", type: "address", indexed: false, internalType: "address" },
            { name: "owner", type: "address", indexed: false, internalType: "address" },
            { name: "enabled", type: "bool", indexed: false, internalType: "bool" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RemoteCallDispatched",
        inputs: [
            { name: "destination", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "router", type: "address", indexed: true, internalType: "address" },
            { name: "account", type: "address", indexed: true, internalType: "address" },
            {
                name: "executionMode",
                type: "uint8",
                indexed: false,
                internalType: "enum ERC7579ExecutorMessage.ExecutionMode",
            },
            { name: "messageId", type: "bytes32", indexed: false, internalType: "bytes32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RemoteCallProcessed",
        inputs: [
            { name: "origin", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "router", type: "address", indexed: true, internalType: "address" },
            { name: "account", type: "address", indexed: true, internalType: "address" },
            {
                name: "executionMode",
                type: "uint8",
                indexed: false,
                internalType: "enum ERC7579ExecutorMessage.ExecutionMode",
            },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "GasPayment",
        inputs: [
            { name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" },
            { name: "destinationDomain", type: "uint32", indexed: true, internalType: "uint32" },
            { name: "gasAmount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "payment", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RelayedMessage",
        inputs: [
            { name: "source", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "messageNonce", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "messageHash", type: "bytes32", indexed: true, internalType: "bytes32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "SentMessage",
        inputs: [
            { name: "destination", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "target", type: "address", indexed: true, internalType: "address" },
            { name: "messageNonce", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "sender", type: "address", indexed: false, internalType: "address" },
            { name: "message", type: "bytes", indexed: false, internalType: "bytes" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RelayERC20",
        inputs: [
            { name: "token", type: "address", indexed: true, internalType: "address" },
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "source", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "SendERC20",
        inputs: [
            { name: "token", type: "address", indexed: true, internalType: "address" },
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "destination", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "CrosschainBurn",
        inputs: [
            { name: "from", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "sender", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "CrosschainMint",
        inputs: [
            { name: "to", type: "address", indexed: true, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "sender", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModuleInstalled",
        inputs: [
            { name: "moduleTypeId", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "module", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModuleUninstallResult",
        inputs: [
            { name: "module", type: "address", indexed: false, internalType: "address" },
            { name: "result", type: "bool", indexed: false, internalType: "bool" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModuleUninstalled",
        inputs: [
            { name: "moduleTypeId", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "module", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "NonceInvalidated",
        inputs: [{ name: "nonce", type: "uint32", indexed: false, internalType: "uint32" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "PermissionInstalled",
        inputs: [
            { name: "permission", type: "bytes4", indexed: false, internalType: "PermissionId" },
            { name: "nonce", type: "uint32", indexed: false, internalType: "uint32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "PermissionUninstalled",
        inputs: [{ name: "permission", type: "bytes4", indexed: false, internalType: "PermissionId" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "Received",
        inputs: [
            { name: "sender", type: "address", indexed: false, internalType: "address" },
            { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "RootValidatorUpdated",
        inputs: [{ name: "rootValidator", type: "bytes21", indexed: false, internalType: "ValidationId" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "SelectorSet",
        inputs: [
            { name: "selector", type: "bytes4", indexed: false, internalType: "bytes4" },
            { name: "vId", type: "bytes21", indexed: false, internalType: "ValidationId" },
            { name: "allowed", type: "bool", indexed: false, internalType: "bool" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "TryExecuteUnsuccessful",
        inputs: [
            { name: "batchExecutionindex", type: "uint256", indexed: false, internalType: "uint256" },
            { name: "result", type: "bytes", indexed: false, internalType: "bytes" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "Upgraded",
        inputs: [{ name: "implementation", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "ValidatorInstalled",
        inputs: [
            { name: "validator", type: "address", indexed: false, internalType: "contract IValidator" },
            { name: "nonce", type: "uint32", indexed: false, internalType: "uint32" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ValidatorUninstalled",
        inputs: [{ name: "validator", type: "address", indexed: false, internalType: "contract IValidator" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnerRegistered",
        inputs: [
            { name: "kernel", type: "address", indexed: true, internalType: "address" },
            { name: "owner", type: "address", indexed: true, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModuleInitialized",
        inputs: [
            { name: "account", type: "address", indexed: true, internalType: "address" },
            { name: "owner", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "ModuleUninitialized",
        inputs: [{ name: "account", type: "address", indexed: true, internalType: "address" }],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnerAdded",
        inputs: [
            { name: "account", type: "address", indexed: true, internalType: "address" },
            { name: "owner", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
    {
        type: "event",
        name: "OwnerRemoved",
        inputs: [
            { name: "account", type: "address", indexed: true, internalType: "address" },
            { name: "owner", type: "address", indexed: false, internalType: "address" },
        ],
        anonymous: false,
    },
] as const;
