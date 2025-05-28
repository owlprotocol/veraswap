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
    "0x60a034608257601f61214a38819003918201601f19168301916001600160401b03831184841017608657808492602094604052833981010312608257516001600160a01b03811681036082576080526040516120af908161009b82396080518181816101be0152818161039301528181610eb9015281816111f60152611c290152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60806040526004361015610011575f80fd5b5f3560e01c806304837ce3146105b3578063595323f5146105285780636036742c146104fd5780636a36a38c1461040f57806391dd734614610344578063aa2f15011461022b578063ab1edd9d14610212578063c2c04613146101ed578063dc4c90d3146101a9578063e991282e14610184578063eebe0c6a146100df5763fc1ed6d61461009d575f80fd5b346100db576100d76100c86100b136610925565b6100b9610cdc565b506100c2610d0e565b50611e13565b60409391935193849384610af0565b0390f35b5f80fd5b346100db576100ed366108f1565b303303610175578061015061014a61014560a06001600160801b0395019361011485610bcc565b61012d8761012460c08501610bd9565b16600f0b610dac565b9061013b60e0840184610bed565b9490933690610c1f565b611145565b91610bcc565b1561016b5781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610158565b6314e1dbf760e11b5f5260045ffd5b346100db576100d761019d6101983661074f565b611be6565b60405191829182610892565b346100db575f3660031901126100db576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100db576100d761020661020136610925565b611933565b60405191829182610b6d565b346100db576100d761020661022636610925565b6115fe565b346100db5761023936610b3a565b303303610175576020810161024e8183610d2d565b905061025c60408401610bd9565b9161026684610d62565b9190815b61028a576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926102978286610d2d565b91905f198501858111610316576102c76102c06001600160801b0392610305966102e395610d76565b9788611469565b93906102d660808a018a610bed565b9390921690851590611145565b901561032a576102f590600f0b610c92565b6001600160801b03165b93610d62565b918015610316575f1901908161026a565b634e487b7160e01b5f52601160045260245ffd5b6103369060801d610c92565b6001600160801b03166102ff565b346100db5760203660031901126100db576004356001600160401b0381116100db57366023820112156100db578060040135906001600160401b0382116100db5736602483830101116100db577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610400575f6024819284806040519384930183378101838152039082305af16103e4611514565b906103f157602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100db5761041d36610b3a565b3033036101755760208101906104338282610d2d565b905061044160408301610bd9565b9161044b81610d62565b935f915b838310610472576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936104e16001600160801b036104cb6104b66001946104a86104a18a61049b8b8b610d2d565b90610d76565b9b8c611469565b948593919216600f0b610dac565b6104c360808d018d610bed565b939092611145565b90156104ec576001600160801b03165b96610d62565b95949301919061044f565b60801d6001600160801b03166104db565b346100db576100d76100c861051136610925565b610519610cdc565b50610522610d0e565b506112bb565b346100db57610536366108f1565b303303610175578061057961014a61014560a06001600160801b0395019361055d85610bcc565b8661056a60c08401610bd9565b169061013b60e0840184610bed565b156105a05761058a9060801d610c92565b633b2f660160e21b5f9081529116600452602490fd5b6105ac90600f0b610c92565b8116610158565b346100db576100d761019d6105c73661074f565b610e72565b606081019081106001600160401b038211176105e757604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176105e757604052565b60a081019081106001600160401b038211176105e757604052565b90601f801991011681019081106001600160401b038211176105e757604052565b35906001600160a01b03821682036100db57565b35906001600160801b03821682036100db57565b6001600160401b0381116105e75760051b60200190565b359062ffffff821682036100db57565b35908160020b82036100db57565b81601f820112156100db578035906106c68261067a565b926106d46040519485610631565b828452602060608186019402830101918183116100db57602001925b8284106106fe575050505090565b6060848303126100db576020606091604051610719816105cc565b61072287610691565b815261072f8388016106a1565b8382015261073f60408801610652565b60408201528152019301926106f0565b60206003198201126100db576004356001600160401b0381116100db57608081830360031901126100db5760405191610787836105fb565b61079382600401610652565b83526107a160248301610652565b60208401526107b260448301610666565b60408401526064820135916001600160401b0383116100db576107d892016004016106af565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b906108538183516107e0565b6020820151151560a0820152610100608061087f604085015161012060c0860152610120850190610823565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b8383106108c457505050505090565b90919293946020806108e2600193603f198682030187528951610847565b970193019301919392906108b5565b60206003198201126100db57600435906001600160401b0382116100db576101009082900360031901126100db5760040190565b60206003198201126100db576004356001600160401b0381116100db5760a081830360031901126100db576040519161095d83610616565b61096982600401610652565b835261097760248301610652565b602084015260448201356001600160401b0381116100db578201816023820112156100db576004810135906109ab8261067a565b916109b96040519384610631565b808352602060048185019260051b84010101918483116100db57602401905b828210610a215750505060408401526109f360648301610666565b60608401526084820135916001600160401b0383116100db57610a1992016004016106af565b608082015290565b60208091610a2e84610652565b8152019101906109d8565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b828210610a8257505050506040816020829301516020850152015191015290565b90919295602080610ae2600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610823565b980192019201909291610a61565b939291610b08610b1692606087526060870190610847565b908582036020870152610a39565b926003821015610b265760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100db57600435906001600160401b0382116100db5760609082900360031901126100db5760040190565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610b9f57505050505090565b9091929394602080610bbd600193603f198682030187528951610a39565b97019301930191939290610b90565b3580151581036100db5790565b356001600160801b03811681036100db5790565b903590601e19813603018212156100db57018035906001600160401b0382116100db576020019181360383136100db57565b91908260a09103126100db57604051610c3781610616565b60808193610c4481610652565b8352610c5260208201610652565b6020840152610c6360408201610691565b6040840152610c74606082016106a1565b60608401520135906001600160a01b03821682036100db5760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610316575f0390565b60405190610cbf82610616565b5f6080838281528260208201528260408201528260608201520152565b60405190610ce982610616565b5f608083610cf5610cb2565b8152826020820152606060408201528260608201520152565b60405190610d1b826105cc565b5f604083606081528260208201520152565b903590601e19813603018212156100db57018035906001600160401b0382116100db57602001918160051b360383136100db57565b356001600160a01b03811681036100db5790565b9190811015610d985760051b81013590609e19813603018212156100db570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610316575f0390565b9190820391821161031657565b90610dd38261067a565b610de06040519182610631565b8281528092610df1601f199161067a565b01905f5b828110610e0157505050565b602090610e0c610cdc565b82828501015201610df5565b805115610d985760200190565b805160011015610d985760400190565b8051821015610d985760209160051b010190565b6001600160401b0381116105e757601f01601f191660200190565b5f1981146103165760010190565b606081019081515190610e855f92610dc9565b8151602083015191956001600160a01b03928316959190921692908584101561113d5794835b6001600160a01b03908116947f0000000000000000000000000000000000000000000000000000000000000000909116939085149260209290915f5b895180518210156110c75781610efc91610e35565b518051868201516040928301519251926001600160a01b03169160029190910b9062ffffff16610f2b84610616565b8b845260018060a01b038716898501526040840152606083015260808201528b866001600160801b0360408801511660405190610f67826105fb565b8482528a838301526040820152604051610f818382610631565b5f815260608201528a610fe85f6060938193610fc45a97610fb660405194859263775f063560e11b9084015260248301611fa6565b03601f198101845283610631565b8d836040518096819582946348c8949160e01b845260048401526024830190610823565b03925af190816110a7575b5061109f57505061100d611005611514565b915a90610dbc565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01611092579380939261107f92611047611041600198610e64565b9f612056565b6040519561105487610616565b86528c8c8701526040516110688d82610631565b5f8152604087015260608601526080850152610e35565b5261108a818d610e35565b505b01610ee7565b9b5050505060019061108c565b91509b611010565b6110c2903d805f833e6110ba8183610631565b810190611ff4565b610ff3565b505097505050505050506110da90610dc9565b5f805b84518110156111375760806110f28287610e35565b510151611102575b6001016110dd565b9061112f6001916111138488610e35565b5161111e8287610e35565b526111298186610e35565b50610e64565b9190506110fa565b50509150565b839095610eab565b93949392602090821561129d576101446401000276a4935b6040519061116a826105cc565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b87526111a78d60048901906107e0565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115611292575f91611260575b5080945f8312145f146112585760801d5b600f0b036112425750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b611237565b90506020813d60201161128a575b8161127b60209383610631565b810103126100db57515f611226565b3d915061126e565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d259361115d565b6112c3610cdc565b916112cc610d0e565b925f9261132a61132460018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361130e856105fb565b8452602084015260408301526060820152610e72565b91611933565b90805115808091611460575b1561134357505050929190565b919593949093911561142057505060029261135d85610e18565b51945b60015b84518110156113a55760606113788287610e35565b51015160608501511061138e575b600101611363565b9250600161139c8486610e35565b51939050611386565b5092509260015b83518110156113ee5760206113c18286610e35565b5101516020870151106113d7575b6001016113ac565b945060016113e58685610e35565b519590506113cf565b50915092916003821015610b2657811561140457565b606084015160208401519192501061141b57600190565b600290565b909480925051155f14611441575060019261143a83610e18565b5191611360565b9290935061144e82610e18565b519061145985610e18565b5194611360565b50825115611336565b90611472610cb2565b5061147c82610d62565b6001600160a01b03828116929082168084101561150a57505b6001600160a01b031691821492602081013562ffffff8116908190036100db576040820135918260020b8093036100db57606001359260018060a01b0384168094036100db57604051946114e886610616565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190611495565b3d1561153e573d9061152582610e49565b916115336040519384610631565b82523d5f602084013e565b606090565b9061154d8261067a565b61155a6040519182610631565b828152809261156b601f199161067a565b01905f5b82811061157b57505050565b602090611586610d0e565b8282850101520161156f565b604051606091906115a38382610631565b6002815291601f1901825f5b8281106115bb57505050565b6020906040516115ca81610616565b5f81525f838201525f60408201525f606082015260606080820152828285010152016115af565b9190820180921161031657565b5f604082019061160f825151611543565b915f915b81519283518110156118e25785516001600160a01b039081169461167a919061163d908490610e35565b5116946001600160801b0360608901511695608089019687519160405193611664856105fb565b8452602084015260408301526060820152611be6565b948551156118d55761168b86610e18565b519460015b87518110156116d25760606116a5828a610e35565b5101516060880151116116bb575b600101611690565b955060016116c98789610e35565b519690506116b3565b509193969495509161171f60018060a01b036116ef868a51610e35565b5116602087019360018060a01b03855116906001600160801b0360608b01511690519160405193611664856105fb565b958651156118c45761173087610e18565b519560015b885181101561177757606061174a828b610e35565b510151606089015111611760575b600101611735565b9650600161176e888a610e35565b51979050611758565b5097949298956001949750906118856118a49392611793611592565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b039101511690604086015192604051946117d486610616565b85526020850152604084015260608301526080820152611852898060a01b036117fe8a8d51610e35565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a0151926040519761183789610616565b88526020880152604087015260608601526080850152610e18565b5261185c8d610e18565b506118668d610e25565b526118708c610e25565b506080806060830151940151910151906115f1565b906040519a6118938c6105cc565b8b5260208b015260408a0152610e64565b966118af8287610e35565b526118ba8186610e35565b505b019194611613565b5096939592905060019194506118bc565b94506001919693506118bc565b509150506118f291939250611543565b5f805b845181101561113757604061190a8287610e35565b51015161191a575b6001016118f5565b9061192b6001916111138488610e35565b919050611912565b5f60408201611943815151611543565b915f905b8251918251811015611b955785516001600160a01b03908116936119989190611971908490610e35565b5116936001600160801b036060890151169460808901958651916040519361130e856105fb565b94855115611b88576119a986610e18565b519460015b87518110156119f05760606119c3828a610e35565b5101516060880151106119d9575b6001016119ae565b955060016119e78789610e35565b519690506119d1565b5091939694955091611a3d60018060a01b03611a0d868551610e35565b5116602087019860018060a01b038a5116906001600160801b0360608b0151169051916040519361130e856105fb565b95865115611b7757611a4e87610e18565b519560015b8851811015611a95576060611a68828b610e35565b510151606089015110611a7e575b600101611a53565b96506001611a8c888a610e35565b51979050611a76565b509798949295600194975090611885611b579392611ab1611592565b809c6118528b611ac88a8c8060a01b039251610e35565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a01519260405196611b0188610616565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b0391015116906040880151926040519761183789610616565b96611b628287610e35565b52611b6d8186610e35565b505b019094611947565b509692909395506001919450611b6f565b9450600191969250611b6f565b50915050611ba591939250611543565b5f805b8451811015611137576040611bbd8287610e35565b510151611bcd575b600101611ba8565b90611bde6001916111138488610e35565b919050611bc5565b6060810180515190611bf85f92610dc9565b8351602085015191956001600160a01b0391821695919092169283861015611e0c57949283905b6001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081169491169182149260209290915f5b89518051821015611db85781611c6d91610e35565b518051868201516040928301519251926001600160a01b03169160029190910b9062ffffff16611c9c84610616565b60018060a01b038c16845286898501526040840152606083015260808201528b866001600160801b0360408801511660405190611cd8826105fb565b8482528a838301526040820152604051611cf28382610631565b5f815260608201528a611d275f6060938193610fc45a97610fb660405194859263595323f560e01b9084015260248301611fa6565b03925af19081611da0575b50611d98575050611d44611005611514565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01611d8b5793809392611d7892611047611041600198610e64565b52611d83818d610e35565b505b01611c58565b9b50505050600190611d85565b91509b611d47565b611db3903d805f833e6110ba8183610631565b611d32565b50509750505050505050611dcb90610dc9565b5f805b8451811015611137576080611de38287610e35565b510151611df3575b600101611dce565b90611e046001916111138488610e35565b919050611deb565b9480611c1f565b611e1b610cdc565b91611e24610d0e565b925f92611e6c611e6660018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611664856105fb565b916115fe565b90805115808091611f9d575b15611e8557505050929190565b9195939490939115611f5d575050600292611e9f85610e18565b51945b60015b8451811015611ee7576060611eba8287610e35565b510151606085015111611ed0575b600101611ea5565b92506001611ede8486610e35565b51939050611ec8565b5092509260015b8351811015611f30576020611f038286610e35565b510151602087015111611f19575b600101611eee565b94506001611f278685610e35565b51959050611f11565b50915092916003821015610b26578115611f4657565b606084015160208401519192501161141b57600190565b909480925051155f14611f7e5750600192611f7783610e18565b5191611ea2565b92909350611f8b82610e18565b5190611f9685610e18565b5194611ea2565b50825115611e78565b6101206060611ff19360208452611fc16020850182516107e0565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610823565b90565b6020818303126100db578051906001600160401b0382116100db570181601f820112156100db5780519061202782610e49565b926120356040519485610631565b828452602083830101116100db57815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b01612079576024015190565b6040516306190b2b60e41b81526020600482015290819061209e906024830190610823565b0390fdfea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c806304837ce3146105b3578063595323f5146105285780636036742c146104fd5780636a36a38c1461040f57806391dd734614610344578063aa2f15011461022b578063ab1edd9d14610212578063c2c04613146101ed578063dc4c90d3146101a9578063e991282e14610184578063eebe0c6a146100df5763fc1ed6d61461009d575f80fd5b346100db576100d76100c86100b136610925565b6100b9610cdc565b506100c2610d0e565b50611e13565b60409391935193849384610af0565b0390f35b5f80fd5b346100db576100ed366108f1565b303303610175578061015061014a61014560a06001600160801b0395019361011485610bcc565b61012d8761012460c08501610bd9565b16600f0b610dac565b9061013b60e0840184610bed565b9490933690610c1f565b611145565b91610bcc565b1561016b5781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610158565b6314e1dbf760e11b5f5260045ffd5b346100db576100d761019d6101983661074f565b611be6565b60405191829182610892565b346100db575f3660031901126100db576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346100db576100d761020661020136610925565b611933565b60405191829182610b6d565b346100db576100d761020661022636610925565b6115fe565b346100db5761023936610b3a565b303303610175576020810161024e8183610d2d565b905061025c60408401610bd9565b9161026684610d62565b9190815b61028a576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926102978286610d2d565b91905f198501858111610316576102c76102c06001600160801b0392610305966102e395610d76565b9788611469565b93906102d660808a018a610bed565b9390921690851590611145565b901561032a576102f590600f0b610c92565b6001600160801b03165b93610d62565b918015610316575f1901908161026a565b634e487b7160e01b5f52601160045260245ffd5b6103369060801d610c92565b6001600160801b03166102ff565b346100db5760203660031901126100db576004356001600160401b0381116100db57366023820112156100db578060040135906001600160401b0382116100db5736602483830101116100db577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610400575f6024819284806040519384930183378101838152039082305af16103e4611514565b906103f157602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b346100db5761041d36610b3a565b3033036101755760208101906104338282610d2d565b905061044160408301610bd9565b9161044b81610d62565b935f915b838310610472576001600160801b0385633b2f660160e21b5f521660045260245ffd5b909192936104e16001600160801b036104cb6104b66001946104a86104a18a61049b8b8b610d2d565b90610d76565b9b8c611469565b948593919216600f0b610dac565b6104c360808d018d610bed565b939092611145565b90156104ec576001600160801b03165b96610d62565b95949301919061044f565b60801d6001600160801b03166104db565b346100db576100d76100c861051136610925565b610519610cdc565b50610522610d0e565b506112bb565b346100db57610536366108f1565b303303610175578061057961014a61014560a06001600160801b0395019361055d85610bcc565b8661056a60c08401610bd9565b169061013b60e0840184610bed565b156105a05761058a9060801d610c92565b633b2f660160e21b5f9081529116600452602490fd5b6105ac90600f0b610c92565b8116610158565b346100db576100d761019d6105c73661074f565b610e72565b606081019081106001600160401b038211176105e757604052565b634e487b7160e01b5f52604160045260245ffd5b608081019081106001600160401b038211176105e757604052565b60a081019081106001600160401b038211176105e757604052565b90601f801991011681019081106001600160401b038211176105e757604052565b35906001600160a01b03821682036100db57565b35906001600160801b03821682036100db57565b6001600160401b0381116105e75760051b60200190565b359062ffffff821682036100db57565b35908160020b82036100db57565b81601f820112156100db578035906106c68261067a565b926106d46040519485610631565b828452602060608186019402830101918183116100db57602001925b8284106106fe575050505090565b6060848303126100db576020606091604051610719816105cc565b61072287610691565b815261072f8388016106a1565b8382015261073f60408801610652565b60408201528152019301926106f0565b60206003198201126100db576004356001600160401b0381116100db57608081830360031901126100db5760405191610787836105fb565b61079382600401610652565b83526107a160248301610652565b60208401526107b260448301610666565b60408401526064820135916001600160401b0383116100db576107d892016004016106af565b606082015290565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b906108538183516107e0565b6020820151151560a0820152610100608061087f604085015161012060c0860152610120850190610823565b93606081015160e0850152015191015290565b602081016020825282518091526040820191602060408360051b8301019401925f915b8383106108c457505050505090565b90919293946020806108e2600193603f198682030187528951610847565b970193019301919392906108b5565b60206003198201126100db57600435906001600160401b0382116100db576101009082900360031901126100db5760040190565b60206003198201126100db576004356001600160401b0381116100db5760a081830360031901126100db576040519161095d83610616565b61096982600401610652565b835261097760248301610652565b602084015260448201356001600160401b0381116100db578201816023820112156100db576004810135906109ab8261067a565b916109b96040519384610631565b808352602060048185019260051b84010101918483116100db57602401905b828210610a215750505060408401526109f360648301610666565b60608401526084820135916001600160401b0383116100db57610a1992016004016106af565b608082015290565b60208091610a2e84610652565b8152019101906109d8565b9060608101918051926060835283518091526080830190602060808260051b8601019501915f905b828210610a8257505050506040816020829301516020850152015191015290565b90919295602080610ae2600193607f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610823565b980192019201909291610a61565b939291610b08610b1692606087526060870190610847565b908582036020870152610a39565b926003821015610b265760400152565b634e487b7160e01b5f52602160045260245ffd5b60206003198201126100db57600435906001600160401b0382116100db5760609082900360031901126100db5760040190565b602081016020825282518091526040820191602060408360051b8301019401925f915b838310610b9f57505050505090565b9091929394602080610bbd600193603f198682030187528951610a39565b97019301930191939290610b90565b3580151581036100db5790565b356001600160801b03811681036100db5790565b903590601e19813603018212156100db57018035906001600160401b0382116100db576020019181360383136100db57565b91908260a09103126100db57604051610c3781610616565b60808193610c4481610652565b8352610c5260208201610652565b6020840152610c6360408201610691565b6040840152610c74606082016106a1565b60608401520135906001600160a01b03821682036100db5760800152565b600f0b6f7fffffffffffffffffffffffffffffff198114610316575f0390565b60405190610cbf82610616565b5f6080838281528260208201528260408201528260608201520152565b60405190610ce982610616565b5f608083610cf5610cb2565b8152826020820152606060408201528260608201520152565b60405190610d1b826105cc565b5f604083606081528260208201520152565b903590601e19813603018212156100db57018035906001600160401b0382116100db57602001918160051b360383136100db57565b356001600160a01b03811681036100db5790565b9190811015610d985760051b81013590609e19813603018212156100db570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b8114610316575f0390565b9190820391821161031657565b90610dd38261067a565b610de06040519182610631565b8281528092610df1601f199161067a565b01905f5b828110610e0157505050565b602090610e0c610cdc565b82828501015201610df5565b805115610d985760200190565b805160011015610d985760400190565b8051821015610d985760209160051b010190565b6001600160401b0381116105e757601f01601f191660200190565b5f1981146103165760010190565b606081019081515190610e855f92610dc9565b8151602083015191956001600160a01b03928316959190921692908584101561113d5794835b6001600160a01b03908116947f0000000000000000000000000000000000000000000000000000000000000000909116939085149260209290915f5b895180518210156110c75781610efc91610e35565b518051868201516040928301519251926001600160a01b03169160029190910b9062ffffff16610f2b84610616565b8b845260018060a01b038716898501526040840152606083015260808201528b866001600160801b0360408801511660405190610f67826105fb565b8482528a838301526040820152604051610f818382610631565b5f815260608201528a610fe85f6060938193610fc45a97610fb660405194859263775f063560e11b9084015260248301611fa6565b03601f198101845283610631565b8d836040518096819582946348c8949160e01b845260048401526024830190610823565b03925af190816110a7575b5061109f57505061100d611005611514565b915a90610dbc565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01611092579380939261107f92611047611041600198610e64565b9f612056565b6040519561105487610616565b86528c8c8701526040516110688d82610631565b5f8152604087015260608601526080850152610e35565b5261108a818d610e35565b505b01610ee7565b9b5050505060019061108c565b91509b611010565b6110c2903d805f833e6110ba8183610631565b810190611ff4565b610ff3565b505097505050505050506110da90610dc9565b5f805b84518110156111375760806110f28287610e35565b510151611102575b6001016110dd565b9061112f6001916111138488610e35565b5161111e8287610e35565b526111298186610e35565b50610e64565b9190506110fa565b50509150565b839095610eab565b93949392602090821561129d576101446401000276a4935b6040519061116a826105cc565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b87526111a78d60048901906107e0565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115611292575f91611260575b5080945f8312145f146112585760801d5b600f0b036112425750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b611237565b90506020813d60201161128a575b8161127b60209383610631565b810103126100db57515f611226565b3d915061126e565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d259361115d565b6112c3610cdc565b916112cc610d0e565b925f9261132a61132460018060a01b0383511660018060a01b036020850151166080850151906001600160801b03606087015116906040519361130e856105fb565b8452602084015260408301526060820152610e72565b91611933565b90805115808091611460575b1561134357505050929190565b919593949093911561142057505060029261135d85610e18565b51945b60015b84518110156113a55760606113788287610e35565b51015160608501511061138e575b600101611363565b9250600161139c8486610e35565b51939050611386565b5092509260015b83518110156113ee5760206113c18286610e35565b5101516020870151106113d7575b6001016113ac565b945060016113e58685610e35565b519590506113cf565b50915092916003821015610b2657811561140457565b606084015160208401519192501061141b57600190565b600290565b909480925051155f14611441575060019261143a83610e18565b5191611360565b9290935061144e82610e18565b519061145985610e18565b5194611360565b50825115611336565b90611472610cb2565b5061147c82610d62565b6001600160a01b03828116929082168084101561150a57505b6001600160a01b031691821492602081013562ffffff8116908190036100db576040820135918260020b8093036100db57606001359260018060a01b0384168094036100db57604051946114e886610616565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190611495565b3d1561153e573d9061152582610e49565b916115336040519384610631565b82523d5f602084013e565b606090565b9061154d8261067a565b61155a6040519182610631565b828152809261156b601f199161067a565b01905f5b82811061157b57505050565b602090611586610d0e565b8282850101520161156f565b604051606091906115a38382610631565b6002815291601f1901825f5b8281106115bb57505050565b6020906040516115ca81610616565b5f81525f838201525f60408201525f606082015260606080820152828285010152016115af565b9190820180921161031657565b5f604082019061160f825151611543565b915f915b81519283518110156118e25785516001600160a01b039081169461167a919061163d908490610e35565b5116946001600160801b0360608901511695608089019687519160405193611664856105fb565b8452602084015260408301526060820152611be6565b948551156118d55761168b86610e18565b519460015b87518110156116d25760606116a5828a610e35565b5101516060880151116116bb575b600101611690565b955060016116c98789610e35565b519690506116b3565b509193969495509161171f60018060a01b036116ef868a51610e35565b5116602087019360018060a01b03855116906001600160801b0360608b01511690519160405193611664856105fb565b958651156118c45761173087610e18565b519560015b885181101561177757606061174a828b610e35565b510151606089015111611760575b600101611735565b9650600161176e888a610e35565b51979050611758565b5097949298956001949750906118856118a49392611793611592565b809c888060a01b03905116825162ffffff60408201511690606081015160020b9060808c8060a01b039101511690604086015192604051946117d486610616565b85526020850152604084015260608301526080820152611852898060a01b036117fe8a8d51610e35565b511692865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a0151926040519761183789610616565b88526020880152604087015260608601526080850152610e18565b5261185c8d610e18565b506118668d610e25565b526118708c610e25565b506080806060830151940151910151906115f1565b906040519a6118938c6105cc565b8b5260208b015260408a0152610e64565b966118af8287610e35565b526118ba8186610e35565b505b019194611613565b5096939592905060019194506118bc565b94506001919693506118bc565b509150506118f291939250611543565b5f805b845181101561113757604061190a8287610e35565b51015161191a575b6001016118f5565b9061192b6001916111138488610e35565b919050611912565b5f60408201611943815151611543565b915f905b8251918251811015611b955785516001600160a01b03908116936119989190611971908490610e35565b5116936001600160801b036060890151169460808901958651916040519361130e856105fb565b94855115611b88576119a986610e18565b519460015b87518110156119f05760606119c3828a610e35565b5101516060880151106119d9575b6001016119ae565b955060016119e78789610e35565b519690506119d1565b5091939694955091611a3d60018060a01b03611a0d868551610e35565b5116602087019860018060a01b038a5116906001600160801b0360608b0151169051916040519361130e856105fb565b95865115611b7757611a4e87610e18565b519560015b8851811015611a95576060611a68828b610e35565b510151606089015110611a7e575b600101611a53565b96506001611a8c888a610e35565b51979050611a76565b509798949295600194975090611885611b579392611ab1611592565b809c6118528b611ac88a8c8060a01b039251610e35565b511691865162ffffff60408201511690606081015160020b9060808e8060a01b03910151169060408a01519260405196611b0188610616565b875260208701526040860152606085015260808401528a8060a01b0390511692845162ffffff60408201511690606081015160020b9060808e8060a01b0391015116906040880151926040519761183789610616565b96611b628287610e35565b52611b6d8186610e35565b505b019094611947565b509692909395506001919450611b6f565b9450600191969250611b6f565b50915050611ba591939250611543565b5f805b8451811015611137576040611bbd8287610e35565b510151611bcd575b600101611ba8565b90611bde6001916111138488610e35565b919050611bc5565b6060810180515190611bf85f92610dc9565b8351602085015191956001600160a01b0391821695919092169283861015611e0c57949283905b6001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081169491169182149260209290915f5b89518051821015611db85781611c6d91610e35565b518051868201516040928301519251926001600160a01b03169160029190910b9062ffffff16611c9c84610616565b60018060a01b038c16845286898501526040840152606083015260808201528b866001600160801b0360408801511660405190611cd8826105fb565b8482528a838301526040820152604051611cf28382610631565b5f815260608201528a611d275f6060938193610fc45a97610fb660405194859263595323f560e01b9084015260248301611fa6565b03925af19081611da0575b50611d98575050611d44611005611514565b909b5b8c8901516001600160e01b0319166304d099ff60e21b01611d8b5793809392611d7892611047611041600198610e64565b52611d83818d610e35565b505b01611c58565b9b50505050600190611d85565b91509b611d47565b611db3903d805f833e6110ba8183610631565b611d32565b50509750505050505050611dcb90610dc9565b5f805b8451811015611137576080611de38287610e35565b510151611df3575b600101611dce565b90611e046001916111138488610e35565b919050611deb565b9480611c1f565b611e1b610cdc565b91611e24610d0e565b925f92611e6c611e6660018060a01b0383511660018060a01b036020850151166080850151906001600160801b036060870151169060405193611664856105fb565b916115fe565b90805115808091611f9d575b15611e8557505050929190565b9195939490939115611f5d575050600292611e9f85610e18565b51945b60015b8451811015611ee7576060611eba8287610e35565b510151606085015111611ed0575b600101611ea5565b92506001611ede8486610e35565b51939050611ec8565b5092509260015b8351811015611f30576020611f038286610e35565b510151602087015111611f19575b600101611eee565b94506001611f278685610e35565b51959050611f11565b50915092916003821015610b26578115611f4657565b606084015160208401519192501161141b57600190565b909480925051155f14611f7e5750600192611f7783610e18565b5191611ea2565b92909350611f8b82610e18565b5190611f9685610e18565b5194611ea2565b50825115611e78565b6101206060611ff19360208452611fc16020850182516107e0565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610823565b90565b6020818303126100db578051906001600160401b0382116100db570181601f820112156100db5780519061202782610e49565b926120356040519485610631565b828452602083830101116100db57815f9260208093018386015e8301015290565b60208101516001600160e01b0319166304d099ff60e21b01612079576024015190565b6040516306190b2b60e41b81526020600482015290819061209e906024830190610823565b0390fdfea164736f6c634300081a000a" as Hex;
export const V4MetaQuoter = {
    abi,
    bytecode,
    deployedBytecode,
};
