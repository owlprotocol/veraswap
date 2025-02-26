import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [{ name: "initialOwner", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
} as const;
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
    outputs: [{ name: "balance", type: "uint256", internalType: "uint256" }],
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
    outputs: [{ name: "delta", type: "int256", internalType: "BalanceDelta" }],
    stateMutability: "nonpayable",
} as const;
export const extsload = {
    type: "function",
    name: "extsload",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const extsload_bytes32_uint256 = {
    type: "function",
    name: "extsload",
    inputs: [
        { name: "startSlot", type: "bytes32", internalType: "bytes32" },
        { name: "nSlots", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const extsload_bytes32array = {
    type: "function",
    name: "extsload",
    inputs: [{ name: "slots", type: "bytes32[]", internalType: "bytes32[]" }],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const exttload = {
    type: "function",
    name: "exttload",
    inputs: [{ name: "slots", type: "bytes32[]", internalType: "bytes32[]" }],
    outputs: [{ name: "", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const exttload_bytes32 = {
    type: "function",
    name: "exttload",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
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
        { name: "operator", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "isOperator", type: "bool", internalType: "bool" }],
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
export const owner = {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
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
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
} as const;
export const settleFor = {
    type: "function",
    name: "settleFor",
    inputs: [{ name: "recipient", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
} as const;
export const supportsInterface = {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
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
export const transferOwnership = {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unlock = {
    type: "function",
    name: "unlock",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "result", type: "bytes", internalType: "bytes" }],
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
export const OwnershipTransferred = {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
        { name: "user", type: "address", indexed: true, internalType: "address" },
        { name: "newOwner", type: "address", indexed: true, internalType: "address" },
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
export const DelegateCallNotAllowed = { type: "error", name: "DelegateCallNotAllowed", inputs: [] } as const;
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
    _constructor,
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
    owner,
    protocolFeeController,
    protocolFeesAccrued,
    setOperator,
    setProtocolFee,
    setProtocolFeeController,
    settle,
    settleFor,
    supportsInterface,
    swap,
    sync,
    take,
    transfer,
    transferFrom,
    transferOwnership,
    unlock,
    updateDynamicLPFee,
] as const;
export const events = [
    Approval,
    Donate,
    Initialize,
    ModifyLiquidity,
    OperatorSet,
    OwnershipTransferred,
    ProtocolFeeControllerUpdated,
    ProtocolFeeUpdated,
    Swap,
    Transfer,
] as const;
export const errors = [
    AlreadyUnlocked,
    CurrenciesOutOfOrderOrEqual,
    CurrencyNotSettled,
    DelegateCallNotAllowed,
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

export const bytecode =
    "0x60a03460a057601f6143b838819003918201601f19168301916001600160401b0383118484101760a45780849260209460405283398101031260a057516001600160a01b0381169081900360a0575f80546001600160a01b0319168217815560405191907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08180a3306080526142ff90816100b98239608051816124550152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60a0806040526004361015610012575f80fd5b5f3560e01c908162fdd58e14611f3a5750806301ffc9a714611ee4578063095bcdb614611e5d5780630b0d9c0914611e0257806311da60b414611dd8578063156e29f614611d535780631e2eaeaf14611d37578063234266d714611b3f5780632d77138914611acd57806335fd631a14611a775780633dd45adb14611a44578063426a8493146119ca57806348c8949114611833578063527596511461178f578063558a7297146116fd578063598af9e7146116a35780635a6bcfda14610dd15780636276cbbe14610b135780637e87ce7d14610a4357806380f0b44c146109c85780638161b874146108fb5780638da5cb5b146108d457806397e8cd4e1461089c5780639bf6645f1461084f578063a5841194146107d5578063b6363cf21461077e578063dbd035ff14610728578063f02de3b214610700578063f135baaa146106e4578063f2fde38b1461066f578063f3cd914c14610407578063f5298aca146102e45763fe99049a14610186575f80fd5b346102e05760803660031901126102e05761019f611f79565b6101a7611f8f565b60443591606435916001600160a01b03909116905f8051602061426a833981519152906102449033841415806102bd575b610252575b835f52600460205260405f20865f5260205260405f206101fe868254612159565b905560018060a01b031693845f52600460205260405f20865f5260205260405f2061022a828254612166565b905560408051338152602081019290925290918291820190565b0390a4602060405160018152f35b5f84815260056020908152604080832033845282528083208984529091529020548560018201610284575b50506101dd565b61028d91612159565b845f52600560205260405f2060018060a01b0333165f5260205260405f20875f5260205260405f20555f8561027d565b505f84815260036020908152604080832033845290915290205460ff16156101d8565b5f80fd5b346102e0576102f236611fa5565b5f8051602061428a8339815191525c156103f8575f8051602061426a8339815191526103705f9360018060a01b03169461033661032e856121ce565b3390886121ef565b6001600160a01b03169233841415806103d6575b610375575b8385526004602052604085208686526020526040852061022a828254612159565b0390a4005b838552600560209081526040808720338852825280872088885290915285205481861982036103a6575b505061034f565b6103af91612159565b8486526005602090815260408088203389528252808820898952909152862055868161039f565b5083855260036020908152604080872033885290915285205460ff161561034a565b6354e3ca0d60e01b5f5260045ffd5b346102e0576101203660031901126102e05761042236612053565b60603660a31901126102e0576040519061043b82611fea565b60a43580151581036102e057825260c435602083019081529060e435906001600160a01b03821682036102e05760408401918252610104356001600160401b0381116102e05761048f9036906004016120da565b9290935f8051602061428a8339815191525c156103f8576104ae612453565b51156106605760a0822092835f52600660205260405f20906104cf82612494565b60808401958482828a600160a01b600190038b5116936104ee946128cc565b90949195606088015160020b908b51151590600160a01b60019003905116916040519861051a8a612005565b895260208901526040880152606087015262ffffff166080860152885115155f149862ffffff610607986105636105f49860209d61064d578a516001600160a01b031695613367565b94929682919261062e575b505060018060a01b03845116938e6001600160801b0360408301511691015160020b90604051958860801d600f0b875288600f0b60208801526040870152606086015260808501521660a08301527f40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f60c03393a3885187906001600160a01b0316612a39565b8094919461060f575b5050823391612535565b604051908152f35b9051610627916001600160a01b039091169083612535565b84806105fd565b60018060a01b03165f5260018f5260405f209081540190558e8061056e565b8a8e01516001600160a01b031695613367565b63be8b850760e01b5f5260045ffd5b346102e05760203660031901126102e057610688611f79565b5f549061069f336001600160a01b03841614612173565b60018060a01b031680916bffffffffffffffffffffffff60a01b16175f55337f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b346102e05760203660031901126102e0576004355c5f5260205ff35b346102e0575f3660031901126102e0576002546040516001600160a01b039091168152602090f35b346102e05761073636612107565b6040519160408360208152836020820152019160051b8301916020806040850193925b8335548152019101908483821015610775575060208091610759565b60408186030190f35b346102e05760403660031901126102e057610797611f79565b61079f611f8f565b9060018060a01b03165f52600360205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b346102e05760203660031901126102e0576107ee611f79565b6001600160a01b03811690816108125750505f5f8051602061424a8339815191525d005b61081b90612840565b905f8051602061424a8339815191525d7f1e0745a7db1623981f0b2a5d4232364c00787266eb75ad546f190e6cebe9bd955d005b346102e05761085d36612107565b6040519160408360208152836020820152019160051b8301916020806040850193925b83355c8152019101908483821015610775575060208091610880565b346102e05760203660031901126102e0576001600160a01b036108bd611f79565b165f526001602052602060405f2054604051908152f35b346102e0575f3660031901126102e0575f546040516001600160a01b039091168152602090f35b346102e05760603660031901126102e057610914611f79565b61091c611f8f565b600254604435906001600160a01b031633036109b9576001600160a01b03821680151580610999575b61098a5760209361060792806109825750815f526001855260405f20549384925b5f526001865260405f2061097b848254612159565b905561227a565b938492610966565b6318f3cb2960e31b5f5260045ffd5b505f8051602061424a8339815191525c6001600160a01b03168114610945565b6348f5c3ed60e01b5f5260045ffd5b346102e05760403660031901126102e0576109e1611f79565b5f8051602061428a8339815191525c156103f857335f9081526001600160a01b038216602052604090205c610a176024356121ce565b9081600f0b03610a3457610a329133915f03600f0b906121ef565b005b63bda73abf60e01b5f5260045ffd5b346102e05760c03660031901126102e057610a5d36612053565b610a65612041565b6002549091906001600160a01b031633036109b957623e900062fff0008316106103e9610fff8416101615610afb57602060a07fe9c42593e71f84403b84352cd168d693e2c9fcd1fdbcc3feb21d92b43e6696f9922092835f526006825260405f20610ad081612494565b805462ffffff60b81b191660b883901b62ffffff60b81b1617905560405162ffffff919091168152a2005b62ffffff8263a7abe2f760e01b5f521660045260245ffd5b346102e05760c03660031901126102e057610b2d36612053565b60a435906001600160a01b0382168083036102e057610b4a612453565b6060820191825160020b617fff8113610dbf5750825160020b60018112610dad5750805160208201805190916001600160a01b03908116911680821015610d8f575050608082019060018060a01b03825116906040840191610bb262ffffff84511682612772565b15610d7d5750610bc762ffffff835116612823565b83519097906001600160a01b0381169033829003610d2a575b505060a085205f8181526006602052604090208054919290916001600160a01b0316610d1b576020997fdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d643892610c3660a0936130e2565b9162ffffff60d01b9060d01b168a62ffffff851b84861b161717905562ffffff600180841b0389511695600180851b03905116965116995160020b600180841b03885116906040519b8c528c8c015260408b01528860608b015260020b98896080820152a4516001600160a01b0381169033829003610cba575b8585604051908152f35b61100016610cc9575b80610cb0565b610d1292610cf060405193636fe7e6eb60e01b8886015233602486015260448501906124b4565b60e4830152836101048301526101048252610d0d61012483612020565b612b5b565b50828080610cc3565b637983c05160e01b5f5260045ffd5b61200016610d39575b80610be0565b604051636e4c1aa760e11b6020820152336024820152610d7691610d6060448301896124b4565b8860e483015260e48252610d0d61010483612020565b5088610d33565b630732d7b560e51b5f5260045260245ffd5b60449250604051916306e6c98360e41b835260048301526024820152fd5b631d3d20b160e31b5f5260045260245ffd5b6316e0049f60e31b5f5260045260245ffd5b346102e0576101403660031901126102e057610dec36612053565b60803660a31901126102e05760405190610e0582611fcf565b60a4358060020b81036102e057825260c4358060020b81036102e057602083015260e4356040830152610104356060830152610124356001600160401b0381116102e057610e579036906004016120da565b90925f8051602061428a8339815191525c156103f857610e75612453565b60a0832093845f52600660205260405f20608052610e94608051612494565b60808401516001600160a01b03811690338290036115ee575b5050815160020b92602083015160020b91610ecb60408501516125f6565b93606087015160020b9760608201516040519960c08b018b81106001600160401b038211176115da57604052338b528860208c01528660408c015287600f0b60608c015260808b015260a08a01525f91858812156115bc57620d89e71988126115a957620d89e886136115965760405192610f4584611fcf565b5f84525f60208501525f60408501525f606085015287600f0b611373575b600460805101978960020b5f528860205260405f20988860020b5f5260205260405f206080515460a01c60020b8b81125f1461131d575060028060018c0154600184015490039b015491015490039b5b60a0600180821b03825116910151906040519160268301528960068301528b600383015281525f603a600c83012091816040820152816020820152525f5260066080510160205260405f20976001600160801b038954169982600f0b155f146112e1578a156112d25761106061105a60409f9b6111219c6111339e5b60018301956110526002611046848a548503613d76565b95019283548503613d76565b9655556121ce565b916121ce565b6001600160801b03169060801b179a8b965f84600f0b12611264575b5082600f0b611160575b5050506110ac61109d8560801d8360801d016125f6565b9185600f0b90600f0b016125f6565b6001600160801b03169060801b1791815160020b90602083015160020b8c8401516060850151918e5194855260208501528d84015260608301527ff208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec60803393a3608089015189906001600160a01b0316612674565b8094919461113f575b50833391612535565b82519182526020820152f35b608082015161115a916001600160a01b039091169083612535565b8561112a565b6080515492935090916001600160a01b0381169060a01c60020b828112156111b9575050906111ad926111a26111986111a894612cb9565b91600f0b92612cb9565b90613031565b6125f6565b60801b5b8b8080611086565b92809193125f1461123a576111f8916111e56111a86111a8936111df88600f0b91612cb9565b87613031565b936111f386600f0b92612cb9565b612fe6565b6001600160801b03169060801b17906001600160801b0361122560036080510192600f0b82845416613066565b166001600160801b03198254161790556111b1565b906111a892509261125061119861125695612cb9565b90612fe6565b6001600160801b03166111b1565b808f91516112a6575b015161127a575b8e61107c565b6112a18260805160049160020b5f52016020525f6002604082208281558260018201550155565b611274565b6112cd8360805160049160020b5f52016020525f6002604082208281558260018201550155565b61126d565b632bbfae4960e21b5f5260045ffd5b61106061105a60409f9b6111219c6111339e6001600160801b0361130889600f0b83613066565b166001600160801b031984541617835561102f565b90999089136113435760028060018c0154600184015490039b015491015490039b610fb3565b9860026001608051015460018c01549003600183015490039a81806080510154910154900391015490039b610fb3565b6004608051018960020b5f5280602052898960405f206113c381546001600160801b036113a681831695600f0b86613066565b16931594858515141595611562575b508d600f0b9060801d612a13565b60801b82179055602087015285528760020b5f5260205260405f208054906001600160801b0382166113f88b600f0b82613066565b901592836001600160801b03831615141593611535575b8b600f0b9060801d600f0b039160016001607f1b03831360016001607f1b031984121761152157826001600160801b03935060801b83831617905516606086015260408501525f88600f0b12156114aa575b835161148e575b604084015115610f635761148960808c015160020b88600560805101612c6d565b610f63565b6114a560808c015160020b8a600560805101612c6d565b611468565b60808b015160020b6001600160801b03600181602088015116925f81620d89e719071281620d89e719050390620d89e805030181041680911161150e576001600160801b036060860151161115611461578663b8e3c38560e01b5f5260045260245ffd5b8963b8e3c38560e01b5f5260045260245ffd5b634e487b7160e01b5f52601160045260245ffd5b6080515460a01c60020b8b1361140f5760016080510154600184015560026080510154600284015561140f565b6080515460a01c60020b1215611579575b8e6113b5565b600160805101546001840155600260805101546002840155611573565b8563035aeeff60e31b5f5260045260245ffd5b8763d5e2f7ab60e01b5f5260045260245ffd5b604488876040519163c4433ed560e01b835260048301526024820152fd5b634e487b7160e01b5f52604160045260245ffd5b5f604085015113808091611696575b1561164457505060405163259982e560e01b602082015261163b91610d0d8261162d8887898c3360248701612590565b03601f198101845283612020565b505b8580610ead565b159081611688575b50611658575b5061163d565b60405163021d0ee760e41b602082015261168191610d0d8261162d8887898c3360248701612590565b5085611652565b61020091501615158761164c565b50610800821615156115fd565b346102e05760603660031901126102e0576116bc611f79565b6116c4611f8f565b6001600160a01b039182165f90815260056020908152604080832094909316825292835281812060443582528352819020549051908152f35b346102e05760403660031901126102e057611716611f79565b602435908115158092036102e057335f52600360205260405f2060018060a01b0382165f5260205260405f2060ff1981541660ff841617905560405191825260018060a01b0316907fceb576d9f15e4e200fdb5096d64d5dfd667e16def20c1eefd14256d8e3faa26760203392a3602060405160018152f35b346102e05760c03660031901126102e0576117a936612053565b6117b1612041565b906280000062ffffff6040830151161480159061181c575b61180d5760a0906117d98361256c565b205f52600660205260405f20906117ef82612494565b815462ffffff60d01b191660d09190911b62ffffff60d01b16179055005b6330d2164160e01b5f5260045ffd5b5060808101516001600160a01b03163314156117c9565b346102e05760203660031901126102e0576004356001600160401b0381116102e0576118639036906004016120da565b5f8051602061428a8339815191525c6119bb576118b0915f9160015f8051602061428a8339815191525d6040516348eeb9a360e11b815260206004820152938492839260248401916121ae565b038183335af19081156119b0575f91611928575b505f805160206142aa8339815191525c6119195760406020915f5f8051602061428a8339815191525d815192839181835280519182918282860152018484015e5f828201840152601f01601f19168101030190f35b635212cba160e01b5f5260045ffd5b90503d805f833e6119398183612020565b8101906020818303126102e0578051906001600160401b0382116102e0570181601f820112156102e0578051906001600160401b0382116115da576040519261198c601f8401601f191660200185612020565b828452602083830101116102e057815f9260208093018386015e83010152816118c4565b6040513d5f823e3d90fd5b6328486b6360e11b5f5260045ffd5b346102e0576119d836611fa5565b9091335f52600560205260405f2060018060a01b0382165f5260205260405f20835f526020528160405f205560405191825260018060a01b0316907fb3fd5071835887567a0671151121894ddccc2842f1d10bedad13e0d17cace9a760203392a4602060405160018152f35b60203660031901126102e057611a58611f79565b5f8051602061428a8339815191525c156103f8576106076020916123bd565b346102e05760403660031901126102e0576024356004356040519160408360208152826020820152019060051b8301916001602060408501935b8354815201910190848382101561077557506020600191611ab1565b346102e05760203660031901126102e057611ae6611f79565b611afa60018060a01b035f54163314612173565b600280546001600160a01b0319166001600160a01b039290921691821790557fb4bd8ef53df690b9943d3318996006dbb82a25f54719d8c8035b516a2a5b8acc5f80a2005b346102e0576101003660031901126102e057611b5a36612053565b60c4359060a43560e4356001600160401b0381116102e057611b809036906004016120da565b9190935f8051602061428a8339815191525c156103f857611b9f612453565b60a0842094855f52600660205260405f2094611bba86612494565b6080810180516001600160a01b0381169033829003611cf8575b50506001600160801b03600388015416978815611ce957602098611bf7876121ce565b5f03611c02876121ce565b5f036001600160801b03169060801b179887611cd5575b86611cc0575b5050611c2c338985612535565b60405190868252858a8301527f29ef05caaff9404b7cb6d1c0e9bbae9eaa7ab2541feba1a9c4248594c08156cb60403393a3516001600160a01b038116939033859003611c7e575b8888604051908152f35b601016611c8c575b80611c74565b611cb495610d0d9361162d9260405197889563e1b4af6960e01b8d88015233602488016124f7565b50828080808080611c86565b600201908660801b0481540190558980611c1f565b60018101828960801b048154019055611c19565b63a74f97ab60e01b5f5260045ffd5b602016611d06575b80611bd4565b604051635b54587d60e11b6020820152611d3091610d0d8261162d8b898b8d8b33602488016124f7565b5088611d00565b346102e05760203660031901126102e057600435545f5260205ff35b346102e057611d6136611fa5565b905f8051602061428a8339815191525c156103f8576001600160a01b0316915f905f8051602061426a8339815191529061037090611dae611da1866121ce565b8503600f0b3390886121ef565b60018060a01b0316938484526004602052604084208685526020526040842061022a828254612166565b5f3660031901126102e0575f8051602061428a8339815191525c156103f8576020610607336123bd565b346102e05760603660031901126102e057611e1b611f79565b611e23611f8f565b604435905f8051602061428a8339815191525c156103f857610a3292611e58611e4b846121ce565b5f03600f0b3390836121ef565b61227a565b346102e057611e6b36611fa5565b9091335f52600460205260405f20835f5260205260405f20611e8e838254612159565b905560018060a01b031690815f52600460205260405f20835f5260205260405f20611eba828254612166565b9055604080513380825260208201939093525f8051602061426a8339815191529181908101610244565b346102e05760203660031901126102e05760043563ffffffff60e01b81168091036102e0576020906301ffc9a760e01b8114908115611f29575b506040519015158152f35b630f632fb360e01b14905082611f1e565b346102e05760403660031901126102e0576020906001600160a01b03611f5e611f79565b165f526004825260405f206024355f52825260405f20548152f35b600435906001600160a01b03821682036102e057565b602435906001600160a01b03821682036102e057565b60609060031901126102e0576004356001600160a01b03811681036102e057906024359060443590565b608081019081106001600160401b038211176115da57604052565b606081019081106001600160401b038211176115da57604052565b60a081019081106001600160401b038211176115da57604052565b90601f801991011681019081106001600160401b038211176115da57604052565b60a4359062ffffff821682036102e057565b60a09060031901126102e0576040519061206c82612005565b816004356001600160a01b03811681036102e05781526024356001600160a01b03811681036102e057602082015260443562ffffff811681036102e05760408201526064358060020b81036102e0576060820152608435906001600160a01b03821682036102e05760800152565b9181601f840112156102e0578235916001600160401b0383116102e057602083818601950101116102e057565b9060206003198301126102e0576004356001600160401b0381116102e057826023820112156102e0578060040135926001600160401b0384116102e05760248460051b830101116102e0576024019190565b9190820391821161152157565b9190820180921161152157565b1561217a57565b60405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b6044820152606490fd5b908060209392818452848401375f828201840152601f01601f1916010190565b6001607f1b8110156121e057600f0b90565b6393dafdf160e01b5f5260045ffd5b9190600f0b918215612275576001600160a01b039182165f90815291166020526040902061221f815c92836128b1565b80915d61224b57505f195f805160206142aa8339815191525c015f805160206142aa8339815191525d5b565b1561225257565b60015f805160206142aa8339815191525c015f805160206142aa8339815191525d565b505050565b9091906001600160a01b03811690816123085750505f80808093855af11561229f5750565b6040516390bfb86560e01b81526001600160a01b0390911660048201525f602482018190526080604483015260a03d601f01601f191690810160648401523d6084840152903d9060a484013e808201600460a482015260c4633d2cec6f60e21b91015260e40190fd5b60205f604481949682604095865198899363a9059cbb60e01b855260018060a01b0316600485015260248401525af13d15601f3d116001855114161716928281528260208201520152156123595750565b6040516390bfb86560e01b8152600481019190915263a9059cbb60e01b602482015260806044820152601f3d01601f191660a0810160648301523d60848301523d5f60a484013e808201600460a482015260c4633c9fd93960e21b91015260e40190fd5b5f8051602061424a8339815191525c91906001600160a01b0383166123f2576122499034935b6123ec856121ce565b906121ef565b34612444576122499061242e7f1e0745a7db1623981f0b2a5d4232364c00787266eb75ad546f190e6cebe9bd955c61242986612840565b612159565b935f5f8051602061424a8339815191525d6123e3565b635876424f60e11b5f5260045ffd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316300361248557565b6306c4a1c760e11b5f5260045ffd5b546001600160a01b0316156124a557565b63486aa30760e01b5f5260045ffd5b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b919261251a6101209461253298969360018060a01b0316855260208501906124b4565b60c083015260e08201528161010082015201916121ae565b90565b9061224992916125538360018060a01b038351168460801d906121ef565b60200151600f9190910b906001600160a01b03166121ef565b62ffffff16620f4240811161257e5750565b631400211360e01b5f5260045260245ffd5b6001600160a01b0390911681526125329492610160926125e891906125b99060208501906124b4565b8051600290810b60c08501526020820151900b60e0840152604081015161010084015260600151610120830152565b8161014082015201916121ae565b9081600f0b9182036121e057565b9261265a9061262b6125329997946101a0979460018060a01b0316875260208701906124b4565b8051600290810b60c08701526020820151900b60e0860152604081015161010086015260600151610120850152565b6101408301526101608201528161018082015201916121ae565b939590919296945f9660018060a01b038616331461276757885f6040870151135f1461270f5761040087166126ad575b50505050505050565b61270297999850926126fb969594926126e1926126ef956040519788966327c18fbf60e21b60208901523360248901612604565b03601f198101835282612020565b6002821615159161308e565b80926130ae565b915f8080808080806126a4565b95949392919061010086166127275750505050505050565b612702979950869850916126e19161275b94936126fb98604051978896633615df3f60e11b60208901523360248901612604565b6001821615159161308e565b505f96505050505050565b608081161580612817575b6127ed5760408116158061280b575b6127ed57610400811615806127ff575b6127ed57610100811615806127f3575b6127ed576001600160a01b0381166127cd575062ffffff1662800000141590565b613fff1615908115916127de575090565b62800000915062ffffff161490565b50505f90565b506001811615156127ac565b5060028116151561279c565b5060048116151561278c565b5060088116151561277d565b6280000062ffffff82161461283b576125328161256c565b505f90565b6001600160a01b03168061285357504790565b6020602491604051928380926370a0823160e01b82523060048301525afa9081156119b0575f91612882575090565b90506020813d6020116128a9575b8161289d60209383612020565b810103126102e0575190565b3d9150612890565b9190915f838201938412911290801582169115161761152157565b6020830151955f958695919491336001600160a01b03851614612a0657608084166128f9575b5050505050565b612971926126e161296b92612957946040519586946315d7892d60e21b602087015233602487015261292e604487018c6124b4565b8051151560e48701526020810151610104870152604001516001600160a01b0316610124860152565b6101406101448501526101648401916121ae565b82612b5b565b9160608351036129f7576040015162ffffff1662800000146129eb575b60081661299f575b808080806128f2565b604001519250608083901d600f0b8015612996576129c0905f8612956128b1565b93156129e3575f84135b6129d4575f612996565b637d05b8eb60e11b5f5260045ffd5b5f84126129ca565b6060820151935061298e565b631e048e1d60e01b5f5260045ffd5b505f965086955050505050565b90600f0b90600f0b019060016001607f1b0319821260016001607f1b0383131761152157565b91969592949293336001600160a01b03841614612b4e578460801d94600f0b938860408516612ad9575b50505050505f9481600f0b15801590612acd575b612a83575b5050509190565b612ab19395505f60208201511290511515145f14612ab9576001600160801b03169060801b175b80936130ae565b5f8080612a7c565b906001600160801b03169060801b17612aaa565b5082600f0b1515612a77565b612b32612b3e946126e16111a895612b44999895612b1761292e9660405197889663b47b2fb160e01b602089015233602489015260448801906124b4565b8c6101448501526101606101648501526101848401916121ae565b6004821615159161308e565b90612a13565b5f80808088612a63565b5050505050909150905f90565b9190918251925f8060208301958682865af115612bc357505060405191601f19603f3d011683016040523d83523d9060208401915f833e6020845110918215612ba7575b50506129f757565b5190516001600160e01b03199182169116141590505f80612b9f565b5183516001600160e01b03198116919060048210612c4d575b50506040516390bfb86560e01b81526001600160a01b0390921660048301526001600160e01b03191660248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c463a9e35b2f60e01b91015260e40190fd5b6001600160e01b031960049290920360031b82901b161690508280612bdc565b919060020b9060020b90818107612c9b5705908160081d5f52602052600160ff60405f2092161b8154189055565b601c906044926040519163d4d8f3e683526020830152604082015201fd5b60020b908160ff1d82810118620d89e88111612fd35763ffffffff9192600182167001fffcb933bd6fad37aa2d162d1a59400102600160801b189160028116612fb7575b60048116612f9b575b60088116612f7f575b60108116612f63575b60208116612f47575b60408116612f2b575b60808116612f0f575b6101008116612ef3575b6102008116612ed7575b6104008116612ebb575b6108008116612e9f575b6110008116612e83575b6120008116612e67575b6140008116612e4b575b6180008116612e2f575b620100008116612e13575b620200008116612df8575b620400008116612ddd575b6208000016612dc4575b5f12612dbc575b0160201c90565b5f1904612db5565b6b048a170391f7dc42444e8fa290910260801c90612dae565b6d2216e584f5fa1ea926041bedfe9890920260801c91612da4565b916e5d6af8dedb81196699c329225ee6040260801c91612d99565b916f09aa508b5b7a84e1c677de54f3e99bc90260801c91612d8e565b916f31be135f97d08fd981231505542fcfa60260801c91612d83565b916f70d869a156d2a1b890bb3df62baf32f70260801c91612d79565b916fa9f746462d870fdf8a65dc1f90e061e50260801c91612d6f565b916fd097f3bdfd2022b8845ad8f792aa58250260801c91612d65565b916fe7159475a2c29b7443b29c7fa6e889d90260801c91612d5b565b916ff3392b0822b70005940c7a398e4b70f30260801c91612d51565b916ff987a7253ac413176f2b074cf7815e540260801c91612d47565b916ffcbe86c7900a88aedcffc83b479aa3a40260801c91612d3d565b916ffe5dee046a99a2a811c461f1969c30530260801c91612d33565b916fff2ea16466c96a3843ec78b326b528610260801c91612d2a565b916fff973b41fa98c081472e6896dfb254c00260801c91612d21565b916fffcb9843d60f6159c9db58835c9266440260801c91612d18565b916fffe5caca7e10e4e61c3624eaa0941cd00260801c91612d0f565b916ffff2e50f5f656932ef12357cf3c7fdcc0260801c91612d06565b916ffff97272373d413259a46990580e213a0260801c91612cfd565b826345c3193d60e11b5f5260045260245ffd5b905f83600f0b125f1461301257613008925f036001600160801b031691613fba565b5f81126121e05790565b613025926001600160801b031691613f7e565b5f81126121e0575f0390565b905f83600f0b125f1461305357613008925f036001600160801b031691614052565b613025926001600160801b031691613fe6565b906001600160801b0390600f0b911601908160801c61308157565b6393dafdf15f526004601cfd5b9061309891612b5b565b901561283b5760408151036129f7576040015190565b6130d1906130c38360801d8260801d036125f6565b92600f0b90600f0b036125f6565b6001600160801b03169060801b1790565b73fffd8963efd1fc6a506488495d951d51639616826401000276a21982016001600160a01b03161161332957602081901b640100000000600160c01b03168060ff61312c826140b0565b16916080831061331d5750607e1982011c5b800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c80029081607f1c8260ff1c1c80029283607f1c8460ff1c1c80029485607f1c8660ff1c1c80029687607f1c8860ff1c1c80029889607f1c8a60ff1c1c80029a8b607f1c8c60ff1c1c80029c8d80607f1c9060ff1c1c800260cd1c6604000000000000169d60cc1c6608000000000000169c60cb1c6610000000000000169b60ca1c6620000000000000169a60c91c6640000000000000169960c81c6680000000000000169860c71c670100000000000000169760c61c670200000000000000169660c51c670400000000000000169560c41c670800000000000000169460c31c671000000000000000169360c21c672000000000000000169260c11c674000000000000000169160c01c6780000000000000001690607f190160401b1717171717171717171717171717693627a301d71055774c85026f028f6481ab7f045a5af012a19d003aa919810160801d60020b906fdb2df09e81959a81455e260799a0632f0160801d60020b918282145f146132f95750905090565b6001600160a01b039081169061330e84612cb9565b1611613318575090565b905090565b905081607f031b61313e565b6318521d4960e21b5f9081526001600160a01b0391909116600452602490fd5b8115613353570490565b634e487b7160e01b5f52601260045260245ffd5b6040519290915f61337785611fea565b5f855260208501925f845260408601955f875280968654956040860151159586155f14613d6857610fff8860b81c16945b81516001600160a01b038a1680875260a08b901c60020b90945260038b01546001600160801b031690945260808201515f94939062400000811615613d595762bfffff166133f58161256c565b61ffff8816613d3e575b8096620f424062ffffff83161015613d26575b845115613d1057505088613cc8576060830180519091906001600160a01b031681811015613caa575050516001600160a01b03166401000276a3811115613c9857505b604051986101008a018a81106001600160401b038211176115da576040525f8a525f60208b01525f60408b01525f60608b01525f60808b01525f60a08b01525f60c08b015288155f14613c8a5760018b0154949390945b60e08b01525b80158015613c6f575b613b845760018060a01b038c51168a528a60208d015160020b602085015160020b90815f818307129105038b155f14613a9157600560ff8216938260020b60081d60010b5f520160205260405f205f198460ff031c9054169283151593845f14613a7f579061352b60ff926140b0565b90031660020b900360020b0260020b5b905b151560408c015260020b8060208c0152620d89e7191215613a70575b620d89e860208b015160020b1215613a62575b858c8b8b6001600160801b0360406001808060a01b03613592602087015160020b612cb9565b16806060870152818060a01b0387511694828060a01b0360608d01511692839115168183101891180218940151169060018060a01b038416811015915f87125f1461393c5762ffffff8616620f4240036135ee81895f03613dbf565b95841561392b57613600838583613fe6565b965b87811061388857509660c093929188919062ffffff8216620f424003613874575050865b945b15613866579161363792613fba565b925b015260a08d015260808c01526001600160a01b03168c5282515f12156138365760a08a0151905f82126121e057039261367b60808b015160c08c015190612166565b5f81126121e057810390811360011661152157935b61ffff87166137ee575b6001600160801b0360408d015116806137d4575b508b5160608b01516001600160a01b03918216911681036137a5575060408a0151613705575b886136f8575f1960208b015160020b0160020b5b60020b60208d01525b93926134b2565b60208a015160020b6136e8565b88613782576001600160801b036137698d8d8d600460e08201519260206002820154935b015160020b60020b5f520160205260405f2091600183019081549003905560028201908154900390555460801d908c15613774575b604001518316613066565b1660408d01526136d4565b5f91909103600f0b9061375e565b6001600160801b036137698d8d8d6004600183015492602060e084015193613729565b8a516001600160a01b031681036137bd575b506136f1565b6137c6906130e2565b60020b60208d01525f6137b7565b60c08b015160801b0460e08b01510160e08b01525f6136ae565b9662ffffff861661ffff8816036138195760c08a0151905b8160c08c01510360c08c0152019661369a565b620f424060808b015161ffff89169060c08d015101020490613806565b60808a015160c08b015101905f82126121e057019260a08a01515f81126121e057613860916128b1565b93613690565b61386f92614052565b613637565b62ffffff613883921689614133565b613626565b97505050935091508392801583151761391e578e9260c09183156138bd576138b18782846141b6565b809789015f0394613628565b6001600160a01b038711613900576138fb6138f66138e76001600160801b0384168a60601b613349565b6001600160a01b038516612166565b614235565b6138b1565b6138fb6138f66139196001600160801b0384168a613e74565b6138e7565b634f2461b85f526004601cfd5b613936838286613f7e565b96613602565b91945091508315613a5157613952818385613fba565b925b83861061399e5780945b1561398f579161396d92613fe6565b905b8c60c061398962ffffff8c16620f42408190039086614133565b91613639565b61399892613f7e565b9061396f565b50849250811581151761391e578315613a41576001600160a01b038511613a09578460601b6001600160801b03821680820615159104015b6001600160a01b03831690808211156139fc5790036001600160a01b03165b809461395e565b634323a5555f526004601cfd5b6001600160801b038116613a2281600160601b88613efe565b90801561335357600160601b8709156139d657600101806139d6575f80fd5b613a4c85828461415c565b6139f5565b613a5c818484614052565b92613954565b620d89e860208b015261356c565b620d89e71960208b0152613559565b5060020b900360020b0260020b61353b565b6001018060020b9060058160ff16948360081d60010b5f520160205260405f2090600160ff5f1992161b0119905416801593841594855f14613b6c576102e0578160ff925f03167e1f0d1e100c1d070f090b19131c1706010e11080a1a141802121b1503160405601f6101e07f804040554300526644320000502061067405302602000010750620017611707760fc7fb6db6db6ddddddddd34d34d349249249210842108c6318c639ce739cffffffff860260f81c161b60f71c1692831c63d76453e004161a17031660020b0160020b0260020b5b9061353d565b5060ff809250031660020b0160020b0260020b613b66565b949891955099969298919598602088015160a01b62ffffff60a01b1660018060a01b038951169168ffffffffffffffffff60b81b16171782556001600160801b036003830154166001600160801b03604089015116809103613c4b575b508215613c3c5760e060029101519101555b825190155f821214613c265750613c0d613c1592936125f6565b9251036125f6565b6001600160801b03169060801b1793565b613c15925090613c3691036125f6565b916125f6565b60e06001910151910155613bf3565b6001600160801b03166001600160801b03196003840154161760038301555f613be1565b508b5160608401516001600160a01b039081169116146134bb565b60028b0154949390946134ac565b639e4d7cc760e01b5f5260045260245ffd5b6044925060405191637c9c6e8f60e01b835260048301526024820152fd5b6060830180519091906001600160a01b031681811115613caa575050516001600160a01b031673fffd8963efd1fc6a506488495d951d5263988d26811015613c985750613455565b9a509a50509950505050505050505f925f929190565b5f8551131561341257634b10312360e11b5f5260045ffd5b62ffffff610fff89169116620f4240818302049101036133ff565b508960d01c62ffffff166133f5565b610fff8860c41c16946133a8565b81810291905f1982820991838084109303928084039384600160801b11156102e05714613db657600160801b910990828211900360801b910360801c1790565b50505060801c90565b808202905f1983820990828083109203918083039283620f424011156102e05714613e1f577fde8f6cefed634549b62c77574f722e1ac57e23f24d8fd5cb790fb65668c2613993620f4240910990828211900360fa1b910360061c170290565b5050620f424091500490565b81810291905f1982820991838084109303928084039384600160601b11156102e05714613e6b57600160601b910990828211900360a01b910360601c1790565b50505060601c90565b90606082901b905f19600160601b8409928280851094039380850394858411156102e05714613ef7578190600160601b900981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b5091500490565b91818302915f19818509938380861095039480860395868511156102e05714613f76579082910981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b505091500490565b6001600160a01b0391821691160360ff81901d90810118906001906001600160801b0316613fac8382613e2b565b928260601b91091515160190565b612532926001600160a01b03928316919092160360ff81901d90810118906001600160801b0316613e2b565b6001600160a01b038281169082161161404c575b6001600160a01b03811692831561404057614034926001600160a01b0380821693909103169060601b600160601b600160e01b0316614133565b90808206151591040190565b62bfc9215f526004601cfd5b90613ffa565b906001600160a01b03808216908316116140aa575b6001600160a01b03821691821561404057612532936140a5926001600160a01b0380821693909103169060601b600160601b600160e01b0316613efe565b613349565b90614067565b80156102e0577f07060605060205000602030205040001060502050303040105050304000000006f8421084210842108cc6318c6db6d54be826001600160801b031060071b83811c6001600160401b031060061b1783811c63ffffffff1060051b1783811c61ffff1060041b1783811c60ff1060031b1792831c1c601f161a1790565b929190614141828286613efe565b938215613353570961414f57565b906001019081156102e057565b919081156141b1576001600160a01b03909216918183029160609190911b600160601b600160e01b0316908204831482821116156141a457612532926138f692820391614133565b63f5c787f15f526004601cfd5b505090565b919081156141b15760601b600160601b600160e01b0316916001600160a01b031690808202826141e68383613349565b14614213575b506141fa6141ff9284613349565b612166565b80820491061515016001600160a01b031690565b83018381106141ec576001600160a01b039361423193919250614133565b1690565b6001600160a01b038116919082036121e05756fe27e098c505d44ec3574004bca052aabf76bd35004c182099d8c575fb238593b91b3d7edb2e9c0b0e7c525b20aaaef0f5940d2ed71663c7d39266ecafac728859c090fc4683624cfc3884e9d8de5eca132f2d0ec062aff75d43c0465d5ceeab237d4b3164c6e45b97e7d87b7125a44c5828d005af88f9d751cfd78729c5d99a0ba2646970667358221220700c4ddb96f499bf5093e9129c04bedf027998827c0031f6ea8086407f74d9f464736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x60a0806040526004361015610012575f80fd5b5f3560e01c908162fdd58e14611f3a5750806301ffc9a714611ee4578063095bcdb614611e5d5780630b0d9c0914611e0257806311da60b414611dd8578063156e29f614611d535780631e2eaeaf14611d37578063234266d714611b3f5780632d77138914611acd57806335fd631a14611a775780633dd45adb14611a44578063426a8493146119ca57806348c8949114611833578063527596511461178f578063558a7297146116fd578063598af9e7146116a35780635a6bcfda14610dd15780636276cbbe14610b135780637e87ce7d14610a4357806380f0b44c146109c85780638161b874146108fb5780638da5cb5b146108d457806397e8cd4e1461089c5780639bf6645f1461084f578063a5841194146107d5578063b6363cf21461077e578063dbd035ff14610728578063f02de3b214610700578063f135baaa146106e4578063f2fde38b1461066f578063f3cd914c14610407578063f5298aca146102e45763fe99049a14610186575f80fd5b346102e05760803660031901126102e05761019f611f79565b6101a7611f8f565b60443591606435916001600160a01b03909116905f8051602061426a833981519152906102449033841415806102bd575b610252575b835f52600460205260405f20865f5260205260405f206101fe868254612159565b905560018060a01b031693845f52600460205260405f20865f5260205260405f2061022a828254612166565b905560408051338152602081019290925290918291820190565b0390a4602060405160018152f35b5f84815260056020908152604080832033845282528083208984529091529020548560018201610284575b50506101dd565b61028d91612159565b845f52600560205260405f2060018060a01b0333165f5260205260405f20875f5260205260405f20555f8561027d565b505f84815260036020908152604080832033845290915290205460ff16156101d8565b5f80fd5b346102e0576102f236611fa5565b5f8051602061428a8339815191525c156103f8575f8051602061426a8339815191526103705f9360018060a01b03169461033661032e856121ce565b3390886121ef565b6001600160a01b03169233841415806103d6575b610375575b8385526004602052604085208686526020526040852061022a828254612159565b0390a4005b838552600560209081526040808720338852825280872088885290915285205481861982036103a6575b505061034f565b6103af91612159565b8486526005602090815260408088203389528252808820898952909152862055868161039f565b5083855260036020908152604080872033885290915285205460ff161561034a565b6354e3ca0d60e01b5f5260045ffd5b346102e0576101203660031901126102e05761042236612053565b60603660a31901126102e0576040519061043b82611fea565b60a43580151581036102e057825260c435602083019081529060e435906001600160a01b03821682036102e05760408401918252610104356001600160401b0381116102e05761048f9036906004016120da565b9290935f8051602061428a8339815191525c156103f8576104ae612453565b51156106605760a0822092835f52600660205260405f20906104cf82612494565b60808401958482828a600160a01b600190038b5116936104ee946128cc565b90949195606088015160020b908b51151590600160a01b60019003905116916040519861051a8a612005565b895260208901526040880152606087015262ffffff166080860152885115155f149862ffffff610607986105636105f49860209d61064d578a516001600160a01b031695613367565b94929682919261062e575b505060018060a01b03845116938e6001600160801b0360408301511691015160020b90604051958860801d600f0b875288600f0b60208801526040870152606086015260808501521660a08301527f40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f60c03393a3885187906001600160a01b0316612a39565b8094919461060f575b5050823391612535565b604051908152f35b9051610627916001600160a01b039091169083612535565b84806105fd565b60018060a01b03165f5260018f5260405f209081540190558e8061056e565b8a8e01516001600160a01b031695613367565b63be8b850760e01b5f5260045ffd5b346102e05760203660031901126102e057610688611f79565b5f549061069f336001600160a01b03841614612173565b60018060a01b031680916bffffffffffffffffffffffff60a01b16175f55337f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3005b346102e05760203660031901126102e0576004355c5f5260205ff35b346102e0575f3660031901126102e0576002546040516001600160a01b039091168152602090f35b346102e05761073636612107565b6040519160408360208152836020820152019160051b8301916020806040850193925b8335548152019101908483821015610775575060208091610759565b60408186030190f35b346102e05760403660031901126102e057610797611f79565b61079f611f8f565b9060018060a01b03165f52600360205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b346102e05760203660031901126102e0576107ee611f79565b6001600160a01b03811690816108125750505f5f8051602061424a8339815191525d005b61081b90612840565b905f8051602061424a8339815191525d7f1e0745a7db1623981f0b2a5d4232364c00787266eb75ad546f190e6cebe9bd955d005b346102e05761085d36612107565b6040519160408360208152836020820152019160051b8301916020806040850193925b83355c8152019101908483821015610775575060208091610880565b346102e05760203660031901126102e0576001600160a01b036108bd611f79565b165f526001602052602060405f2054604051908152f35b346102e0575f3660031901126102e0575f546040516001600160a01b039091168152602090f35b346102e05760603660031901126102e057610914611f79565b61091c611f8f565b600254604435906001600160a01b031633036109b9576001600160a01b03821680151580610999575b61098a5760209361060792806109825750815f526001855260405f20549384925b5f526001865260405f2061097b848254612159565b905561227a565b938492610966565b6318f3cb2960e31b5f5260045ffd5b505f8051602061424a8339815191525c6001600160a01b03168114610945565b6348f5c3ed60e01b5f5260045ffd5b346102e05760403660031901126102e0576109e1611f79565b5f8051602061428a8339815191525c156103f857335f9081526001600160a01b038216602052604090205c610a176024356121ce565b9081600f0b03610a3457610a329133915f03600f0b906121ef565b005b63bda73abf60e01b5f5260045ffd5b346102e05760c03660031901126102e057610a5d36612053565b610a65612041565b6002549091906001600160a01b031633036109b957623e900062fff0008316106103e9610fff8416101615610afb57602060a07fe9c42593e71f84403b84352cd168d693e2c9fcd1fdbcc3feb21d92b43e6696f9922092835f526006825260405f20610ad081612494565b805462ffffff60b81b191660b883901b62ffffff60b81b1617905560405162ffffff919091168152a2005b62ffffff8263a7abe2f760e01b5f521660045260245ffd5b346102e05760c03660031901126102e057610b2d36612053565b60a435906001600160a01b0382168083036102e057610b4a612453565b6060820191825160020b617fff8113610dbf5750825160020b60018112610dad5750805160208201805190916001600160a01b03908116911680821015610d8f575050608082019060018060a01b03825116906040840191610bb262ffffff84511682612772565b15610d7d5750610bc762ffffff835116612823565b83519097906001600160a01b0381169033829003610d2a575b505060a085205f8181526006602052604090208054919290916001600160a01b0316610d1b576020997fdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d643892610c3660a0936130e2565b9162ffffff60d01b9060d01b168a62ffffff851b84861b161717905562ffffff600180841b0389511695600180851b03905116965116995160020b600180841b03885116906040519b8c528c8c015260408b01528860608b015260020b98896080820152a4516001600160a01b0381169033829003610cba575b8585604051908152f35b61100016610cc9575b80610cb0565b610d1292610cf060405193636fe7e6eb60e01b8886015233602486015260448501906124b4565b60e4830152836101048301526101048252610d0d61012483612020565b612b5b565b50828080610cc3565b637983c05160e01b5f5260045ffd5b61200016610d39575b80610be0565b604051636e4c1aa760e11b6020820152336024820152610d7691610d6060448301896124b4565b8860e483015260e48252610d0d61010483612020565b5088610d33565b630732d7b560e51b5f5260045260245ffd5b60449250604051916306e6c98360e41b835260048301526024820152fd5b631d3d20b160e31b5f5260045260245ffd5b6316e0049f60e31b5f5260045260245ffd5b346102e0576101403660031901126102e057610dec36612053565b60803660a31901126102e05760405190610e0582611fcf565b60a4358060020b81036102e057825260c4358060020b81036102e057602083015260e4356040830152610104356060830152610124356001600160401b0381116102e057610e579036906004016120da565b90925f8051602061428a8339815191525c156103f857610e75612453565b60a0832093845f52600660205260405f20608052610e94608051612494565b60808401516001600160a01b03811690338290036115ee575b5050815160020b92602083015160020b91610ecb60408501516125f6565b93606087015160020b9760608201516040519960c08b018b81106001600160401b038211176115da57604052338b528860208c01528660408c015287600f0b60608c015260808b015260a08a01525f91858812156115bc57620d89e71988126115a957620d89e886136115965760405192610f4584611fcf565b5f84525f60208501525f60408501525f606085015287600f0b611373575b600460805101978960020b5f528860205260405f20988860020b5f5260205260405f206080515460a01c60020b8b81125f1461131d575060028060018c0154600184015490039b015491015490039b5b60a0600180821b03825116910151906040519160268301528960068301528b600383015281525f603a600c83012091816040820152816020820152525f5260066080510160205260405f20976001600160801b038954169982600f0b155f146112e1578a156112d25761106061105a60409f9b6111219c6111339e5b60018301956110526002611046848a548503613d76565b95019283548503613d76565b9655556121ce565b916121ce565b6001600160801b03169060801b179a8b965f84600f0b12611264575b5082600f0b611160575b5050506110ac61109d8560801d8360801d016125f6565b9185600f0b90600f0b016125f6565b6001600160801b03169060801b1791815160020b90602083015160020b8c8401516060850151918e5194855260208501528d84015260608301527ff208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec60803393a3608089015189906001600160a01b0316612674565b8094919461113f575b50833391612535565b82519182526020820152f35b608082015161115a916001600160a01b039091169083612535565b8561112a565b6080515492935090916001600160a01b0381169060a01c60020b828112156111b9575050906111ad926111a26111986111a894612cb9565b91600f0b92612cb9565b90613031565b6125f6565b60801b5b8b8080611086565b92809193125f1461123a576111f8916111e56111a86111a8936111df88600f0b91612cb9565b87613031565b936111f386600f0b92612cb9565b612fe6565b6001600160801b03169060801b17906001600160801b0361122560036080510192600f0b82845416613066565b166001600160801b03198254161790556111b1565b906111a892509261125061119861125695612cb9565b90612fe6565b6001600160801b03166111b1565b808f91516112a6575b015161127a575b8e61107c565b6112a18260805160049160020b5f52016020525f6002604082208281558260018201550155565b611274565b6112cd8360805160049160020b5f52016020525f6002604082208281558260018201550155565b61126d565b632bbfae4960e21b5f5260045ffd5b61106061105a60409f9b6111219c6111339e6001600160801b0361130889600f0b83613066565b166001600160801b031984541617835561102f565b90999089136113435760028060018c0154600184015490039b015491015490039b610fb3565b9860026001608051015460018c01549003600183015490039a81806080510154910154900391015490039b610fb3565b6004608051018960020b5f5280602052898960405f206113c381546001600160801b036113a681831695600f0b86613066565b16931594858515141595611562575b508d600f0b9060801d612a13565b60801b82179055602087015285528760020b5f5260205260405f208054906001600160801b0382166113f88b600f0b82613066565b901592836001600160801b03831615141593611535575b8b600f0b9060801d600f0b039160016001607f1b03831360016001607f1b031984121761152157826001600160801b03935060801b83831617905516606086015260408501525f88600f0b12156114aa575b835161148e575b604084015115610f635761148960808c015160020b88600560805101612c6d565b610f63565b6114a560808c015160020b8a600560805101612c6d565b611468565b60808b015160020b6001600160801b03600181602088015116925f81620d89e719071281620d89e719050390620d89e805030181041680911161150e576001600160801b036060860151161115611461578663b8e3c38560e01b5f5260045260245ffd5b8963b8e3c38560e01b5f5260045260245ffd5b634e487b7160e01b5f52601160045260245ffd5b6080515460a01c60020b8b1361140f5760016080510154600184015560026080510154600284015561140f565b6080515460a01c60020b1215611579575b8e6113b5565b600160805101546001840155600260805101546002840155611573565b8563035aeeff60e31b5f5260045260245ffd5b8763d5e2f7ab60e01b5f5260045260245ffd5b604488876040519163c4433ed560e01b835260048301526024820152fd5b634e487b7160e01b5f52604160045260245ffd5b5f604085015113808091611696575b1561164457505060405163259982e560e01b602082015261163b91610d0d8261162d8887898c3360248701612590565b03601f198101845283612020565b505b8580610ead565b159081611688575b50611658575b5061163d565b60405163021d0ee760e41b602082015261168191610d0d8261162d8887898c3360248701612590565b5085611652565b61020091501615158761164c565b50610800821615156115fd565b346102e05760603660031901126102e0576116bc611f79565b6116c4611f8f565b6001600160a01b039182165f90815260056020908152604080832094909316825292835281812060443582528352819020549051908152f35b346102e05760403660031901126102e057611716611f79565b602435908115158092036102e057335f52600360205260405f2060018060a01b0382165f5260205260405f2060ff1981541660ff841617905560405191825260018060a01b0316907fceb576d9f15e4e200fdb5096d64d5dfd667e16def20c1eefd14256d8e3faa26760203392a3602060405160018152f35b346102e05760c03660031901126102e0576117a936612053565b6117b1612041565b906280000062ffffff6040830151161480159061181c575b61180d5760a0906117d98361256c565b205f52600660205260405f20906117ef82612494565b815462ffffff60d01b191660d09190911b62ffffff60d01b16179055005b6330d2164160e01b5f5260045ffd5b5060808101516001600160a01b03163314156117c9565b346102e05760203660031901126102e0576004356001600160401b0381116102e0576118639036906004016120da565b5f8051602061428a8339815191525c6119bb576118b0915f9160015f8051602061428a8339815191525d6040516348eeb9a360e11b815260206004820152938492839260248401916121ae565b038183335af19081156119b0575f91611928575b505f805160206142aa8339815191525c6119195760406020915f5f8051602061428a8339815191525d815192839181835280519182918282860152018484015e5f828201840152601f01601f19168101030190f35b635212cba160e01b5f5260045ffd5b90503d805f833e6119398183612020565b8101906020818303126102e0578051906001600160401b0382116102e0570181601f820112156102e0578051906001600160401b0382116115da576040519261198c601f8401601f191660200185612020565b828452602083830101116102e057815f9260208093018386015e83010152816118c4565b6040513d5f823e3d90fd5b6328486b6360e11b5f5260045ffd5b346102e0576119d836611fa5565b9091335f52600560205260405f2060018060a01b0382165f5260205260405f20835f526020528160405f205560405191825260018060a01b0316907fb3fd5071835887567a0671151121894ddccc2842f1d10bedad13e0d17cace9a760203392a4602060405160018152f35b60203660031901126102e057611a58611f79565b5f8051602061428a8339815191525c156103f8576106076020916123bd565b346102e05760403660031901126102e0576024356004356040519160408360208152826020820152019060051b8301916001602060408501935b8354815201910190848382101561077557506020600191611ab1565b346102e05760203660031901126102e057611ae6611f79565b611afa60018060a01b035f54163314612173565b600280546001600160a01b0319166001600160a01b039290921691821790557fb4bd8ef53df690b9943d3318996006dbb82a25f54719d8c8035b516a2a5b8acc5f80a2005b346102e0576101003660031901126102e057611b5a36612053565b60c4359060a43560e4356001600160401b0381116102e057611b809036906004016120da565b9190935f8051602061428a8339815191525c156103f857611b9f612453565b60a0842094855f52600660205260405f2094611bba86612494565b6080810180516001600160a01b0381169033829003611cf8575b50506001600160801b03600388015416978815611ce957602098611bf7876121ce565b5f03611c02876121ce565b5f036001600160801b03169060801b179887611cd5575b86611cc0575b5050611c2c338985612535565b60405190868252858a8301527f29ef05caaff9404b7cb6d1c0e9bbae9eaa7ab2541feba1a9c4248594c08156cb60403393a3516001600160a01b038116939033859003611c7e575b8888604051908152f35b601016611c8c575b80611c74565b611cb495610d0d9361162d9260405197889563e1b4af6960e01b8d88015233602488016124f7565b50828080808080611c86565b600201908660801b0481540190558980611c1f565b60018101828960801b048154019055611c19565b63a74f97ab60e01b5f5260045ffd5b602016611d06575b80611bd4565b604051635b54587d60e11b6020820152611d3091610d0d8261162d8b898b8d8b33602488016124f7565b5088611d00565b346102e05760203660031901126102e057600435545f5260205ff35b346102e057611d6136611fa5565b905f8051602061428a8339815191525c156103f8576001600160a01b0316915f905f8051602061426a8339815191529061037090611dae611da1866121ce565b8503600f0b3390886121ef565b60018060a01b0316938484526004602052604084208685526020526040842061022a828254612166565b5f3660031901126102e0575f8051602061428a8339815191525c156103f8576020610607336123bd565b346102e05760603660031901126102e057611e1b611f79565b611e23611f8f565b604435905f8051602061428a8339815191525c156103f857610a3292611e58611e4b846121ce565b5f03600f0b3390836121ef565b61227a565b346102e057611e6b36611fa5565b9091335f52600460205260405f20835f5260205260405f20611e8e838254612159565b905560018060a01b031690815f52600460205260405f20835f5260205260405f20611eba828254612166565b9055604080513380825260208201939093525f8051602061426a8339815191529181908101610244565b346102e05760203660031901126102e05760043563ffffffff60e01b81168091036102e0576020906301ffc9a760e01b8114908115611f29575b506040519015158152f35b630f632fb360e01b14905082611f1e565b346102e05760403660031901126102e0576020906001600160a01b03611f5e611f79565b165f526004825260405f206024355f52825260405f20548152f35b600435906001600160a01b03821682036102e057565b602435906001600160a01b03821682036102e057565b60609060031901126102e0576004356001600160a01b03811681036102e057906024359060443590565b608081019081106001600160401b038211176115da57604052565b606081019081106001600160401b038211176115da57604052565b60a081019081106001600160401b038211176115da57604052565b90601f801991011681019081106001600160401b038211176115da57604052565b60a4359062ffffff821682036102e057565b60a09060031901126102e0576040519061206c82612005565b816004356001600160a01b03811681036102e05781526024356001600160a01b03811681036102e057602082015260443562ffffff811681036102e05760408201526064358060020b81036102e0576060820152608435906001600160a01b03821682036102e05760800152565b9181601f840112156102e0578235916001600160401b0383116102e057602083818601950101116102e057565b9060206003198301126102e0576004356001600160401b0381116102e057826023820112156102e0578060040135926001600160401b0384116102e05760248460051b830101116102e0576024019190565b9190820391821161152157565b9190820180921161152157565b1561217a57565b60405162461bcd60e51b815260206004820152600c60248201526b15539055551213d49256915160a21b6044820152606490fd5b908060209392818452848401375f828201840152601f01601f1916010190565b6001607f1b8110156121e057600f0b90565b6393dafdf160e01b5f5260045ffd5b9190600f0b918215612275576001600160a01b039182165f90815291166020526040902061221f815c92836128b1565b80915d61224b57505f195f805160206142aa8339815191525c015f805160206142aa8339815191525d5b565b1561225257565b60015f805160206142aa8339815191525c015f805160206142aa8339815191525d565b505050565b9091906001600160a01b03811690816123085750505f80808093855af11561229f5750565b6040516390bfb86560e01b81526001600160a01b0390911660048201525f602482018190526080604483015260a03d601f01601f191690810160648401523d6084840152903d9060a484013e808201600460a482015260c4633d2cec6f60e21b91015260e40190fd5b60205f604481949682604095865198899363a9059cbb60e01b855260018060a01b0316600485015260248401525af13d15601f3d116001855114161716928281528260208201520152156123595750565b6040516390bfb86560e01b8152600481019190915263a9059cbb60e01b602482015260806044820152601f3d01601f191660a0810160648301523d60848301523d5f60a484013e808201600460a482015260c4633c9fd93960e21b91015260e40190fd5b5f8051602061424a8339815191525c91906001600160a01b0383166123f2576122499034935b6123ec856121ce565b906121ef565b34612444576122499061242e7f1e0745a7db1623981f0b2a5d4232364c00787266eb75ad546f190e6cebe9bd955c61242986612840565b612159565b935f5f8051602061424a8339815191525d6123e3565b635876424f60e11b5f5260045ffd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316300361248557565b6306c4a1c760e11b5f5260045ffd5b546001600160a01b0316156124a557565b63486aa30760e01b5f5260045ffd5b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b919261251a6101209461253298969360018060a01b0316855260208501906124b4565b60c083015260e08201528161010082015201916121ae565b90565b9061224992916125538360018060a01b038351168460801d906121ef565b60200151600f9190910b906001600160a01b03166121ef565b62ffffff16620f4240811161257e5750565b631400211360e01b5f5260045260245ffd5b6001600160a01b0390911681526125329492610160926125e891906125b99060208501906124b4565b8051600290810b60c08501526020820151900b60e0840152604081015161010084015260600151610120830152565b8161014082015201916121ae565b9081600f0b9182036121e057565b9261265a9061262b6125329997946101a0979460018060a01b0316875260208701906124b4565b8051600290810b60c08701526020820151900b60e0860152604081015161010086015260600151610120850152565b6101408301526101608201528161018082015201916121ae565b939590919296945f9660018060a01b038616331461276757885f6040870151135f1461270f5761040087166126ad575b50505050505050565b61270297999850926126fb969594926126e1926126ef956040519788966327c18fbf60e21b60208901523360248901612604565b03601f198101835282612020565b6002821615159161308e565b80926130ae565b915f8080808080806126a4565b95949392919061010086166127275750505050505050565b612702979950869850916126e19161275b94936126fb98604051978896633615df3f60e11b60208901523360248901612604565b6001821615159161308e565b505f96505050505050565b608081161580612817575b6127ed5760408116158061280b575b6127ed57610400811615806127ff575b6127ed57610100811615806127f3575b6127ed576001600160a01b0381166127cd575062ffffff1662800000141590565b613fff1615908115916127de575090565b62800000915062ffffff161490565b50505f90565b506001811615156127ac565b5060028116151561279c565b5060048116151561278c565b5060088116151561277d565b6280000062ffffff82161461283b576125328161256c565b505f90565b6001600160a01b03168061285357504790565b6020602491604051928380926370a0823160e01b82523060048301525afa9081156119b0575f91612882575090565b90506020813d6020116128a9575b8161289d60209383612020565b810103126102e0575190565b3d9150612890565b9190915f838201938412911290801582169115161761152157565b6020830151955f958695919491336001600160a01b03851614612a0657608084166128f9575b5050505050565b612971926126e161296b92612957946040519586946315d7892d60e21b602087015233602487015261292e604487018c6124b4565b8051151560e48701526020810151610104870152604001516001600160a01b0316610124860152565b6101406101448501526101648401916121ae565b82612b5b565b9160608351036129f7576040015162ffffff1662800000146129eb575b60081661299f575b808080806128f2565b604001519250608083901d600f0b8015612996576129c0905f8612956128b1565b93156129e3575f84135b6129d4575f612996565b637d05b8eb60e11b5f5260045ffd5b5f84126129ca565b6060820151935061298e565b631e048e1d60e01b5f5260045ffd5b505f965086955050505050565b90600f0b90600f0b019060016001607f1b0319821260016001607f1b0383131761152157565b91969592949293336001600160a01b03841614612b4e578460801d94600f0b938860408516612ad9575b50505050505f9481600f0b15801590612acd575b612a83575b5050509190565b612ab19395505f60208201511290511515145f14612ab9576001600160801b03169060801b175b80936130ae565b5f8080612a7c565b906001600160801b03169060801b17612aaa565b5082600f0b1515612a77565b612b32612b3e946126e16111a895612b44999895612b1761292e9660405197889663b47b2fb160e01b602089015233602489015260448801906124b4565b8c6101448501526101606101648501526101848401916121ae565b6004821615159161308e565b90612a13565b5f80808088612a63565b5050505050909150905f90565b9190918251925f8060208301958682865af115612bc357505060405191601f19603f3d011683016040523d83523d9060208401915f833e6020845110918215612ba7575b50506129f757565b5190516001600160e01b03199182169116141590505f80612b9f565b5183516001600160e01b03198116919060048210612c4d575b50506040516390bfb86560e01b81526001600160a01b0390921660048301526001600160e01b03191660248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c463a9e35b2f60e01b91015260e40190fd5b6001600160e01b031960049290920360031b82901b161690508280612bdc565b919060020b9060020b90818107612c9b5705908160081d5f52602052600160ff60405f2092161b8154189055565b601c906044926040519163d4d8f3e683526020830152604082015201fd5b60020b908160ff1d82810118620d89e88111612fd35763ffffffff9192600182167001fffcb933bd6fad37aa2d162d1a59400102600160801b189160028116612fb7575b60048116612f9b575b60088116612f7f575b60108116612f63575b60208116612f47575b60408116612f2b575b60808116612f0f575b6101008116612ef3575b6102008116612ed7575b6104008116612ebb575b6108008116612e9f575b6110008116612e83575b6120008116612e67575b6140008116612e4b575b6180008116612e2f575b620100008116612e13575b620200008116612df8575b620400008116612ddd575b6208000016612dc4575b5f12612dbc575b0160201c90565b5f1904612db5565b6b048a170391f7dc42444e8fa290910260801c90612dae565b6d2216e584f5fa1ea926041bedfe9890920260801c91612da4565b916e5d6af8dedb81196699c329225ee6040260801c91612d99565b916f09aa508b5b7a84e1c677de54f3e99bc90260801c91612d8e565b916f31be135f97d08fd981231505542fcfa60260801c91612d83565b916f70d869a156d2a1b890bb3df62baf32f70260801c91612d79565b916fa9f746462d870fdf8a65dc1f90e061e50260801c91612d6f565b916fd097f3bdfd2022b8845ad8f792aa58250260801c91612d65565b916fe7159475a2c29b7443b29c7fa6e889d90260801c91612d5b565b916ff3392b0822b70005940c7a398e4b70f30260801c91612d51565b916ff987a7253ac413176f2b074cf7815e540260801c91612d47565b916ffcbe86c7900a88aedcffc83b479aa3a40260801c91612d3d565b916ffe5dee046a99a2a811c461f1969c30530260801c91612d33565b916fff2ea16466c96a3843ec78b326b528610260801c91612d2a565b916fff973b41fa98c081472e6896dfb254c00260801c91612d21565b916fffcb9843d60f6159c9db58835c9266440260801c91612d18565b916fffe5caca7e10e4e61c3624eaa0941cd00260801c91612d0f565b916ffff2e50f5f656932ef12357cf3c7fdcc0260801c91612d06565b916ffff97272373d413259a46990580e213a0260801c91612cfd565b826345c3193d60e11b5f5260045260245ffd5b905f83600f0b125f1461301257613008925f036001600160801b031691613fba565b5f81126121e05790565b613025926001600160801b031691613f7e565b5f81126121e0575f0390565b905f83600f0b125f1461305357613008925f036001600160801b031691614052565b613025926001600160801b031691613fe6565b906001600160801b0390600f0b911601908160801c61308157565b6393dafdf15f526004601cfd5b9061309891612b5b565b901561283b5760408151036129f7576040015190565b6130d1906130c38360801d8260801d036125f6565b92600f0b90600f0b036125f6565b6001600160801b03169060801b1790565b73fffd8963efd1fc6a506488495d951d51639616826401000276a21982016001600160a01b03161161332957602081901b640100000000600160c01b03168060ff61312c826140b0565b16916080831061331d5750607e1982011c5b800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c800280607f1c8160ff1c1c80029081607f1c8260ff1c1c80029283607f1c8460ff1c1c80029485607f1c8660ff1c1c80029687607f1c8860ff1c1c80029889607f1c8a60ff1c1c80029a8b607f1c8c60ff1c1c80029c8d80607f1c9060ff1c1c800260cd1c6604000000000000169d60cc1c6608000000000000169c60cb1c6610000000000000169b60ca1c6620000000000000169a60c91c6640000000000000169960c81c6680000000000000169860c71c670100000000000000169760c61c670200000000000000169660c51c670400000000000000169560c41c670800000000000000169460c31c671000000000000000169360c21c672000000000000000169260c11c674000000000000000169160c01c6780000000000000001690607f190160401b1717171717171717171717171717693627a301d71055774c85026f028f6481ab7f045a5af012a19d003aa919810160801d60020b906fdb2df09e81959a81455e260799a0632f0160801d60020b918282145f146132f95750905090565b6001600160a01b039081169061330e84612cb9565b1611613318575090565b905090565b905081607f031b61313e565b6318521d4960e21b5f9081526001600160a01b0391909116600452602490fd5b8115613353570490565b634e487b7160e01b5f52601260045260245ffd5b6040519290915f61337785611fea565b5f855260208501925f845260408601955f875280968654956040860151159586155f14613d6857610fff8860b81c16945b81516001600160a01b038a1680875260a08b901c60020b90945260038b01546001600160801b031690945260808201515f94939062400000811615613d595762bfffff166133f58161256c565b61ffff8816613d3e575b8096620f424062ffffff83161015613d26575b845115613d1057505088613cc8576060830180519091906001600160a01b031681811015613caa575050516001600160a01b03166401000276a3811115613c9857505b604051986101008a018a81106001600160401b038211176115da576040525f8a525f60208b01525f60408b01525f60608b01525f60808b01525f60a08b01525f60c08b015288155f14613c8a5760018b0154949390945b60e08b01525b80158015613c6f575b613b845760018060a01b038c51168a528a60208d015160020b602085015160020b90815f818307129105038b155f14613a9157600560ff8216938260020b60081d60010b5f520160205260405f205f198460ff031c9054169283151593845f14613a7f579061352b60ff926140b0565b90031660020b900360020b0260020b5b905b151560408c015260020b8060208c0152620d89e7191215613a70575b620d89e860208b015160020b1215613a62575b858c8b8b6001600160801b0360406001808060a01b03613592602087015160020b612cb9565b16806060870152818060a01b0387511694828060a01b0360608d01511692839115168183101891180218940151169060018060a01b038416811015915f87125f1461393c5762ffffff8616620f4240036135ee81895f03613dbf565b95841561392b57613600838583613fe6565b965b87811061388857509660c093929188919062ffffff8216620f424003613874575050865b945b15613866579161363792613fba565b925b015260a08d015260808c01526001600160a01b03168c5282515f12156138365760a08a0151905f82126121e057039261367b60808b015160c08c015190612166565b5f81126121e057810390811360011661152157935b61ffff87166137ee575b6001600160801b0360408d015116806137d4575b508b5160608b01516001600160a01b03918216911681036137a5575060408a0151613705575b886136f8575f1960208b015160020b0160020b5b60020b60208d01525b93926134b2565b60208a015160020b6136e8565b88613782576001600160801b036137698d8d8d600460e08201519260206002820154935b015160020b60020b5f520160205260405f2091600183019081549003905560028201908154900390555460801d908c15613774575b604001518316613066565b1660408d01526136d4565b5f91909103600f0b9061375e565b6001600160801b036137698d8d8d6004600183015492602060e084015193613729565b8a516001600160a01b031681036137bd575b506136f1565b6137c6906130e2565b60020b60208d01525f6137b7565b60c08b015160801b0460e08b01510160e08b01525f6136ae565b9662ffffff861661ffff8816036138195760c08a0151905b8160c08c01510360c08c0152019661369a565b620f424060808b015161ffff89169060c08d015101020490613806565b60808a015160c08b015101905f82126121e057019260a08a01515f81126121e057613860916128b1565b93613690565b61386f92614052565b613637565b62ffffff613883921689614133565b613626565b97505050935091508392801583151761391e578e9260c09183156138bd576138b18782846141b6565b809789015f0394613628565b6001600160a01b038711613900576138fb6138f66138e76001600160801b0384168a60601b613349565b6001600160a01b038516612166565b614235565b6138b1565b6138fb6138f66139196001600160801b0384168a613e74565b6138e7565b634f2461b85f526004601cfd5b613936838286613f7e565b96613602565b91945091508315613a5157613952818385613fba565b925b83861061399e5780945b1561398f579161396d92613fe6565b905b8c60c061398962ffffff8c16620f42408190039086614133565b91613639565b61399892613f7e565b9061396f565b50849250811581151761391e578315613a41576001600160a01b038511613a09578460601b6001600160801b03821680820615159104015b6001600160a01b03831690808211156139fc5790036001600160a01b03165b809461395e565b634323a5555f526004601cfd5b6001600160801b038116613a2281600160601b88613efe565b90801561335357600160601b8709156139d657600101806139d6575f80fd5b613a4c85828461415c565b6139f5565b613a5c818484614052565b92613954565b620d89e860208b015261356c565b620d89e71960208b0152613559565b5060020b900360020b0260020b61353b565b6001018060020b9060058160ff16948360081d60010b5f520160205260405f2090600160ff5f1992161b0119905416801593841594855f14613b6c576102e0578160ff925f03167e1f0d1e100c1d070f090b19131c1706010e11080a1a141802121b1503160405601f6101e07f804040554300526644320000502061067405302602000010750620017611707760fc7fb6db6db6ddddddddd34d34d349249249210842108c6318c639ce739cffffffff860260f81c161b60f71c1692831c63d76453e004161a17031660020b0160020b0260020b5b9061353d565b5060ff809250031660020b0160020b0260020b613b66565b949891955099969298919598602088015160a01b62ffffff60a01b1660018060a01b038951169168ffffffffffffffffff60b81b16171782556001600160801b036003830154166001600160801b03604089015116809103613c4b575b508215613c3c5760e060029101519101555b825190155f821214613c265750613c0d613c1592936125f6565b9251036125f6565b6001600160801b03169060801b1793565b613c15925090613c3691036125f6565b916125f6565b60e06001910151910155613bf3565b6001600160801b03166001600160801b03196003840154161760038301555f613be1565b508b5160608401516001600160a01b039081169116146134bb565b60028b0154949390946134ac565b639e4d7cc760e01b5f5260045260245ffd5b6044925060405191637c9c6e8f60e01b835260048301526024820152fd5b6060830180519091906001600160a01b031681811115613caa575050516001600160a01b031673fffd8963efd1fc6a506488495d951d5263988d26811015613c985750613455565b9a509a50509950505050505050505f925f929190565b5f8551131561341257634b10312360e11b5f5260045ffd5b62ffffff610fff89169116620f4240818302049101036133ff565b508960d01c62ffffff166133f5565b610fff8860c41c16946133a8565b81810291905f1982820991838084109303928084039384600160801b11156102e05714613db657600160801b910990828211900360801b910360801c1790565b50505060801c90565b808202905f1983820990828083109203918083039283620f424011156102e05714613e1f577fde8f6cefed634549b62c77574f722e1ac57e23f24d8fd5cb790fb65668c2613993620f4240910990828211900360fa1b910360061c170290565b5050620f424091500490565b81810291905f1982820991838084109303928084039384600160601b11156102e05714613e6b57600160601b910990828211900360a01b910360601c1790565b50505060601c90565b90606082901b905f19600160601b8409928280851094039380850394858411156102e05714613ef7578190600160601b900981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b5091500490565b91818302915f19818509938380861095039480860395868511156102e05714613f76579082910981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b505091500490565b6001600160a01b0391821691160360ff81901d90810118906001906001600160801b0316613fac8382613e2b565b928260601b91091515160190565b612532926001600160a01b03928316919092160360ff81901d90810118906001600160801b0316613e2b565b6001600160a01b038281169082161161404c575b6001600160a01b03811692831561404057614034926001600160a01b0380821693909103169060601b600160601b600160e01b0316614133565b90808206151591040190565b62bfc9215f526004601cfd5b90613ffa565b906001600160a01b03808216908316116140aa575b6001600160a01b03821691821561404057612532936140a5926001600160a01b0380821693909103169060601b600160601b600160e01b0316613efe565b613349565b90614067565b80156102e0577f07060605060205000602030205040001060502050303040105050304000000006f8421084210842108cc6318c6db6d54be826001600160801b031060071b83811c6001600160401b031060061b1783811c63ffffffff1060051b1783811c61ffff1060041b1783811c60ff1060031b1792831c1c601f161a1790565b929190614141828286613efe565b938215613353570961414f57565b906001019081156102e057565b919081156141b1576001600160a01b03909216918183029160609190911b600160601b600160e01b0316908204831482821116156141a457612532926138f692820391614133565b63f5c787f15f526004601cfd5b505090565b919081156141b15760601b600160601b600160e01b0316916001600160a01b031690808202826141e68383613349565b14614213575b506141fa6141ff9284613349565b612166565b80820491061515016001600160a01b031690565b83018381106141ec576001600160a01b039361423193919250614133565b1690565b6001600160a01b038116919082036121e05756fe27e098c505d44ec3574004bca052aabf76bd35004c182099d8c575fb238593b91b3d7edb2e9c0b0e7c525b20aaaef0f5940d2ed71663c7d39266ecafac728859c090fc4683624cfc3884e9d8de5eca132f2d0ec062aff75d43c0465d5ceeab237d4b3164c6e45b97e7d87b7125a44c5828d005af88f9d751cfd78729c5d99a0ba2646970667358221220700c4ddb96f499bf5093e9129c04bedf027998827c0031f6ea8086407f74d9f464736f6c634300081a0033" as Hex;
export const PoolManager = {
    abi,
    bytecode,
    deployedBytecode,
};
