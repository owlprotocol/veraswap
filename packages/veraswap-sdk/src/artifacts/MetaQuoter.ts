import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "_v2Factory", type: "address", internalType: "address" },
        { name: "_v2PoolInitCodeHash", type: "bytes32", internalType: "bytes32" },
        { name: "_v3Factory", type: "address", internalType: "address" },
        { name: "_v3PoolInitCodeHash", type: "bytes32", internalType: "bytes32" },
        { name: "_v4PoolManager", type: "address", internalType: "contract IPoolManager" },
        { name: "_weth9", type: "address", internalType: "address" },
    ],
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
            name: "",
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
            name: "",
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
            name: "",
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
        { name: "", type: "uint8", internalType: "enum IV4MetaQuoter.BestSwap" },
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
            name: "",
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
            name: "",
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
            name: "",
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
            name: "",
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
        { name: "", type: "uint8", internalType: "enum IV4MetaQuoter.BestSwap" },
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
            name: "",
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
export const quoteV2ExactInputSingle = {
    type: "function",
    name: "quoteV2ExactInputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV2Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
                    type: "tuple",
                    internalType: "struct V2PoolKey",
                    components: [
                        { name: "currency0", type: "address", internalType: "Currency" },
                        { name: "currency1", type: "address", internalType: "Currency" },
                    ],
                },
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const quoteV2ExactOutputSingle = {
    type: "function",
    name: "quoteV2ExactOutputSingle",
    inputs: [
        {
            name: "params",
            type: "tuple",
            internalType: "struct IV2Quoter.QuoteExactSingleParams",
            components: [
                {
                    name: "poolKey",
                    type: "tuple",
                    internalType: "struct V2PoolKey",
                    components: [
                        { name: "currency0", type: "address", internalType: "Currency" },
                        { name: "currency1", type: "address", internalType: "Currency" },
                    ],
                },
                { name: "zeroForOne", type: "bool", internalType: "bool" },
                { name: "exactAmount", type: "uint128", internalType: "uint128" },
            ],
        },
    ],
    outputs: [{ name: "amountIn", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const uniswapV3SwapCallback = {
    type: "function",
    name: "uniswapV3SwapCallback",
    inputs: [
        { name: "amount0Delta", type: "int256", internalType: "int256" },
        { name: "amount1Delta", type: "int256", internalType: "int256" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "view",
} as const;
export const unlockCallback = {
    type: "function",
    name: "unlockCallback",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
} as const;
export const v2Factory = {
    type: "function",
    name: "v2Factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const v2PoolInitCodeHash = {
    type: "function",
    name: "v2PoolInitCodeHash",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const v3Factory = {
    type: "function",
    name: "v3Factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const v3PoolInitCodeHash = {
    type: "function",
    name: "v3PoolInitCodeHash",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const weth9 = {
    type: "function",
    name: "weth9",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const InvalidCallbackAddress = {
    type: "error",
    name: "InvalidCallbackAddress",
    inputs: [
        { name: "msgSender", type: "address", internalType: "address" },
        { name: "expectedPoolAddress", type: "address", internalType: "address" },
    ],
} as const;
export const InvalidReserves = { type: "error", name: "InvalidReserves", inputs: [] } as const;
export const NotEnoughLiquidity = {
    type: "error",
    name: "NotEnoughLiquidity",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
} as const;
export const NotPoolManager = { type: "error", name: "NotPoolManager", inputs: [] } as const;
export const NotSelf = { type: "error", name: "NotSelf", inputs: [] } as const;
export const PoolDoesNotExist = {
    type: "error",
    name: "PoolDoesNotExist",
    inputs: [{ name: "pool", type: "address", internalType: "address" }],
} as const;
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
export const V2PoolDoesNotExist = {
    type: "error",
    name: "V2PoolDoesNotExist",
    inputs: [{ name: "pool", type: "address", internalType: "address" }],
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
    quoteV2ExactInputSingle,
    quoteV2ExactOutputSingle,
    uniswapV3SwapCallback,
    unlockCallback,
    v2Factory,
    v2PoolInitCodeHash,
    v3Factory,
    v3PoolInitCodeHash,
    weth9,
] as const;
export const events = [] as const;
export const errors = [
    InvalidCallbackAddress,
    InvalidReserves,
    NotEnoughLiquidity,
    NotPoolManager,
    NotSelf,
    PoolDoesNotExist,
    QuoteSwap,
    UnexpectedCallSuccess,
    UnexpectedRevertBytes,
    V2PoolDoesNotExist,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x6101403461016557601f613a3b38819003918201601f19168301916001600160401b038311848410176101695780849260c094604052833981010312610165576100488161017d565b90602081015161005a6040830161017d565b60608301516080840151939092906001600160a01b03851685036101655760a0610084910161017d565b9460805260a05260c05260e05261010052610120526040516138a990816101928239608051818181610424015281816105f20152818161098e01528181611c780152612fc9015260a05181818161036101528181610402015261096c015260c05181818161020e0152818161083a015281816119ee01528181612d520152818161364a01526137dd015260e0518181816101ec015281816108020152818161362801526137bb0152610100518181816103be01528181610772015281816116ee015281816120690152612ab8015261012051818181610b9a01526133770152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036101655756fe60806040526004361015610011575f80fd5b5f3560e01c806304837ce314610bc957806350879c1c14610b85578063595323f514610afa5780636036742c14610acf578063682ab068146109575780636a36a38c146108695780637c887c5914610825578063827996b5146107eb57806391dd73461461073f578063aa2f15011461063a578063ab1edd9d14610621578063b4b57c39146105dd578063c2c04613146105b8578063c587a0bf146103ed578063dc4c90d3146103a9578063e991282e14610384578063ea2186971461034a578063eebe0c6a146102a5578063fa461e33146101375763fc1ed6d6146100f5575f80fd5b346101335761012f61012061010936610f56565b6101116113c0565b5061011a6113f2565b506131d3565b60409391935193849384611121565b0390f35b5f80fd5b34610133576060366003190112610133576024356004356044356001600160401b0381116101335761016d903690600401611224565b5f83949294139081801561029c575b156101335784908101036080811261013357606013610133576060604051946101a486610be2565b6101ad81610c83565b86526101bb60208201610c83565b60208701526101cc60408201610cc2565b60408701520135938415158503610133576001600160a01b0390610233907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b168033036102865750156102765761024a90611490565b915b156102645750633b2f660160e21b5f5260045260245ffd5b633b2f660160e21b5f5260045260245ffd5b9061028090611490565b9161024c565b6352f0ffb560e11b5f523360045260245260445ffd5b505f831361017c565b34610133576102b336610f22565b30330361033b578061031661031061030b60a06001600160801b039501936102da856112b0565b6102f3876102ea60c085016112bd565b16600f0b611490565b9061030160e08401846112d1565b9490933690611303565b611fb8565b916112b0565b156103315781165b633b2f660160e21b5f521660045260245ffd5b60801d811661031e565b6314e1dbf760e11b5f5260045ffd5b34610133575f3660031901126101335760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346101335761012f61039d61039836610d80565b612ab5565b60405191829182610ec3565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b34610133576103fb3661116b565b61044981517f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906133a5565b90813b1561059757604051630240bc6b60e21b815291606090839060049082906001600160a01b03165afa91821561058c575f905f9361054d575b506001600160701b03809116921691602082015115155f1461053b5760406001600160801b039193925b01511690821590818015610533575b610524576103e58302928084046103e51490151715610510576104e0908361344f565b906103e884029384046103e814171561051057610502610508926020946116c4565b90613462565b604051908152f35b634e487b7160e01b5f52601160045260245ffd5b633dce448b60e11b5f5260045ffd5b5080156104bd565b906001600160801b03906040906104ae565b6001600160701b03935083915061057b9060603d606011610585575b6105738183610c62565b8101906122e5565b5093909150610484565b503d610569565b6040513d5f823e3d90fd5b5063f032f04b60e01b5f9081526001600160a01b0391909116600452602490fd5b346101335761012f6105d16105cc36610f56565b612802565b60405191829182611251565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101335761012f6105d161063536610f56565b6124b1565b3461013357610648366111f1565b30330361033b576020810161065d8183611411565b905061066b604084016112bd565b9161067584611446565b9190815b610699576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926106a68286611411565b91905f198501858111610510576106d66106cf6001600160801b0392610714966106f29561145a565b978861231b565b93906106e560808a018a6112d1565b9390921690851590611fb8565b90156107255761070490600f0b611376565b6001600160801b03165b93611446565b918015610510575f19019081610679565b6107319060801d611376565b6001600160801b031661070e565b34610133576020366003190112610133576004356001600160401b0381116101335761076f903690600401611224565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036107dc575f8281928160405192839283378101838152039082305af16107c06123c6565b906107cd57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b34610133575f3660031901126101335760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461013357610877366111f1565b30330361033b57602081019061088d8282611411565b905061089b604083016112bd565b916108a581611446565b935f915b8383106108cc576001600160801b0385633b2f660160e21b5f521660045260245ffd5b9091929361093b6001600160801b036109256109106001946109026108fb8a6108f58b8b611411565b9061145a565b9b8c61231b565b948593919216600f0b611490565b61091d60808d018d6112d1565b939092611fb8565b9015610946576001600160801b03165b96611446565b9594930191906108a9565b60801d6001600160801b0316610935565b34610133576109653661116b565b6109b381517f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906133a5565b90813b1561059757604051630240bc6b60e21b815291606090839060049082906001600160a01b03165afa91821561058c575f905f93610aa0575b506001600160701b03809116921691602082015115155f14610a8e5760406001600160801b039193925b0151169180158015610a86575b6105245782610a339161344f565b916103e88302928084046103e8149015171561051057610a52916114a0565b6103e58102908082046103e5149015171561051057610a7091613462565b6001810180911161051057602090604051908152f35b508115610a25565b906001600160801b0390604090610a18565b6001600160701b039350839150610ac59060603d606011610585576105738183610c62565b50939091506109ee565b346101335761012f610120610ae336610f56565b610aeb6113c0565b50610af46113f2565b50612123565b3461013357610b0836610f22565b30330361033b5780610b4b61031061030b60a06001600160801b03950193610b2f856112b0565b86610b3c60c084016112bd565b169061030160e08401846112d1565b15610b7257610b5c9060801d611376565b633b2f660160e21b5f9081529116600452602490fd5b610b7e90600f0b611376565b811661031e565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101335761012f61039d610bdd36610d80565b6116ec565b606081019081106001600160401b03821117610bfd57604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b03821117610bfd57604052565b60a081019081106001600160401b03821117610bfd57604052565b604081019081106001600160401b03821117610bfd57604052565b90601f801991011681019081106001600160401b03821117610bfd57604052565b35906001600160a01b038216820361013357565b35906001600160801b038216820361013357565b6001600160401b038111610bfd5760051b60200190565b359062ffffff8216820361013357565b35908160020b820361013357565b81601f8201121561013357803590610cf782610cab565b92610d056040519485610c62565b8284526020606081860194028301019181831161013357602001925b828410610d2f575050505090565b606084830312610133576020606091604051610d4a81610be2565b610d5387610cc2565b8152610d60838801610cd2565b83820152610d7060408801610c83565b6040820152815201930192610d21565b6020600319820112610133576004356001600160401b03811161013357608081830360031901126101335760405191610db883610c11565b610dc482600401610c83565b8352610dd260248301610c83565b6020840152610de360448301610c97565b60408401526064820135916001600160401b03831161013357610e099201600401610ce0565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b90610e84818351610e11565b6020820151151560a08201526101006080610eb0604085015161012060c0860152610120850190610e54565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610ef557505050505090565b9091929394602080610f13600193603f198682030187528951610e78565b97019301930191939290610ee6565b602060031982011261013357600435906001600160401b038211610133576101009082900360031901126101335760040190565b6020600319820112610133576004356001600160401b0381116101335760a081830360031901126101335760405191610f8e83610c2c565b610f9a82600401610c83565b8352610fa860248301610c83565b602084015260448201356001600160401b0381116101335782018160238201121561013357600481013590610fdc82610cab565b91610fea6040519384610c62565b808352602060048185019260051b840101019184831161013357602401905b82821061105257505050604084015261102460648301610c97565b60608401526084820135916001600160401b0383116101335761104a9201600401610ce0565b608082015290565b6020809161105f84610c83565b815201910190611009565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b8282106110b357505050506040816020829301516020850152015191015290565b90919295602080611113600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610e54565b980192019201909291611092565b93929161113961114792606087526060870190610e78565b90858203602087015261106a565b9260038210156111575760400152565b634e487b7160e01b5f52602160045260245ffd5b600319016080811261013357604080519161118583610be2565b126101335760405161119681610c47565b6004356001600160a01b03811681036101335781526024356001600160a01b0381168103610133576020820152815260443580151581036101335760208201526064356001600160801b038116810361013357604082015290565b602060031982011261013357600435906001600160401b0382116101335760609082900360031901126101335760040190565b9181601f84011215610133578235916001600160401b038311610133576020838186019501011161013357565b602081016020825282518091526040820191602060408360051b8301019401925f915b83831061128357505050505090565b90919293946020806112a1600193603f19868203018752895161106a565b97019301930191939290611274565b3580151581036101335790565b356001600160801b03811681036101335790565b903590601e198136030182121561013357018035906001600160401b0382116101335760200191813603831361013357565b91908260a09103126101335760405161131b81610c2c565b6080819361132881610c83565b835261133660208201610c83565b602084015261134760408201610cc2565b604084015261135860608201610cd2565b60608401520135906001600160a01b03821682036101335760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610510575f0390565b604051906113a382610c2c565b5f6080838281528260208201528260408201528260608201520152565b604051906113cd82610c2c565b5f6080836113d9611396565b8152826020820152606060408201528260608201520152565b604051906113ff82610be2565b5f604083606081528260208201520152565b903590601e198136030182121561013357018035906001600160401b03821161013357602001918160051b3603831361013357565b356001600160a01b03811681036101335790565b919081101561147c5760051b81013590609e1981360301821215610133570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610510575f0390565b9190820391821161051057565b604051906114bc602083610c62565b5f80835282815b8281106114cf57505050565b6020906114da6113c0565b828285010152016114c3565b906114f082610cab565b6114fd6040519182610c62565b828152809261150e601f1991610cab565b01905f5b82811061151e57505050565b6020906115296113c0565b82828501015201611512565b60405190611544602083610c62565b5f80835282815b82811061155757505050565b60209060405161156681610c11565b60405161157281610be2565b5f81525f848201525f604082015281525f838201525f60408201525f60608201528282850101520161154b565b906115a982610cab565b6115b66040519182610c62565b82815280926115c7601f1991610cab565b01905f5b8281106115d757505050565b6020906040516115e681610c11565b6040516115f281610be2565b5f81525f848201525f604082015281525f838201525f60408201525f6060820152828285010152016115cb565b9061162982610cab565b6116366040519182610c62565b8281528092611647601f1991610cab565b0190602036910137565b80511561147c5760200190565b80516001101561147c5760400190565b805182101561147c5760209160051b010190565b815180516001600160a01b03908116835260209182015116818301528201511515604080830191909152909101516001600160801b0316606082015260800190565b9190820180921161051057565b6001600160401b038111610bfd57601f01601f191660200190565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168015611fa95760608201928351519161172f5f936114e6565b845160208601516001600160a01b039182169792949116919082881015611f9f57879691965b6001600160a01b03169788149260209260408101925f5b8a51805182101561194457611782828e9261166e565b5162ffffff815116908881015160020b90604060018060a01b039101511691604051936117ae85610c2c565b845260018060a01b0388168a850152604084015260608301526080820152866001600160801b03875116604051906117e582610c11565b8382528a8383015260408201526040516117ff8382610c62565b5f815260608201528a6118665f60609381936118425a9761183460405194859263775f063560e11b90840152602483016134ca565b03601f198101845283610c62565b8d836040518096819582946348c8949160e01b845260048401526024830190610e54565b03925af19081611924575b5061191c57505061188b6118836123c6565b915a906114a0565b909b5b8c8901516001600160e01b0319166304d099ff60e21b0161191057906118c06118ba60019594936124a3565b9d613577565b604051926118cd84610c2c565b83528a8a8401526040516118e18b82610c62565b5f81526040840152606083015260808201526118fd828c61166e565b52611908818b61166e565b505b0161176c565b9b50505060019061190a565b91509b61188e565b61193f903d805f833e6119378183610c62565b810190613515565b611871565b505099509750505050505090611959906114e6565b905f905f5b81518110156119b8576080611973828461166e565b510151611983575b60010161195e565b916119b0600191611994858561166e565b5161199f828861166e565b526119aa818761166e565b506124a3565b92905061197b565b505050915b81516119d1906001600160a01b0316613366565b60208301519091906119eb906001600160a01b0316613366565b917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031615611f8c576060840193611a2b85515161161f565b935f5b86518051821015611a5e579062ffffff611a4a8260019461166e565b515116611a57828961166e565b5201611a2e565b50509193945091946001600160801b036040840151169060405196611a8288610c11565b6001600160a01b038681168952841660208901908152604089019384526060890188815297515f9791969190611ab79061159f565b995196516001600160a01b0397881697169384881015611f8557875b6001600160a01b0316978814965f5b8b518051821015611bd15762ffffff611afd8f92849061166e565b511660405190611b0c82610be2565b8c825260018060a01b038a1660208301526040820152611b506001600160801b038b511660405190611b3d82610be2565b8382528d60208301526040820152613612565b6020820151919e90916001600160e01b0319166304d099ff60e21b01611bc45790611b7c8593926124a3565b9e611b8690613577565b60405192611b9384610c11565b83528d602084015260408301526060820152611baf828461166e565b52611bb99161166e565b506001905b01611ae2565b9d50505050600190611bbe565b50509750979294509750979350611be8915061159f565b935f935f5b8451811015611c41576060611c02828761166e565b510151611c12575b600101611bed565b94611c39600191611c23888861166e565b51611c2e828b61166e565b526119aa818a61166e565b959050611c0a565b5093509390949150905b6001600160a01b038181169190841680831015611f7957505b5f966001600160a01b0391821692831496917f000000000000000000000000000000000000000000000000000000000000000016611ec5575b50611cab85518451906116c4565b91611cce611cc989151594855f14611ebd5760ff60015b16906116c4565b6114e6565b975f5b8751811015611d045780611ce76001928a61166e565b51611cf2828d61166e565b52611cfd818c61166e565b5001611cd1565b5090919296959493955f946020955b8a8951821015611e145760019190611e0d908b611e06611dff858e8e6001600160a01b03611d41848861166e565b51515116958a8060a01b0382611d57868461166e565b515101511662ffffff6040611d6c878561166e565b51510151169060405198611d7f8a610c2c565b89528389015260408801525f60608801526003608088015281611da2858361166e565b5101511515916060611dc3866040611dba828761166e565b5101519461166e565b5101519260405198611dd48a610c2c565b895281890152611de76040519182610c62565b5f8152604088015260608701526080860152516116c4565b809361166e565b528d61166e565b5001611d13565b50509296509296909450611e2a575b5050505050565b60405194611e3786610c2c565b85526001600160a01b031682850152610bb86040808601919091525f6060860152600260808601525193611e6a85610c2c565b845281840152611e7d6040519182610c62565b5f8152604083015260608201525f608082015282515f19810190811161051057611eb291611eab828661166e565b528361166e565b505f80808080611e23565b60ff5f611cc2565b6020611f2a916001600160801b036040805192611ee184610c47565b8784526001600160a01b038a1685850152015160405192911690611f0483610be2565b8252898383015260408201526040518093819263c587a0bf60e01b835260048301611682565b0381305afa5f9181611f45575b5015611c9d5796505f611c9d565b9091506020813d602011611f71575b81611f6160209383610c62565b810103126101335751905f611f37565b3d9150611f54565b91935050918092611c64565b8794611ad3565b611f999492919394611535565b90611c4b565b8792969196611755565b50611fb26114ad565b916119bd565b939493926020908215612105576101446401000276a4935b60405190611fdd82610be2565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b875261201a8d6004890190610e11565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af190811561058c575f916120d3575b5080945f8312145f146120cb5760801d5b600f0b036120b55750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b6120aa565b90506020813d6020116120fd575b816120ee60209383610c62565b8101031261013357515f612099565b3d91506120e1565b61014473fffd8963efd1fc6a506488495d951d5263988d2593611fd0565b61212b6113c0565b916121346113f2565b925f9261219261218c60018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361217685610c11565b84526020840152604083015260608201526116ec565b91612802565b908051158080916122c8575b156121ab57505050929190565b91959394909391156122885750506002926121c585611651565b51945b60015b845181101561220d5760606121e0828761166e565b5101516060850151106121f6575b6001016121cb565b92506001612204848661166e565b519390506121ee565b5092509260015b8351811015612256576020612229828661166e565b51015160208701511061223f575b600101612214565b9450600161224d868561166e565b51959050612237565b5091509291600382101561115757811561226c57565b606084015160208401519192501061228357600190565b600290565b909480925051155f146122a957506001926122a283611651565b51916121c8565b929093506122b682611651565b51906122c185611651565b51946121c8565b5082511561219e565b51906001600160701b038216820361013357565b90816060910312610133576122f9816122d1565b916040612308602084016122d1565b92015163ffffffff811681036101335790565b90612324611396565b5061232e82611446565b6001600160a01b0382811692908216808410156123bc57505b6001600160a01b031691821492602081013562ffffff811690819003610133576040820135918260020b80930361013357606001359260018060a01b038416809403610133576040519461239a86610c2c565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190612347565b3d156123f0573d906123d7826116d1565b916123e56040519384610c62565b82523d5f602084013e565b606090565b906123ff82610cab565b61240c6040519182610c62565b828152809261241d601f1991610cab565b01905f5b82811061242d57505050565b6020906124386113f2565b82828501015201612421565b604051606091906124558382610c62565b6002815291601f1901825f5b82811061246d57505050565b60209060405161247c81610c2c565b5f81525f838201525f60408201525f60608201526060608082015282828501015201612461565b5f1981146105105760010190565b5f60408201906124c28251516123f5565b915f915b81519283518110156127955785516001600160a01b039081169461252d91906124f090849061166e565b5116946001600160801b036060890151169560808901968751916040519361251785610c11565b8452602084015260408301526060820152612ab5565b948551156127885761253e86611651565b519460015b8751811015612585576060612558828a61166e565b51015160608801511161256e575b600101612543565b9550600161257c878961166e565b51969050612566565b50919396949550916125d260018060a01b036125a2868a5161166e565b5116602087019360018060a01b03855116906001600160801b0360608b0151169051916040519361251785610c11565b95865115612777576125e387611651565b519560015b885181101561262a5760606125fd828b61166e565b510151606089015111612613575b6001016125e8565b96506001612621888a61166e565b5197905061260b565b5097949298956001949750906127386127579392612646612444565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b0391015116906040860151926040519461268786610c2c565b85526020850152604084015260608301526080820152612705898060a01b036126b18a8d5161166e565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051976126ea89610c2c565b88526020880152604087015260608601526080850152611651565b5261270f8d611651565b506127198d61165e565b526127238c61165e565b506080806060830151940151910151906116c4565b906040519a6127468c610be2565b8b5260208b015260408a01526124a3565b96612762828761166e565b5261276d818661166e565b505b0191946124c6565b50969395929050600191945061276f565b945060019196935061276f565b509150506127a5919392506123f5565b5f805b84518110156127fc5760406127bd828761166e565b5101516127cd575b6001016127a8565b906127f46001916127de848861166e565b516127e9828761166e565b526119aa818661166e565b9190506127c5565b50509150565b5f604082016128128151516123f5565b915f905b8251918251811015612a645785516001600160a01b0390811693612867919061284090849061166e565b5116936001600160801b036060890151169460808901958651916040519361217685610c11565b94855115612a575761287886611651565b519460015b87518110156128bf576060612892828a61166e565b5101516060880151106128a8575b60010161287d565b955060016128b6878961166e565b519690506128a0565b509193969495509161290c60018060a01b036128dc86855161166e565b5116602087019860018060a01b038a5116906001600160801b0360608b0151169051916040519361217685610c11565b95865115612a465761291d87611651565b519560015b8851811015612964576060612937828b61166e565b51015160608901511061294d575b600101612922565b9650600161295b888a61166e565b51979050612945565b509798949295600194975090612738612a269392612980612444565b809c6127058b6129978a8c8060a01b03925161166e565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051966129d088610c2c565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b039101511690604088015192604051976126ea89610c2c565b96612a31828761166e565b52612a3c818661166e565b505b019094612816565b509692909395506001919450612a3e565b9450600191969250612a3e565b50915050612a74919392506123f5565b5f805b84518110156127fc576040612a8c828761166e565b510151612a9c575b600101612a77565b90612aad6001916127de848861166e565b919050612a94565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031680156131c4576060830180515191612af85f936114e6565b855160208701516001600160a01b03908116979294911691878310156131bb5782979691965b6001600160a01b03169283149260209260408301925f5b8a518051821015612cc557612b4b828e9261166e565b5162ffffff815116908881015160020b90604060018060a01b03910151169160405193612b7785610c2c565b60018060a01b03168452878a850152604084015260608301526080820152866001600160801b0387511660405190612bae82610c11565b8382528a838301526040820152604051612bc88382610c62565b5f815260608201528a612bfd5f60609381936118425a9761183460405194859263595323f560e01b90840152602483016134ca565b03925af19081612cad575b50612ca5575050612c1a6118836123c6565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01612c995790612c496118ba60019594936124a3565b60405192612c5684610c2c565b83528a8a840152604051612c6a8b82610c62565b5f8152604084015260608301526080820152612c86828c61166e565b52612c91818b61166e565b505b01612b35565b9b505050600190612c93565b91509b612c1d565b612cc0903d805f833e6119378183610c62565b612c08565b505099509750505050505090612cda906114e6565b905f905f5b8151811015612d1d576080612cf4828461166e565b510151612d04575b600101612cdf565b91612d15600191611994858561166e565b929050612cfc565b505050905b8251612d36906001600160a01b0316613366565b6020840151909190612d50906001600160a01b0316613366565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316156131a9576060850193612d8f85515161161f565b935f5b86518051821015612dc2579062ffffff612dae8260019461166e565b515116612dbb828961166e565b5201612d92565b50509193945091946001600160801b036040820151169060405196612de688610c11565b6001600160a01b038481168952861660208901908152604089019384526060890188815297515f9791939190612e1b9061159f565b995193516001600160a01b0390811697941693878510156131a35784975b6001600160a01b0316948514965f5b8b518051821015612f375762ffffff612e638f92849061166e565b511660405190612e7282610be2565b60018060a01b038d1682528960208301526040820152612eb66001600160801b038b511660405190612ea382610be2565b8382528d602083015260408201526137a5565b6020820151919e90916001600160e01b0319166304d099ff60e21b01612f2a5790612ee28593926124a3565b9e612eec90613577565b60405192612ef984610c11565b83528d602084015260408301526060820152612f15828461166e565b52612f1f9161166e565b506001905b01612e48565b9d50505050600190612f24565b50509750979294509750979350612f4e915061159f565b935f935f5b8451811015612f91576060612f68828761166e565b510151612f78575b600101612f53565b94612f89600191611c23888861166e565b959050612f70565b5093509390949150905b6001600160a01b03838116939082168085101561319a5750905b5f966001600160a01b0391821694851496917f0000000000000000000000000000000000000000000000000000000000000000166130e5575b50612ffc85518451906116c4565b91613016611cc989151594855f14611ebd576001906116c4565b975f5b875181101561304c578061302f6001928a61166e565b5161303a828d61166e565b52613045818c61166e565b5001613019565b5090919296959493955f946020955b8a89518210156130905760019190613089908b611e06611dff858e8e6001600160a01b03611d41848861166e565b500161305b565b505092965092969094506130a5575050505050565b604051946130b286610c2c565b6001600160a01b0316855282850152610bb86040808601919091525f6060860152600260808601525193611e6a85610c2c565b602061314b916001600160801b03604080519261310184610c47565b6001600160a01b03881684528484018a905201516040519291169061312583610be2565b82528983830152604082015260405180938192630d05560d60e31b835260048301611682565b0381305afa5f9181613166575b5015612fee5796505f612fee565b9091506020813d602011613192575b8161318260209383610c62565b810103126101335751905f613158565b3d9150613175565b91505082612fb5565b84612e39565b6131b593929193611535565b90612f9b565b82969196612b1e565b506131cd6114ad565b90612d22565b6131db6113c0565b916131e46113f2565b925f9261322c61322660018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361251785610c11565b916124b1565b9080511580809161335d575b1561324557505050929190565b919593949093911561331d57505060029261325f85611651565b51945b60015b84518110156132a757606061327a828761166e565b510151606085015111613290575b600101613265565b9250600161329e848661166e565b51939050613288565b5092509260015b83518110156132f05760206132c3828661166e565b5101516020870151116132d9575b6001016132ae565b945060016132e7868561166e565b519590506132d1565b5091509291600382101561115757811561330657565b606084015160208401519192501161228357600190565b909480925051155f1461333e575060019261333783611651565b5191613262565b9290935061334b82611651565b519061335685611651565b5194613262565b50825115613238565b6001600160a01b0381166133a257507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690565b90565b61343f90602081519101516040519060208201926bffffffffffffffffffffffff199060601b1683526bffffffffffffffffffffffff199060601b166034820152602881526133f5604882610c62565b5190206040516001600160f81b03196020820190815260609490941b6bffffffffffffffffffffffff19166021820152603581019190915260558101939093528260758101611834565b905190206001600160a01b031690565b8181029291811591840414171561051057565b811561346c570490565b634e487b7160e01b5f52601260045260245ffd5b61343f9060018060a01b038151169062ffffff604060018060a01b0360208401511692015116604051916020830193845260408301526060820152606081526133f5608082610c62565b61012060606133a293602084526134e5602085018251610e11565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610e54565b602081830312610133578051906001600160401b038211610133570181601f8201121561013357805190613548826116d1565b926135566040519485610c62565b8284526020838301011161013357815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b0161359a576024015190565b6040516306190b2b60e41b8152602060048201529081906135bf906024830190610e54565b0390fd5b9190826040910312610133576020825192015190565b6001600160a01b039182168152911515602083015260408201929092529116606082015260a0608082018190526133a292910190610e54565b80516060905f906001600160a01b039061366f907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b1692833b1561377857604060208201511515915a95831561375d576401000276a4915b5f6001600160801b03858301511691519562ffffff8680519860018060a01b0381511660208b015260018060a01b03602082015116828b0152015116606088015260016080880152608087526136e960a088610c62565b613709865197889687958694630251596160e31b865230600487016135d9565b03925af1908161372f575b5061372a5750506137266118836123c6565b9091565b915091565b6137509060403d604011613756575b6137488183610c62565b8101906135c3565b50613714565b503d61373e565b73fffd8963efd1fc6a506488495d951d5263988d2591613692565b505050604051906373913ebd60e01b60208301526024820152602481526137a0604482610c62565b905f90565b80516060905f906001600160a01b0390613802907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b1692833b1561377857604060208201511515915a958315613881576401000276a4915b5f61383b6001600160801b038684015116611490565b9151855181516001600160a01b0390811660208084019190915283015116818801529086015162ffffff16606082015260808082018390528152956136e960a088610c62565b73fffd8963efd1fc6a506488495d951d5263988d259161382556fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c806304837ce314610bc957806350879c1c14610b85578063595323f514610afa5780636036742c14610acf578063682ab068146109575780636a36a38c146108695780637c887c5914610825578063827996b5146107eb57806391dd73461461073f578063aa2f15011461063a578063ab1edd9d14610621578063b4b57c39146105dd578063c2c04613146105b8578063c587a0bf146103ed578063dc4c90d3146103a9578063e991282e14610384578063ea2186971461034a578063eebe0c6a146102a5578063fa461e33146101375763fc1ed6d6146100f5575f80fd5b346101335761012f61012061010936610f56565b6101116113c0565b5061011a6113f2565b506131d3565b60409391935193849384611121565b0390f35b5f80fd5b34610133576060366003190112610133576024356004356044356001600160401b0381116101335761016d903690600401611224565b5f83949294139081801561029c575b156101335784908101036080811261013357606013610133576060604051946101a486610be2565b6101ad81610c83565b86526101bb60208201610c83565b60208701526101cc60408201610cc2565b60408701520135938415158503610133576001600160a01b0390610233907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b168033036102865750156102765761024a90611490565b915b156102645750633b2f660160e21b5f5260045260245ffd5b633b2f660160e21b5f5260045260245ffd5b9061028090611490565b9161024c565b6352f0ffb560e11b5f523360045260245260445ffd5b505f831361017c565b34610133576102b336610f22565b30330361033b578061031661031061030b60a06001600160801b039501936102da856112b0565b6102f3876102ea60c085016112bd565b16600f0b611490565b9061030160e08401846112d1565b9490933690611303565b611fb8565b916112b0565b156103315781165b633b2f660160e21b5f521660045260245ffd5b60801d811661031e565b6314e1dbf760e11b5f5260045ffd5b34610133575f3660031901126101335760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346101335761012f61039d61039836610d80565b612ab5565b60405191829182610ec3565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b34610133576103fb3661116b565b61044981517f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906133a5565b90813b1561059757604051630240bc6b60e21b815291606090839060049082906001600160a01b03165afa91821561058c575f905f9361054d575b506001600160701b03809116921691602082015115155f1461053b5760406001600160801b039193925b01511690821590818015610533575b610524576103e58302928084046103e51490151715610510576104e0908361344f565b906103e884029384046103e814171561051057610502610508926020946116c4565b90613462565b604051908152f35b634e487b7160e01b5f52601160045260245ffd5b633dce448b60e11b5f5260045ffd5b5080156104bd565b906001600160801b03906040906104ae565b6001600160701b03935083915061057b9060603d606011610585575b6105738183610c62565b8101906122e5565b5093909150610484565b503d610569565b6040513d5f823e3d90fd5b5063f032f04b60e01b5f9081526001600160a01b0391909116600452602490fd5b346101335761012f6105d16105cc36610f56565b612802565b60405191829182611251565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101335761012f6105d161063536610f56565b6124b1565b3461013357610648366111f1565b30330361033b576020810161065d8183611411565b905061066b604084016112bd565b9161067584611446565b9190815b610699576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926106a68286611411565b91905f198501858111610510576106d66106cf6001600160801b0392610714966106f29561145a565b978861231b565b93906106e560808a018a6112d1565b9390921690851590611fb8565b90156107255761070490600f0b611376565b6001600160801b03165b93611446565b918015610510575f19019081610679565b6107319060801d611376565b6001600160801b031661070e565b34610133576020366003190112610133576004356001600160401b0381116101335761076f903690600401611224565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036107dc575f8281928160405192839283378101838152039082305af16107c06123c6565b906107cd57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b34610133575f3660031901126101335760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461013357610877366111f1565b30330361033b57602081019061088d8282611411565b905061089b604083016112bd565b916108a581611446565b935f915b8383106108cc576001600160801b0385633b2f660160e21b5f521660045260245ffd5b9091929361093b6001600160801b036109256109106001946109026108fb8a6108f58b8b611411565b9061145a565b9b8c61231b565b948593919216600f0b611490565b61091d60808d018d6112d1565b939092611fb8565b9015610946576001600160801b03165b96611446565b9594930191906108a9565b60801d6001600160801b0316610935565b34610133576109653661116b565b6109b381517f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906133a5565b90813b1561059757604051630240bc6b60e21b815291606090839060049082906001600160a01b03165afa91821561058c575f905f93610aa0575b506001600160701b03809116921691602082015115155f14610a8e5760406001600160801b039193925b0151169180158015610a86575b6105245782610a339161344f565b916103e88302928084046103e8149015171561051057610a52916114a0565b6103e58102908082046103e5149015171561051057610a7091613462565b6001810180911161051057602090604051908152f35b508115610a25565b906001600160801b0390604090610a18565b6001600160701b039350839150610ac59060603d606011610585576105738183610c62565b50939091506109ee565b346101335761012f610120610ae336610f56565b610aeb6113c0565b50610af46113f2565b50612123565b3461013357610b0836610f22565b30330361033b5780610b4b61031061030b60a06001600160801b03950193610b2f856112b0565b86610b3c60c084016112bd565b169061030160e08401846112d1565b15610b7257610b5c9060801d611376565b633b2f660160e21b5f9081529116600452602490fd5b610b7e90600f0b611376565b811661031e565b34610133575f366003190112610133576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346101335761012f61039d610bdd36610d80565b6116ec565b606081019081106001600160401b03821117610bfd57604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b03821117610bfd57604052565b60a081019081106001600160401b03821117610bfd57604052565b604081019081106001600160401b03821117610bfd57604052565b90601f801991011681019081106001600160401b03821117610bfd57604052565b35906001600160a01b038216820361013357565b35906001600160801b038216820361013357565b6001600160401b038111610bfd5760051b60200190565b359062ffffff8216820361013357565b35908160020b820361013357565b81601f8201121561013357803590610cf782610cab565b92610d056040519485610c62565b8284526020606081860194028301019181831161013357602001925b828410610d2f575050505090565b606084830312610133576020606091604051610d4a81610be2565b610d5387610cc2565b8152610d60838801610cd2565b83820152610d7060408801610c83565b6040820152815201930192610d21565b6020600319820112610133576004356001600160401b03811161013357608081830360031901126101335760405191610db883610c11565b610dc482600401610c83565b8352610dd260248301610c83565b6020840152610de360448301610c97565b60408401526064820135916001600160401b03831161013357610e099201600401610ce0565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b90610e84818351610e11565b6020820151151560a08201526101006080610eb0604085015161012060c0860152610120850190610e54565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610ef557505050505090565b9091929394602080610f13600193603f198682030187528951610e78565b97019301930191939290610ee6565b602060031982011261013357600435906001600160401b038211610133576101009082900360031901126101335760040190565b6020600319820112610133576004356001600160401b0381116101335760a081830360031901126101335760405191610f8e83610c2c565b610f9a82600401610c83565b8352610fa860248301610c83565b602084015260448201356001600160401b0381116101335782018160238201121561013357600481013590610fdc82610cab565b91610fea6040519384610c62565b808352602060048185019260051b840101019184831161013357602401905b82821061105257505050604084015261102460648301610c97565b60608401526084820135916001600160401b0383116101335761104a9201600401610ce0565b608082015290565b6020809161105f84610c83565b815201910190611009565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b8282106110b357505050506040816020829301516020850152015191015290565b90919295602080611113600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610e54565b980192019201909291611092565b93929161113961114792606087526060870190610e78565b90858203602087015261106a565b9260038210156111575760400152565b634e487b7160e01b5f52602160045260245ffd5b600319016080811261013357604080519161118583610be2565b126101335760405161119681610c47565b6004356001600160a01b03811681036101335781526024356001600160a01b0381168103610133576020820152815260443580151581036101335760208201526064356001600160801b038116810361013357604082015290565b602060031982011261013357600435906001600160401b0382116101335760609082900360031901126101335760040190565b9181601f84011215610133578235916001600160401b038311610133576020838186019501011161013357565b602081016020825282518091526040820191602060408360051b8301019401925f915b83831061128357505050505090565b90919293946020806112a1600193603f19868203018752895161106a565b97019301930191939290611274565b3580151581036101335790565b356001600160801b03811681036101335790565b903590601e198136030182121561013357018035906001600160401b0382116101335760200191813603831361013357565b91908260a09103126101335760405161131b81610c2c565b6080819361132881610c83565b835261133660208201610c83565b602084015261134760408201610cc2565b604084015261135860608201610cd2565b60608401520135906001600160a01b03821682036101335760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610510575f0390565b604051906113a382610c2c565b5f6080838281528260208201528260408201528260608201520152565b604051906113cd82610c2c565b5f6080836113d9611396565b8152826020820152606060408201528260608201520152565b604051906113ff82610be2565b5f604083606081528260208201520152565b903590601e198136030182121561013357018035906001600160401b03821161013357602001918160051b3603831361013357565b356001600160a01b03811681036101335790565b919081101561147c5760051b81013590609e1981360301821215610133570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610510575f0390565b9190820391821161051057565b604051906114bc602083610c62565b5f80835282815b8281106114cf57505050565b6020906114da6113c0565b828285010152016114c3565b906114f082610cab565b6114fd6040519182610c62565b828152809261150e601f1991610cab565b01905f5b82811061151e57505050565b6020906115296113c0565b82828501015201611512565b60405190611544602083610c62565b5f80835282815b82811061155757505050565b60209060405161156681610c11565b60405161157281610be2565b5f81525f848201525f604082015281525f838201525f60408201525f60608201528282850101520161154b565b906115a982610cab565b6115b66040519182610c62565b82815280926115c7601f1991610cab565b01905f5b8281106115d757505050565b6020906040516115e681610c11565b6040516115f281610be2565b5f81525f848201525f604082015281525f838201525f60408201525f6060820152828285010152016115cb565b9061162982610cab565b6116366040519182610c62565b8281528092611647601f1991610cab565b0190602036910137565b80511561147c5760200190565b80516001101561147c5760400190565b805182101561147c5760209160051b010190565b815180516001600160a01b03908116835260209182015116818301528201511515604080830191909152909101516001600160801b0316606082015260800190565b9190820180921161051057565b6001600160401b038111610bfd57601f01601f191660200190565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168015611fa95760608201928351519161172f5f936114e6565b845160208601516001600160a01b039182169792949116919082881015611f9f57879691965b6001600160a01b03169788149260209260408101925f5b8a51805182101561194457611782828e9261166e565b5162ffffff815116908881015160020b90604060018060a01b039101511691604051936117ae85610c2c565b845260018060a01b0388168a850152604084015260608301526080820152866001600160801b03875116604051906117e582610c11565b8382528a8383015260408201526040516117ff8382610c62565b5f815260608201528a6118665f60609381936118425a9761183460405194859263775f063560e11b90840152602483016134ca565b03601f198101845283610c62565b8d836040518096819582946348c8949160e01b845260048401526024830190610e54565b03925af19081611924575b5061191c57505061188b6118836123c6565b915a906114a0565b909b5b8c8901516001600160e01b0319166304d099ff60e21b0161191057906118c06118ba60019594936124a3565b9d613577565b604051926118cd84610c2c565b83528a8a8401526040516118e18b82610c62565b5f81526040840152606083015260808201526118fd828c61166e565b52611908818b61166e565b505b0161176c565b9b50505060019061190a565b91509b61188e565b61193f903d805f833e6119378183610c62565b810190613515565b611871565b505099509750505050505090611959906114e6565b905f905f5b81518110156119b8576080611973828461166e565b510151611983575b60010161195e565b916119b0600191611994858561166e565b5161199f828861166e565b526119aa818761166e565b506124a3565b92905061197b565b505050915b81516119d1906001600160a01b0316613366565b60208301519091906119eb906001600160a01b0316613366565b917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031615611f8c576060840193611a2b85515161161f565b935f5b86518051821015611a5e579062ffffff611a4a8260019461166e565b515116611a57828961166e565b5201611a2e565b50509193945091946001600160801b036040840151169060405196611a8288610c11565b6001600160a01b038681168952841660208901908152604089019384526060890188815297515f9791969190611ab79061159f565b995196516001600160a01b0397881697169384881015611f8557875b6001600160a01b0316978814965f5b8b518051821015611bd15762ffffff611afd8f92849061166e565b511660405190611b0c82610be2565b8c825260018060a01b038a1660208301526040820152611b506001600160801b038b511660405190611b3d82610be2565b8382528d60208301526040820152613612565b6020820151919e90916001600160e01b0319166304d099ff60e21b01611bc45790611b7c8593926124a3565b9e611b8690613577565b60405192611b9384610c11565b83528d602084015260408301526060820152611baf828461166e565b52611bb99161166e565b506001905b01611ae2565b9d50505050600190611bbe565b50509750979294509750979350611be8915061159f565b935f935f5b8451811015611c41576060611c02828761166e565b510151611c12575b600101611bed565b94611c39600191611c23888861166e565b51611c2e828b61166e565b526119aa818a61166e565b959050611c0a565b5093509390949150905b6001600160a01b038181169190841680831015611f7957505b5f966001600160a01b0391821692831496917f000000000000000000000000000000000000000000000000000000000000000016611ec5575b50611cab85518451906116c4565b91611cce611cc989151594855f14611ebd5760ff60015b16906116c4565b6114e6565b975f5b8751811015611d045780611ce76001928a61166e565b51611cf2828d61166e565b52611cfd818c61166e565b5001611cd1565b5090919296959493955f946020955b8a8951821015611e145760019190611e0d908b611e06611dff858e8e6001600160a01b03611d41848861166e565b51515116958a8060a01b0382611d57868461166e565b515101511662ffffff6040611d6c878561166e565b51510151169060405198611d7f8a610c2c565b89528389015260408801525f60608801526003608088015281611da2858361166e565b5101511515916060611dc3866040611dba828761166e565b5101519461166e565b5101519260405198611dd48a610c2c565b895281890152611de76040519182610c62565b5f8152604088015260608701526080860152516116c4565b809361166e565b528d61166e565b5001611d13565b50509296509296909450611e2a575b5050505050565b60405194611e3786610c2c565b85526001600160a01b031682850152610bb86040808601919091525f6060860152600260808601525193611e6a85610c2c565b845281840152611e7d6040519182610c62565b5f8152604083015260608201525f608082015282515f19810190811161051057611eb291611eab828661166e565b528361166e565b505f80808080611e23565b60ff5f611cc2565b6020611f2a916001600160801b036040805192611ee184610c47565b8784526001600160a01b038a1685850152015160405192911690611f0483610be2565b8252898383015260408201526040518093819263c587a0bf60e01b835260048301611682565b0381305afa5f9181611f45575b5015611c9d5796505f611c9d565b9091506020813d602011611f71575b81611f6160209383610c62565b810103126101335751905f611f37565b3d9150611f54565b91935050918092611c64565b8794611ad3565b611f999492919394611535565b90611c4b565b8792969196611755565b50611fb26114ad565b916119bd565b939493926020908215612105576101446401000276a4935b60405190611fdd82610be2565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b875261201a8d6004890190610e11565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af190811561058c575f916120d3575b5080945f8312145f146120cb5760801d5b600f0b036120b55750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b6120aa565b90506020813d6020116120fd575b816120ee60209383610c62565b8101031261013357515f612099565b3d91506120e1565b61014473fffd8963efd1fc6a506488495d951d5263988d2593611fd0565b61212b6113c0565b916121346113f2565b925f9261219261218c60018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361217685610c11565b84526020840152604083015260608201526116ec565b91612802565b908051158080916122c8575b156121ab57505050929190565b91959394909391156122885750506002926121c585611651565b51945b60015b845181101561220d5760606121e0828761166e565b5101516060850151106121f6575b6001016121cb565b92506001612204848661166e565b519390506121ee565b5092509260015b8351811015612256576020612229828661166e565b51015160208701511061223f575b600101612214565b9450600161224d868561166e565b51959050612237565b5091509291600382101561115757811561226c57565b606084015160208401519192501061228357600190565b600290565b909480925051155f146122a957506001926122a283611651565b51916121c8565b929093506122b682611651565b51906122c185611651565b51946121c8565b5082511561219e565b51906001600160701b038216820361013357565b90816060910312610133576122f9816122d1565b916040612308602084016122d1565b92015163ffffffff811681036101335790565b90612324611396565b5061232e82611446565b6001600160a01b0382811692908216808410156123bc57505b6001600160a01b031691821492602081013562ffffff811690819003610133576040820135918260020b80930361013357606001359260018060a01b038416809403610133576040519461239a86610c2c565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190612347565b3d156123f0573d906123d7826116d1565b916123e56040519384610c62565b82523d5f602084013e565b606090565b906123ff82610cab565b61240c6040519182610c62565b828152809261241d601f1991610cab565b01905f5b82811061242d57505050565b6020906124386113f2565b82828501015201612421565b604051606091906124558382610c62565b6002815291601f1901825f5b82811061246d57505050565b60209060405161247c81610c2c565b5f81525f838201525f60408201525f60608201526060608082015282828501015201612461565b5f1981146105105760010190565b5f60408201906124c28251516123f5565b915f915b81519283518110156127955785516001600160a01b039081169461252d91906124f090849061166e565b5116946001600160801b036060890151169560808901968751916040519361251785610c11565b8452602084015260408301526060820152612ab5565b948551156127885761253e86611651565b519460015b8751811015612585576060612558828a61166e565b51015160608801511161256e575b600101612543565b9550600161257c878961166e565b51969050612566565b50919396949550916125d260018060a01b036125a2868a5161166e565b5116602087019360018060a01b03855116906001600160801b0360608b0151169051916040519361251785610c11565b95865115612777576125e387611651565b519560015b885181101561262a5760606125fd828b61166e565b510151606089015111612613575b6001016125e8565b96506001612621888a61166e565b5197905061260b565b5097949298956001949750906127386127579392612646612444565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b0391015116906040860151926040519461268786610c2c565b85526020850152604084015260608301526080820152612705898060a01b036126b18a8d5161166e565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051976126ea89610c2c565b88526020880152604087015260608601526080850152611651565b5261270f8d611651565b506127198d61165e565b526127238c61165e565b506080806060830151940151910151906116c4565b906040519a6127468c610be2565b8b5260208b015260408a01526124a3565b96612762828761166e565b5261276d818661166e565b505b0191946124c6565b50969395929050600191945061276f565b945060019196935061276f565b509150506127a5919392506123f5565b5f805b84518110156127fc5760406127bd828761166e565b5101516127cd575b6001016127a8565b906127f46001916127de848861166e565b516127e9828761166e565b526119aa818661166e565b9190506127c5565b50509150565b5f604082016128128151516123f5565b915f905b8251918251811015612a645785516001600160a01b0390811693612867919061284090849061166e565b5116936001600160801b036060890151169460808901958651916040519361217685610c11565b94855115612a575761287886611651565b519460015b87518110156128bf576060612892828a61166e565b5101516060880151106128a8575b60010161287d565b955060016128b6878961166e565b519690506128a0565b509193969495509161290c60018060a01b036128dc86855161166e565b5116602087019860018060a01b038a5116906001600160801b0360608b0151169051916040519361217685610c11565b95865115612a465761291d87611651565b519560015b8851811015612964576060612937828b61166e565b51015160608901511061294d575b600101612922565b9650600161295b888a61166e565b51979050612945565b509798949295600194975090612738612a269392612980612444565b809c6127058b6129978a8c8060a01b03925161166e565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051966129d088610c2c565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b039101511690604088015192604051976126ea89610c2c565b96612a31828761166e565b52612a3c818661166e565b505b019094612816565b509692909395506001919450612a3e565b9450600191969250612a3e565b50915050612a74919392506123f5565b5f805b84518110156127fc576040612a8c828761166e565b510151612a9c575b600101612a77565b90612aad6001916127de848861166e565b919050612a94565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031680156131c4576060830180515191612af85f936114e6565b855160208701516001600160a01b03908116979294911691878310156131bb5782979691965b6001600160a01b03169283149260209260408301925f5b8a518051821015612cc557612b4b828e9261166e565b5162ffffff815116908881015160020b90604060018060a01b03910151169160405193612b7785610c2c565b60018060a01b03168452878a850152604084015260608301526080820152866001600160801b0387511660405190612bae82610c11565b8382528a838301526040820152604051612bc88382610c62565b5f815260608201528a612bfd5f60609381936118425a9761183460405194859263595323f560e01b90840152602483016134ca565b03925af19081612cad575b50612ca5575050612c1a6118836123c6565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01612c995790612c496118ba60019594936124a3565b60405192612c5684610c2c565b83528a8a840152604051612c6a8b82610c62565b5f8152604084015260608301526080820152612c86828c61166e565b52612c91818b61166e565b505b01612b35565b9b505050600190612c93565b91509b612c1d565b612cc0903d805f833e6119378183610c62565b612c08565b505099509750505050505090612cda906114e6565b905f905f5b8151811015612d1d576080612cf4828461166e565b510151612d04575b600101612cdf565b91612d15600191611994858561166e565b929050612cfc565b505050905b8251612d36906001600160a01b0316613366565b6020840151909190612d50906001600160a01b0316613366565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316156131a9576060850193612d8f85515161161f565b935f5b86518051821015612dc2579062ffffff612dae8260019461166e565b515116612dbb828961166e565b5201612d92565b50509193945091946001600160801b036040820151169060405196612de688610c11565b6001600160a01b038481168952861660208901908152604089019384526060890188815297515f9791939190612e1b9061159f565b995193516001600160a01b0390811697941693878510156131a35784975b6001600160a01b0316948514965f5b8b518051821015612f375762ffffff612e638f92849061166e565b511660405190612e7282610be2565b60018060a01b038d1682528960208301526040820152612eb66001600160801b038b511660405190612ea382610be2565b8382528d602083015260408201526137a5565b6020820151919e90916001600160e01b0319166304d099ff60e21b01612f2a5790612ee28593926124a3565b9e612eec90613577565b60405192612ef984610c11565b83528d602084015260408301526060820152612f15828461166e565b52612f1f9161166e565b506001905b01612e48565b9d50505050600190612f24565b50509750979294509750979350612f4e915061159f565b935f935f5b8451811015612f91576060612f68828761166e565b510151612f78575b600101612f53565b94612f89600191611c23888861166e565b959050612f70565b5093509390949150905b6001600160a01b03838116939082168085101561319a5750905b5f966001600160a01b0391821694851496917f0000000000000000000000000000000000000000000000000000000000000000166130e5575b50612ffc85518451906116c4565b91613016611cc989151594855f14611ebd576001906116c4565b975f5b875181101561304c578061302f6001928a61166e565b5161303a828d61166e565b52613045818c61166e565b5001613019565b5090919296959493955f946020955b8a89518210156130905760019190613089908b611e06611dff858e8e6001600160a01b03611d41848861166e565b500161305b565b505092965092969094506130a5575050505050565b604051946130b286610c2c565b6001600160a01b0316855282850152610bb86040808601919091525f6060860152600260808601525193611e6a85610c2c565b602061314b916001600160801b03604080519261310184610c47565b6001600160a01b03881684528484018a905201516040519291169061312583610be2565b82528983830152604082015260405180938192630d05560d60e31b835260048301611682565b0381305afa5f9181613166575b5015612fee5796505f612fee565b9091506020813d602011613192575b8161318260209383610c62565b810103126101335751905f613158565b3d9150613175565b91505082612fb5565b84612e39565b6131b593929193611535565b90612f9b565b82969196612b1e565b506131cd6114ad565b90612d22565b6131db6113c0565b916131e46113f2565b925f9261322c61322660018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361251785610c11565b916124b1565b9080511580809161335d575b1561324557505050929190565b919593949093911561331d57505060029261325f85611651565b51945b60015b84518110156132a757606061327a828761166e565b510151606085015111613290575b600101613265565b9250600161329e848661166e565b51939050613288565b5092509260015b83518110156132f05760206132c3828661166e565b5101516020870151116132d9575b6001016132ae565b945060016132e7868561166e565b519590506132d1565b5091509291600382101561115757811561330657565b606084015160208401519192501161228357600190565b909480925051155f1461333e575060019261333783611651565b5191613262565b9290935061334b82611651565b519061335685611651565b5194613262565b50825115613238565b6001600160a01b0381166133a257507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690565b90565b61343f90602081519101516040519060208201926bffffffffffffffffffffffff199060601b1683526bffffffffffffffffffffffff199060601b166034820152602881526133f5604882610c62565b5190206040516001600160f81b03196020820190815260609490941b6bffffffffffffffffffffffff19166021820152603581019190915260558101939093528260758101611834565b905190206001600160a01b031690565b8181029291811591840414171561051057565b811561346c570490565b634e487b7160e01b5f52601260045260245ffd5b61343f9060018060a01b038151169062ffffff604060018060a01b0360208401511692015116604051916020830193845260408301526060820152606081526133f5608082610c62565b61012060606133a293602084526134e5602085018251610e11565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610e54565b602081830312610133578051906001600160401b038211610133570181601f8201121561013357805190613548826116d1565b926135566040519485610c62565b8284526020838301011161013357815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b0161359a576024015190565b6040516306190b2b60e41b8152602060048201529081906135bf906024830190610e54565b0390fd5b9190826040910312610133576020825192015190565b6001600160a01b039182168152911515602083015260408201929092529116606082015260a0608082018190526133a292910190610e54565b80516060905f906001600160a01b039061366f907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b1692833b1561377857604060208201511515915a95831561375d576401000276a4915b5f6001600160801b03858301511691519562ffffff8680519860018060a01b0381511660208b015260018060a01b03602082015116828b0152015116606088015260016080880152608087526136e960a088610c62565b613709865197889687958694630251596160e31b865230600487016135d9565b03925af1908161372f575b5061372a5750506137266118836123c6565b9091565b915091565b6137509060403d604011613756575b6137488183610c62565b8101906135c3565b50613714565b503d61373e565b73fffd8963efd1fc6a506488495d951d5263988d2591613692565b505050604051906373913ebd60e01b60208301526024820152602481526137a0604482610c62565b905f90565b80516060905f906001600160a01b0390613802907f0000000000000000000000000000000000000000000000000000000000000000907f000000000000000000000000000000000000000000000000000000000000000090613480565b1692833b1561377857604060208201511515915a958315613881576401000276a4915b5f61383b6001600160801b038684015116611490565b9151855181516001600160a01b0390811660208084019190915283015116818801529086015162ffffff16606082015260808082018390528152956136e960a088610c62565b73fffd8963efd1fc6a506488495d951d5263988d259161382556fea164736f6c634300081a000a" as Hex;
export const MetaQuoter = {
    abi,
    bytecode,
    deployedBytecode,
};
