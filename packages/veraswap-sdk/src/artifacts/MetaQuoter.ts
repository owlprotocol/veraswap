import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "_factory", type: "address", internalType: "address" },
        { name: "_poolInitCodeHash", type: "bytes32", internalType: "bytes32" },
        { name: "_poolManager", type: "address", internalType: "contract IPoolManager" },
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
export const factory = {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
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
export const poolInitCodeHash = {
    type: "function",
    name: "poolInitCodeHash",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const poolManager = {
    type: "function",
    name: "poolManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPoolManager" }],
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
export const InvalidCallbackAddress = {
    type: "error",
    name: "InvalidCallbackAddress",
    inputs: [
        { name: "msgSender", type: "address", internalType: "address" },
        { name: "expectedPoolAddress", type: "address", internalType: "address" },
    ],
} as const;
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
export const functions = [
    _constructor,
    _quoteExactInput,
    _quoteExactInputSingle,
    _quoteExactOutput,
    _quoteExactOutputSingle,
    factory,
    metaQuoteExactInput,
    metaQuoteExactInputBest,
    metaQuoteExactInputSingle,
    metaQuoteExactOutput,
    metaQuoteExactOutputBest,
    metaQuoteExactOutputSingle,
    poolInitCodeHash,
    poolManager,
    uniswapV3SwapCallback,
    unlockCallback,
] as const;
export const events = [] as const;
export const errors = [
    InvalidCallbackAddress,
    NotEnoughLiquidity,
    NotPoolManager,
    NotSelf,
    PoolDoesNotExist,
    QuoteSwap,
    UnexpectedCallSuccess,
    UnexpectedRevertBytes,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60e0346100e657601f612e3d38819003918201601f19168301916001600160401b038311848410176100ea578084926060946040528339810103126100e6578051906001600160a01b03821682036100e6576020810151604090910151916001600160a01b03831683036100e65760805260a05260c052604051612d3e90816100ff82396080518181816101d7015281816103cb01528181612adf0152612c72015260a0518181816101b50152818161039301528181612abd0152612c50015260c05181818161034d0152818161058401528181611116015281816117c6015261221a0152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60806040526004361015610011575f80fd5b5f3560e01c806304837ce3146107a1578063595323f5146107165780636036742c146106eb5780636a36a38c146105fd57806391dd734614610551578063aa2f150114610438578063ab1edd9d1461041f578063c2c04613146103fa578063c45a0155146103b6578063d64efe911461037c578063dc4c90d314610338578063e991282e14610313578063eebe0c6a1461026e578063fa461e33146101005763fc1ed6d6146100be575f80fd5b346100fc576100f86100e96100d236610b13565b6100da610ef7565b506100e3610f29565b506126ae565b60409391935193849384610cde565b0390f35b5f80fd5b346100fc5760603660031901126100fc576024356004356044356001600160401b0381116100fc57610136903690600401610d5b565b5f839492941390818015610265575b156100fc578490810103608081126100fc576060136100fc5760606040519461016d866107ba565b61017681610840565b865261018460208201610840565b60208701526101956040820161087f565b604087015201359384151585036100fc576001600160a01b03906101fc907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1680330361024f57501561023f5761021390610fc7565b915b1561022d5750633b2f660160e21b5f5260045260245ffd5b633b2f660160e21b5f5260045260245ffd5b9061024990610fc7565b91610215565b6352f0ffb560e11b5f523360045260245260445ffd5b505f8313610145565b346100fc5761027c36610adf565b30330361030457806102df6102d96102d460a06001600160801b039501936102a385610de7565b6102bc876102b360c08501610df4565b16600f0b610fc7565b906102ca60e0840184610e08565b9490933690610e3a565b611715565b91610de7565b156102fa5781165b633b2f660160e21b5f521660045260245ffd5b60801d81166102e7565b6314e1dbf760e11b5f5260045ffd5b346100fc576100f861032c6103273661093d565b6121d3565b60405191829182610a80565b346100fc575f3660031901126100fc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100fc575f3660031901126100fc5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346100fc575f3660031901126100fc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100fc576100f861041361040e36610b13565b611f20565b60405191829182610d88565b346100fc576100f861041361043336610b13565b611bcf565b346100fc5761044636610d28565b303303610304576020810161045b8183610f48565b905061046960408401610df4565b9161047384610f7d565b9190815b610497576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926104a48286610f48565b91905f198501858111610523576104d46104cd6001600160801b0392610512966104f095610f91565b9788611a39565b93906104e360808a018a610e08565b9390921690851590611715565b90156105375761050290600f0b610ead565b6001600160801b03165b93610f7d565b918015610523575f19019081610477565b634e487b7160e01b5f52601160045260245ffd5b6105439060801d610ead565b6001600160801b031661050c565b346100fc5760203660031901126100fc576004356001600160401b0381116100fc57610581903690600401610d5b565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036105ee575f8281928160405192839283378101838152039082305af16105d2611ae4565b906105df57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100fc5761060b36610d28565b3033036103045760208101906106218282610f48565b905061062f60408301610df4565b9161063981610f7d565b935f915b838310610660576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936106cf6001600160801b036106b96106a460019461069661068f8a6106898b8b610f48565b90610f91565b9b8c611a39565b948593919216600f0b610fc7565b6106b160808d018d610e08565b939092611715565b90156106da576001600160801b03165b96610f7d565b95949301919061063d565b60801d6001600160801b03166106c9565b346100fc576100f86100e96106ff36610b13565b610707610ef7565b50610710610f29565b5061188b565b346100fc5761072436610adf565b30330361030457806107676102d96102d460a06001600160801b0395019361074b85610de7565b8661075860c08401610df4565b16906102ca60e0840184610e08565b1561078e576107789060801d610ead565b633b2f660160e21b5f9081529116600452602490fd5b61079a90600f0b610ead565b81166102e7565b346100fc576100f861032c6107b53661093d565b6110be565b606081019081106001600160401b038211176107d557604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176107d557604052565b60a081019081106001600160401b038211176107d557604052565b90601f801991011681019081106001600160401b038211176107d557604052565b35906001600160a01b03821682036100fc57565b35906001600160801b03821682036100fc57565b6001600160401b0381116107d55760051b60200190565b359062ffffff821682036100fc57565b35908160020b82036100fc57565b81601f820112156100fc578035906108b482610868565b926108c2604051948561081f565b828452602060608186019402830101918183116100fc57602001925b8284106108ec575050505090565b6060848303126100fc576020606091604051610907816107ba565b6109108761087f565b815261091d83880161088f565b8382015261092d60408801610840565b60408201528152019301926108de565b60206003198201126100fc576004356001600160401b0381116100fc57608081830360031901126100fc5760405191610975836107e9565b61098182600401610840565b835261098f60248301610840565b60208401526109a060448301610854565b60408401526064820135916001600160401b0383116100fc576109c6920160040161089d565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b90610a418183516109ce565b6020820151151560a08201526101006080610a6d604085015161012060c0860152610120850190610a11565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610ab257505050505090565b9091929394602080610ad0600193603f198682030187528951610a35565b97019301930191939290610aa3565b60206003198201126100fc57600435906001600160401b0382116100fc576101009082900360031901126100fc5760040190565b60206003198201126100fc576004356001600160401b0381116100fc5760a081830360031901126100fc5760405191610b4b83610804565b610b5782600401610840565b8352610b6560248301610840565b602084015260448201356001600160401b0381116100fc578201816023820112156100fc57600481013590610b9982610868565b91610ba7604051938461081f565b808352602060048185019260051b84010101918483116100fc57602401905b828210610c0f575050506040840152610be160648301610854565b60608401526084820135916001600160401b0383116100fc57610c07920160040161089d565b608082015290565b60208091610c1c84610840565b815201910190610bc6565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b828210610c7057505050506040816020829301516020850152015191015290565b90919295602080610cd0600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610a11565b980192019201909291610c4f565b939291610cf6610d0492606087526060870190610a35565b908582036020870152610c27565b926003821015610d145760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100fc57600435906001600160401b0382116100fc5760609082900360031901126100fc5760040190565b9181601f840112156100fc578235916001600160401b0383116100fc57602083818601950101116100fc57565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610dba57505050505090565b9091929394602080610dd8600193603f198682030187528951610c27565b97019301930191939290610dab565b3580151581036100fc5790565b356001600160801b03811681036100fc5790565b903590601e19813603018212156100fc57018035906001600160401b0382116100fc576020019181360383136100fc57565b91908260a09103126100fc57604051610e5281610804565b60808193610e5f81610840565b8352610e6d60208201610840565b6020840152610e7e6040820161087f565b6040840152610e8f6060820161088f565b60608401520135906001600160a01b03821682036100fc5760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610523575f0390565b60405190610eda82610804565b5f6080838281528260208201528260408201528260608201520152565b60405190610f0482610804565b5f608083610f10610ecd565b8152826020820152606060408201528260608201520152565b60405190610f36826107ba565b5f604083606081528260208201520152565b903590601e19813603018212156100fc57018035906001600160401b0382116100fc57602001918160051b360383136100fc57565b356001600160a01b03811681036100fc5790565b9190811015610fb35760051b81013590609e19813603018212156100fc570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610523575f0390565b9190820391821161052357565b90610fee82610868565b610ffb604051918261081f565b828152809261100c601f1991610868565b0190602036910137565b805115610fb35760200190565b805160011015610fb35760400190565b8051821015610fb35760209160051b010190565b9190820180921161052357565b9061105e82610868565b61106b604051918261081f565b828152809261107c601f1991610868565b01905f5b82811061108c57505050565b602090611097610ef7565b82828501015201611080565b6001600160401b0381116107d557601f01601f191660200190565b6060810190815151906110d15f92611054565b815160208301805192966001600160a01b03928316949093909216918285101561170b57849691965b60018060a01b0316809514925f92604083019260018060a01b037f000000000000000000000000000000000000000000000000000000000000000016966020955b83518051821015611317578a6111538f928490611033565b5162ffffff815116908a81015160020b90604060018060a01b0391015116916040519361117f85610804565b845260018060a01b038a168c8501526040840152606083015260808201526001600160801b03885116604051906111b5826107e9565b8282528b8b83015260408201526040516111cf8b8261081f565b5f815260608201528b8a6112365f61120560609482946112135a9860405194859163775f063560e11b858401526024830161295c565b03601f19810185528461081f565b836040518096819582946348c8949160e01b845260048401526024830190610a11565b03925af190816112f7575b506112ee57505061125b611253611ae4565b915a90610fd7565b909d8e5b8b01516001600160e01b0319166304d099ff60e21b016112e15790611285859392611bc1565b9e61128f90612a0c565b6040519261129c84610804565b83528c8c8401526040516112b08d8261081f565b5f81526040840152606083015260808201526112cc8284611033565b526112d691611033565b506001905b0161113b565b9d505050506001906112db565b91509d8e61125f565b611312903d805f833e61130a818361081f565b8101906129aa565b611241565b505099989250999550935061132d919550611054565b945f945f5b855181101561138c5760806113478288611033565b510151611357575b600101611332565b956113846001916113688989611033565b51611373828c611033565b5261137e818b611033565b50611bc1565b96905061134f565b5092969195935093506113a0865151610fe4565b945f5b875180518210156113d3579062ffffff6113bf82600194611033565b5151166113cc828a611033565b52016113a3565b50509651935191516040519795965092946001600160a01b0392831694919390926001600160801b03909116911661140a886107e9565b8752818701938452604087019081526060870195808752519461142d5f96612841565b975194516001600160a01b039586169516908186101561170457855b6001600160a01b0316958614945f5b8951805182101561153f576114718262ffffff92611033565b511660405190611480826107ba565b89825260018060a01b0386168883015260408201528b6114c36001600160801b03885116604051906114b1826107ba565b8482528b8b8301526040820152612aa7565b909b633b2f660160e21b8d8b63ffffffff60e01b9101511603611532579380939261151f926114fc6114f6600198611bc1565b9f612a0c565b60405195611509876107e9565b86528d8d87015260408601526060850152611033565b5261152a818d611033565b505b01611458565b9b5050505060019061152c565b5050975094505050926115529150612841565b915f915f5b86518110156115ab57606061156c8289611033565b51015161157c575b600101611557565b926115a360019161158d868a611033565b516115988289611033565b5261137e8188611033565b939050611574565b509294509290506115c76115c28351865190611047565b611054565b935f5b83518110156115fd57806115e060019286611033565b516115eb8289611033565b526115f68188611033565b50016115ca565b509190925f5b83518110156116fe576001906116f76001600160a01b036116248388611033565b51515116838060a01b0385611639858a611033565b515101511662ffffff604061164e868b611033565b5151015116906040519261166184610804565b83528683015260408201525f606082015260036080820152846116848489611033565b51015115156040611695858a611033565b51015160606116a4868b611033565b51015191604051936116b585610804565b8452878401526040516116c8888261081f565b5f81526040840152606083015260808201526116e5838751611047565b906116f0828b611033565b5288611033565b5001611603565b50505050565b8591611449565b84929691966110fa565b93949392602090821561186d576101446401000276a4935b6040519061173a826107ba565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b87526117778d60048901906109ce565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115611862575f91611830575b5080945f8312145f146118285760801d5b600f0b036118125750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b611807565b90506020813d60201161185a575b8161184b6020938361081f565b810103126100fc57515f6117f6565b3d915061183e565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d259361172d565b611893610ef7565b9161189c610f29565b925f926118fa6118f460018060a01b0383511660018060a01b036020850151166080850151906001600160801b0360608701511690604051936118de856107e9565b84526020840152604083015260608201526110be565b91611f20565b90805115808091611a30575b1561191357505050929190565b91959394909391156119f057505060029261192d85611016565b51945b60015b84518110156119755760606119488287611033565b51015160608501511061195e575b600101611933565b9250600161196c8486611033565b51939050611956565b5092509260015b83518110156119be5760206119918286611033565b5101516020870151106119a7575b60010161197c565b945060016119b58685611033565b5195905061199f565b50915092916003821015610d145781156119d457565b60608401516020840151919250106119eb57600190565b600290565b909480925051155f14611a115750600192611a0a83611016565b5191611930565b92909350611a1e82611016565b5190611a2985611016565b5194611930565b50825115611906565b90611a42610ecd565b50611a4c82610f7d565b6001600160a01b038281169290821680841015611ada57505b6001600160a01b031691821492602081013562ffffff8116908190036100fc576040820135918260020b8093036100fc57606001359260018060a01b0384168094036100fc5760405194611ab886610804565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190611a65565b3d15611b0e573d90611af5826110a3565b91611b03604051938461081f565b82523d5f602084013e565b606090565b90611b1d82610868565b611b2a604051918261081f565b8281528092611b3b601f1991610868565b01905f5b828110611b4b57505050565b602090611b56610f29565b82828501015201611b3f565b60405160609190611b73838261081f565b6002815291601f1901825f5b828110611b8b57505050565b602090604051611b9a81610804565b5f81525f838201525f60408201525f60608201526060608082015282828501015201611b7f565b5f1981146105235760010190565b5f6040820190611be0825151611b13565b915f915b8151928351811015611eb35785516001600160a01b0390811694611c4b9190611c0e908490611033565b5116946001600160801b0360608901511695608089019687519160405193611c35856107e9565b84526020840152604083015260608201526121d3565b94855115611ea657611c5c86611016565b519460015b8751811015611ca3576060611c76828a611033565b510151606088015111611c8c575b600101611c61565b95506001611c9a8789611033565b51969050611c84565b5091939694955091611cf060018060a01b03611cc0868a51611033565b5116602087019360018060a01b03855116906001600160801b0360608b01511690519160405193611c35856107e9565b95865115611e9557611d0187611016565b519560015b8851811015611d48576060611d1b828b611033565b510151606089015111611d31575b600101611d06565b96506001611d3f888a611033565b51979050611d29565b509794929895600194975090611e56611e759392611d64611b62565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b03910151169060408601519260405194611da586610804565b85526020850152604084015260608301526080820152611e23898060a01b03611dcf8a8d51611033565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a01519260405197611e0889610804565b88526020880152604087015260608601526080850152611016565b52611e2d8d611016565b50611e378d611023565b52611e418c611023565b50608080606083015194015191015190611047565b906040519a611e648c6107ba565b8b5260208b015260408a0152611bc1565b96611e808287611033565b52611e8b8186611033565b505b019194611be4565b509693959290506001919450611e8d565b9450600191969350611e8d565b50915050611ec391939250611b13565b5f805b8451811015611f1a576040611edb8287611033565b510151611eeb575b600101611ec6565b90611f12600191611efc8488611033565b51611f078287611033565b5261137e8186611033565b919050611ee3565b50509150565b5f60408201611f30815151611b13565b915f905b82519182518110156121825785516001600160a01b0390811693611f859190611f5e908490611033565b5116936001600160801b03606089015116946080890195865191604051936118de856107e9565b9485511561217557611f9686611016565b519460015b8751811015611fdd576060611fb0828a611033565b510151606088015110611fc6575b600101611f9b565b95506001611fd48789611033565b51969050611fbe565b509193969495509161202a60018060a01b03611ffa868551611033565b5116602087019860018060a01b038a5116906001600160801b0360608b015116905191604051936118de856107e9565b958651156121645761203b87611016565b519560015b8851811015612082576060612055828b611033565b51015160608901511061206b575b600101612040565b96506001612079888a611033565b51979050612063565b509798949295600194975090611e56612144939261209e611b62565b809c611e238b6120b58a8c8060a01b039251611033565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051966120ee88610804565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408801519260405197611e0889610804565b9661214f8287611033565b5261215a8186611033565b505b019094611f34565b50969290939550600191945061215c565b945060019196925061215c565b5091505061219291939250611b13565b5f805b8451811015611f1a5760406121aa8287611033565b5101516121ba575b600101612195565b906121cb600191611efc8488611033565b9190506121b2565b6060810190815151906121e65f92611054565b815160208301805192966001600160a01b0393841694909390921691848310156126a55782949691965b6001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811695911693841493602093604084019391929091905f5b835180518210156123ec578a6122698f928490611033565b5162ffffff815116908a81015160020b90604060018060a01b0391015116916040519361229585610804565b60018060a01b03168452898c8501526040840152606083015260808201526001600160801b03885116604051906122cb826107e9565b8282528b8b83015260408201526040516122e58b8261081f565b5f815260608201528b8a61231b5f61120560609482946112135a9860405194859163595323f560e01b858401526024830161295c565b03925af190816123d4575b506123cb575050612338611253611ae4565b909d8e5b8b01516001600160e01b0319166304d099ff60e21b016123be5790612362859392611bc1565b9e61236c90612a0c565b6040519261237984610804565b83528c8c84015260405161238d8d8261081f565b5f81526040840152606083015260808201526123a98284611033565b526123b391611033565b506001905b01612251565b9d505050506001906123b8565b91509d8e61233c565b6123e7903d805f833e61130a818361081f565b612326565b5050999892509995509350612402919550611054565b945f945f5b855181101561244557608061241c8288611033565b51015161242c575b600101612407565b9561243d6001916113688989611033565b969050612424565b5093509350939094612458865151610fe4565b945f5b8751805182101561248b579062ffffff61247782600194611033565b515116612484828a611033565b520161245b565b5050965193519251604051979596506001600160a01b0393841695929491936001600160801b0390911691166124c0886107e9565b875281870194855260408701908152606087019580875251946124e35f96612841565b975190516001600160a01b03908116959116908582101561269f5781955b6001600160a01b0316918214945f5b895180518210156125ce576125298262ffffff92611033565b511660405190612538826107ba565b60018060a01b038a168252858883015260408201528b61257b6001600160801b0388511660405190612569826107ba565b8482528b8b8301526040820152612c3a565b909b633b2f660160e21b8d8b63ffffffff60e01b91015116036125c157938093926125ae926114fc6114f6600198611bc1565b526125b9818d611033565b505b01612510565b9b505050506001906125bb565b5050975094505050926125e19150612841565b915f915f5b86518110156126245760606125fb8289611033565b51015161260b575b6001016125e6565b9261261c60019161158d868a611033565b939050612603565b5092945092905061263b6115c28351865190611047565b935f5b8351811015612671578061265460019286611033565b5161265f8289611033565b5261266a8188611033565b500161263e565b509190925f5b83518110156116fe576001906126986001600160a01b036116248388611033565b5001612677565b81612501565b82969196612210565b6126b6610ef7565b916126bf610f29565b925f9261270761270160018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611c35856107e9565b91611bcf565b90805115808091612838575b1561272057505050929190565b91959394909391156127f857505060029261273a85611016565b51945b60015b84518110156127825760606127558287611033565b51015160608501511161276b575b600101612740565b925060016127798486611033565b51939050612763565b5092509260015b83518110156127cb57602061279e8286611033565b5101516020870151116127b4575b600101612789565b945060016127c28685611033565b519590506127ac565b50915092916003821015610d145781156127e157565b60608401516020840151919250116119eb57600190565b909480925051155f14612819575060019261281283611016565b519161273d565b9290935061282682611016565b519061283185611016565b519461273d565b50825115612713565b9061284b82610868565b612858604051918261081f565b8281528092612869601f1991610868565b01905f5b82811061287957505050565b602090604051612888816107e9565b604051612894816107ba565b5f81525f848201525f604082015281525f838201525f60408201525f60608201528282850101520161286d565b60018060a01b038151169062ffffff604060018060a01b03602084015116920151166040519160208301938452604083015260608201526060815261290760808261081f565b5190209160405192602084019260ff60f81b84526bffffffffffffffffffffffff199060601b166021850152603584015260558301526055825261294c60758361081f565b905190206001600160a01b031690565b61012060606129a793602084526129776020850182516109ce565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610a11565b90565b6020818303126100fc578051906001600160401b0382116100fc570181601f820112156100fc578051906129dd826110a3565b926129eb604051948561081f565b828452602083830101116100fc57815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b01612a2f576024015190565b6040516306190b2b60e41b815260206004820152908190612a54906024830190610a11565b0390fd5b91908260409103126100fc576020825192015190565b6001600160a01b039182168152911515602083015260408201929092529116606082015260a0608082018190526129a792910190610a11565b80516060905f906001600160a01b0390612b04907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1692833b15612c0d57604060208201511515915a958315612bf2576401000276a4915b5f6001600160801b03858301511691519562ffffff8680519860018060a01b0381511660208b015260018060a01b03602082015116828b015201511660608801526001608088015260808752612b7e60a08861081f565b612b9e865197889687958694630251596160e31b86523060048701612a6e565b03925af19081612bc4575b50612bbf575050612bbb611253611ae4565b9091565b915091565b612be59060403d604011612beb575b612bdd818361081f565b810190612a58565b50612ba9565b503d612bd3565b73fffd8963efd1fc6a506488495d951d5263988d2591612b27565b505050604051906373913ebd60e01b6020830152602482015260248152612c3560448261081f565b905f90565b80516060905f906001600160a01b0390612c97907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1692833b15612c0d57604060208201511515915a958315612d16576401000276a4915b5f612cd06001600160801b038684015116610fc7565b9151855181516001600160a01b0390811660208084019190915283015116818801529086015162ffffff1660608201526080808201839052815295612b7e60a08861081f565b73fffd8963efd1fc6a506488495d951d5263988d2591612cba56fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c806304837ce3146107a1578063595323f5146107165780636036742c146106eb5780636a36a38c146105fd57806391dd734614610551578063aa2f150114610438578063ab1edd9d1461041f578063c2c04613146103fa578063c45a0155146103b6578063d64efe911461037c578063dc4c90d314610338578063e991282e14610313578063eebe0c6a1461026e578063fa461e33146101005763fc1ed6d6146100be575f80fd5b346100fc576100f86100e96100d236610b13565b6100da610ef7565b506100e3610f29565b506126ae565b60409391935193849384610cde565b0390f35b5f80fd5b346100fc5760603660031901126100fc576024356004356044356001600160401b0381116100fc57610136903690600401610d5b565b5f839492941390818015610265575b156100fc578490810103608081126100fc576060136100fc5760606040519461016d866107ba565b61017681610840565b865261018460208201610840565b60208701526101956040820161087f565b604087015201359384151585036100fc576001600160a01b03906101fc907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1680330361024f57501561023f5761021390610fc7565b915b1561022d5750633b2f660160e21b5f5260045260245ffd5b633b2f660160e21b5f5260045260245ffd5b9061024990610fc7565b91610215565b6352f0ffb560e11b5f523360045260245260445ffd5b505f8313610145565b346100fc5761027c36610adf565b30330361030457806102df6102d96102d460a06001600160801b039501936102a385610de7565b6102bc876102b360c08501610df4565b16600f0b610fc7565b906102ca60e0840184610e08565b9490933690610e3a565b611715565b91610de7565b156102fa5781165b633b2f660160e21b5f521660045260245ffd5b60801d81166102e7565b6314e1dbf760e11b5f5260045ffd5b346100fc576100f861032c6103273661093d565b6121d3565b60405191829182610a80565b346100fc575f3660031901126100fc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100fc575f3660031901126100fc5760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346100fc575f3660031901126100fc576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100fc576100f861041361040e36610b13565b611f20565b60405191829182610d88565b346100fc576100f861041361043336610b13565b611bcf565b346100fc5761044636610d28565b303303610304576020810161045b8183610f48565b905061046960408401610df4565b9161047384610f7d565b9190815b610497576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926104a48286610f48565b91905f198501858111610523576104d46104cd6001600160801b0392610512966104f095610f91565b9788611a39565b93906104e360808a018a610e08565b9390921690851590611715565b90156105375761050290600f0b610ead565b6001600160801b03165b93610f7d565b918015610523575f19019081610477565b634e487b7160e01b5f52601160045260245ffd5b6105439060801d610ead565b6001600160801b031661050c565b346100fc5760203660031901126100fc576004356001600160401b0381116100fc57610581903690600401610d5b565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036105ee575f8281928160405192839283378101838152039082305af16105d2611ae4565b906105df57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100fc5761060b36610d28565b3033036103045760208101906106218282610f48565b905061062f60408301610df4565b9161063981610f7d565b935f915b838310610660576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936106cf6001600160801b036106b96106a460019461069661068f8a6106898b8b610f48565b90610f91565b9b8c611a39565b948593919216600f0b610fc7565b6106b160808d018d610e08565b939092611715565b90156106da576001600160801b03165b96610f7d565b95949301919061063d565b60801d6001600160801b03166106c9565b346100fc576100f86100e96106ff36610b13565b610707610ef7565b50610710610f29565b5061188b565b346100fc5761072436610adf565b30330361030457806107676102d96102d460a06001600160801b0395019361074b85610de7565b8661075860c08401610df4565b16906102ca60e0840184610e08565b1561078e576107789060801d610ead565b633b2f660160e21b5f9081529116600452602490fd5b61079a90600f0b610ead565b81166102e7565b346100fc576100f861032c6107b53661093d565b6110be565b606081019081106001600160401b038211176107d557604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176107d557604052565b60a081019081106001600160401b038211176107d557604052565b90601f801991011681019081106001600160401b038211176107d557604052565b35906001600160a01b03821682036100fc57565b35906001600160801b03821682036100fc57565b6001600160401b0381116107d55760051b60200190565b359062ffffff821682036100fc57565b35908160020b82036100fc57565b81601f820112156100fc578035906108b482610868565b926108c2604051948561081f565b828452602060608186019402830101918183116100fc57602001925b8284106108ec575050505090565b6060848303126100fc576020606091604051610907816107ba565b6109108761087f565b815261091d83880161088f565b8382015261092d60408801610840565b60408201528152019301926108de565b60206003198201126100fc576004356001600160401b0381116100fc57608081830360031901126100fc5760405191610975836107e9565b61098182600401610840565b835261098f60248301610840565b60208401526109a060448301610854565b60408401526064820135916001600160401b0383116100fc576109c6920160040161089d565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b90610a418183516109ce565b6020820151151560a08201526101006080610a6d604085015161012060c0860152610120850190610a11565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610ab257505050505090565b9091929394602080610ad0600193603f198682030187528951610a35565b97019301930191939290610aa3565b60206003198201126100fc57600435906001600160401b0382116100fc576101009082900360031901126100fc5760040190565b60206003198201126100fc576004356001600160401b0381116100fc5760a081830360031901126100fc5760405191610b4b83610804565b610b5782600401610840565b8352610b6560248301610840565b602084015260448201356001600160401b0381116100fc578201816023820112156100fc57600481013590610b9982610868565b91610ba7604051938461081f565b808352602060048185019260051b84010101918483116100fc57602401905b828210610c0f575050506040840152610be160648301610854565b60608401526084820135916001600160401b0383116100fc57610c07920160040161089d565b608082015290565b60208091610c1c84610840565b815201910190610bc6565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b828210610c7057505050506040816020829301516020850152015191015290565b90919295602080610cd0600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610a11565b980192019201909291610c4f565b939291610cf6610d0492606087526060870190610a35565b908582036020870152610c27565b926003821015610d145760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100fc57600435906001600160401b0382116100fc5760609082900360031901126100fc5760040190565b9181601f840112156100fc578235916001600160401b0383116100fc57602083818601950101116100fc57565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610dba57505050505090565b9091929394602080610dd8600193603f198682030187528951610c27565b97019301930191939290610dab565b3580151581036100fc5790565b356001600160801b03811681036100fc5790565b903590601e19813603018212156100fc57018035906001600160401b0382116100fc576020019181360383136100fc57565b91908260a09103126100fc57604051610e5281610804565b60808193610e5f81610840565b8352610e6d60208201610840565b6020840152610e7e6040820161087f565b6040840152610e8f6060820161088f565b60608401520135906001600160a01b03821682036100fc5760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610523575f0390565b60405190610eda82610804565b5f6080838281528260208201528260408201528260608201520152565b60405190610f0482610804565b5f608083610f10610ecd565b8152826020820152606060408201528260608201520152565b60405190610f36826107ba565b5f604083606081528260208201520152565b903590601e19813603018212156100fc57018035906001600160401b0382116100fc57602001918160051b360383136100fc57565b356001600160a01b03811681036100fc5790565b9190811015610fb35760051b81013590609e19813603018212156100fc570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610523575f0390565b9190820391821161052357565b90610fee82610868565b610ffb604051918261081f565b828152809261100c601f1991610868565b0190602036910137565b805115610fb35760200190565b805160011015610fb35760400190565b8051821015610fb35760209160051b010190565b9190820180921161052357565b9061105e82610868565b61106b604051918261081f565b828152809261107c601f1991610868565b01905f5b82811061108c57505050565b602090611097610ef7565b82828501015201611080565b6001600160401b0381116107d557601f01601f191660200190565b6060810190815151906110d15f92611054565b815160208301805192966001600160a01b03928316949093909216918285101561170b57849691965b60018060a01b0316809514925f92604083019260018060a01b037f000000000000000000000000000000000000000000000000000000000000000016966020955b83518051821015611317578a6111538f928490611033565b5162ffffff815116908a81015160020b90604060018060a01b0391015116916040519361117f85610804565b845260018060a01b038a168c8501526040840152606083015260808201526001600160801b03885116604051906111b5826107e9565b8282528b8b83015260408201526040516111cf8b8261081f565b5f815260608201528b8a6112365f61120560609482946112135a9860405194859163775f063560e11b858401526024830161295c565b03601f19810185528461081f565b836040518096819582946348c8949160e01b845260048401526024830190610a11565b03925af190816112f7575b506112ee57505061125b611253611ae4565b915a90610fd7565b909d8e5b8b01516001600160e01b0319166304d099ff60e21b016112e15790611285859392611bc1565b9e61128f90612a0c565b6040519261129c84610804565b83528c8c8401526040516112b08d8261081f565b5f81526040840152606083015260808201526112cc8284611033565b526112d691611033565b506001905b0161113b565b9d505050506001906112db565b91509d8e61125f565b611312903d805f833e61130a818361081f565b8101906129aa565b611241565b505099989250999550935061132d919550611054565b945f945f5b855181101561138c5760806113478288611033565b510151611357575b600101611332565b956113846001916113688989611033565b51611373828c611033565b5261137e818b611033565b50611bc1565b96905061134f565b5092969195935093506113a0865151610fe4565b945f5b875180518210156113d3579062ffffff6113bf82600194611033565b5151166113cc828a611033565b52016113a3565b50509651935191516040519795965092946001600160a01b0392831694919390926001600160801b03909116911661140a886107e9565b8752818701938452604087019081526060870195808752519461142d5f96612841565b975194516001600160a01b039586169516908186101561170457855b6001600160a01b0316958614945f5b8951805182101561153f576114718262ffffff92611033565b511660405190611480826107ba565b89825260018060a01b0386168883015260408201528b6114c36001600160801b03885116604051906114b1826107ba565b8482528b8b8301526040820152612aa7565b909b633b2f660160e21b8d8b63ffffffff60e01b9101511603611532579380939261151f926114fc6114f6600198611bc1565b9f612a0c565b60405195611509876107e9565b86528d8d87015260408601526060850152611033565b5261152a818d611033565b505b01611458565b9b5050505060019061152c565b5050975094505050926115529150612841565b915f915f5b86518110156115ab57606061156c8289611033565b51015161157c575b600101611557565b926115a360019161158d868a611033565b516115988289611033565b5261137e8188611033565b939050611574565b509294509290506115c76115c28351865190611047565b611054565b935f5b83518110156115fd57806115e060019286611033565b516115eb8289611033565b526115f68188611033565b50016115ca565b509190925f5b83518110156116fe576001906116f76001600160a01b036116248388611033565b51515116838060a01b0385611639858a611033565b515101511662ffffff604061164e868b611033565b5151015116906040519261166184610804565b83528683015260408201525f606082015260036080820152846116848489611033565b51015115156040611695858a611033565b51015160606116a4868b611033565b51015191604051936116b585610804565b8452878401526040516116c8888261081f565b5f81526040840152606083015260808201526116e5838751611047565b906116f0828b611033565b5288611033565b5001611603565b50505050565b8591611449565b84929691966110fa565b93949392602090821561186d576101446401000276a4935b6040519061173a826107ba565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b87526117778d60048901906109ce565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115611862575f91611830575b5080945f8312145f146118285760801d5b600f0b036118125750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b611807565b90506020813d60201161185a575b8161184b6020938361081f565b810103126100fc57515f6117f6565b3d915061183e565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d259361172d565b611893610ef7565b9161189c610f29565b925f926118fa6118f460018060a01b0383511660018060a01b036020850151166080850151906001600160801b0360608701511690604051936118de856107e9565b84526020840152604083015260608201526110be565b91611f20565b90805115808091611a30575b1561191357505050929190565b91959394909391156119f057505060029261192d85611016565b51945b60015b84518110156119755760606119488287611033565b51015160608501511061195e575b600101611933565b9250600161196c8486611033565b51939050611956565b5092509260015b83518110156119be5760206119918286611033565b5101516020870151106119a7575b60010161197c565b945060016119b58685611033565b5195905061199f565b50915092916003821015610d145781156119d457565b60608401516020840151919250106119eb57600190565b600290565b909480925051155f14611a115750600192611a0a83611016565b5191611930565b92909350611a1e82611016565b5190611a2985611016565b5194611930565b50825115611906565b90611a42610ecd565b50611a4c82610f7d565b6001600160a01b038281169290821680841015611ada57505b6001600160a01b031691821492602081013562ffffff8116908190036100fc576040820135918260020b8093036100fc57606001359260018060a01b0384168094036100fc5760405194611ab886610804565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190611a65565b3d15611b0e573d90611af5826110a3565b91611b03604051938461081f565b82523d5f602084013e565b606090565b90611b1d82610868565b611b2a604051918261081f565b8281528092611b3b601f1991610868565b01905f5b828110611b4b57505050565b602090611b56610f29565b82828501015201611b3f565b60405160609190611b73838261081f565b6002815291601f1901825f5b828110611b8b57505050565b602090604051611b9a81610804565b5f81525f838201525f60408201525f60608201526060608082015282828501015201611b7f565b5f1981146105235760010190565b5f6040820190611be0825151611b13565b915f915b8151928351811015611eb35785516001600160a01b0390811694611c4b9190611c0e908490611033565b5116946001600160801b0360608901511695608089019687519160405193611c35856107e9565b84526020840152604083015260608201526121d3565b94855115611ea657611c5c86611016565b519460015b8751811015611ca3576060611c76828a611033565b510151606088015111611c8c575b600101611c61565b95506001611c9a8789611033565b51969050611c84565b5091939694955091611cf060018060a01b03611cc0868a51611033565b5116602087019360018060a01b03855116906001600160801b0360608b01511690519160405193611c35856107e9565b95865115611e9557611d0187611016565b519560015b8851811015611d48576060611d1b828b611033565b510151606089015111611d31575b600101611d06565b96506001611d3f888a611033565b51979050611d29565b509794929895600194975090611e56611e759392611d64611b62565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b03910151169060408601519260405194611da586610804565b85526020850152604084015260608301526080820152611e23898060a01b03611dcf8a8d51611033565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a01519260405197611e0889610804565b88526020880152604087015260608601526080850152611016565b52611e2d8d611016565b50611e378d611023565b52611e418c611023565b50608080606083015194015191015190611047565b906040519a611e648c6107ba565b8b5260208b015260408a0152611bc1565b96611e808287611033565b52611e8b8186611033565b505b019194611be4565b509693959290506001919450611e8d565b9450600191969350611e8d565b50915050611ec391939250611b13565b5f805b8451811015611f1a576040611edb8287611033565b510151611eeb575b600101611ec6565b90611f12600191611efc8488611033565b51611f078287611033565b5261137e8186611033565b919050611ee3565b50509150565b5f60408201611f30815151611b13565b915f905b82519182518110156121825785516001600160a01b0390811693611f859190611f5e908490611033565b5116936001600160801b03606089015116946080890195865191604051936118de856107e9565b9485511561217557611f9686611016565b519460015b8751811015611fdd576060611fb0828a611033565b510151606088015110611fc6575b600101611f9b565b95506001611fd48789611033565b51969050611fbe565b509193969495509161202a60018060a01b03611ffa868551611033565b5116602087019860018060a01b038a5116906001600160801b0360608b015116905191604051936118de856107e9565b958651156121645761203b87611016565b519560015b8851811015612082576060612055828b611033565b51015160608901511061206b575b600101612040565b96506001612079888a611033565b51979050612063565b509798949295600194975090611e56612144939261209e611b62565b809c611e238b6120b58a8c8060a01b039251611033565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a015192604051966120ee88610804565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408801519260405197611e0889610804565b9661214f8287611033565b5261215a8186611033565b505b019094611f34565b50969290939550600191945061215c565b945060019196925061215c565b5091505061219291939250611b13565b5f805b8451811015611f1a5760406121aa8287611033565b5101516121ba575b600101612195565b906121cb600191611efc8488611033565b9190506121b2565b6060810190815151906121e65f92611054565b815160208301805192966001600160a01b0393841694909390921691848310156126a55782949691965b6001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811695911693841493602093604084019391929091905f5b835180518210156123ec578a6122698f928490611033565b5162ffffff815116908a81015160020b90604060018060a01b0391015116916040519361229585610804565b60018060a01b03168452898c8501526040840152606083015260808201526001600160801b03885116604051906122cb826107e9565b8282528b8b83015260408201526040516122e58b8261081f565b5f815260608201528b8a61231b5f61120560609482946112135a9860405194859163595323f560e01b858401526024830161295c565b03925af190816123d4575b506123cb575050612338611253611ae4565b909d8e5b8b01516001600160e01b0319166304d099ff60e21b016123be5790612362859392611bc1565b9e61236c90612a0c565b6040519261237984610804565b83528c8c84015260405161238d8d8261081f565b5f81526040840152606083015260808201526123a98284611033565b526123b391611033565b506001905b01612251565b9d505050506001906123b8565b91509d8e61233c565b6123e7903d805f833e61130a818361081f565b612326565b5050999892509995509350612402919550611054565b945f945f5b855181101561244557608061241c8288611033565b51015161242c575b600101612407565b9561243d6001916113688989611033565b969050612424565b5093509350939094612458865151610fe4565b945f5b8751805182101561248b579062ffffff61247782600194611033565b515116612484828a611033565b520161245b565b5050965193519251604051979596506001600160a01b0393841695929491936001600160801b0390911691166124c0886107e9565b875281870194855260408701908152606087019580875251946124e35f96612841565b975190516001600160a01b03908116959116908582101561269f5781955b6001600160a01b0316918214945f5b895180518210156125ce576125298262ffffff92611033565b511660405190612538826107ba565b60018060a01b038a168252858883015260408201528b61257b6001600160801b0388511660405190612569826107ba565b8482528b8b8301526040820152612c3a565b909b633b2f660160e21b8d8b63ffffffff60e01b91015116036125c157938093926125ae926114fc6114f6600198611bc1565b526125b9818d611033565b505b01612510565b9b505050506001906125bb565b5050975094505050926125e19150612841565b915f915f5b86518110156126245760606125fb8289611033565b51015161260b575b6001016125e6565b9261261c60019161158d868a611033565b939050612603565b5092945092905061263b6115c28351865190611047565b935f5b8351811015612671578061265460019286611033565b5161265f8289611033565b5261266a8188611033565b500161263e565b509190925f5b83518110156116fe576001906126986001600160a01b036116248388611033565b5001612677565b81612501565b82969196612210565b6126b6610ef7565b916126bf610f29565b925f9261270761270160018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611c35856107e9565b91611bcf565b90805115808091612838575b1561272057505050929190565b91959394909391156127f857505060029261273a85611016565b51945b60015b84518110156127825760606127558287611033565b51015160608501511161276b575b600101612740565b925060016127798486611033565b51939050612763565b5092509260015b83518110156127cb57602061279e8286611033565b5101516020870151116127b4575b600101612789565b945060016127c28685611033565b519590506127ac565b50915092916003821015610d145781156127e157565b60608401516020840151919250116119eb57600190565b909480925051155f14612819575060019261281283611016565b519161273d565b9290935061282682611016565b519061283185611016565b519461273d565b50825115612713565b9061284b82610868565b612858604051918261081f565b8281528092612869601f1991610868565b01905f5b82811061287957505050565b602090604051612888816107e9565b604051612894816107ba565b5f81525f848201525f604082015281525f838201525f60408201525f60608201528282850101520161286d565b60018060a01b038151169062ffffff604060018060a01b03602084015116920151166040519160208301938452604083015260608201526060815261290760808261081f565b5190209160405192602084019260ff60f81b84526bffffffffffffffffffffffff199060601b166021850152603584015260558301526055825261294c60758361081f565b905190206001600160a01b031690565b61012060606129a793602084526129776020850182516109ce565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610a11565b90565b6020818303126100fc578051906001600160401b0382116100fc570181601f820112156100fc578051906129dd826110a3565b926129eb604051948561081f565b828452602083830101116100fc57815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b01612a2f576024015190565b6040516306190b2b60e41b815260206004820152908190612a54906024830190610a11565b0390fd5b91908260409103126100fc576020825192015190565b6001600160a01b039182168152911515602083015260408201929092529116606082015260a0608082018190526129a792910190610a11565b80516060905f906001600160a01b0390612b04907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1692833b15612c0d57604060208201511515915a958315612bf2576401000276a4915b5f6001600160801b03858301511691519562ffffff8680519860018060a01b0381511660208b015260018060a01b03602082015116828b015201511660608801526001608088015260808752612b7e60a08861081f565b612b9e865197889687958694630251596160e31b86523060048701612a6e565b03925af19081612bc4575b50612bbf575050612bbb611253611ae4565b9091565b915091565b612be59060403d604011612beb575b612bdd818361081f565b810190612a58565b50612ba9565b503d612bd3565b73fffd8963efd1fc6a506488495d951d5263988d2591612b27565b505050604051906373913ebd60e01b6020830152602482015260248152612c3560448261081f565b905f90565b80516060905f906001600160a01b0390612c97907f0000000000000000000000000000000000000000000000000000000000000000907f0000000000000000000000000000000000000000000000000000000000000000906128c1565b1692833b15612c0d57604060208201511515915a958315612d16576401000276a4915b5f612cd06001600160801b038684015116610fc7565b9151855181516001600160a01b0390811660208084019190915283015116818801529086015162ffffff1660608201526080808201839052815295612b7e60a08861081f565b73fffd8963efd1fc6a506488495d951d5263988d2591612cba56fea164736f6c634300081a000a" as Hex;
export const MetaQuoter = {
    abi,
    bytecode,
    deployedBytecode,
};
