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
    "0x60a034607b57601f6110e938819003918201601f19168301916001600160401b03831184841017607f57808492602094604052833981010312607b57516001600160a01b0381168103607b5760805260405161105590816100948239608051818181610145015281816101e10152818161040c0152610e920152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe60806040526004361015610011575f80fd5b5f3560e01c8063147d2af91461063a5780635873307314610601578063595323f5146105765780636a36a38c1461048857806391dd7346146103bd578063aa2f1501146102a4578063aa9d21cb1461026b578063ca253dc914610174578063dc4c90d3146101305763eebe0c6a14610087575f80fd5b3461012c5761009536610a0b565b30330361011d57806100f86100f26100ed60a06001600160801b039501936100bc85610c93565b6100d5876100cc60c08501610ca0565b16600f0b610d85565b906100e360e0840184610cb4565b94909336906108fd565b610de1565b91610c93565b156101135781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610100565b6314e1dbf760e11b5f5260045ffd5b5f80fd5b3461012c575f36600319011261012c576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461012c57604061018436610785565b5f806101dc5f6101ad6101bb5a968851928391631a8da8e360e21b602084015260248301610a96565b03601f1981018352826106bd565b8651809381926348c8949160e01b8352602060048401526024830190610a3f565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1908161024b575b5061024357505061023561022f610227610bc6565b925a90610bf5565b91610d95565b905b82519182526020820152f35b909150610237565b610266903d805f833e61025e81836106bd565b810190610b64565b610212565b3461012c57604061027b36610966565b5f806101dc5f6101ad6101bb5a96885192839163775f063560e11b602084015260248301610c45565b3461012c576102b236610a63565b30330361011d57602081016102c78183610d06565b90506102d560408401610ca0565b916102df84610d3b565b9190815b610303576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926103108286610d06565b91905f19850185811161038f576103406103396001600160801b039261037e9661035c95610d4f565b9788610f57565b939061034f60808a018a610cb4565b9390921690851590610de1565b90156103a35761036e90600f0b610ce6565b6001600160801b03165b93610d3b565b91801561038f575f190190816102e3565b634e487b7160e01b5f52601160045260245ffd5b6103af9060801d610ce6565b6001600160801b0316610378565b3461012c57602036600319011261012c576004356001600160401b03811161012c573660238201121561012c578060040135906001600160401b03821161012c57366024838301011161012c577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610479575f6024819284806040519384930183378101838152039082305af161045d610bc6565b9061046a57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b3461012c5761049636610a63565b30330361011d5760208101906104ac8282610d06565b90506104ba60408301610ca0565b916104c481610d3b565b935f915b8383106104eb576001600160801b0385633b2f660160e21b5f521660045260245ffd5b9091929361055a6001600160801b0361054461052f60019461052161051a8a6105148b8b610d06565b90610d4f565b9b8c610f57565b948593919216600f0b610d85565b61053c60808d018d610cb4565b939092610de1565b9015610565576001600160801b03165b96610d3b565b9594930191906104c8565b60801d6001600160801b0316610554565b3461012c5761058436610a0b565b30330361011d57806105c76100f26100ed60a06001600160801b039501936105ab85610c93565b866105b860c08401610ca0565b16906100e360e0840184610cb4565b156105ee576105d89060801d610ce6565b633b2f660160e21b5f9081529116600452602490fd5b6105fa90600f0b610ce6565b8116610100565b3461012c57604061061136610966565b5f806101dc5f6101ad6101bb5a96885192839163595323f560e01b602084015260248301610c45565b3461012c57604061064a36610785565b5f806101dc5f6101ad6101bb5a96885192839163aa2f150160e01b602084015260248301610a96565b606081019081106001600160401b0382111761068e57604052565b634e487b7160e01b5f52604160045260245ffd5b60a081019081106001600160401b0382111761068e57604052565b90601f801991011681019081106001600160401b0382111761068e57604052565b35906001600160a01b038216820361012c57565b359062ffffff8216820361012c57565b35908160020b820361012c57565b6001600160401b03811161068e57601f01601f191660200190565b81601f8201121561012c5780359061074282610710565b9261075060405194856106bd565b8284526020838301011161012c57815f926020809301838601378301015290565b35906001600160801b038216820361012c57565b602060031982011261012c576004356001600160401b03811161012c576060818303600319011261012c57604051916107bd83610673565b6107c9826004016106de565b835260248201356001600160401b03811161012c578201908060238301121561012c576004820135916001600160401b03831161068e578260051b6040519361081560208301866106bd565b8452810160240190602084019083831161012c5760248101915b838310610854575050505050602083015261084c90604401610771565b604082015290565b82356001600160401b03811161012c576004908301019060a0601f19838803011261012c5760405190610886826106a2565b610892602084016106de565b82526108a0604084016106f2565b60208301526108b160608401610702565b60408301526108c2608084016106de565b606083015260a0830135916001600160401b03831161012c576108ed8860208096958196010161072b565b608082015281520192019161082f565b91908260a091031261012c57604051610915816106a2565b6080610961818395610926816106de565b8552610934602082016106de565b6020860152610945604082016106f2565b604086015261095660608201610702565b6060860152016106de565b910152565b602060031982011261012c576004356001600160401b03811161012c57610100818303600319011261012c5760405191608083018381106001600160401b0382111761068e576040526109bc81836004016108fd565b835260a4820135801515810361012c5760208401526109dd60c48301610771565b604084015260e4820135916001600160401b03831161012c57610a03920160040161072b565b606082015290565b602060031982011261012c57600435906001600160401b03821161012c5761010090829003600319011261012c5760040190565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b602060031982011261012c57600435906001600160401b03821161012c57606090829003600319011261012c5760040190565b602080825282516001600160a01b031682820152828101516060604084015280516080840181905260a0600582901b85018101959392909201915f9085015b828210610af657505050506001600160801b03604060609201511691015290565b90919295602080610b56600193609f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610a3f565b980192019201909291610ad5565b60208183031261012c578051906001600160401b03821161012c570181601f8201121561012c57805190610b9782610710565b92610ba560405194856106bd565b8284526020838301011161012c57815f9260208093018386015e8301015290565b3d15610bf0573d90610bd782610710565b91610be560405193846106bd565b82523d5f602084013e565b606090565b9190820391821161038f57565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b6101206060610c909360208452610c60602085018251610c02565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610a3f565b90565b35801515810361012c5790565b356001600160801b038116810361012c5790565b903590601e198136030182121561012c57018035906001600160401b03821161012c5760200191813603831361012c57565b600f0b6f7fffffffffffffffffffffffffffffff19811461038f575f0390565b903590601e198136030182121561012c57018035906001600160401b03821161012c57602001918160051b3603831361012c57565b356001600160a01b038116810361012c5790565b9190811015610d715760051b81013590609e198136030182121561012c570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b811461038f575f0390565b60208101516001600160e01b0319166304d099ff60e21b01610db8576024015190565b6040516306190b2b60e41b815260206004820152908190610ddd906024830190610a3f565b0390fd5b939493926020908215610f39576101446401000276a4935b60405190610e0682610673565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b8752610e438d6004890190610c02565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115610f2e575f91610efc575b5080945f8312145f14610ef45760801d5b600f0b03610ede5750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b610ed3565b90506020813d602011610f26575b81610f17602093836106bd565b8101031261012c57515f610ec2565b3d9150610f0a565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d2593610df9565b905f6080604051610f67816106a2565b8281528260208201528260408201528260608201520152610f8782610d3b565b6001600160a01b03828116929082168084101561101557505b6001600160a01b031691821492602081013562ffffff81169081900361012c576040820135918260020b80930361012c57606001359260018060a01b03841680940361012c5760405194610ff3866106a2565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190610fa056fea26469706673582212206468312057179bafd4acda0d3106276b03768e47129a5c1b8a7b6313b8ea90e064736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c8063147d2af91461063a5780635873307314610601578063595323f5146105765780636a36a38c1461048857806391dd7346146103bd578063aa2f1501146102a4578063aa9d21cb1461026b578063ca253dc914610174578063dc4c90d3146101305763eebe0c6a14610087575f80fd5b3461012c5761009536610a0b565b30330361011d57806100f86100f26100ed60a06001600160801b039501936100bc85610c93565b6100d5876100cc60c08501610ca0565b16600f0b610d85565b906100e360e0840184610cb4565b94909336906108fd565b610de1565b91610c93565b156101135781165b633b2f660160e21b5f521660045260245ffd5b60801d8116610100565b6314e1dbf760e11b5f5260045ffd5b5f80fd5b3461012c575f36600319011261012c576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b3461012c57604061018436610785565b5f806101dc5f6101ad6101bb5a968851928391631a8da8e360e21b602084015260248301610a96565b03601f1981018352826106bd565b8651809381926348c8949160e01b8352602060048401526024830190610a3f565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1908161024b575b5061024357505061023561022f610227610bc6565b925a90610bf5565b91610d95565b905b82519182526020820152f35b909150610237565b610266903d805f833e61025e81836106bd565b810190610b64565b610212565b3461012c57604061027b36610966565b5f806101dc5f6101ad6101bb5a96885192839163775f063560e11b602084015260248301610c45565b3461012c576102b236610a63565b30330361011d57602081016102c78183610d06565b90506102d560408401610ca0565b916102df84610d3b565b9190815b610303576001600160801b0384633b2f660160e21b5f521660045260245ffd5b9091926103108286610d06565b91905f19850185811161038f576103406103396001600160801b039261037e9661035c95610d4f565b9788610f57565b939061034f60808a018a610cb4565b9390921690851590610de1565b90156103a35761036e90600f0b610ce6565b6001600160801b03165b93610d3b565b91801561038f575f190190816102e3565b634e487b7160e01b5f52601160045260245ffd5b6103af9060801d610ce6565b6001600160801b0316610378565b3461012c57602036600319011261012c576004356001600160401b03811161012c573660238201121561012c578060040135906001600160401b03821161012c57366024838301011161012c577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610479575f6024819284806040519384930183378101838152039082305af161045d610bc6565b9061046a57602081519101fd5b63703a952d60e11b5f5260045ffd5b63570c108560e11b5f5260045ffd5b3461012c5761049636610a63565b30330361011d5760208101906104ac8282610d06565b90506104ba60408301610ca0565b916104c481610d3b565b935f915b8383106104eb576001600160801b0385633b2f660160e21b5f521660045260245ffd5b9091929361055a6001600160801b0361054461052f60019461052161051a8a6105148b8b610d06565b90610d4f565b9b8c610f57565b948593919216600f0b610d85565b61053c60808d018d610cb4565b939092610de1565b9015610565576001600160801b03165b96610d3b565b9594930191906104c8565b60801d6001600160801b0316610554565b3461012c5761058436610a0b565b30330361011d57806105c76100f26100ed60a06001600160801b039501936105ab85610c93565b866105b860c08401610ca0565b16906100e360e0840184610cb4565b156105ee576105d89060801d610ce6565b633b2f660160e21b5f9081529116600452602490fd5b6105fa90600f0b610ce6565b8116610100565b3461012c57604061061136610966565b5f806101dc5f6101ad6101bb5a96885192839163595323f560e01b602084015260248301610c45565b3461012c57604061064a36610785565b5f806101dc5f6101ad6101bb5a96885192839163aa2f150160e01b602084015260248301610a96565b606081019081106001600160401b0382111761068e57604052565b634e487b7160e01b5f52604160045260245ffd5b60a081019081106001600160401b0382111761068e57604052565b90601f801991011681019081106001600160401b0382111761068e57604052565b35906001600160a01b038216820361012c57565b359062ffffff8216820361012c57565b35908160020b820361012c57565b6001600160401b03811161068e57601f01601f191660200190565b81601f8201121561012c5780359061074282610710565b9261075060405194856106bd565b8284526020838301011161012c57815f926020809301838601378301015290565b35906001600160801b038216820361012c57565b602060031982011261012c576004356001600160401b03811161012c576060818303600319011261012c57604051916107bd83610673565b6107c9826004016106de565b835260248201356001600160401b03811161012c578201908060238301121561012c576004820135916001600160401b03831161068e578260051b6040519361081560208301866106bd565b8452810160240190602084019083831161012c5760248101915b838310610854575050505050602083015261084c90604401610771565b604082015290565b82356001600160401b03811161012c576004908301019060a0601f19838803011261012c5760405190610886826106a2565b610892602084016106de565b82526108a0604084016106f2565b60208301526108b160608401610702565b60408301526108c2608084016106de565b606083015260a0830135916001600160401b03831161012c576108ed8860208096958196010161072b565b608082015281520192019161082f565b91908260a091031261012c57604051610915816106a2565b6080610961818395610926816106de565b8552610934602082016106de565b6020860152610945604082016106f2565b604086015261095660608201610702565b6060860152016106de565b910152565b602060031982011261012c576004356001600160401b03811161012c57610100818303600319011261012c5760405191608083018381106001600160401b0382111761068e576040526109bc81836004016108fd565b835260a4820135801515810361012c5760208401526109dd60c48301610771565b604084015260e4820135916001600160401b03831161012c57610a03920160040161072b565b606082015290565b602060031982011261012c57600435906001600160401b03821161012c5761010090829003600319011261012c5760040190565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b602060031982011261012c57600435906001600160401b03821161012c57606090829003600319011261012c5760040190565b602080825282516001600160a01b031682820152828101516060604084015280516080840181905260a0600582901b85018101959392909201915f9085015b828210610af657505050506001600160801b03604060609201511691015290565b90919295602080610b56600193609f198a820301865260a060808c518780841b03815116845262ffffff868201511686850152604081015160020b60408501528780841b0360608201511660608501520151918160808201520190610a3f565b980192019201909291610ad5565b60208183031261012c578051906001600160401b03821161012c570181601f8201121561012c57805190610b9782610710565b92610ba560405194856106bd565b8284526020838301011161012c57815f9260208093018386015e8301015290565b3d15610bf0573d90610bd782610710565b91610be560405193846106bd565b82523d5f602084013e565b606090565b9190820391821161038f57565b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b6101206060610c909360208452610c60602085018251610c02565b6020810151151560c08501526001600160801b0360408201511660e0850152015191610100808201520190610a3f565b90565b35801515810361012c5790565b356001600160801b038116810361012c5790565b903590601e198136030182121561012c57018035906001600160401b03821161012c5760200191813603831361012c57565b600f0b6f7fffffffffffffffffffffffffffffff19811461038f575f0390565b903590601e198136030182121561012c57018035906001600160401b03821161012c57602001918160051b3603831361012c57565b356001600160a01b038116810361012c5790565b9190811015610d715760051b81013590609e198136030182121561012c570190565b634e487b7160e01b5f52603260045260245ffd5b600160ff1b811461038f575f0390565b60208101516001600160e01b0319166304d099ff60e21b01610db8576024015190565b6040516306190b2b60e41b815260206004820152908190610ddd906024830190610a3f565b0390fd5b939493926020908215610f39576101446401000276a4935b60405190610e0682610673565b1515988982528085830194888652604084019760018060a01b031688526040519788968795633cf3645360e21b8752610e438d6004890190610c02565b51151560a48701525160c4860152516001600160a01b031660e48501526101206101048501526101248401829052848401375f838284010152601f801991011681010301815f60018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af1908115610f2e575f91610efc575b5080945f8312145f14610ef45760801d5b600f0b03610ede5750565b60a09020631e97b5cd60e21b5f5260045260245ffd5b600f0b610ed3565b90506020813d602011610f26575b81610f17602093836106bd565b8101031261012c57515f610ec2565b3d9150610f0a565b6040513d5f823e3d90fd5b61014473fffd8963efd1fc6a506488495d951d5263988d2593610df9565b905f6080604051610f67816106a2565b8281528260208201528260408201528260608201520152610f8782610d3b565b6001600160a01b03828116929082168084101561101557505b6001600160a01b031691821492602081013562ffffff81169081900361012c576040820135918260020b80930361012c57606001359260018060a01b03841680940361012c5760405194610ff3866106a2565b85526001600160a01b0316602085015260408401526060830152608082015291565b9150508190610fa056fea26469706673582212206468312057179bafd4acda0d3106276b03768e47129a5c1b8a7b6313b8ea90e064736f6c634300081a0033" as Hex;
export const V4Quoter = {
    abi,
    bytecode,
    deployedBytecode,
};
