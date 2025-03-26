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
export const functions = [
    poolManager,
    quoteExactInput,
    quoteExactInputSingle,
    quoteExactOutput,
    quoteExactOutputSingle,
] as const;
export const events = [] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IV4Quoter = {
    abi,
};
