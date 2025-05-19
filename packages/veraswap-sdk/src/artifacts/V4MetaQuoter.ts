import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [{ name: "_poolManager", type: "address", internalType: "contract IPoolManager" }],
    stateMutability: "nonpayable",
} as const;
export const _quoteExactInput = {
    type: "function",
    name: "_quoteExactInput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const _quoteExactInputSingle = {
    type: "function",
    name: "_quoteExactInputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const _quoteExactOutput = {
    type: "function",
    name: "_quoteExactOutput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const _quoteExactOutputSingle = {
    type: "function",
    name: "_quoteExactOutputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactInput = {
    type: "function",
    name: "metaQuoteExactInput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "hopCurrencies", type: "address[]", internalType: "Currency[]" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "swaps",
            type: "tuple[]",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactResult[]",
            components: [
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactInputBest = {
    type: "function",
    name: "metaQuoteExactInputBest",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "hopCurrencies", type: "address[]", internalType: "Currency[]" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "bestSingleSwap",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleResult",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "bestMultihopSwap",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactResult",
            components: [
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "bestSwapType", type: "uint8", internalType: "enum IV4MetaQuoter.BestSwap" },
    ],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactInputSingle = {
    type: "function",
    name: "metaQuoteExactInputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "swaps",
            type: "tuple[]",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleResult[]",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactOutput = {
    type: "function",
    name: "metaQuoteExactOutput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "hopCurrencies", type: "address[]", internalType: "Currency[]" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "swaps",
            type: "tuple[]",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactResult[]",
            components: [
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactOutputBest = {
    type: "function",
    name: "metaQuoteExactOutputBest",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "hopCurrencies", type: "address[]", internalType: "Currency[]" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "bestSingleSwap",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleResult",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
        {
            name: "bestMultihopSwap",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactResult",
            components: [
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "bestSwapType", type: "uint8", internalType: "enum IV4MetaQuoter.BestSwap" },
    ],
    stateMutability: "nonpayable",
} as const;
export const metaQuoteExactOutputSingle = {
    type: "function",
    name: "metaQuoteExactOutputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                { name: "variableCurrency", type: "address", internalType: "Currency" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                {
                    name: "poolKeyOptions",
                    type: "tuple[]",
                    internalType: "struct IV4MetaQuoter.PoolKeyOptions[]",
                    components: [
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "address" },
                    ],
                },
            ],
        },
    ],
    outputs: [
        {
            name: "swaps",
            type: "tuple[]",
            internalType: "struct IV4MetaQuoter.MetaQuoteExactSingleResult[]",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
                { name: "variableAmount", type: "uint256", internalType: "uint256" },
                { name: "gasEstimate", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    stateMutability: "nonpayable",
} as const;
export const poolManager = {
    type: "function",
    name: "poolManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPoolManager" }],
    stateMutability: "view",
} as const;
export const quoteExactInput = {
    type: "function",
    name: "quoteExactInput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [
        { name: "amountOut", type: "uint256", internalType: "uint256" },
        { name: "gasEstimate", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const quoteExactInputSingle = {
    type: "function",
    name: "quoteExactInputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    outputs: [
        { name: "amountOut", type: "uint256", internalType: "uint256" },
        { name: "gasEstimate", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const quoteExactOutput = {
    type: "function",
    name: "quoteExactOutput",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactParams",
            components: [
                { name: "exactCurrency", type: "address", internalType: "Currency" },
                {
                    name: "path",
                    type: "tuple[]",
                    internalType: "struct PathKey[]",
                    components: [
                        { name: "intermediateCurrency", type: "address", internalType: "Currency" },
                        { name: "fee", type: "uint24", internalType: "uint24" },
                        { name: "tickSpacing", type: "int24", internalType: "int24" },
                        { name: "hooks", type: "address", internalType: "contract IHooks" },
                        { name: "hookData", type: "bytes", internalType: "bytes" },
                    ],
                },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [
        { name: "amountIn", type: "uint256", internalType: "uint256" },
        { name: "gasEstimate", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const quoteExactOutputSingle = {
    type: "function",
    name: "quoteExactOutputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV4Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
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
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
                { name: "hookData", type: "bytes", internalType: "bytes" },
            ],
        },
    ],
    outputs: [
        { name: "amountIn", type: "uint256", internalType: "uint256" },
        { name: "gasEstimate", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
} as const;
export const unlockCallback = {
    type: "function",
    name: "unlockCallback",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const NotEnoughLiquidity = {
    type: "error",
    name: "NotEnoughLiquidity",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
} as const;
export const NotPoolManager = { type: "error", name: "NotPoolManager", inputs: [] } as const;
export const NotSelf = { type: "error", name: "NotSelf", inputs: [] } as const;
export const QuoteSwap = {
    type: "error",
    name: "QuoteSwap",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
} as const;
export const UnexpectedCallSuccess = { type: "error", name: "UnexpectedCallSuccess", inputs: [] } as const;
export const UnexpectedRevertBytes = {
    type: "error",
    name: "UnexpectedRevertBytes",
    inputs: [{ name: "revertData", type: "bytes", internalType: "bytes" }],
} as const;
export const functions = [
    _constructor,
    _quoteExactInput,
    _quoteExactInputSingle,
    _quoteExactOutput,
    _quoteExactOutputSingle,
    metaQuoteExactInput,
    metaQuoteExactInputBest,
    metaQuoteExactInputSingle,
    metaQuoteExactOutput,
    metaQuoteExactOutputBest,
    metaQuoteExactOutputSingle,
    poolManager,
    quoteExactInput,
    quoteExactInputSingle,
    quoteExactOutput,
    quoteExactOutputSingle,
    unlockCallback,
] as const;
export const events = [] as const;
export const errors = [
    NotEnoughLiquidity,
    NotPoolManager,
    NotSelf,
    QuoteSwap,
    UnexpectedCallSuccess,
    UnexpectedRevertBytes,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60a034607b57601f61227f38819003918201601f19168301916001600160401b03831184841017607f57808492602094604052833981010312607b57516001600160a01b0381168103607b576080526040516121eb908161009482396080518181816101d8015281816103f701528181611e3c01526120430152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60806040526004361015610011575f80fd5b5f3560e01c806304837ce31461063b578063147d2af9146106205780635873307314610605578063595323f51461057a5780636036742c146105615780636a36a38c1461047357806391dd7346146103a8578063aa2f15011461028f578063aa9d21cb14610274578063ab1edd9d1461025b578063c2c0461314610236578063ca253dc914610207578063dc4c90d3146101c3578063e991282e1461019e578063eebe0c6a146100f95763fc1ed6d6146100c9575f80fd5b346100f5576100f16100e26100dd36610c76565b611b54565b60409391935193849384610e4f565b0390f35b5f80fd5b346100f55761010736610c42565b30330361018f578061016a61016461015f60a06001600160801b0395019361012e8561121f565b6101478761013e60c0850161122c565b16600f0b6114ca565b9061015560e0840184611240565b9490933690610b4c565b611f92565b9161121f565b156101855781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610172565b6314e1dbf760e11b5f5260045ffd5b346100f5576100f16101b76101b2366107d7565b611976565b6040519182918261091a565b346100f5575f3660031901126100f5576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100f557604061022961022261021d366109da565b6121b3565b9190611eb0565b9082519182526020820152f35b346100f5576100f161024f61024a36610c76565b6117b8565b60405191829182610ecc565b346100f5576100f161024f61026f36610c76565b6115b5565b346100f557604061022961022261028a36610bb5565b611ddc565b346100f55761029d36610e99565b30330361018f57602081016102b2818361145f565b90506102c06040840161122c565b916102ca84611494565b9190815b6102ee576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926102fb828661145f565b91905f19850185811161037a5761032b6103246001600160801b039261036996610347956114a8565b9788612108565b939061033a60808a018a611240565b9390921690851590611f92565b901561038e5761035990600f0b611272565b6001600160801b03165b93611494565b91801561037a575f190190816102ce565b634e487b7160e01b5f52601160045260245ffd5b61039a9060801d611272565b6001600160801b0316610363565b346100f55760203660031901126100f5576004356001600160401b0381116100f557366023820112156100f5578060040135906001600160401b0382116100f55736602483830101116100f5577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610464575f6024819284806040519384930183378101838152039082305af1610448611dad565b9061045557602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100f55761048136610e99565b30330361018f576020810190610497828261145f565b90506104a56040830161122c565b916104af81611494565b935f915b8383106104d6576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936105456001600160801b0361052f61051a60019461050c6105058a6104ff8b8b61145f565b906114a8565b9b8c612108565b948593919216600f0b6114ca565b61052760808d018d611240565b939092611f92565b9015610550576001600160801b03165b96611494565b9594930191906104b3565b60801d6001600160801b031661053f565b346100f5576100f16100e261057536610c76565b6112b1565b346100f55761058836610c42565b30330361018f57806105cb61016461015f60a06001600160801b039501936105af8561121f565b866105bc60c0840161122c565b169061015560e0840184611240565b156105f2576105dc9060801d611272565b633b2f660160e21b5f9081529116600452602490fd5b6105fe90600f0b611272565b8116610172565b346100f557604061022961022261061b36610bb5565b611f67565b346100f5576040610229610222610636366109da565b611f3c565b346100f5576100f16101b761064f366107d7565b611019565b606081019081106001600160401b0382111761066f57604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b0382111761066f57604052565b60a081019081106001600160401b0382111761066f57604052565b90601f801991011681019081106001600160401b0382111761066f57604052565b35906001600160a01b03821682036100f557565b35906001600160801b03821682036100f557565b6001600160401b03811161066f5760051b60200190565b359062ffffff821682036100f557565b35908160020b82036100f557565b81601f820112156100f55780359061074e82610702565b9261075c60405194856106b9565b828452602060608186019402830101918183116100f557602001925b828410610786575050505090565b6060848303126100f55760206060916040516107a181610654565b6107aa87610719565b81526107b7838801610729565b838201526107c7604088016106da565b6040820152815201930192610778565b60206003198201126100f5576004356001600160401b0381116100f557608081830360031901126100f5576040519161080f83610683565b61081b826004016106da565b8352610829602483016106da565b602084015261083a604483016106ee565b60408401526064820135916001600160401b0383116100f5576108609201600401610737565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b906108db818351610868565b6020820151151560a08201526101006080610907604085015161012060c08601526101208501906108ab565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b83831061094c57505050505090565b909192939460208061096a600193603f1986820301875289516108cf565b9701930193019193929061093d565b6001600160401b03811161066f57601f01601f191660200190565b81601f820112156100f5578035906109ab82610979565b926109b960405194856106b9565b828452602083830101116100f557815f926020809301838601378301015290565b60206003198201126100f5576004356001600160401b0381116100f557606081830360031901126100f55760405191610a1283610654565b610a1e826004016106da565b835260248201356001600160401b0381116100f557820190806023830112156100f557600482013591610a5083610702565b92610a5e60405194856106b9565b808452602060048186019260051b84010101918383116100f55760248101915b838310610aa35750505050506020830152610a9b906044016106ee565b604082015290565b82356001600160401b0381116100f5576004908301019060a0601f1983880301126100f55760405190610ad58261069e565b610ae1602084016106da565b8252610aef60408401610719565b6020830152610b0060608401610729565b6040830152610b11608084016106da565b606083015260a0830135916001600160401b0383116100f557610b3c88602080969581960101610994565b6080820152815201920191610a7e565b91908260a09103126100f557604051610b648161069e565b6080610bb0818395610b75816106da565b8552610b83602082016106da565b6020860152610b9460408201610719565b6040860152610ba560608201610729565b6060860152016106da565b910152565b60206003198201126100f5576004356001600160401b0381116100f55761010081830360031901126100f55760405191610bee83610683565b610bfb8183600401610b4c565b835260a482013580151581036100f5576020840152610c1c60c483016106ee565b604084015260e4820135916001600160401b0383116100f5576108609201600401610994565b60206003198201126100f557600435906001600160401b0382116100f5576101009082900360031901126100f55760040190565b60206003198201126100f5576004356001600160401b0381116100f55760a081830360031901126100f55760405191610cae8361069e565b610cba826004016106da565b8352610cc8602483016106da565b602084015260448201356001600160401b0381116100f5578201816023820112156100f557600481013590610cfc82610702565b91610d0a60405193846106b9565b808352602060048185019260051b84010101918483116100f557602401905b828210610d72575050506040840152610d44606483016106ee565b60608401526084820135916001600160401b0383116100f557610d6a9201600401610737565b608082015290565b60208091610d7f846106da565b815201910190610d29565b9080602083519182815201916020808360051b8301019401925f915b838310610db557505050505090565b9091929394602080610e16600193601f1986820301875260a060808b518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b03606082015116606085015201519181608082015201906108ab565b97019301930191939290610da6565b90604080610e3c8451606085526060850190610d8a565b9360208101516020850152015191015290565b939291610e67610e75926060875260608701906108cf565b908582036020870152610e25565b926003821015610e855760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100f557600435906001600160401b0382116100f55760609082900360031901126100f55760040190565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610efe57505050505090565b9091929394602080610f1c600193603f198682030187528951610e25565b97019301930191939290610eef565b60405190610f388261069e565b5f6080838281528260208201528260408201528260608201520152565b60405190610f628261069e565b5f608083610f6e610f2b565b8152826020820152606060408201528260608201520152565b90610f9182610702565b610f9e60405191826106b9565b8281528092610faf601f1991610702565b01905f5b828110610fbf57505050565b602090610fca610f55565b82828501015201610fb3565b805115610fe35760200190565b634e487b7160e01b5f52603260045260245ffd5b8051821015610fe35760209160051b010190565b5f19811461037a5760010190565b9060608201918251519061102d5f92610f87565b8151602083015191956001600160a01b03918216939092909116908184101561121557839592955b6001600160a01b03169360209390851492905f5b885180518210156111a0578161107e91610ff7565b518051878201516040928301519251926001600160a01b03169160029190910b9062ffffff166110ad8461069e565b8a845260018060a01b0387168a8501526040840152606083015260808201526111116001600160801b03604087015116604051906110ea82610683565b838252888a83015260408201526040516111048a826106b9565b5f81526060820152611ddc565b9099633b2f660160e21b63ffffffff60e01b8a8d01511603611194579061114461113e600195949361100b565b9b611eb0565b604051926111518461069e565b8352888a8401526040516111658b826106b9565b5f8152604084015260608301526080820152611181828d610ff7565b5261118c818c610ff7565b505b01611069565b9950505060019061118e565b5050965050505050506111b290610f87565b5f805b845181101561120f5760806111ca8287610ff7565b5101516111da575b6001016111b5565b906112076001916111eb8488610ff7565b516111f68287610ff7565b526112018186610ff7565b5061100b565b9190506111d2565b50509150565b8391959295611055565b3580151581036100f55790565b356001600160801b03811681036100f55790565b903590601e19813603018212156100f557018035906001600160401b0382116100f5576020019181360383136100f557565b600f0b6f7fffffffffffffffffffffffffffffff19811461037a575f0390565b6040519061129f82610654565b5f604083606081528260208201520152565b6112b9610f55565b916112c2611292565b925f9261132061131a60018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361130485610683565b8452602084015260408301526060820152611019565b916117b8565b90805115808091611456575b1561133957505050929190565b919593949093911561141657505060029261135385610fd6565b51945b60015b845181101561139b57606061136e8287610ff7565b510151606085015110611384575b600101611359565b925060016113928486610ff7565b5193905061137c565b5092509260015b83518110156113e45760206113b78286610ff7565b5101516020870151106113cd575b6001016113a2565b945060016113db8685610ff7565b519590506113c5565b50915092916003821015610e855781156113fa57565b606084015160208401519192501061141157600190565b600290565b909480925051155f14611437575060019261143083610fd6565b5191611356565b9290935061144482610fd6565b519061144f85610fd6565b5194611356565b5082511561132c565b903590601e19813603018212156100f557018035906001600160401b0382116100f557602001918160051b360383136100f557565b356001600160a01b03811681036100f55790565b9190811015610fe35760051b81013590609e19813603018212156100f5570190565b600160ff1b811461037a575f0390565b9190820391821161037a57565b8181029291811591840414171561037a57565b9061150482610702565b61151160405191826106b9565b8281528092611522601f1991610702565b01905f5b82811061153257505050565b60209061153d611292565b82828501015201611526565b6040805190919061155a83826106b9565b6001815291601f1901825f5b82811061157257505050565b6020906040516115818161069e565b5f81525f838201525f60408201525f60608201526060608082015282828501015201611566565b9190820180921161037a57565b6080810190815151906115cf6040820192835151906114e7565b6115d95f916114fa565b905f936020945b8651805182101561176557816115f591610ff7565b51945f978787019060408801995b85518051821015611754576001600160a01b0390611622908390610ff7565b511662ffffff8a5116845160020b8d60018060a01b0390511691604051936116498561069e565b84528d840152604083015260608201526040516116668c826106b9565b5f81526080820152611676611549565b9061168082610fd6565b5261168a81610fd6565b50845160608601516040518d926116c8926001600160801b0316906001600160a01b03166116b783610654565b825284848301526040820152611f3c565b919099633b2f660160e21b63ffffffff60e01b838d01511603611747579160019493916117006116fa61173f9561100b565b9c611eb0565b906040519361170e85610654565b8452830152604082015261172d836117288b51518b6114e7565b6115a8565b90611738828d610ff7565b528a610ff7565b505b01611603565b9950505050600190611741565b5090995091965050506001016115e0565b505050915093925061177791506114fa565b5f805b845181101561120f57604061178f8287610ff7565b51015161179f575b60010161177a565b906117b06001916111eb8488610ff7565b919050611797565b6080810190815151906117d26040820192835151906114e7565b6117dc5f916114fa565b905f936020945b8651805182101561192357816117f891610ff7565b51945f978787019060408801995b85518051821015611912576001600160a01b0390611825908390610ff7565b511662ffffff8a5116845160020b8d60018060a01b03905116916040519361184c8561069e565b84528d840152604083015260608201526040516118698c826106b9565b5f81526080820152611879611549565b9061188382610fd6565b5261188d81610fd6565b50845160608601516040518d926118cb926001600160801b0316906001600160a01b03166118ba83610654565b8252848483015260408201526121b3565b919099633b2f660160e21b63ffffffff60e01b838d01511603611905579160019493916117006116fa6118fd9561100b565b505b01611806565b99505050506001906118ff565b5090995091965050506001016117e3565b505050915093925061193591506114fa565b5f805b845181101561120f57604061194d8287610ff7565b51015161195d575b600101611938565b9061196e6001916111eb8488610ff7565b919050611955565b9060608201918251519061198a5f92610f87565b8151602083015191956001600160a01b039182169390929091169081841015611b4a57839592955b6001600160a01b03169360209390851492905f5b88518051821015611af757816119db91610ff7565b518051878201516040928301519251926001600160a01b03169160029190910b9062ffffff16611a0a8461069e565b8a845260018060a01b0387168a850152604084015260608301526080820152611a6e6001600160801b0360408701511660405190611a4782610683565b838252888a8301526040820152604051611a618a826106b9565b5f81526060820152611f67565b9099633b2f660160e21b63ffffffff60e01b8a8d01511603611aeb5790611a9b61113e600195949361100b565b60405192611aa88461069e565b8352888a840152604051611abc8b826106b9565b5f8152604084015260608301526080820152611ad8828d610ff7565b52611ae3818c610ff7565b505b016119c6565b99505050600190611ae5565b505096505050505050611b0990610f87565b5f805b845181101561120f576080611b218287610ff7565b510151611b31575b600101611b0c565b90611b426001916111eb8488610ff7565b919050611b29565b83919592956119b2565b611b5c610f55565b91611b65611292565b925f92611bc3611bbd60018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611ba785610683565b8452602084015260408301526060820152611976565b916115b5565b90805115808091611cf4575b15611bdc57505050929190565b9195939490939115611cb4575050600292611bf685610fd6565b51945b60015b8451811015611c3e576060611c118287610ff7565b510151606085015111611c27575b600101611bfc565b92506001611c358486610ff7565b51939050611c1f565b5092509260015b8351811015611c87576020611c5a8286610ff7565b510151602087015111611c70575b600101611c45565b94506001611c7e8685610ff7565b51959050611c68565b50915092916003821015610e85578115611c9d57565b606084015160208401519192501161141157600190565b909480925051155f14611cd55750600192611cce83610fd6565b5191611bf9565b92909350611ce282610fd6565b5190611ced85610fd6565b5194611bf9565b50825115611bcf565b6101206060611d489360208452611d18602085018251610868565b6020810151151560c08501526001600160801b0360408201511660e08501520151916101008082015201906108ab565b90565b6020818303126100f5578051906001600160401b0382116100f5570181601f820112156100f557805190611d7e82610979565b92611d8c60405194856106b9565b828452602083830101116100f557815f9260208093018386015e8301015290565b3d15611dd7573d90611dbe82610979565b91611dcc60405193846106b9565b82523d5f602084013e565b606090565b60605f611e375f611e07611e155a9660405192839163775f063560e11b602084015260248301611cfd565b03601f1981018352826106b9565b604051809381926348c8949160e01b83526020600484015260248301906108ab565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af19081611e90575b50611e8b575050611e87611e7f611dad565b915a906114da565b9091565b915091565b611eab903d805f833e611ea381836106b9565b810190611d4b565b611e6d565b60208101516001600160e01b0319166304d099ff60e21b01611ed3576024015190565b6040516306190b2b60e41b815260206004820152908190611ef89060248301906108ab565b0390fd5b6020815260018060a01b03825116602082015260606001600160801b036040611f32602086015184838701526080860190610d8a565b9401511691015290565b60605f611e375f611e07611e155a9660405192839163aa2f150160e01b602084015260248301611efc565b60605f611e375f611e07611e155a9660405192839163595323f560e01b602084015260248301611cfd565b9394939260209082156120ea576101446401000276a4935b60405190611fb782610654565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b8752611ff48d6004890190610868565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af19081156120df575f916120ad575b5080945f8312145f146120a55760801d5b600f0b0361208f5750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b612084565b90506020813d6020116120d7575b816120c8602093836106b9565b810103126100f557515f612073565b3d91506120bb565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d2593611faa565b90612111610f2b565b5061211b82611494565b6001600160a01b0382811692908216808410156121a957505b6001600160a01b031691821492602081013562ffffff8116908190036100f5576040820135918260020b8093036100f557606001359260018060a01b0384168094036100f557604051946121878661069e565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190612134565b60605f611e375f611e07611e155a96604051928391631a8da8e360e21b602084015260248301611efc56fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c806304837ce31461063b578063147d2af9146106205780635873307314610605578063595323f51461057a5780636036742c146105615780636a36a38c1461047357806391dd7346146103a8578063aa2f15011461028f578063aa9d21cb14610274578063ab1edd9d1461025b578063c2c0461314610236578063ca253dc914610207578063dc4c90d3146101c3578063e991282e1461019e578063eebe0c6a146100f95763fc1ed6d6146100c9575f80fd5b346100f5576100f16100e26100dd36610c76565b611b54565b60409391935193849384610e4f565b0390f35b5f80fd5b346100f55761010736610c42565b30330361018f578061016a61016461015f60a06001600160801b0395019361012e8561121f565b6101478761013e60c0850161122c565b16600f0b6114ca565b9061015560e0840184611240565b9490933690610b4c565b611f92565b9161121f565b156101855781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610172565b6314e1dbf760e11b5f5260045ffd5b346100f5576100f16101b76101b2366107d7565b611976565b6040519182918261091a565b346100f5575f3660031901126100f5576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100f557604061022961022261021d366109da565b6121b3565b9190611eb0565b9082519182526020820152f35b346100f5576100f161024f61024a36610c76565b6117b8565b60405191829182610ecc565b346100f5576100f161024f61026f36610c76565b6115b5565b346100f557604061022961022261028a36610bb5565b611ddc565b346100f55761029d36610e99565b30330361018f57602081016102b2818361145f565b90506102c06040840161122c565b916102ca84611494565b9190815b6102ee576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926102fb828661145f565b91905f19850185811161037a5761032b6103246001600160801b039261036996610347956114a8565b9788612108565b939061033a60808a018a611240565b9390921690851590611f92565b901561038e5761035990600f0b611272565b6001600160801b03165b93611494565b91801561037a575f190190816102ce565b634e487b7160e01b5f52601160045260245ffd5b61039a9060801d611272565b6001600160801b0316610363565b346100f55760203660031901126100f5576004356001600160401b0381116100f557366023820112156100f5578060040135906001600160401b0382116100f55736602483830101116100f5577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610464575f6024819284806040519384930183378101838152039082305af1610448611dad565b9061045557602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100f55761048136610e99565b30330361018f576020810190610497828261145f565b90506104a56040830161122c565b916104af81611494565b935f915b8383106104d6576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936105456001600160801b0361052f61051a60019461050c6105058a6104ff8b8b61145f565b906114a8565b9b8c612108565b948593919216600f0b6114ca565b61052760808d018d611240565b939092611f92565b9015610550576001600160801b03165b96611494565b9594930191906104b3565b60801d6001600160801b031661053f565b346100f5576100f16100e261057536610c76565b6112b1565b346100f55761058836610c42565b30330361018f57806105cb61016461015f60a06001600160801b039501936105af8561121f565b866105bc60c0840161122c565b169061015560e0840184611240565b156105f2576105dc9060801d611272565b633b2f660160e21b5f9081529116600452602490fd5b6105fe90600f0b611272565b8116610172565b346100f557604061022961022261061b36610bb5565b611f67565b346100f5576040610229610222610636366109da565b611f3c565b346100f5576100f16101b761064f366107d7565b611019565b606081019081106001600160401b0382111761066f57604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b0382111761066f57604052565b60a081019081106001600160401b0382111761066f57604052565b90601f801991011681019081106001600160401b0382111761066f57604052565b35906001600160a01b03821682036100f557565b35906001600160801b03821682036100f557565b6001600160401b03811161066f5760051b60200190565b359062ffffff821682036100f557565b35908160020b82036100f557565b81601f820112156100f55780359061074e82610702565b9261075c60405194856106b9565b828452602060608186019402830101918183116100f557602001925b828410610786575050505090565b6060848303126100f55760206060916040516107a181610654565b6107aa87610719565b81526107b7838801610729565b838201526107c7604088016106da565b6040820152815201930192610778565b60206003198201126100f5576004356001600160401b0381116100f557608081830360031901126100f5576040519161080f83610683565b61081b826004016106da565b8352610829602483016106da565b602084015261083a604483016106ee565b60408401526064820135916001600160401b0383116100f5576108609201600401610737565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b906108db818351610868565b6020820151151560a08201526101006080610907604085015161012060c08601526101208501906108ab565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b83831061094c57505050505090565b909192939460208061096a600193603f1986820301875289516108cf565b9701930193019193929061093d565b6001600160401b03811161066f57601f01601f191660200190565b81601f820112156100f5578035906109ab82610979565b926109b960405194856106b9565b828452602083830101116100f557815f926020809301838601378301015290565b60206003198201126100f5576004356001600160401b0381116100f557606081830360031901126100f55760405191610a1283610654565b610a1e826004016106da565b835260248201356001600160401b0381116100f557820190806023830112156100f557600482013591610a5083610702565b92610a5e60405194856106b9565b808452602060048186019260051b84010101918383116100f55760248101915b838310610aa35750505050506020830152610a9b906044016106ee565b604082015290565b82356001600160401b0381116100f5576004908301019060a0601f1983880301126100f55760405190610ad58261069e565b610ae1602084016106da565b8252610aef60408401610719565b6020830152610b0060608401610729565b6040830152610b11608084016106da565b606083015260a0830135916001600160401b0383116100f557610b3c88602080969581960101610994565b6080820152815201920191610a7e565b91908260a09103126100f557604051610b648161069e565b6080610bb0818395610b75816106da565b8552610b83602082016106da565b6020860152610b9460408201610719565b6040860152610ba560608201610729565b6060860152016106da565b910152565b60206003198201126100f5576004356001600160401b0381116100f55761010081830360031901126100f55760405191610bee83610683565b610bfb8183600401610b4c565b835260a482013580151581036100f5576020840152610c1c60c483016106ee565b604084015260e4820135916001600160401b0383116100f5576108609201600401610994565b60206003198201126100f557600435906001600160401b0382116100f5576101009082900360031901126100f55760040190565b60206003198201126100f5576004356001600160401b0381116100f55760a081830360031901126100f55760405191610cae8361069e565b610cba826004016106da565b8352610cc8602483016106da565b602084015260448201356001600160401b0381116100f5578201816023820112156100f557600481013590610cfc82610702565b91610d0a60405193846106b9565b808352602060048185019260051b84010101918483116100f557602401905b828210610d72575050506040840152610d44606483016106ee565b60608401526084820135916001600160401b0383116100f557610d6a9201600401610737565b608082015290565b60208091610d7f846106da565b815201910190610d29565b9080602083519182815201916020808360051b8301019401925f915b838310610db557505050505090565b9091929394602080610e16600193601f1986820301875260a060808b518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b03606082015116606085015201519181608082015201906108ab565b97019301930191939290610da6565b90604080610e3c8451606085526060850190610d8a565b9360208101516020850152015191015290565b939291610e67610e75926060875260608701906108cf565b908582036020870152610e25565b926003821015610e855760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100f557600435906001600160401b0382116100f55760609082900360031901126100f55760040190565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610efe57505050505090565b9091929394602080610f1c600193603f198682030187528951610e25565b97019301930191939290610eef565b60405190610f388261069e565b5f6080838281528260208201528260408201528260608201520152565b60405190610f628261069e565b5f608083610f6e610f2b565b8152826020820152606060408201528260608201520152565b90610f9182610702565b610f9e60405191826106b9565b8281528092610faf601f1991610702565b01905f5b828110610fbf57505050565b602090610fca610f55565b82828501015201610fb3565b805115610fe35760200190565b634e487b7160e01b5f52603260045260245ffd5b8051821015610fe35760209160051b010190565b5f19811461037a5760010190565b9060608201918251519061102d5f92610f87565b8151602083015191956001600160a01b03918216939092909116908184101561121557839592955b6001600160a01b03169360209390851492905f5b885180518210156111a0578161107e91610ff7565b518051878201516040928301519251926001600160a01b03169160029190910b9062ffffff166110ad8461069e565b8a845260018060a01b0387168a8501526040840152606083015260808201526111116001600160801b03604087015116604051906110ea82610683565b838252888a83015260408201526040516111048a826106b9565b5f81526060820152611ddc565b9099633b2f660160e21b63ffffffff60e01b8a8d01511603611194579061114461113e600195949361100b565b9b611eb0565b604051926111518461069e565b8352888a8401526040516111658b826106b9565b5f8152604084015260608301526080820152611181828d610ff7565b5261118c818c610ff7565b505b01611069565b9950505060019061118e565b5050965050505050506111b290610f87565b5f805b845181101561120f5760806111ca8287610ff7565b5101516111da575b6001016111b5565b906112076001916111eb8488610ff7565b516111f68287610ff7565b526112018186610ff7565b5061100b565b9190506111d2565b50509150565b8391959295611055565b3580151581036100f55790565b356001600160801b03811681036100f55790565b903590601e19813603018212156100f557018035906001600160401b0382116100f5576020019181360383136100f557565b600f0b6f7fffffffffffffffffffffffffffffff19811461037a575f0390565b6040519061129f82610654565b5f604083606081528260208201520152565b6112b9610f55565b916112c2611292565b925f9261132061131a60018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361130485610683565b8452602084015260408301526060820152611019565b916117b8565b90805115808091611456575b1561133957505050929190565b919593949093911561141657505060029261135385610fd6565b51945b60015b845181101561139b57606061136e8287610ff7565b510151606085015110611384575b600101611359565b925060016113928486610ff7565b5193905061137c565b5092509260015b83518110156113e45760206113b78286610ff7565b5101516020870151106113cd575b6001016113a2565b945060016113db8685610ff7565b519590506113c5565b50915092916003821015610e855781156113fa57565b606084015160208401519192501061141157600190565b600290565b909480925051155f14611437575060019261143083610fd6565b5191611356565b9290935061144482610fd6565b519061144f85610fd6565b5194611356565b5082511561132c565b903590601e19813603018212156100f557018035906001600160401b0382116100f557602001918160051b360383136100f557565b356001600160a01b03811681036100f55790565b9190811015610fe35760051b81013590609e19813603018212156100f5570190565b600160ff1b811461037a575f0390565b9190820391821161037a57565b8181029291811591840414171561037a57565b9061150482610702565b61151160405191826106b9565b8281528092611522601f1991610702565b01905f5b82811061153257505050565b60209061153d611292565b82828501015201611526565b6040805190919061155a83826106b9565b6001815291601f1901825f5b82811061157257505050565b6020906040516115818161069e565b5f81525f838201525f60408201525f60608201526060608082015282828501015201611566565b9190820180921161037a57565b6080810190815151906115cf6040820192835151906114e7565b6115d95f916114fa565b905f936020945b8651805182101561176557816115f591610ff7565b51945f978787019060408801995b85518051821015611754576001600160a01b0390611622908390610ff7565b511662ffffff8a5116845160020b8d60018060a01b0390511691604051936116498561069e565b84528d840152604083015260608201526040516116668c826106b9565b5f81526080820152611676611549565b9061168082610fd6565b5261168a81610fd6565b50845160608601516040518d926116c8926001600160801b0316906001600160a01b03166116b783610654565b825284848301526040820152611f3c565b919099633b2f660160e21b63ffffffff60e01b838d01511603611747579160019493916117006116fa61173f9561100b565b9c611eb0565b906040519361170e85610654565b8452830152604082015261172d836117288b51518b6114e7565b6115a8565b90611738828d610ff7565b528a610ff7565b505b01611603565b9950505050600190611741565b5090995091965050506001016115e0565b505050915093925061177791506114fa565b5f805b845181101561120f57604061178f8287610ff7565b51015161179f575b60010161177a565b906117b06001916111eb8488610ff7565b919050611797565b6080810190815151906117d26040820192835151906114e7565b6117dc5f916114fa565b905f936020945b8651805182101561192357816117f891610ff7565b51945f978787019060408801995b85518051821015611912576001600160a01b0390611825908390610ff7565b511662ffffff8a5116845160020b8d60018060a01b03905116916040519361184c8561069e565b84528d840152604083015260608201526040516118698c826106b9565b5f81526080820152611879611549565b9061188382610fd6565b5261188d81610fd6565b50845160608601516040518d926118cb926001600160801b0316906001600160a01b03166118ba83610654565b8252848483015260408201526121b3565b919099633b2f660160e21b63ffffffff60e01b838d01511603611905579160019493916117006116fa6118fd9561100b565b505b01611806565b99505050506001906118ff565b5090995091965050506001016117e3565b505050915093925061193591506114fa565b5f805b845181101561120f57604061194d8287610ff7565b51015161195d575b600101611938565b9061196e6001916111eb8488610ff7565b919050611955565b9060608201918251519061198a5f92610f87565b8151602083015191956001600160a01b039182169390929091169081841015611b4a57839592955b6001600160a01b03169360209390851492905f5b88518051821015611af757816119db91610ff7565b518051878201516040928301519251926001600160a01b03169160029190910b9062ffffff16611a0a8461069e565b8a845260018060a01b0387168a850152604084015260608301526080820152611a6e6001600160801b0360408701511660405190611a4782610683565b838252888a8301526040820152604051611a618a826106b9565b5f81526060820152611f67565b9099633b2f660160e21b63ffffffff60e01b8a8d01511603611aeb5790611a9b61113e600195949361100b565b60405192611aa88461069e565b8352888a840152604051611abc8b826106b9565b5f8152604084015260608301526080820152611ad8828d610ff7565b52611ae3818c610ff7565b505b016119c6565b99505050600190611ae5565b505096505050505050611b0990610f87565b5f805b845181101561120f576080611b218287610ff7565b510151611b31575b600101611b0c565b90611b426001916111eb8488610ff7565b919050611b29565b83919592956119b2565b611b5c610f55565b91611b65611292565b925f92611bc3611bbd60018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611ba785610683565b8452602084015260408301526060820152611976565b916115b5565b90805115808091611cf4575b15611bdc57505050929190565b9195939490939115611cb4575050600292611bf685610fd6565b51945b60015b8451811015611c3e576060611c118287610ff7565b510151606085015111611c27575b600101611bfc565b92506001611c358486610ff7565b51939050611c1f565b5092509260015b8351811015611c87576020611c5a8286610ff7565b510151602087015111611c70575b600101611c45565b94506001611c7e8685610ff7565b51959050611c68565b50915092916003821015610e85578115611c9d57565b606084015160208401519192501161141157600190565b909480925051155f14611cd55750600192611cce83610fd6565b5191611bf9565b92909350611ce282610fd6565b5190611ced85610fd6565b5194611bf9565b50825115611bcf565b6101206060611d489360208452611d18602085018251610868565b6020810151151560c08501526001600160801b0360408201511660e08501520151916101008082015201906108ab565b90565b6020818303126100f5578051906001600160401b0382116100f5570181601f820112156100f557805190611d7e82610979565b92611d8c60405194856106b9565b828452602083830101116100f557815f9260208093018386015e8301015290565b3d15611dd7573d90611dbe82610979565b91611dcc60405193846106b9565b82523d5f602084013e565b606090565b60605f611e375f611e07611e155a9660405192839163775f063560e11b602084015260248301611cfd565b03601f1981018352826106b9565b604051809381926348c8949160e01b83526020600484015260248301906108ab565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af19081611e90575b50611e8b575050611e87611e7f611dad565b915a906114da565b9091565b915091565b611eab903d805f833e611ea381836106b9565b810190611d4b565b611e6d565b60208101516001600160e01b0319166304d099ff60e21b01611ed3576024015190565b6040516306190b2b60e41b815260206004820152908190611ef89060248301906108ab565b0390fd5b6020815260018060a01b03825116602082015260606001600160801b036040611f32602086015184838701526080860190610d8a565b9401511691015290565b60605f611e375f611e07611e155a9660405192839163aa2f150160e01b602084015260248301611efc565b60605f611e375f611e07611e155a9660405192839163595323f560e01b602084015260248301611cfd565b9394939260209082156120ea576101446401000276a4935b60405190611fb782610654565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b8752611ff48d6004890190610868565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af19081156120df575f916120ad575b5080945f8312145f146120a55760801d5b600f0b0361208f5750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b612084565b90506020813d6020116120d7575b816120c8602093836106b9565b810103126100f557515f612073565b3d91506120bb565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d2593611faa565b90612111610f2b565b5061211b82611494565b6001600160a01b0382811692908216808410156121a957505b6001600160a01b031691821492602081013562ffffff8116908190036100f5576040820135918260020b8093036100f557606001359260018060a01b0384168094036100f557604051946121878661069e565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190612134565b60605f611e375f611e07611e155a96604051928391631a8da8e360e21b602084015260248301611efc56fea164736f6c634300081a000a" as Hex;
export const V4MetaQuoter = {
    abi,
    bytecode,
    deployedBytecode,
};
