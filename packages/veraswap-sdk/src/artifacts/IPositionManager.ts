export const DOMAIN_SEPARATOR = {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const getPoolAndPositionInfo = {
    type: "function",
    name: "getPoolAndPositionInfo",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
        {
            name: "",
            type: "tuple",
            internalType: "struct PoolKey",
            components: [
                { name: "currency0", type: "address", internalType: "Currency" },
                { name: "currency1", type: "address", internalType: "Currency" },
                { name: "fee", type: "uint24", internalType: "uint24" },
                { name: "tickSpacing", type: "int24", internalType: "int24" },
                { name: "hooks", type: "address", internalType: "contract IHooks" },
            ],
        },
        { name: "", type: "uint256", internalType: "PositionInfo" },
    ],
    stateMutability: "view",
} as const;
export const getPositionLiquidity = {
    type: "function",
    name: "getPositionLiquidity",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "liquidity", type: "uint128", internalType: "uint128" }],
    stateMutability: "view",
} as const;
export const initializePool = {
    type: "function",
    name: "initializePool",
    inputs: [
        {
            name: "key",
            type: "tuple",
            internalType: "struct PoolKey",
            components: [
                { name: "currency0", type: "address", internalType: "Currency" },
                { name: "currency1", type: "address", internalType: "Currency" },
                { name: "fee", type: "uint24", internalType: "uint24" },
                { name: "tickSpacing", type: "int24", internalType: "int24" },
                { name: "hooks", type: "address", internalType: "contract IHooks" },
            ],
        },
        { name: "sqrtPriceX96", type: "uint160", internalType: "uint160" },
    ],
    outputs: [{ name: "", type: "int24", internalType: "int24" }],
    stateMutability: "payable",
} as const;
export const modifyLiquidities = {
    type: "function",
    name: "modifyLiquidities",
    inputs: [
        { name: "unlockData", type: "bytes", internalType: "bytes" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const modifyLiquiditiesWithoutUnlock = {
    type: "function",
    name: "modifyLiquiditiesWithoutUnlock",
    inputs: [
        { name: "actions", type: "bytes", internalType: "bytes" },
        { name: "params", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const multicall = {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]", internalType: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
} as const;
export const nextTokenId = {
    type: "function",
    name: "nextTokenId",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const nonces = {
    type: "function",
    name: "nonces",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "word", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const permit = {
    type: "function",
    name: "permit",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
        { name: "nonce", type: "uint256", internalType: "uint256" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
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
    outputs: [{ name: "err", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
} as const;
export const permitBatch = {
    type: "function",
    name: "permitBatch",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        {
            name: "_permitBatch",
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
    outputs: [{ name: "err", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
} as const;
export const permitForAll = {
    type: "function",
    name: "permitForAll",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "operator", type: "address", internalType: "address" },
        { name: "approved", type: "bool", internalType: "bool" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
        { name: "nonce", type: "uint256", internalType: "uint256" },
        { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const poolManager = {
    type: "function",
    name: "poolManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPoolManager" }],
    stateMutability: "view",
} as const;
export const positionInfo = {
    type: "function",
    name: "positionInfo",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "PositionInfo" }],
    stateMutability: "view",
} as const;
export const revokeNonce = {
    type: "function",
    name: "revokeNonce",
    inputs: [{ name: "nonce", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const subscribe = {
    type: "function",
    name: "subscribe",
    inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "newSubscriber", type: "address", internalType: "address" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const subscriber = {
    type: "function",
    name: "subscriber",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "subscriber", type: "address", internalType: "contract ISubscriber" }],
    stateMutability: "view",
} as const;
export const unsubscribe = {
    type: "function",
    name: "unsubscribe",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const unsubscribeGasLimit = {
    type: "function",
    name: "unsubscribeGasLimit",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const Subscription = {
    type: "event",
    name: "Subscription",
    inputs: [
        { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "subscriber", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const Unsubscription = {
    type: "event",
    name: "Unsubscription",
    inputs: [
        { name: "tokenId", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "subscriber", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const AlreadySubscribed = {
    type: "error",
    name: "AlreadySubscribed",
    inputs: [
        { name: "tokenId", type: "uint256", internalType: "uint256" },
        { name: "subscriber", type: "address", internalType: "address" },
    ],
} as const;
export const BurnNotificationReverted = {
    type: "error",
    name: "BurnNotificationReverted",
    inputs: [
        { name: "subscriber", type: "address", internalType: "address" },
        { name: "reason", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const DeadlinePassed = {
    type: "error",
    name: "DeadlinePassed",
    inputs: [{ name: "deadline", type: "uint256", internalType: "uint256" }],
} as const;
export const GasLimitTooLow = { type: "error", name: "GasLimitTooLow", inputs: [] } as const;
export const ModifyLiquidityNotificationReverted = {
    type: "error",
    name: "ModifyLiquidityNotificationReverted",
    inputs: [
        { name: "subscriber", type: "address", internalType: "address" },
        { name: "reason", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const NoCodeSubscriber = { type: "error", name: "NoCodeSubscriber", inputs: [] } as const;
export const NoSelfPermit = { type: "error", name: "NoSelfPermit", inputs: [] } as const;
export const NonceAlreadyUsed = { type: "error", name: "NonceAlreadyUsed", inputs: [] } as const;
export const NotApproved = {
    type: "error",
    name: "NotApproved",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
} as const;
export const NotSubscribed = { type: "error", name: "NotSubscribed", inputs: [] } as const;
export const PoolManagerMustBeLocked = { type: "error", name: "PoolManagerMustBeLocked", inputs: [] } as const;
export const SignatureDeadlineExpired = { type: "error", name: "SignatureDeadlineExpired", inputs: [] } as const;
export const SubscriptionReverted = {
    type: "error",
    name: "SubscriptionReverted",
    inputs: [
        { name: "subscriber", type: "address", internalType: "address" },
        { name: "reason", type: "bytes", internalType: "bytes" },
    ],
} as const;
export const Unauthorized = { type: "error", name: "Unauthorized", inputs: [] } as const;
export const functions = [
    DOMAIN_SEPARATOR,
    getPoolAndPositionInfo,
    getPositionLiquidity,
    initializePool,
    modifyLiquidities,
    modifyLiquiditiesWithoutUnlock,
    multicall,
    nextTokenId,
    nonces,
    permit,
    permit_address___address_uint160_uint48_uint48__address_uint256__bytes,
    permitBatch,
    permitForAll,
    poolManager,
    positionInfo,
    revokeNonce,
    subscribe,
    subscriber,
    unsubscribe,
    unsubscribeGasLimit,
] as const;
export const events = [Subscription, Unsubscription] as const;
export const errors = [
    AlreadySubscribed,
    BurnNotificationReverted,
    DeadlinePassed,
    GasLimitTooLow,
    ModifyLiquidityNotificationReverted,
    NoCodeSubscriber,
    NoSelfPermit,
    NonceAlreadyUsed,
    NotApproved,
    NotSubscribed,
    PoolManagerMustBeLocked,
    SignatureDeadlineExpired,
    SubscriptionReverted,
    Unauthorized,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IPositionManager = {
    abi,
};
