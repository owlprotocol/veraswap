export const allowance = {
    type: "function",
    name: "allowance",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const burn = {
    type: "function",
    name: "burn",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const clear = {
    type: "function",
    name: "clear",
    inputs: [
        { name: "currency", type: "address", internalType: "Currency" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const collectProtocolFees = {
    type: "function",
    name: "collectProtocolFees",
    inputs: [
        { name: "recipient", type: "address", internalType: "address" },
        { name: "currency", type: "address", internalType: "Currency" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amountCollected", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
} as const;
export const donate = {
    type: "function",
    name: "donate",
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
        { name: "amount0", type: "uint256", internalType: "uint256" },
        { name: "amount1", type: "uint256", internalType: "uint256" },
        { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "int256", internalType: "BalanceDelta" }],
    stateMutability: "nonpayable",
} as const;
export const extsload = {
    type: "function",
    name: "extsload",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "value", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const extsload_bytes32_uint256 = {
    type: "function",
    name: "extsload",
    inputs: [
        { name: "startSlot", type: "bytes32", internalType: "bytes32" },
        { name: "nSlots", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "values", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const extsload_bytes32array = {
    type: "function",
    name: "extsload",
    inputs: [{ name: "slots", type: "bytes32[]", internalType: "bytes32[]" }],
    outputs: [{ name: "values", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const exttload = {
    type: "function",
    name: "exttload",
    inputs: [{ name: "slots", type: "bytes32[]", internalType: "bytes32[]" }],
    outputs: [{ name: "values", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const exttload_bytes32 = {
    type: "function",
    name: "exttload",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "value", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const initialize = {
    type: "function",
    name: "initialize",
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
    outputs: [{ name: "tick", type: "int24", internalType: "int24" }],
    stateMutability: "nonpayable",
} as const;
export const isOperator = {
    type: "function",
    name: "isOperator",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "approved", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const mint = {
    type: "function",
    name: "mint",
    inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const modifyLiquidity = {
    type: "function",
    name: "modifyLiquidity",
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
        {
            name: "params",
            type: "tuple",
            internalType: "struct IPoolManager.ModifyLiquidityParams",
            components: [
                { name: "tickLower", type: "int24", internalType: "int24" },
                { name: "tickUpper", type: "int24", internalType: "int24" },
                { name: "liquidityDelta", type: "int256", internalType: "int256" },
                { name: "salt", type: "bytes32", internalType: "bytes32" },
            ],
        },
        { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
        { name: "callerDelta", type: "int256", internalType: "BalanceDelta" },
        { name: "feesAccrued", type: "int256", internalType: "BalanceDelta" },
    ],
    stateMutability: "nonpayable",
} as const;
export const protocolFeeController = {
    type: "function",
    name: "protocolFeeController",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const protocolFeesAccrued = {
    type: "function",
    name: "protocolFeesAccrued",
    inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
    outputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const setOperator = {
    type: "function",
    name: "setOperator",
    inputs: [
        { name: "operator", type: "address", internalType: "address" },
        { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const setProtocolFee = {
    type: "function",
    name: "setProtocolFee",
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
        { name: "newProtocolFee", type: "uint24", internalType: "uint24" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setProtocolFeeController = {
    type: "function",
    name: "setProtocolFeeController",
    inputs: [{ name: "controller", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const settle = {
    type: "function",
    name: "settle",
    inputs: [],
    outputs: [{ name: "paid", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
} as const;
export const settleFor = {
    type: "function",
    name: "settleFor",
    inputs: [{ name: "recipient", type: "address", internalType: "address" }],
    outputs: [{ name: "paid", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
} as const;
export const swap = {
    type: "function",
    name: "swap",
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
        {
            name: "params",
            type: "tuple",
            internalType: "struct IPoolManager.SwapParams",
            components: [
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "amountSpecified", type: "int256", internalType: "int256" },
                { name: "sqrtPriceLimitX96", type: "uint160", internalType: "uint160" },
            ],
        },
        { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "swapDelta", type: "int256", internalType: "BalanceDelta" }],
    stateMutability: "nonpayable",
} as const;
export const sync = {
    type: "function",
    name: "sync",
    inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const take = {
    type: "function",
    name: "take",
    inputs: [
        { name: "currency", type: "address", internalType: "Currency" },
        { name: "to", type: "address", internalType: "address" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const transfer = {
    type: "function",
    name: "transfer",
    inputs: [
        { name: "receiver", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const transferFrom = {
    type: "function",
    name: "transferFrom",
    inputs: [
        { name: "sender", type: "address", internalType: "address" },
        { name: "receiver", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const unlock = {
    type: "function",
    name: "unlock",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const updateDynamicLPFee = {
    type: "function",
    name: "updateDynamicLPFee",
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
        { name: "newDynamicLPFee", type: "uint24", internalType: "uint24" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const Donate = {
    type: "event",
    name: "Donate",
    inputs: [
        { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "amount0", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "amount1", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const Initialize = {
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
} as const;
export const ModifyLiquidity = {
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
} as const;
export const OperatorSet = {
    type: "event",
    name: "OperatorSet",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "operator", type: "address", indexed: true, internalType: "address" },
        { name: "approved", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
} as const;
export const ProtocolFeeControllerUpdated = {
    type: "event",
    name: "ProtocolFeeControllerUpdated",
    inputs: [{ name: "protocolFeeController", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const ProtocolFeeUpdated = {
    type: "event",
    name: "ProtocolFeeUpdated",
    inputs: [
        { name: "id", type: "bytes32", indexed: true, internalType: "PoolId" },
        { name: "protocolFee", type: "uint24", indexed: false, internalType: "uint24" },
    ],
    anonymous: false,
} as const;
export const Swap = {
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
} as const;
export const Transfer = {
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
} as const;
export const AlreadyUnlocked = { type: "error", name: "AlreadyUnlocked", inputs: [] } as const;
export const CurrenciesOutOfOrderOrEqual = {
    type: "error",
    name: "CurrenciesOutOfOrderOrEqual",
    inputs: [
        { name: "currency0", type: "address", internalType: "address" },
        { name: "currency1", type: "address", internalType: "address" },
    ],
} as const;
export const CurrencyNotSettled = { type: "error", name: "CurrencyNotSettled", inputs: [] } as const;
export const InvalidCaller = { type: "error", name: "InvalidCaller", inputs: [] } as const;
export const ManagerLocked = { type: "error", name: "ManagerLocked", inputs: [] } as const;
export const MustClearExactPositiveDelta = { type: "error", name: "MustClearExactPositiveDelta", inputs: [] } as const;
export const NonzeroNativeValue = { type: "error", name: "NonzeroNativeValue", inputs: [] } as const;
export const PoolNotInitialized = { type: "error", name: "PoolNotInitialized", inputs: [] } as const;
export const ProtocolFeeCurrencySynced = { type: "error", name: "ProtocolFeeCurrencySynced", inputs: [] } as const;
export const ProtocolFeeTooLarge = {
    type: "error",
    name: "ProtocolFeeTooLarge",
    inputs: [{ name: "fee", type: "uint24", internalType: "uint24" }],
} as const;
export const SwapAmountCannotBeZero = { type: "error", name: "SwapAmountCannotBeZero", inputs: [] } as const;
export const TickSpacingTooLarge = {
    type: "error",
    name: "TickSpacingTooLarge",
    inputs: [{ name: "tickSpacing", type: "int24", internalType: "int24" }],
} as const;
export const TickSpacingTooSmall = {
    type: "error",
    name: "TickSpacingTooSmall",
    inputs: [{ name: "tickSpacing", type: "int24", internalType: "int24" }],
} as const;
export const UnauthorizedDynamicLPFeeUpdate = {
    type: "error",
    name: "UnauthorizedDynamicLPFeeUpdate",
    inputs: [],
} as const;
export const functions = [
    allowance,
    approve,
    balanceOf,
    burn,
    clear,
    collectProtocolFees,
    donate,
    extsload,
    extsload_bytes32_uint256,
    extsload_bytes32array,
    exttload,
    exttload_bytes32,
    initialize,
    isOperator,
    mint,
    modifyLiquidity,
    protocolFeeController,
    protocolFeesAccrued,
    setOperator,
    setProtocolFee,
    setProtocolFeeController,
    settle,
    settleFor,
    swap,
    sync,
    take,
    transfer,
    transferFrom,
    unlock,
    updateDynamicLPFee,
] as const;
export const events = [
    Approval,
    Donate,
    Initialize,
    ModifyLiquidity,
    OperatorSet,
    ProtocolFeeControllerUpdated,
    ProtocolFeeUpdated,
    Swap,
    Transfer,
] as const;
export const errors = [
    AlreadyUnlocked,
    CurrenciesOutOfOrderOrEqual,
    CurrencyNotSettled,
    InvalidCaller,
    ManagerLocked,
    MustClearExactPositiveDelta,
    NonzeroNativeValue,
    PoolNotInitialized,
    ProtocolFeeCurrencySynced,
    ProtocolFeeTooLarge,
    SwapAmountCannotBeZero,
    TickSpacingTooLarge,
    TickSpacingTooSmall,
    UnauthorizedDynamicLPFeeUpdate,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IPoolManager = {
    abi,
};
