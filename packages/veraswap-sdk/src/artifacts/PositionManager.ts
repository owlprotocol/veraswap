import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "_poolManager", type: "address", internalType: "contract IPoolManager" },
        { name: "_permit2", type: "address", internalType: "contract IAllowanceTransfer" },
        { name: "_unsubscribeGasLimit", type: "uint256", internalType: "uint256" },
        { name: "_tokenDescriptor", type: "address", internalType: "contract IPositionDescriptor" },
        { name: "_weth9", type: "address", internalType: "contract IWETH9" },
    ],
    stateMutability: "nonpayable",
} as const;
export const receive = { type: "receive", stateMutability: "payable" } as const;
export const DOMAIN_SEPARATOR = {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const WETH9 = {
    type: "function",
    name: "WETH9",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IWETH9" }],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const getApproved = {
    type: "function",
    name: "getApproved",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const getPoolAndPositionInfo = {
    type: "function",
    name: "getPoolAndPositionInfo",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [
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
        { name: "info", type: "uint256", internalType: "PositionInfo" },
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
export const isApprovedForAll = {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
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
export const msgSender = {
    type: "function",
    name: "msgSender",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const multicall = {
    type: "function",
    name: "multicall",
    inputs: [{ name: "data", type: "bytes[]", internalType: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
} as const;
export const name = {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
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
    outputs: [{ name: "bitmap", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const ownerOf = {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "id", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "owner", type: "address", internalType: "address" }],
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
export const permit2 = {
    type: "function",
    name: "permit2",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IAllowanceTransfer" }],
    stateMutability: "view",
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
export const poolKeys = {
    type: "function",
    name: "poolKeys",
    inputs: [{ name: "poolId", type: "bytes25", internalType: "bytes25" }],
    outputs: [
        { name: "currency0", type: "address", internalType: "Currency" },
        { name: "currency1", type: "address", internalType: "Currency" },
        { name: "fee", type: "uint24", internalType: "uint24" },
        { name: "tickSpacing", type: "int24", internalType: "int24" },
        { name: "hooks", type: "address", internalType: "contract IHooks" },
    ],
    stateMutability: "view",
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
    outputs: [{ name: "info", type: "uint256", internalType: "PositionInfo" }],
    stateMutability: "view",
} as const;
export const revokeNonce = {
    type: "function",
    name: "revokeNonce",
    inputs: [{ name: "nonce", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
} as const;
export const safeTransferFrom = {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const safeTransferFrom_address_address_uint256_bytes = {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
        { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setApprovalForAll = {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
        { name: "operator", type: "address", internalType: "address" },
        { name: "approved", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
export const supportsInterface = {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const symbol = {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const tokenDescriptor = {
    type: "function",
    name: "tokenDescriptor",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPositionDescriptor" }],
    stateMutability: "view",
} as const;
export const tokenURI = {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const transferFrom = {
    type: "function",
    name: "transferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "id", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unlockCallback = {
    type: "function",
    name: "unlockCallback",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
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
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const ApprovalForAll = {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "operator", type: "address", indexed: true, internalType: "address" },
        { name: "approved", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
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
export const Transfer = {
    type: "event",
    name: "Transfer",
    inputs: [
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "id", type: "uint256", indexed: true, internalType: "uint256" },
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
export const ContractLocked = { type: "error", name: "ContractLocked", inputs: [] } as const;
export const DeadlinePassed = {
    type: "error",
    name: "DeadlinePassed",
    inputs: [{ name: "deadline", type: "uint256", internalType: "uint256" }],
} as const;
export const DeltaNotNegative = {
    type: "error",
    name: "DeltaNotNegative",
    inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
} as const;
export const DeltaNotPositive = {
    type: "error",
    name: "DeltaNotPositive",
    inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
} as const;
export const GasLimitTooLow = { type: "error", name: "GasLimitTooLow", inputs: [] } as const;
export const InputLengthMismatch = { type: "error", name: "InputLengthMismatch", inputs: [] } as const;
export const InsufficientBalance = { type: "error", name: "InsufficientBalance", inputs: [] } as const;
export const InvalidContractSignature = { type: "error", name: "InvalidContractSignature", inputs: [] } as const;
export const InvalidEthSender = { type: "error", name: "InvalidEthSender", inputs: [] } as const;
export const InvalidSignature = { type: "error", name: "InvalidSignature", inputs: [] } as const;
export const InvalidSignatureLength = { type: "error", name: "InvalidSignatureLength", inputs: [] } as const;
export const InvalidSigner = { type: "error", name: "InvalidSigner", inputs: [] } as const;
export const MaximumAmountExceeded = {
    type: "error",
    name: "MaximumAmountExceeded",
    inputs: [
        { name: "maximumAmount", type: "uint128", internalType: "uint128" },
        { name: "amountRequested", type: "uint128", internalType: "uint128" },
    ],
} as const;
export const MinimumAmountInsufficient = {
    type: "error",
    name: "MinimumAmountInsufficient",
    inputs: [
        { name: "minimumAmount", type: "uint128", internalType: "uint128" },
        { name: "amountReceived", type: "uint128", internalType: "uint128" },
    ],
} as const;
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
export const NotPoolManager = { type: "error", name: "NotPoolManager", inputs: [] } as const;
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
export const UnsupportedAction = {
    type: "error",
    name: "UnsupportedAction",
    inputs: [{ name: "action", type: "uint256", internalType: "uint256" }],
} as const;
export const functions = [
    _constructor,
    receive,
    DOMAIN_SEPARATOR,
    WETH9,
    approve,
    balanceOf,
    getApproved,
    getPoolAndPositionInfo,
    getPositionLiquidity,
    initializePool,
    isApprovedForAll,
    modifyLiquidities,
    modifyLiquiditiesWithoutUnlock,
    msgSender,
    multicall,
    name,
    nextTokenId,
    nonces,
    ownerOf,
    permit,
    permit_address___address_uint160_uint48_uint48__address_uint256__bytes,
    permit2,
    permitBatch,
    permitForAll,
    poolKeys,
    poolManager,
    positionInfo,
    revokeNonce,
    safeTransferFrom,
    safeTransferFrom_address_address_uint256_bytes,
    setApprovalForAll,
    subscribe,
    subscriber,
    supportsInterface,
    symbol,
    tokenDescriptor,
    tokenURI,
    transferFrom,
    unlockCallback,
    unsubscribe,
    unsubscribeGasLimit,
] as const;
export const events = [Approval, ApprovalForAll, Subscription, Transfer, Unsubscription] as const;
export const errors = [
    AlreadySubscribed,
    BurnNotificationReverted,
    ContractLocked,
    DeadlinePassed,
    DeltaNotNegative,
    DeltaNotPositive,
    GasLimitTooLow,
    InputLengthMismatch,
    InsufficientBalance,
    InvalidContractSignature,
    InvalidEthSender,
    InvalidSignature,
    InvalidSignatureLength,
    InvalidSigner,
    MaximumAmountExceeded,
    MinimumAmountInsufficient,
    ModifyLiquidityNotificationReverted,
    NoCodeSubscriber,
    NoSelfPermit,
    NonceAlreadyUsed,
    NotApproved,
    NotPoolManager,
    NotSubscribed,
    PoolManagerMustBeLocked,
    SignatureDeadlineExpired,
    SubscriptionReverted,
    Unauthorized,
    UnsupportedAction,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x61018080604052346105365760a0816151668038038091610020828561053a565b8339810103126105365780516001600160a01b03811681036105365760208201516001600160a01b03811681036105365760408301516060840151936001600160a01b03851685036105365760800151926001600160a01b03841684036105365760405161008f60408261053a565b6018815260208101907f556e697377617020763420506f736974696f6e73204e4654000000000000000082526040516100c960408261053a565b600b81526a554e492d56342d504f534d60a81b602082015281516001600160401b03811161044a575f54600181811c9116801561052c575b602082101461042c57601f81116104ca575b50806020601f8211600114610469575f9161045e575b508160011b915f199060031b1c1916175f555b8051906001600160401b03821161044a5760015490600182811c92168015610440575b602083101461042c5781601f8493116103be575b50602090601f8311600114610358575f9261034d575b50508160011b915f199060031b1c1916176001555b5190208060c0524660a05260405160208101917f8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a86683526040820152466060820152306080820152608081526101f460a08261053a565b51902060805260e052610100526101205261014052600160085561016052604051614c08908161055e823960805181611f63015260a05181611f3d015260c05181611fb2015260e05181818161096601528181610c7401528181610ecd015281816114f00152818161181e015281816118b201528181611bbc01528181611c760152818161232a015281816123de01528181612758015281816131f1015281816132a40152818161332b01528181613400015281816136960152818161389c01528181613cb201528181613e0801528181613f4301528181613ffa01528181614079015261474e015261010051818181611108015261298b01526101205181818161037a0152818161087d01528181610b9a015261402b0152610140518181816111400152818161239501528181612f8301528181612fdf015281816130b2015261312201526101605181818161129e0152611adc0152f35b015190505f80610189565b60015f9081528281209350601f198516905b8181106103a6575090846001959493921061038e575b505050811b0160015561019e565b01515f1960f88460031b161c191690555f8080610380565b9293602060018192878601518155019501930161036a565b60015f529091507fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6601f840160051c81019160208510610422575b90601f859493920160051c01905b8181106104145750610173565b5f8155849350600101610407565b90915081906103f9565b634e487b7160e01b5f52602260045260245ffd5b91607f169161015f565b634e487b7160e01b5f52604160045260245ffd5b90508301515f610129565b5f8080528181209250601f198416905b8181106104b25750908360019493921061049a575b5050811b015f5561013c565b8501515f1960f88460031b161c191690555f8061048e565b9192602060018192868a015181550194019201610479565b5f80527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563601f830160051c81019160208410610522575b601f0160051c01905b8181106105175750610113565b5f815560010161050a565b9091508190610501565b90607f1690610101565b5f80fd5b601f909101601f19168101906001600160401b0382119082101761044a5760405256fe60806040526004361015610022575b3615610018575f80fd5b610020612392565b005b5f3560e01c80622a3e3a1461029057806301ffc9a71461028b57806305c1ee201461028657806306fdde0314610281578063081812fc1461027c578063095ea7b3146102775780630f5730f11461027257806312261ee71461026d57806316a24131146102685780631efeed331461026357806323b872dd1461025e5780632b67b570146102595780632b9261de146102545780633644e5151461024f5780633aea60f01461024a57806342842e0e146102455780634767565f146102405780634aa4a4fc1461023b5780634afe393c14610236578063502e1a16146102315780635a9d7a681461022c5780636352211e1461022757806370a082311461022257806375794a3c1461021d5780637ba03aad1461021857806386b6be7d1461021357806389097a6a1461020e57806391dd73461461020957806395d89b4114610204578063a22cb465146101ff578063ac9650d8146101fa578063ad0b27fb146101f5578063b88d4fde146101f0578063c87b56dd146101eb578063d737d0c7146101e6578063dc4c90d3146101e1578063dd46508f146101dc578063e985e9c5146101d75763f70204050361000e57611d78565b611d14565b611beb565b611ba7565b611b75565b611aa6565b61185e565b61180a565b61172c565b61169a565b6115e5565b6114bd565b611493565b61140f565b6113dd565b61137d565b6112fd565b6112cd565b611289565b611240565b61119f565b61112b565b6110f1565b610eba565b610de3565b610db2565b610c32565b610b4f565b610952565b6108de565b6108ac565b610868565b610775565b6106f5565b6106c3565b6105e3565b61056c565b6104fe565b61031c565b6001600160a01b038116036102a657565b5f80fd5b35906102b582610295565b565b9181601f840112156102a6578235916001600160401b0383116102a657602083818601950101116102a657565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b9060206103199281815201906102e4565b90565b60603660031901126102a65760043561033481610295565b602435906001600160401b0382116102a6578136039160606003198401126102a6576044356001600160401b0381116102a6576103759036906004016102b7565b6060947f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031693909290843b156102a657604051632a2d80d160e01b81526001600160a01b039096166004808801919091526060602488015260c48701949082013590602219018112156102a6578101602460048201359101946001600160401b0382116102a6578160071b360386136102a65760606064890152819052869460e48601949392915f5b8181106104c4575050506104755f96948694889460448561045d61044d60248b99016102aa565b6001600160a01b03166084890152565b013560a4860152848303600319016044860152611e8b565b03925af190816104aa575b506104a1575061049d610491611ef4565b60405191829182610308565b0390f35b61049d90610491565b806104b85f6104be936105c2565b80610584565b5f610480565b91965091929394608080826104db6001948b611e2c565b019701910191889695949392610426565b6001600160e01b03198116036102a657565b346102a65760203660031901126102a657602060043561051d816104ec565b63ffffffff60e01b166301ffc9a760e01b811490811561055b575b811561054a575b506040519015158152f35b635b5e139f60e01b1490505f61053f565b6380ac58cd60e01b81149150610538565b60203660031901126102a6576100206004353361240d565b5f9103126102a657565b634e487b7160e01b5f52604160045260245ffd5b60a081019081106001600160401b038211176105bd57604052565b61058e565b90601f801991011681019081106001600160401b038211176105bd57604052565b346102a6575f3660031901126102a6576040515f80548060011c90600181169081156106b9575b6020831082146106a557828552602085019190811561068c575060011461063c575b61049d84610491818603826105c2565b5f8080529250907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818410610678575050016104918261062c565b805484840152602090930192600101610665565b60ff191682525090151560051b0190506104918261062c565b634e487b7160e01b5f52602260045260245ffd5b91607f169161060a565b346102a65760203660031901126102a6576004355f526004602052602060018060a01b0360405f205416604051908152f35b346102a65760403660031901126102a65760043561071281610295565b6024355f818152600260205260409020546001600160a01b0316913383141580610752575b6107445761002092612453565b6282b42960e81b5f5260045ffd5b505f83815260056020908152604080832033845290915290205460ff1615610737565b60a03660031901126102a65760043561078d81610295565b60243560443591606435926084356001600160401b0381116102a6576107b79036906004016102b7565b948242116108595761084e856108549361002098610848885f80998682526002602052818960018060a01b036040832054169c8d9981604051977f49ecf333e5b8c95c40fdafc95c1ad136e8914a8fb55e9dc8bb01eaa83a2df9ad8952602089019060018060a01b031681526040890192835260608901948552608089019687528160a08a209952525252526124ad565b91612532565b8261240d565b612453565b635a9165ff60e01b5f5260045ffd5b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346102a65760203660031901126102a6576004355f526007602052602060018060a01b0360405f205416604051908152f35b346102a65760203660031901126102a6576020610915600435610900816120a7565b919082851c60020b9260081c60020b916126c6565b6001600160801b0360405191168152f35b60609060031901126102a65760043561093e81610295565b9060243561094b81610295565b9060443590565b346102a65761096036610926565b9161098a7f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40578291610a7e6109c46109b86109ab865f52600260205260405f2090565b546001600160a01b031690565b6001600160a01b031690565b6001600160a01b03841692906109db908414612854565b6001600160a01b03811693610a28906109f586151561288d565b8433148015610b04575b8015610adf575b610a0f906128cd565b6001600160a01b03165f90815260036020526040902090565b80545f190190556001600160a01b0381165f90815260036020526040902080546001019055610a5f855f52600260205260405f2090565b80546001600160a01b0319166001600160a01b03909216919091179055565b610aa3610a93845f52600460205260405f2090565b80546001600160a01b0319169055565b5f80516020614bb38339815191525f80a4610ad0610ac9825f52600960205260405f2090565b5460ff1690565b610ad657005b6100209061290a565b50610a0f610afb6109b86109ab8a5f52600460205260405f2090565b33149050610a06565b50610b3b610ac933610b268460018060a01b03165f52600560205260405f2090565b9060018060a01b03165f5260205260405f2090565b6109ff565b6306a582ff60e51b5f5260045ffd5b6101003660031901126102a657600435610b6881610295565b60c03660231901126102a65760e4356001600160401b0381116102a657610b939036906004016102b7565b60609290917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657610475935f8094604051968795869485936302b67b5760e41b855260018060a01b03166004850152610bfd60248501611dc0565b60a435610c0981610295565b6001600160a01b031660a485015260c43560c485015261010060e4850152610104840191611e8b565b60603660031901126102a657602435600435610c4d82610295565b6044356001600160401b0381116102a657610c6c9036906004016102b7565b610c989391937f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b4057610ca68333612a0e565b15610d9f575f8381526007602052604090206001600160a01b0390610cca906109ab565b1680610d7c57505f83815260096020526040902080546001179055610d4c90610d48905f8581526007602052604090206001600160a01b03851696610d4291610d14908990610a5f565b610d346040519384926346abfb5960e11b60208501528960248501611f23565b03601f1981018352826105c2565b83612aa4565b1590565b610d7757507f9709492381f90bdc5938bb4e3b8e35b7e0eac8af058619e27191c5a40ce79fa95f80a3005b612acc565b6312fdec5f60e11b5f5260048490526001600160a01b031660245260445ffd5b5ffd5b6301952d1b60e31b5f523360045260245ffd5b346102a6575f3660031901126102a6576020610dcc611f3a565b604051908152f35b6044359081151582036102a657565b60c03660031901126102a657600435610dfb81610295565b602435610e0781610295565b610e0f610dd4565b906064359260843560a4356001600160401b0381116102a657610e369036906004016102b7565b8692919242116108595783610eb59361084e92610848885f6100209c8189818f81604051977f6673cb397ee2a50b6b8401653d3638b4ac8b3db9c28aa6870ffceb7574ec2f768952602089019060018060a01b03168152600160408a019316835260608901948552608089019687528160a08a209952525252526124ad565b612c7c565b346102a657610ec836610926565b610ef17f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b4057610f0d6109b86109ab835f52600260205260405f2090565b6001600160a01b0384169290610f24908414612854565b6001600160a01b0381169282908490610f3e82151561288d565b80331480156110ca575b80156110a5575b610f58906128cd565b6001600160a01b038781165f90815260036020908152604080832080545f190190559287168252828220805460010190558582526002905220610f9c908590610a5f565b610fb1610a93845f52600460205260405f2090565b5f80516020614bb38339815191525f80a4610fd7610ac9835f52600960205260405f2090565b611097575b3b15918215610fef575b6100208361200c565b604051630a85bd0160e11b81523360048201526001600160a01b039490941660248501526044840191909152608060648401525f6084840181905260209250839160a49183915af1801561109257610020915f91611063575b506001600160e01b031916630a85bd0160e11b145f80610fe6565b611085915060203d60201161108b575b61107d81836105c2565b810190611ff7565b5f611048565b503d611073565b611eab565b6110a08261290a565b610fdc565b50610f586110c16109b86109ab865f52600460205260405f2090565b33149050610f4f565b506110ec610ac933610b268a60018060a01b03165f52600560205260405f2090565b610f48565b346102a6575f3660031901126102a65760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b9181601f840112156102a6578235916001600160401b0383116102a6576020808501948460051b0101116102a657565b60403660031901126102a6576004356001600160401b0381116102a6576111ca9036906004016102b7565b6024356001600160401b0381116102a6576111e990369060040161116f565b915f80516020614b938339815191525c6001600160a01b03166112315761121f93335f80516020614b938339815191525d612cff565b5f5f80516020614b938339815191525d005b6337affdbf60e11b5f5260045ffd5b346102a65760403660031901126102a65760043561125d81610295565b6024359060018060a01b03165f52600660205260405f20905f52602052602060405f2054604051908152f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346102a65760203660031901126102a65760206112eb600435612084565b6040516001600160a01b039091168152f35b346102a65760203660031901126102a65760043561131a81610295565b6001600160a01b03168015611349575f52600360205261049d60405f2054604051918291829190602083019252565b60405162461bcd60e51b815260206004820152600c60248201526b5a45524f5f4144445245535360a01b6044820152606490fd5b346102a6575f3660031901126102a6576020600854604051908152f35b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b346102a65760203660031901126102a65760c06113fb6004356120a7565b611408604051809361139a565b60a0820152f35b346102a65760203660031901126102a65760043566ffffffffffffff1981168091036102a6575f908152600a60209081526040918290208054600182015460029283015485516001600160a01b0393841681528383169581019590955260a082811c62ffffff169686019690965260b89190911c90920b6060840152166080820152f35b346102a65760203660031901126102a6576004355f526009602052602060405f2054604051908152f35b346102a65760203660031901126102a6576004356001600160401b0381116102a6576114ed9036906004016102b7565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036115d65760408135189063ffffffff60408201351663ffffffe0601f8201169260608401602084013518179282019260608401359483641fffffffe08760051b16805f905b888183106115a7579050608092915001019101101761159a576060608063ffffffff61158f961694019201612cff565b61049d610491611ee0565b633b99b53d5f526004601cfd5b8294509263ffffffe0601f60808060209687969801013599848b1817998d01013501160101920186929161155f565b63570c108560e11b5f5260045ffd5b346102a6575f3660031901126102a6576040515f6001548060011c9060018116908115611690575b6020831082146106a557828552602085019190811561068c575060011461163e5761049d84610491818603826105c2565b60015f9081529250907fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b81841061167c575050016104918261062c565b805484840152602090930192600101611669565b91607f169161160d565b346102a65760403660031901126102a6576004356116b781610295565b60243580151581036102a6576100209133612c7c565b602081016020825282518091526040820191602060408360051b8301019401925f915b8383106116ff57505050505090565b909192939460208061171d600193603f1986820301875289516102e4565b970193019301919392906116f0565b60203660031901126102a6576004356001600160401b0381116102a65761175790369060040161116f565b906117618261215b565b9161176f60405193846105c2565b808352601f1961177e8261215b565b015f5b8181106117f95750505f5b8181106117a1576040518061049d86826116cd565b5f806117ae838587612186565b906117be604051809381936121cc565b0390305af46117cb611ef4565b90156117f157906001916117df82876121d9565b526117ea81866121d9565b500161178c565b602081519101fd5b806060602080938801015201611781565b60203660031901126102a6576004356118427f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40576118508133612a0e565b15610d9f576100209061290a565b346102a65760803660031901126102a65760043561187b81610295565b6024359061188882610295565b6044356064356001600160401b0381116102a6576118aa9036906004016102b7565b9390916118d67f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40576118f26109b86109ab835f52600260205260405f2090565b6001600160a01b0385169290611909908414612854565b6001600160a01b038116928290849061192382151561288d565b8033148015611a7f575b8015611a5a575b61193d906128cd565b6001600160a01b038881165f90815260036020908152604080832080545f190190559287168252828220805460010190558582526002905220611981908590610a5f565b611996610a93845f52600460205260405f2090565b5f80516020614bb38339815191525f80a46119bc610ac9835f52600960205260405f2090565b611a4c575b3b159384156119d4575b6100208561200c565b602094505f906119fb60405197889687958694630a85bd0160e11b865233600487016121ed565b03925af1801561109257610020915f91611a2d575b506001600160e01b031916630a85bd0160e11b145f8080806119cb565b611a46915060203d60201161108b5761107d81836105c2565b5f611a10565b611a558261290a565b6119c1565b5061193d611a766109b86109ab865f52600460205260405f2090565b33149050611934565b50611aa1610ac933610b268b60018060a01b03165f52600560205260405f2090565b61192d565b346102a65760203660031901126102a65760043560405163e9dc637560e01b815230600482015260248101919091525f816044817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa8015611092575f90611b23575b61049d9060405191829182610308565b503d805f833e611b3381836105c2565b8101906020818303126102a6578051906001600160401b0382116102a6570181601f820112156102a65761049d91816020611b709351910161221e565b611b13565b346102a6575f3660031901126102a6576040516001600160a01b035f80516020614b938339815191525c168152602090f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b60403660031901126102a6576004356001600160401b0381116102a657611c169036906004016102b7565b6024355f80516020614b938339815191525c6001600160a01b031661123157335f80516020614b938339815191525d804211611d02576040516348c8949160e01b8152602060048201525f8180611c71602482018789611e8b565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1801561109257611cb3575b610020612ced565b3d805f833e611cc281836105c2565b8101906020818303126102a6578051906001600160401b0382116102a657019080601f830112156102a6578151611cfb9260200161221e565b5080611cab565b63bfb22adf60e01b5f5260045260245ffd5b346102a65760403660031901126102a657602060ff611d6c600435611d3881610295565b60243590611d4582610295565b60018060a01b03165f526005845260405f209060018060a01b03165f5260205260405f2090565b54166040519015158152f35b366003190160c081126102a65760a0136102a6576020611da260a435611d9d81610295565b612281565b6040519060020b8152f35b359065ffffffffffff821682036102a657565b602435611dcc81610295565b6001600160a01b03168152604435611de381610295565b6001600160a01b0316602082015260643565ffffffffffff8116908190036102a657604082015260843565ffffffffffff811681036102a65765ffffffffffff60609116910152565b65ffffffffffff611e85606080938035611e4581610295565b6001600160a01b031686526020810135611e5e81610295565b6001600160a01b0316602087015283611e7960408301611dad565b16604087015201611dad565b16910152565b908060209392818452848401375f828201840152601f01601f1916010190565b6040513d5f823e3d90fd5b604051906102b56080836105c2565b6001600160401b0381116105bd57601f01601f191660200190565b60405190611eef6020836105c2565b5f8252565b3d15611f1e573d90611f0582611ec5565b91611f1360405193846105c2565b82523d5f602084013e565b606090565b604090610319949281528160208201520191611e8b565b467f000000000000000000000000000000000000000000000000000000000000000003611f85577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a86682527f0000000000000000000000000000000000000000000000000000000000000000604082015246606082015230608082015260808152611ff160a0826105c2565b51902090565b908160209103126102a65751610319816104ec565b1561201357565b60405162461bcd60e51b815260206004820152601060248201526f155394d0519157d49150d2541251539560821b6044820152606490fd5b1561205257565b60405162461bcd60e51b815260206004820152600a6024820152691393d517d3525395115160b21b6044820152606490fd5b5f908152600260205260409020546001600160a01b0316906102b582151561204b565b5f60806040516120b6816105a2565b82815282602082015282604082015282606082015201525f52600960205260405f20548066ffffffffffffff19165f52600a60205260405f20612158612148600260405193612104856105a2565b80546001600160a01b0390811686526001820154908116602087015262ffffff60a082901c16604087015260b81c60020b606086015201546001600160a01b031690565b6001600160a01b03166080830152565b91565b6001600160401b0381116105bd5760051b60200190565b634e487b7160e01b5f52603260045260245ffd5b91908110156121c75760051b81013590601e19813603018212156102a65701908135916001600160401b0383116102a65760200182360381136102a6579190565b612172565b908092918237015f815290565b80518210156121c75760209160051b010190565b6001600160a01b03918216815291166020820152604081019190915260806060820181905261031993910191611e8b565b92919261222a82611ec5565b9161223860405193846105c2565b8294818452818301116102a6578281602093845f96015e010152565b8060020b036102a657565b908160209103126102a6575161031981612254565b62ffffff8116036102a657565b60405163313b65df60e11b81529060043561229b81610295565b6001600160a01b031660048301526024356122b581610295565b6001600160a01b0316602483015262ffffff6044356122d381612274565b1660448301526064356122e581612254565b60020b606483015261230c6084356122fc81610295565b6001600160a01b03166084840152565b6001600160a01b0390811660a4830152602090829060c49082905f907f0000000000000000000000000000000000000000000000000000000000000000165af15f9181612361575b506103195750627fffff90565b61238491925060203d60201161238b575b61237c81836105c2565b81019061225f565b905f612354565b503d612372565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806123da575b6123cb57565b631c5deabb60e11b5f5260045ffd5b50337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614156123c5565b90600160ff82161b9160018060a01b03165f52600660205260405f209060081c5f5260205260405f2081815418809155161561244557565b623f613760e71b5f5260045ffd5b5f83815260046020526040902080546001600160a01b0319166001600160a01b038416179055906001600160a01b0390811691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a4565b906124b6611f3a565b916040519261190160f01b8452600284015260228301525f604060428420938281528260208201520152565b91908260409103126102a6576020823592013590565b634e487b7160e01b5f52601160045260245ffd5b60ff601b9116019060ff821161251e57565b6124f8565b90604010156121c75760400190565b90833b61263d57604181036125f157906020926125a38361257b61257561256761255f5f988801886124e2565b949097612523565b356001600160f81b03191690565b60f81c90565b935b604051948594859094939260ff6060936080840197845216602083015260408201520152565b838052039060015afa15611092575f516001600160a01b03169081156125e2576001600160a01b0316036125d357565b632057875960e21b5f5260045ffd5b638baa579f60e01b5f5260045ffd5b906040820361262e5760209261260e825f946125a39401906124e2565b9092906001600160ff1b038116906126289060ff1c61250c565b9361257d565b634be6321b60e01b5f5260045ffd5b90926126639360209360405195869485938493630b135d3f60e11b855260048501611f23565b03916001600160a01b03165afa908115611092575f916126a7575b506001600160e01b0319166374eca2c160e11b0161269857565b632c19a72f60e21b5f5260045ffd5b6126c0915060203d60201161108b5761107d81836105c2565b5f61267e565b92906127019260a092604051956026870152600686015260038501523084525f603a600c860120948160408201528160208201525220613d79565b6006810180911161251e57604080516020818101948552918101929092526127549290916127328160608101610d34565b51902060405180938192631e2eaeaf60e01b8352600483019190602083019252565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa8015611092576001600160801b03915f9161279c57501690565b6127be915060203d6020116127c2575b6127b681836105c2565b8101906127c9565b1690565b503d6127ac565b908160209103126102a6575190565b60405163789add5560e11b81527fc090fc4683624cfc3884e9d8de5eca132f2d0ec062aff75d43c0465d5ceeab23600482015290602090829060249082906001600160a01b03165afa908115611092575f91612835575b50151590565b61284e915060203d6020116127c2576127b681836105c2565b5f61282f565b1561285b57565b60405162461bcd60e51b815260206004820152600a60248201526957524f4e475f46524f4d60b01b6044820152606490fd5b1561289457565b60405162461bcd60e51b81526020600482015260116024820152701253959053125117d49150d25412515395607a1b6044820152606490fd5b156128d457565b60405162461bcd60e51b815260206004820152600e60248201526d1393d517d055551213d49256915160921b6044820152606490fd5b5f8181526007602052604090206001600160a01b0390612929906109ab565b169081156129ff575f818152600960205260409020805460ff1916905561295b610a93825f52600760205260405f2090565b813b612988575b7fa0ebb1de82db929a9153472f37d3a66dbede4436258311ad0f52a35a2c91d1505f80a3565b5a7f00000000000000000000000000000000000000000000000000000000000000008091106129fa57823b156102a657604051632bd1774560e21b815260048101839052905f908290602490829084908890f16129e6575b50612962565b806104b85f6129f4936105c2565b5f6129e0565b612d4f565b63046fcd8560e31b5f5260045ffd5b6001600160a01b03612a1f83612084565b6001600160a01b0383169116811492908315612a83575b508215612a4257505090565b60ff9250612a7e91906001600160a01b0390612a5d90612084565b165f52600560205260405f209060018060a01b03165f5260205260405f2090565b541690565b5f828152600460205260408120546001600160a01b03169091149350612a36565b803b15612abd57815f92918360208194519301915af190565b637c402b2160e01b5f5260045ffd5b6040516390bfb86560e01b81526001600160a01b0390911660048201526346abfb5960e11b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c46340f52f4f60e11b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b03909116600482015263a9059cbb60e01b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c4633c9fd93960e21b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b0390911660048201525f602482018190526080604483015260a03d601f01601f191690810160648401523d6084840152903d9060a484013e808201600460a482015260c4633d2cec6f60e21b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b03909116600482015263b1a9116f60e01b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c463ace9448160e01b91015260e40190fd5b6001600160a01b039081165f818152600560209081526040808320948616835293815292902090927f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c319291805460ff191695151560ff81169690961790556040519485526001600160a01b031693a3565b5f5f80516020614b938339815191525d565b90929193828403612d40575f5b84811015612d3857600190612d32818501612d2883888b612186565b913560f81c612d5e565b01612d0c565b509350505050565b63aaad13f760e01b5f5260045ffd5b6376a1e1d360e11b5f5260045ffd5b909190600b811015612e605780612d895750612d7d906102b592613bc4565b94939093929192613d30565b60048103612da85750612d9f906102b59261353c565b93929092613c5e565b60018103612dca5750612dbe906102b592613bc4565b94939093929192613c06565b60028103612df95750612de3612df3916102b593613907565b9890979691959295949394613188565b95613a34565b60058103612e255750612e12612e1f916102b5936137b2565b9790969591949294613188565b94613874565b9160038314612e48575050610d9c91505b635cda29d760e01b5f52600452602490565b6102b5925090612e579161353c565b93929092613578565b600d8103612e7c5750612e76906102b592613175565b90613511565b60118103612ea45750612e95612e9e916102b5936132f6565b92909192613188565b916134f6565b600b8103612ed85750612ed2612ec0612ecc926102b5946132f6565b938294939291936133b7565b926133d2565b916133f7565b600e8103612f0a5750612efe612ef4612f04926102b5946132f6565b9282949291613188565b9261330e565b91613322565b60128103612f255750612f20906102b592613011565b61329d565b60138103612f415750612f3b906102b592613175565b906131d8565b60148103612f685750612f5a612f62916102b593613175565b919091613188565b906131ba565b60158103612fb65750612f81612fb1916102b593613011565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690613068565b613118565b9160168314612fcb575050610d9c9150612e36565b6102b5925061300c91612fdd91613011565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031661301d565b6130a8565b9060201161159a573590565b613028903090613d99565b600160ff1b8214613063578115613052575b81116130435790565b631e9acf1760e31b5f5260045ffd5b905061305d5f613e01565b9061303a565b905090565b90613073305f613d99565b90600160ff1b83146130a2578215613090575b5081116130435790565b61309b919250613e01565b905f613086565b50905090565b806130b05750565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690813b156102a6575f91602483926040519485938492632e1a7d4d60e01b845260048401525af180156110925761310e5750565b5f6102b5916105c2565b806131205750565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a6575f90600460405180948193630d0e30db60e41b83525af180156110925761310e5750565b919060401161159a576020823592013590565b6001600160a01b038116600181036131ae5750505f80516020614b938339815191525c90565b60020361031957503090565b906131c482613e5e565b90816131cf57505050565b6102b592613eab565b906131e282613f3c565b90811561328857811161326f577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b156102a65760405163203c2d1360e21b81526001600160a01b0390911660048201526024810191909152905f908290604490829084905af18015611092576132615750565b806104b85f6102b5936105c2565b6102b5915f80516020614b938339815191525c90613322565b505050565b600160ff1b811461251e575f0390565b6132c881307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f80516020614b938339815191525c5f8312156132ec57612ed26102b59361328d565b6102b59291613322565b9060601161159a578035916040602083013592013590565b908161331e576103199150613f3c565b5090565b908215613288577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657604051630b0d9c0960e01b81526001600160a01b03938416600482015291909216602482015260448101929092525f908290606490829084905af18015611092576133a25750565b806133ae5f80936105c2565b8003126102a657565b156133ce575f80516020614b938339815191525c90565b3090565b90600160ff1b82036133e8576103199150613e5e565b8161331e576103199150613e01565b908215613288577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b156102a657604051632961046560e21b81526001600160a01b03821660048201525f8160248183885af18015611092576134e2575b506001600160a01b0381166134b1575050602090600460405180948193630476982d60e21b83525af18015611092576134965750565b6134ae9060203d6020116127c2576127b681836105c2565b50565b5f93602093926134c092613fe0565b600460405180948193630476982d60e21b83525af18015611092576134965750565b806104b85f6134f0936105c2565b5f613460565b916135086102b59382612f0482613f3c565b612f0482613f3c565b906102b5916135335f80516020614b938339815191525c9182612ed282613e01565b612ed282613e01565b919082359260208101359260408201359263ffffffff60608401351683019063ffffffff8235169360208084019386010191011061159a579190565b939290925f80516020614b938339815191525c6135958682612a0e565b1561373157506135a4856120a7565b9290938360081c60020b958460201c60020b966135d26135c689838a8d6126c6565b6001600160801b031690565b966135dc8a612084565b955f6135f08c5f52600960205260405f2090565b556135fa8b6140ca565b5f998961362c575b505050505050508160ff16613619575b5050505050565b61362294614233565b5f80808080613612565b60409495969a50906136919161366c61364c6136478d61415c565b61328d565b91613662613658611eb6565b97889060020b9052565b60020b6020870152565b84860152606084018c90528451632d35e7ed60e11b81529a8b94859460048601613767565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af18015611092575f965f916136f1575b50906136e0826136e5949398614175565b6141a9565b5f808080808080613602565b6136e097506136e59392915061371e9060403d60401161372a575b61371681836105c2565b810190613751565b979097919293506136cf565b503d61370c565b6301952d1b60e31b5f9081526001600160a01b0391909116600452602490fd5b91908260409103126102a6576020825192015190565b6060610319959361377b836101409561139a565b805160020b60a0840152602081015160020b60c0840152604081015160e08401520151610100820152816101208201520191611e8b565b91908260a08101359260c08201359260e083013592610100810135926101208201359263ffffffff6101408401351683019063ffffffff8235169360208084019386010191011061159a579190565b91908260a09103126102a657604051613819816105a2565b6080808294803561382981610295565b8452602081013561383981610295565b6020850152604081013561384c81612274565b6040850152606081013561385f81612254565b606085015201359161387083610295565b0152565b90916102b59796959493926001600160801b036139006138c060a06138993688613801565b207f00000000000000000000000000000000000000000000000000000000000000006142ba565b5050506138cc84614346565b6138d586614346565b6138e888356138e381610295565b613f3c565b916138fa60208a01356138e381610295565b93614666565b1692613a34565b9091819260a08301359260c08101359260e08201359261010083013592610120810135926101408201359263ffffffff6101608401351683019063ffffffff8235169360208084019386010191011061159a579190565b600260806102b593613990813561397481610295565b85546001600160a01b0319166001600160a01b03909116178555565b600184016139c160208301356139a581610295565b82546001600160a01b0319166001600160a01b03909116178255565b60408201356139cf81612274565b815460608401356139df81612254565b60b81b62ffffff60b81b169162ffffff60a01b9060a01b169065ffffffffffff60a01b191617179055013591613a1483610295565b0180546001600160a01b0319166001600160a01b03909216919091179055565b909194969297939597600854926001840160085560018060a01b038a1699613a5d8b151561288d565b5f858152600260205260409020546001600160a01b0316613b8e57613b09613b5d98613b5793876102b59e613ac286613aa9613b4f9860018060a01b03165f52600360205260405f2090565b80546001019055610a5f845f52600260205260405f2090565b5f5f80516020614bb38339815191528180a4613ade3688613801565b63ffffff0066ffffff000000009160a066ffffffffffffff199120169260081b169260201b16171790565b9283613b1d875f52600960205260405f2090565b5566ffffffffffffff1984165f818152600a6020526040902060010154869060b81c60020b15613b63575b505061415c565b923690613801565b906146fc565b506147c5565b613b82613b879266ffffffffffffff19165f52600a60205260405f2090565b61395e565b5f85613b48565b60405162461bcd60e51b815260206004820152600e60248201526d1053149150511657d3525395115160921b6044820152606490fd5b909181359260208301359260408101359260608201359263ffffffff60808401351683019063ffffffff8235169360208084019386010191011061159a579190565b90959495939192935f80516020614b938339815191525c613c278382612a0e565b156137315750956136e092826136476102b59899613c52613c4a613c58976120a7565b93909261415c565b916146fc565b90614175565b949394929091925f80516020614b938339815191525c613c7e8282612a0e565b1561373157506102b59495613d2b9282613c9a613c58946120a7565b90613c526001600160801b03613d25613cd660a085207f00000000000000000000000000000000000000000000000000000000000000006142ba565b505050613ce88660081c60020b614346565b613cf78760201c60020b614346565b8651613d0b906001600160a01b0316613f3c565b60208801519092906138fa906001600160a01b0316613f3c565b1661415c565b6147c5565b90959495939192935f80516020614b938339815191525c613d518382612a0e565b15613731575095613d2b9282613c526102b59899613d71613c58966120a7565b92909161415c565b604051602081019182526006604082015260408152611ff16060826105c2565b6001600160a01b038116613dac57503190565b6040516370a0823160e01b81526001600160a01b0392831660048201529160209183916024918391165afa908115611092575f91613de8575090565b610319915060203d6020116127c2576127b681836105c2565b613e2c81307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f8213613e3e57506103199061328d565b63019a8d9360e51b5f9081526001600160a01b0391909116600452602490fd5b6001600160a01b038116613e7157504790565b6040516370a0823160e01b815230600482015290602090829060249082906001600160a01b03165afa908115611092575f91613de8575090565b9091906001600160a01b038116613ed857505f808080613ecc94865af11590565b613ed35750565b612ba6565b6040805163a9059cbb60e01b81526001600160a01b039094166004850152602484019290925291905f9060208260448582885af13d15601f3d11600185511416171692828152826020820152015215613f2e5750565b6001600160a01b0316612b39565b613f6781307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f8212613f73575090565b634c085bf160e01b5f9081526001600160a01b0391909116600452602490fd5b6001600160a01b039182165f9081529282166020908152604093849020935163789add5560e11b815260048101949094529183916024918391165afa908115611092575f91613de8575090565b9091906001600160a01b0383163003614028576102b592507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690613eab565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657604051631b63c28b60e11b81526001600160a01b0394851660048201527f00000000000000000000000000000000000000000000000000000000000000008516602482015291841660448301529190921660648301525f908290608490829084905af18015611092576132615750565b5f818152600260205260408120546001600160a01b03166140ec81151561204b565b80825260036020526040822082198154019055614111835f52600260205260405f2090565b80546001600160a01b03848116600386901b90811b91901b1991821681179092555f858152600460205260409020805490911690911790555f80516020614bb38339815191528280a4565b905f821261416657565b6393dafdf160e01b5f5260045ffd5b6141989061418a8360801d8260801d036148a2565b92600f0b90600f0b036148a2565b6001600160801b03169060801b1790565b929190926001600160801b038160801d94816141c4876148b0565b9116918291161061422157506001600160801b03929350600f0b90826141e9836148b0565b911692839116106141f8575050565b9061420a6001600160801b03926148b0565b90630940b79160e11b5f526004521660245260445ffd5b6001600160801b039061420a866148b0565b5f81815260076020526040902080546001600160a01b031981169091556001600160a01b0316946142ae94610d489492939192909160405163b1a9116f60e01b602082015260248101959095526001600160a01b031660448501526064840152608483015260a4808301919091528152610d4260c4826105c2565b6142b55750565b612c0f565b91906142c7602091613d79565b604051631e2eaeaf60e01b8152600481019190915292839060249082906001600160a01b03165afa918215611092575f92614325575b506001600160a01b0382169160a081901c60020b9162ffffff60b883901c81169260d01c1690565b61433f91925060203d6020116127c2576127b681836105c2565b905f6142fd565b60020b908160ff1d82810118620d89e881116146605763ffffffff9192600182167001fffcb933bd6fad37aa2d162d1a59400102600160801b189160028116614644575b60048116614628575b6008811661460c575b601081166145f0575b602081166145d4575b604081166145b8575b6080811661459c575b6101008116614580575b6102008116614564575b6104008116614548575b610800811661452c575b6110008116614510575b61200081166144f4575b61400081166144d8575b61800081166144bc575b6201000081166144a0575b620200008116614485575b62040000811661446a575b6208000016614451575b5f12614449575b0160201c90565b5f1904614442565b6b048a170391f7dc42444e8fa290910260801c9061443b565b6d2216e584f5fa1ea926041bedfe9890920260801c91614431565b916e5d6af8dedb81196699c329225ee6040260801c91614426565b916f09aa508b5b7a84e1c677de54f3e99bc90260801c9161441b565b916f31be135f97d08fd981231505542fcfa60260801c91614410565b916f70d869a156d2a1b890bb3df62baf32f70260801c91614406565b916fa9f746462d870fdf8a65dc1f90e061e50260801c916143fc565b916fd097f3bdfd2022b8845ad8f792aa58250260801c916143f2565b916fe7159475a2c29b7443b29c7fa6e889d90260801c916143e8565b916ff3392b0822b70005940c7a398e4b70f30260801c916143de565b916ff987a7253ac413176f2b074cf7815e540260801c916143d4565b916ffcbe86c7900a88aedcffc83b479aa3a40260801c916143ca565b916ffe5dee046a99a2a811c461f1969c30530260801c916143c0565b916fff2ea16466c96a3843ec78b326b528610260801c916143b7565b916fff973b41fa98c081472e6896dfb254c00260801c916143ae565b916fffcb9843d60f6159c9db58835c9266440260801c916143a5565b916fffe5caca7e10e4e61c3624eaa0941cd00260801c9161439c565b916ffff2e50f5f656932ef12357cf3c7fdcc0260801c91614393565b916ffff97272373d413259a46990580e213a0260801c9161438a565b826148c6565b936001600160a01b03838116908316116146f4575b6001600160a01b0385811695908316861161469c5750506103199350614915565b919490939192906001600160a01b03821611156146e85782916146c3916146c99594614915565b936148db565b6001600160801b0381166001600160801b038316105f14613063575090565b915050610319926148db565b90919061467b565b95939460409161474961470d611eb6565b60088a901c60020b81529260208a811c60020b90850152858585015286606085015284519889948594632d35e7ed60e11b865260048601613767565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1908115611092575f945f926147a1575b5081949560ff1661479857505050565b6102b592614962565b9094506147bd915060403d60401161372a5761371681836105c2565b90935f614788565b908160801d600f0b91600f0b915f81128061487f575b6148485750505f811280614823575b6147f2575050565b906148026135c6610d9c9361328d565b63031e30ad60e41b5f526001600160801b0391821660045216602452604490565b506001600160801b03806148368361328d565b16166001600160801b038316106147ea565b906001600160801b0361485d610d9c9361328d565b63031e30ad60e41b5f526001600160801b039283166004521616602452604490565b506001600160801b036148918261328d565b166001600160801b038316106147db565b9081600f0b91820361416657565b5f81600f0b12614166576001600160801b031690565b6345c3193d60e11b5f5260020b60045260245ffd5b6103199261490a9290916001600160a01b038083169082161161490f575b90036001600160a01b031690614a25565b614b7e565b906148f9565b6103199261490a929091906001600160a01b038082169083161161495c575b61494a6001600160a01b03828116908416614ab2565b9190036001600160a01b031691614afb565b90614934565b6149b29192815f52600760205260018060a01b0360405f205416936040519263d8865c2760e01b6020850152602484015260448301526064820152606481526149ac6084826105c2565b82612aa4565b156149ba5750565b6040516390bfb86560e01b8152600481019190915263d8865c2760e01b602482015260806044820152601f3d01601f191660a0810160648301523d60848301523d5f60a484013e808201600460a482015260c46374a7887160e11b91015260e40190fd5b156102a657565b90606082901b905f19600160601b8409928280851094039380850394614a4c868511614a1e565b14614aab578190600160601b900981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b5091500490565b81810291905f1982820991838084109303928084039384600160601b11156102a65714614af257600160601b910990828211900360a01b910360601c1790565b50505060601c90565b91818302915f19818509938380861095039480860395614b1c878611614a1e565b14614b76579082910981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b505091500490565b906001600160801b0382168092036141665756fe0aedd6bde10e3aa2adec092b02a3e3e805795516cda41f27aa145b8f300af87addf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220170a66356ae2a8a64b26f643e5a93d930154bae57c050fc67cd6b497768faf9064736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610022575b3615610018575f80fd5b610020612392565b005b5f3560e01c80622a3e3a1461029057806301ffc9a71461028b57806305c1ee201461028657806306fdde0314610281578063081812fc1461027c578063095ea7b3146102775780630f5730f11461027257806312261ee71461026d57806316a24131146102685780631efeed331461026357806323b872dd1461025e5780632b67b570146102595780632b9261de146102545780633644e5151461024f5780633aea60f01461024a57806342842e0e146102455780634767565f146102405780634aa4a4fc1461023b5780634afe393c14610236578063502e1a16146102315780635a9d7a681461022c5780636352211e1461022757806370a082311461022257806375794a3c1461021d5780637ba03aad1461021857806386b6be7d1461021357806389097a6a1461020e57806391dd73461461020957806395d89b4114610204578063a22cb465146101ff578063ac9650d8146101fa578063ad0b27fb146101f5578063b88d4fde146101f0578063c87b56dd146101eb578063d737d0c7146101e6578063dc4c90d3146101e1578063dd46508f146101dc578063e985e9c5146101d75763f70204050361000e57611d78565b611d14565b611beb565b611ba7565b611b75565b611aa6565b61185e565b61180a565b61172c565b61169a565b6115e5565b6114bd565b611493565b61140f565b6113dd565b61137d565b6112fd565b6112cd565b611289565b611240565b61119f565b61112b565b6110f1565b610eba565b610de3565b610db2565b610c32565b610b4f565b610952565b6108de565b6108ac565b610868565b610775565b6106f5565b6106c3565b6105e3565b61056c565b6104fe565b61031c565b6001600160a01b038116036102a657565b5f80fd5b35906102b582610295565b565b9181601f840112156102a6578235916001600160401b0383116102a657602083818601950101116102a657565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b9060206103199281815201906102e4565b90565b60603660031901126102a65760043561033481610295565b602435906001600160401b0382116102a6578136039160606003198401126102a6576044356001600160401b0381116102a6576103759036906004016102b7565b6060947f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031693909290843b156102a657604051632a2d80d160e01b81526001600160a01b039096166004808801919091526060602488015260c48701949082013590602219018112156102a6578101602460048201359101946001600160401b0382116102a6578160071b360386136102a65760606064890152819052869460e48601949392915f5b8181106104c4575050506104755f96948694889460448561045d61044d60248b99016102aa565b6001600160a01b03166084890152565b013560a4860152848303600319016044860152611e8b565b03925af190816104aa575b506104a1575061049d610491611ef4565b60405191829182610308565b0390f35b61049d90610491565b806104b85f6104be936105c2565b80610584565b5f610480565b91965091929394608080826104db6001948b611e2c565b019701910191889695949392610426565b6001600160e01b03198116036102a657565b346102a65760203660031901126102a657602060043561051d816104ec565b63ffffffff60e01b166301ffc9a760e01b811490811561055b575b811561054a575b506040519015158152f35b635b5e139f60e01b1490505f61053f565b6380ac58cd60e01b81149150610538565b60203660031901126102a6576100206004353361240d565b5f9103126102a657565b634e487b7160e01b5f52604160045260245ffd5b60a081019081106001600160401b038211176105bd57604052565b61058e565b90601f801991011681019081106001600160401b038211176105bd57604052565b346102a6575f3660031901126102a6576040515f80548060011c90600181169081156106b9575b6020831082146106a557828552602085019190811561068c575060011461063c575b61049d84610491818603826105c2565b5f8080529250907f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818410610678575050016104918261062c565b805484840152602090930192600101610665565b60ff191682525090151560051b0190506104918261062c565b634e487b7160e01b5f52602260045260245ffd5b91607f169161060a565b346102a65760203660031901126102a6576004355f526004602052602060018060a01b0360405f205416604051908152f35b346102a65760403660031901126102a65760043561071281610295565b6024355f818152600260205260409020546001600160a01b0316913383141580610752575b6107445761002092612453565b6282b42960e81b5f5260045ffd5b505f83815260056020908152604080832033845290915290205460ff1615610737565b60a03660031901126102a65760043561078d81610295565b60243560443591606435926084356001600160401b0381116102a6576107b79036906004016102b7565b948242116108595761084e856108549361002098610848885f80998682526002602052818960018060a01b036040832054169c8d9981604051977f49ecf333e5b8c95c40fdafc95c1ad136e8914a8fb55e9dc8bb01eaa83a2df9ad8952602089019060018060a01b031681526040890192835260608901948552608089019687528160a08a209952525252526124ad565b91612532565b8261240d565b612453565b635a9165ff60e01b5f5260045ffd5b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346102a65760203660031901126102a6576004355f526007602052602060018060a01b0360405f205416604051908152f35b346102a65760203660031901126102a6576020610915600435610900816120a7565b919082851c60020b9260081c60020b916126c6565b6001600160801b0360405191168152f35b60609060031901126102a65760043561093e81610295565b9060243561094b81610295565b9060443590565b346102a65761096036610926565b9161098a7f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40578291610a7e6109c46109b86109ab865f52600260205260405f2090565b546001600160a01b031690565b6001600160a01b031690565b6001600160a01b03841692906109db908414612854565b6001600160a01b03811693610a28906109f586151561288d565b8433148015610b04575b8015610adf575b610a0f906128cd565b6001600160a01b03165f90815260036020526040902090565b80545f190190556001600160a01b0381165f90815260036020526040902080546001019055610a5f855f52600260205260405f2090565b80546001600160a01b0319166001600160a01b03909216919091179055565b610aa3610a93845f52600460205260405f2090565b80546001600160a01b0319169055565b5f80516020614bb38339815191525f80a4610ad0610ac9825f52600960205260405f2090565b5460ff1690565b610ad657005b6100209061290a565b50610a0f610afb6109b86109ab8a5f52600460205260405f2090565b33149050610a06565b50610b3b610ac933610b268460018060a01b03165f52600560205260405f2090565b9060018060a01b03165f5260205260405f2090565b6109ff565b6306a582ff60e51b5f5260045ffd5b6101003660031901126102a657600435610b6881610295565b60c03660231901126102a65760e4356001600160401b0381116102a657610b939036906004016102b7565b60609290917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657610475935f8094604051968795869485936302b67b5760e41b855260018060a01b03166004850152610bfd60248501611dc0565b60a435610c0981610295565b6001600160a01b031660a485015260c43560c485015261010060e4850152610104840191611e8b565b60603660031901126102a657602435600435610c4d82610295565b6044356001600160401b0381116102a657610c6c9036906004016102b7565b610c989391937f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b4057610ca68333612a0e565b15610d9f575f8381526007602052604090206001600160a01b0390610cca906109ab565b1680610d7c57505f83815260096020526040902080546001179055610d4c90610d48905f8581526007602052604090206001600160a01b03851696610d4291610d14908990610a5f565b610d346040519384926346abfb5960e11b60208501528960248501611f23565b03601f1981018352826105c2565b83612aa4565b1590565b610d7757507f9709492381f90bdc5938bb4e3b8e35b7e0eac8af058619e27191c5a40ce79fa95f80a3005b612acc565b6312fdec5f60e11b5f5260048490526001600160a01b031660245260445ffd5b5ffd5b6301952d1b60e31b5f523360045260245ffd5b346102a6575f3660031901126102a6576020610dcc611f3a565b604051908152f35b6044359081151582036102a657565b60c03660031901126102a657600435610dfb81610295565b602435610e0781610295565b610e0f610dd4565b906064359260843560a4356001600160401b0381116102a657610e369036906004016102b7565b8692919242116108595783610eb59361084e92610848885f6100209c8189818f81604051977f6673cb397ee2a50b6b8401653d3638b4ac8b3db9c28aa6870ffceb7574ec2f768952602089019060018060a01b03168152600160408a019316835260608901948552608089019687528160a08a209952525252526124ad565b612c7c565b346102a657610ec836610926565b610ef17f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b4057610f0d6109b86109ab835f52600260205260405f2090565b6001600160a01b0384169290610f24908414612854565b6001600160a01b0381169282908490610f3e82151561288d565b80331480156110ca575b80156110a5575b610f58906128cd565b6001600160a01b038781165f90815260036020908152604080832080545f190190559287168252828220805460010190558582526002905220610f9c908590610a5f565b610fb1610a93845f52600460205260405f2090565b5f80516020614bb38339815191525f80a4610fd7610ac9835f52600960205260405f2090565b611097575b3b15918215610fef575b6100208361200c565b604051630a85bd0160e11b81523360048201526001600160a01b039490941660248501526044840191909152608060648401525f6084840181905260209250839160a49183915af1801561109257610020915f91611063575b506001600160e01b031916630a85bd0160e11b145f80610fe6565b611085915060203d60201161108b575b61107d81836105c2565b810190611ff7565b5f611048565b503d611073565b611eab565b6110a08261290a565b610fdc565b50610f586110c16109b86109ab865f52600460205260405f2090565b33149050610f4f565b506110ec610ac933610b268a60018060a01b03165f52600560205260405f2090565b610f48565b346102a6575f3660031901126102a65760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b9181601f840112156102a6578235916001600160401b0383116102a6576020808501948460051b0101116102a657565b60403660031901126102a6576004356001600160401b0381116102a6576111ca9036906004016102b7565b6024356001600160401b0381116102a6576111e990369060040161116f565b915f80516020614b938339815191525c6001600160a01b03166112315761121f93335f80516020614b938339815191525d612cff565b5f5f80516020614b938339815191525d005b6337affdbf60e11b5f5260045ffd5b346102a65760403660031901126102a65760043561125d81610295565b6024359060018060a01b03165f52600660205260405f20905f52602052602060405f2054604051908152f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b346102a65760203660031901126102a65760206112eb600435612084565b6040516001600160a01b039091168152f35b346102a65760203660031901126102a65760043561131a81610295565b6001600160a01b03168015611349575f52600360205261049d60405f2054604051918291829190602083019252565b60405162461bcd60e51b815260206004820152600c60248201526b5a45524f5f4144445245535360a01b6044820152606490fd5b346102a6575f3660031901126102a6576020600854604051908152f35b80516001600160a01b03908116835260208083015182169084015260408083015162ffffff169084015260608083015160020b9084015260809182015116910152565b346102a65760203660031901126102a65760c06113fb6004356120a7565b611408604051809361139a565b60a0820152f35b346102a65760203660031901126102a65760043566ffffffffffffff1981168091036102a6575f908152600a60209081526040918290208054600182015460029283015485516001600160a01b0393841681528383169581019590955260a082811c62ffffff169686019690965260b89190911c90920b6060840152166080820152f35b346102a65760203660031901126102a6576004355f526009602052602060405f2054604051908152f35b346102a65760203660031901126102a6576004356001600160401b0381116102a6576114ed9036906004016102b7565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036115d65760408135189063ffffffff60408201351663ffffffe0601f8201169260608401602084013518179282019260608401359483641fffffffe08760051b16805f905b888183106115a7579050608092915001019101101761159a576060608063ffffffff61158f961694019201612cff565b61049d610491611ee0565b633b99b53d5f526004601cfd5b8294509263ffffffe0601f60808060209687969801013599848b1817998d01013501160101920186929161155f565b63570c108560e11b5f5260045ffd5b346102a6575f3660031901126102a6576040515f6001548060011c9060018116908115611690575b6020831082146106a557828552602085019190811561068c575060011461163e5761049d84610491818603826105c2565b60015f9081529250907fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf65b81841061167c575050016104918261062c565b805484840152602090930192600101611669565b91607f169161160d565b346102a65760403660031901126102a6576004356116b781610295565b60243580151581036102a6576100209133612c7c565b602081016020825282518091526040820191602060408360051b8301019401925f915b8383106116ff57505050505090565b909192939460208061171d600193603f1986820301875289516102e4565b970193019301919392906116f0565b60203660031901126102a6576004356001600160401b0381116102a65761175790369060040161116f565b906117618261215b565b9161176f60405193846105c2565b808352601f1961177e8261215b565b015f5b8181106117f95750505f5b8181106117a1576040518061049d86826116cd565b5f806117ae838587612186565b906117be604051809381936121cc565b0390305af46117cb611ef4565b90156117f157906001916117df82876121d9565b526117ea81866121d9565b500161178c565b602081519101fd5b806060602080938801015201611781565b60203660031901126102a6576004356118427f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40576118508133612a0e565b15610d9f576100209061290a565b346102a65760803660031901126102a65760043561187b81610295565b6024359061188882610295565b6044356064356001600160401b0381116102a6576118aa9036906004016102b7565b9390916118d67f00000000000000000000000000000000000000000000000000000000000000006127d8565b610b40576118f26109b86109ab835f52600260205260405f2090565b6001600160a01b0385169290611909908414612854565b6001600160a01b038116928290849061192382151561288d565b8033148015611a7f575b8015611a5a575b61193d906128cd565b6001600160a01b038881165f90815260036020908152604080832080545f190190559287168252828220805460010190558582526002905220611981908590610a5f565b611996610a93845f52600460205260405f2090565b5f80516020614bb38339815191525f80a46119bc610ac9835f52600960205260405f2090565b611a4c575b3b159384156119d4575b6100208561200c565b602094505f906119fb60405197889687958694630a85bd0160e11b865233600487016121ed565b03925af1801561109257610020915f91611a2d575b506001600160e01b031916630a85bd0160e11b145f8080806119cb565b611a46915060203d60201161108b5761107d81836105c2565b5f611a10565b611a558261290a565b6119c1565b5061193d611a766109b86109ab865f52600460205260405f2090565b33149050611934565b50611aa1610ac933610b268b60018060a01b03165f52600560205260405f2090565b61192d565b346102a65760203660031901126102a65760043560405163e9dc637560e01b815230600482015260248101919091525f816044817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa8015611092575f90611b23575b61049d9060405191829182610308565b503d805f833e611b3381836105c2565b8101906020818303126102a6578051906001600160401b0382116102a6570181601f820112156102a65761049d91816020611b709351910161221e565b611b13565b346102a6575f3660031901126102a6576040516001600160a01b035f80516020614b938339815191525c168152602090f35b346102a6575f3660031901126102a6576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b60403660031901126102a6576004356001600160401b0381116102a657611c169036906004016102b7565b6024355f80516020614b938339815191525c6001600160a01b031661123157335f80516020614b938339815191525d804211611d02576040516348c8949160e01b8152602060048201525f8180611c71602482018789611e8b565b0381837f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1801561109257611cb3575b610020612ced565b3d805f833e611cc281836105c2565b8101906020818303126102a6578051906001600160401b0382116102a657019080601f830112156102a6578151611cfb9260200161221e565b5080611cab565b63bfb22adf60e01b5f5260045260245ffd5b346102a65760403660031901126102a657602060ff611d6c600435611d3881610295565b60243590611d4582610295565b60018060a01b03165f526005845260405f209060018060a01b03165f5260205260405f2090565b54166040519015158152f35b366003190160c081126102a65760a0136102a6576020611da260a435611d9d81610295565b612281565b6040519060020b8152f35b359065ffffffffffff821682036102a657565b602435611dcc81610295565b6001600160a01b03168152604435611de381610295565b6001600160a01b0316602082015260643565ffffffffffff8116908190036102a657604082015260843565ffffffffffff811681036102a65765ffffffffffff60609116910152565b65ffffffffffff611e85606080938035611e4581610295565b6001600160a01b031686526020810135611e5e81610295565b6001600160a01b0316602087015283611e7960408301611dad565b16604087015201611dad565b16910152565b908060209392818452848401375f828201840152601f01601f1916010190565b6040513d5f823e3d90fd5b604051906102b56080836105c2565b6001600160401b0381116105bd57601f01601f191660200190565b60405190611eef6020836105c2565b5f8252565b3d15611f1e573d90611f0582611ec5565b91611f1360405193846105c2565b82523d5f602084013e565b606090565b604090610319949281528160208201520191611e8b565b467f000000000000000000000000000000000000000000000000000000000000000003611f85577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8cad95687ba82c2ce50e74f7b754645e5117c3a5bec8151c0726d5857980a86682527f0000000000000000000000000000000000000000000000000000000000000000604082015246606082015230608082015260808152611ff160a0826105c2565b51902090565b908160209103126102a65751610319816104ec565b1561201357565b60405162461bcd60e51b815260206004820152601060248201526f155394d0519157d49150d2541251539560821b6044820152606490fd5b1561205257565b60405162461bcd60e51b815260206004820152600a6024820152691393d517d3525395115160b21b6044820152606490fd5b5f908152600260205260409020546001600160a01b0316906102b582151561204b565b5f60806040516120b6816105a2565b82815282602082015282604082015282606082015201525f52600960205260405f20548066ffffffffffffff19165f52600a60205260405f20612158612148600260405193612104856105a2565b80546001600160a01b0390811686526001820154908116602087015262ffffff60a082901c16604087015260b81c60020b606086015201546001600160a01b031690565b6001600160a01b03166080830152565b91565b6001600160401b0381116105bd5760051b60200190565b634e487b7160e01b5f52603260045260245ffd5b91908110156121c75760051b81013590601e19813603018212156102a65701908135916001600160401b0383116102a65760200182360381136102a6579190565b612172565b908092918237015f815290565b80518210156121c75760209160051b010190565b6001600160a01b03918216815291166020820152604081019190915260806060820181905261031993910191611e8b565b92919261222a82611ec5565b9161223860405193846105c2565b8294818452818301116102a6578281602093845f96015e010152565b8060020b036102a657565b908160209103126102a6575161031981612254565b62ffffff8116036102a657565b60405163313b65df60e11b81529060043561229b81610295565b6001600160a01b031660048301526024356122b581610295565b6001600160a01b0316602483015262ffffff6044356122d381612274565b1660448301526064356122e581612254565b60020b606483015261230c6084356122fc81610295565b6001600160a01b03166084840152565b6001600160a01b0390811660a4830152602090829060c49082905f907f0000000000000000000000000000000000000000000000000000000000000000165af15f9181612361575b506103195750627fffff90565b61238491925060203d60201161238b575b61237c81836105c2565b81019061225f565b905f612354565b503d612372565b337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161415806123da575b6123cb57565b631c5deabb60e11b5f5260045ffd5b50337f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031614156123c5565b90600160ff82161b9160018060a01b03165f52600660205260405f209060081c5f5260205260405f2081815418809155161561244557565b623f613760e71b5f5260045ffd5b5f83815260046020526040902080546001600160a01b0319166001600160a01b038416179055906001600160a01b0390811691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a4565b906124b6611f3a565b916040519261190160f01b8452600284015260228301525f604060428420938281528260208201520152565b91908260409103126102a6576020823592013590565b634e487b7160e01b5f52601160045260245ffd5b60ff601b9116019060ff821161251e57565b6124f8565b90604010156121c75760400190565b90833b61263d57604181036125f157906020926125a38361257b61257561256761255f5f988801886124e2565b949097612523565b356001600160f81b03191690565b60f81c90565b935b604051948594859094939260ff6060936080840197845216602083015260408201520152565b838052039060015afa15611092575f516001600160a01b03169081156125e2576001600160a01b0316036125d357565b632057875960e21b5f5260045ffd5b638baa579f60e01b5f5260045ffd5b906040820361262e5760209261260e825f946125a39401906124e2565b9092906001600160ff1b038116906126289060ff1c61250c565b9361257d565b634be6321b60e01b5f5260045ffd5b90926126639360209360405195869485938493630b135d3f60e11b855260048501611f23565b03916001600160a01b03165afa908115611092575f916126a7575b506001600160e01b0319166374eca2c160e11b0161269857565b632c19a72f60e21b5f5260045ffd5b6126c0915060203d60201161108b5761107d81836105c2565b5f61267e565b92906127019260a092604051956026870152600686015260038501523084525f603a600c860120948160408201528160208201525220613d79565b6006810180911161251e57604080516020818101948552918101929092526127549290916127328160608101610d34565b51902060405180938192631e2eaeaf60e01b8352600483019190602083019252565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa8015611092576001600160801b03915f9161279c57501690565b6127be915060203d6020116127c2575b6127b681836105c2565b8101906127c9565b1690565b503d6127ac565b908160209103126102a6575190565b60405163789add5560e11b81527fc090fc4683624cfc3884e9d8de5eca132f2d0ec062aff75d43c0465d5ceeab23600482015290602090829060249082906001600160a01b03165afa908115611092575f91612835575b50151590565b61284e915060203d6020116127c2576127b681836105c2565b5f61282f565b1561285b57565b60405162461bcd60e51b815260206004820152600a60248201526957524f4e475f46524f4d60b01b6044820152606490fd5b1561289457565b60405162461bcd60e51b81526020600482015260116024820152701253959053125117d49150d25412515395607a1b6044820152606490fd5b156128d457565b60405162461bcd60e51b815260206004820152600e60248201526d1393d517d055551213d49256915160921b6044820152606490fd5b5f8181526007602052604090206001600160a01b0390612929906109ab565b169081156129ff575f818152600960205260409020805460ff1916905561295b610a93825f52600760205260405f2090565b813b612988575b7fa0ebb1de82db929a9153472f37d3a66dbede4436258311ad0f52a35a2c91d1505f80a3565b5a7f00000000000000000000000000000000000000000000000000000000000000008091106129fa57823b156102a657604051632bd1774560e21b815260048101839052905f908290602490829084908890f16129e6575b50612962565b806104b85f6129f4936105c2565b5f6129e0565b612d4f565b63046fcd8560e31b5f5260045ffd5b6001600160a01b03612a1f83612084565b6001600160a01b0383169116811492908315612a83575b508215612a4257505090565b60ff9250612a7e91906001600160a01b0390612a5d90612084565b165f52600560205260405f209060018060a01b03165f5260205260405f2090565b541690565b5f828152600460205260408120546001600160a01b03169091149350612a36565b803b15612abd57815f92918360208194519301915af190565b637c402b2160e01b5f5260045ffd5b6040516390bfb86560e01b81526001600160a01b0390911660048201526346abfb5960e11b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c46340f52f4f60e11b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b03909116600482015263a9059cbb60e01b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c4633c9fd93960e21b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b0390911660048201525f602482018190526080604483015260a03d601f01601f191690810160648401523d6084840152903d9060a484013e808201600460a482015260c4633d2cec6f60e21b91015260e40190fd5b6040516390bfb86560e01b81526001600160a01b03909116600482015263b1a9116f60e01b60248201526080604482015260a03d601f01601f191690810160648301523d60848301523d5f60a484013e808201600460a482015260c463ace9448160e01b91015260e40190fd5b6001600160a01b039081165f818152600560209081526040808320948616835293815292902090927f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c319291805460ff191695151560ff81169690961790556040519485526001600160a01b031693a3565b5f5f80516020614b938339815191525d565b90929193828403612d40575f5b84811015612d3857600190612d32818501612d2883888b612186565b913560f81c612d5e565b01612d0c565b509350505050565b63aaad13f760e01b5f5260045ffd5b6376a1e1d360e11b5f5260045ffd5b909190600b811015612e605780612d895750612d7d906102b592613bc4565b94939093929192613d30565b60048103612da85750612d9f906102b59261353c565b93929092613c5e565b60018103612dca5750612dbe906102b592613bc4565b94939093929192613c06565b60028103612df95750612de3612df3916102b593613907565b9890979691959295949394613188565b95613a34565b60058103612e255750612e12612e1f916102b5936137b2565b9790969591949294613188565b94613874565b9160038314612e48575050610d9c91505b635cda29d760e01b5f52600452602490565b6102b5925090612e579161353c565b93929092613578565b600d8103612e7c5750612e76906102b592613175565b90613511565b60118103612ea45750612e95612e9e916102b5936132f6565b92909192613188565b916134f6565b600b8103612ed85750612ed2612ec0612ecc926102b5946132f6565b938294939291936133b7565b926133d2565b916133f7565b600e8103612f0a5750612efe612ef4612f04926102b5946132f6565b9282949291613188565b9261330e565b91613322565b60128103612f255750612f20906102b592613011565b61329d565b60138103612f415750612f3b906102b592613175565b906131d8565b60148103612f685750612f5a612f62916102b593613175565b919091613188565b906131ba565b60158103612fb65750612f81612fb1916102b593613011565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690613068565b613118565b9160168314612fcb575050610d9c9150612e36565b6102b5925061300c91612fdd91613011565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031661301d565b6130a8565b9060201161159a573590565b613028903090613d99565b600160ff1b8214613063578115613052575b81116130435790565b631e9acf1760e31b5f5260045ffd5b905061305d5f613e01565b9061303a565b905090565b90613073305f613d99565b90600160ff1b83146130a2578215613090575b5081116130435790565b61309b919250613e01565b905f613086565b50905090565b806130b05750565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690813b156102a6575f91602483926040519485938492632e1a7d4d60e01b845260048401525af180156110925761310e5750565b5f6102b5916105c2565b806131205750565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a6575f90600460405180948193630d0e30db60e41b83525af180156110925761310e5750565b919060401161159a576020823592013590565b6001600160a01b038116600181036131ae5750505f80516020614b938339815191525c90565b60020361031957503090565b906131c482613e5e565b90816131cf57505050565b6102b592613eab565b906131e282613f3c565b90811561328857811161326f577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b156102a65760405163203c2d1360e21b81526001600160a01b0390911660048201526024810191909152905f908290604490829084905af18015611092576132615750565b806104b85f6102b5936105c2565b6102b5915f80516020614b938339815191525c90613322565b505050565b600160ff1b811461251e575f0390565b6132c881307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f80516020614b938339815191525c5f8312156132ec57612ed26102b59361328d565b6102b59291613322565b9060601161159a578035916040602083013592013590565b908161331e576103199150613f3c565b5090565b908215613288577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657604051630b0d9c0960e01b81526001600160a01b03938416600482015291909216602482015260448101929092525f908290606490829084905af18015611092576133a25750565b806133ae5f80936105c2565b8003126102a657565b156133ce575f80516020614b938339815191525c90565b3090565b90600160ff1b82036133e8576103199150613e5e565b8161331e576103199150613e01565b908215613288577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b156102a657604051632961046560e21b81526001600160a01b03821660048201525f8160248183885af18015611092576134e2575b506001600160a01b0381166134b1575050602090600460405180948193630476982d60e21b83525af18015611092576134965750565b6134ae9060203d6020116127c2576127b681836105c2565b50565b5f93602093926134c092613fe0565b600460405180948193630476982d60e21b83525af18015611092576134965750565b806104b85f6134f0936105c2565b5f613460565b916135086102b59382612f0482613f3c565b612f0482613f3c565b906102b5916135335f80516020614b938339815191525c9182612ed282613e01565b612ed282613e01565b919082359260208101359260408201359263ffffffff60608401351683019063ffffffff8235169360208084019386010191011061159a579190565b939290925f80516020614b938339815191525c6135958682612a0e565b1561373157506135a4856120a7565b9290938360081c60020b958460201c60020b966135d26135c689838a8d6126c6565b6001600160801b031690565b966135dc8a612084565b955f6135f08c5f52600960205260405f2090565b556135fa8b6140ca565b5f998961362c575b505050505050508160ff16613619575b5050505050565b61362294614233565b5f80808080613612565b60409495969a50906136919161366c61364c6136478d61415c565b61328d565b91613662613658611eb6565b97889060020b9052565b60020b6020870152565b84860152606084018c90528451632d35e7ed60e11b81529a8b94859460048601613767565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af18015611092575f965f916136f1575b50906136e0826136e5949398614175565b6141a9565b5f808080808080613602565b6136e097506136e59392915061371e9060403d60401161372a575b61371681836105c2565b810190613751565b979097919293506136cf565b503d61370c565b6301952d1b60e31b5f9081526001600160a01b0391909116600452602490fd5b91908260409103126102a6576020825192015190565b6060610319959361377b836101409561139a565b805160020b60a0840152602081015160020b60c0840152604081015160e08401520151610100820152816101208201520191611e8b565b91908260a08101359260c08201359260e083013592610100810135926101208201359263ffffffff6101408401351683019063ffffffff8235169360208084019386010191011061159a579190565b91908260a09103126102a657604051613819816105a2565b6080808294803561382981610295565b8452602081013561383981610295565b6020850152604081013561384c81612274565b6040850152606081013561385f81612254565b606085015201359161387083610295565b0152565b90916102b59796959493926001600160801b036139006138c060a06138993688613801565b207f00000000000000000000000000000000000000000000000000000000000000006142ba565b5050506138cc84614346565b6138d586614346565b6138e888356138e381610295565b613f3c565b916138fa60208a01356138e381610295565b93614666565b1692613a34565b9091819260a08301359260c08101359260e08201359261010083013592610120810135926101408201359263ffffffff6101608401351683019063ffffffff8235169360208084019386010191011061159a579190565b600260806102b593613990813561397481610295565b85546001600160a01b0319166001600160a01b03909116178555565b600184016139c160208301356139a581610295565b82546001600160a01b0319166001600160a01b03909116178255565b60408201356139cf81612274565b815460608401356139df81612254565b60b81b62ffffff60b81b169162ffffff60a01b9060a01b169065ffffffffffff60a01b191617179055013591613a1483610295565b0180546001600160a01b0319166001600160a01b03909216919091179055565b909194969297939597600854926001840160085560018060a01b038a1699613a5d8b151561288d565b5f858152600260205260409020546001600160a01b0316613b8e57613b09613b5d98613b5793876102b59e613ac286613aa9613b4f9860018060a01b03165f52600360205260405f2090565b80546001019055610a5f845f52600260205260405f2090565b5f5f80516020614bb38339815191528180a4613ade3688613801565b63ffffff0066ffffff000000009160a066ffffffffffffff199120169260081b169260201b16171790565b9283613b1d875f52600960205260405f2090565b5566ffffffffffffff1984165f818152600a6020526040902060010154869060b81c60020b15613b63575b505061415c565b923690613801565b906146fc565b506147c5565b613b82613b879266ffffffffffffff19165f52600a60205260405f2090565b61395e565b5f85613b48565b60405162461bcd60e51b815260206004820152600e60248201526d1053149150511657d3525395115160921b6044820152606490fd5b909181359260208301359260408101359260608201359263ffffffff60808401351683019063ffffffff8235169360208084019386010191011061159a579190565b90959495939192935f80516020614b938339815191525c613c278382612a0e565b156137315750956136e092826136476102b59899613c52613c4a613c58976120a7565b93909261415c565b916146fc565b90614175565b949394929091925f80516020614b938339815191525c613c7e8282612a0e565b1561373157506102b59495613d2b9282613c9a613c58946120a7565b90613c526001600160801b03613d25613cd660a085207f00000000000000000000000000000000000000000000000000000000000000006142ba565b505050613ce88660081c60020b614346565b613cf78760201c60020b614346565b8651613d0b906001600160a01b0316613f3c565b60208801519092906138fa906001600160a01b0316613f3c565b1661415c565b6147c5565b90959495939192935f80516020614b938339815191525c613d518382612a0e565b15613731575095613d2b9282613c526102b59899613d71613c58966120a7565b92909161415c565b604051602081019182526006604082015260408152611ff16060826105c2565b6001600160a01b038116613dac57503190565b6040516370a0823160e01b81526001600160a01b0392831660048201529160209183916024918391165afa908115611092575f91613de8575090565b610319915060203d6020116127c2576127b681836105c2565b613e2c81307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f8213613e3e57506103199061328d565b63019a8d9360e51b5f9081526001600160a01b0391909116600452602490fd5b6001600160a01b038116613e7157504790565b6040516370a0823160e01b815230600482015290602090829060249082906001600160a01b03165afa908115611092575f91613de8575090565b9091906001600160a01b038116613ed857505f808080613ecc94865af11590565b613ed35750565b612ba6565b6040805163a9059cbb60e01b81526001600160a01b039094166004850152602484019290925291905f9060208260448582885af13d15601f3d11600185511416171692828152826020820152015215613f2e5750565b6001600160a01b0316612b39565b613f6781307f0000000000000000000000000000000000000000000000000000000000000000613f93565b905f8212613f73575090565b634c085bf160e01b5f9081526001600160a01b0391909116600452602490fd5b6001600160a01b039182165f9081529282166020908152604093849020935163789add5560e11b815260048101949094529183916024918391165afa908115611092575f91613de8575090565b9091906001600160a01b0383163003614028576102b592507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690613eab565b907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b156102a657604051631b63c28b60e11b81526001600160a01b0394851660048201527f00000000000000000000000000000000000000000000000000000000000000008516602482015291841660448301529190921660648301525f908290608490829084905af18015611092576132615750565b5f818152600260205260408120546001600160a01b03166140ec81151561204b565b80825260036020526040822082198154019055614111835f52600260205260405f2090565b80546001600160a01b03848116600386901b90811b91901b1991821681179092555f858152600460205260409020805490911690911790555f80516020614bb38339815191528280a4565b905f821261416657565b6393dafdf160e01b5f5260045ffd5b6141989061418a8360801d8260801d036148a2565b92600f0b90600f0b036148a2565b6001600160801b03169060801b1790565b929190926001600160801b038160801d94816141c4876148b0565b9116918291161061422157506001600160801b03929350600f0b90826141e9836148b0565b911692839116106141f8575050565b9061420a6001600160801b03926148b0565b90630940b79160e11b5f526004521660245260445ffd5b6001600160801b039061420a866148b0565b5f81815260076020526040902080546001600160a01b031981169091556001600160a01b0316946142ae94610d489492939192909160405163b1a9116f60e01b602082015260248101959095526001600160a01b031660448501526064840152608483015260a4808301919091528152610d4260c4826105c2565b6142b55750565b612c0f565b91906142c7602091613d79565b604051631e2eaeaf60e01b8152600481019190915292839060249082906001600160a01b03165afa918215611092575f92614325575b506001600160a01b0382169160a081901c60020b9162ffffff60b883901c81169260d01c1690565b61433f91925060203d6020116127c2576127b681836105c2565b905f6142fd565b60020b908160ff1d82810118620d89e881116146605763ffffffff9192600182167001fffcb933bd6fad37aa2d162d1a59400102600160801b189160028116614644575b60048116614628575b6008811661460c575b601081166145f0575b602081166145d4575b604081166145b8575b6080811661459c575b6101008116614580575b6102008116614564575b6104008116614548575b610800811661452c575b6110008116614510575b61200081166144f4575b61400081166144d8575b61800081166144bc575b6201000081166144a0575b620200008116614485575b62040000811661446a575b6208000016614451575b5f12614449575b0160201c90565b5f1904614442565b6b048a170391f7dc42444e8fa290910260801c9061443b565b6d2216e584f5fa1ea926041bedfe9890920260801c91614431565b916e5d6af8dedb81196699c329225ee6040260801c91614426565b916f09aa508b5b7a84e1c677de54f3e99bc90260801c9161441b565b916f31be135f97d08fd981231505542fcfa60260801c91614410565b916f70d869a156d2a1b890bb3df62baf32f70260801c91614406565b916fa9f746462d870fdf8a65dc1f90e061e50260801c916143fc565b916fd097f3bdfd2022b8845ad8f792aa58250260801c916143f2565b916fe7159475a2c29b7443b29c7fa6e889d90260801c916143e8565b916ff3392b0822b70005940c7a398e4b70f30260801c916143de565b916ff987a7253ac413176f2b074cf7815e540260801c916143d4565b916ffcbe86c7900a88aedcffc83b479aa3a40260801c916143ca565b916ffe5dee046a99a2a811c461f1969c30530260801c916143c0565b916fff2ea16466c96a3843ec78b326b528610260801c916143b7565b916fff973b41fa98c081472e6896dfb254c00260801c916143ae565b916fffcb9843d60f6159c9db58835c9266440260801c916143a5565b916fffe5caca7e10e4e61c3624eaa0941cd00260801c9161439c565b916ffff2e50f5f656932ef12357cf3c7fdcc0260801c91614393565b916ffff97272373d413259a46990580e213a0260801c9161438a565b826148c6565b936001600160a01b03838116908316116146f4575b6001600160a01b0385811695908316861161469c5750506103199350614915565b919490939192906001600160a01b03821611156146e85782916146c3916146c99594614915565b936148db565b6001600160801b0381166001600160801b038316105f14613063575090565b915050610319926148db565b90919061467b565b95939460409161474961470d611eb6565b60088a901c60020b81529260208a811c60020b90850152858585015286606085015284519889948594632d35e7ed60e11b865260048601613767565b03815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af1908115611092575f945f926147a1575b5081949560ff1661479857505050565b6102b592614962565b9094506147bd915060403d60401161372a5761371681836105c2565b90935f614788565b908160801d600f0b91600f0b915f81128061487f575b6148485750505f811280614823575b6147f2575050565b906148026135c6610d9c9361328d565b63031e30ad60e41b5f526001600160801b0391821660045216602452604490565b506001600160801b03806148368361328d565b16166001600160801b038316106147ea565b906001600160801b0361485d610d9c9361328d565b63031e30ad60e41b5f526001600160801b039283166004521616602452604490565b506001600160801b036148918261328d565b166001600160801b038316106147db565b9081600f0b91820361416657565b5f81600f0b12614166576001600160801b031690565b6345c3193d60e11b5f5260020b60045260245ffd5b6103199261490a9290916001600160a01b038083169082161161490f575b90036001600160a01b031690614a25565b614b7e565b906148f9565b6103199261490a929091906001600160a01b038082169083161161495c575b61494a6001600160a01b03828116908416614ab2565b9190036001600160a01b031691614afb565b90614934565b6149b29192815f52600760205260018060a01b0360405f205416936040519263d8865c2760e01b6020850152602484015260448301526064820152606481526149ac6084826105c2565b82612aa4565b156149ba5750565b6040516390bfb86560e01b8152600481019190915263d8865c2760e01b602482015260806044820152601f3d01601f191660a0810160648301523d60848301523d5f60a484013e808201600460a482015260c46374a7887160e11b91015260e40190fd5b156102a657565b90606082901b905f19600160601b8409928280851094039380850394614a4c868511614a1e565b14614aab578190600160601b900981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b5091500490565b81810291905f1982820991838084109303928084039384600160601b11156102a65714614af257600160601b910990828211900360a01b910360601c1790565b50505060601c90565b91818302915f19818509938380861095039480860395614b1c878611614a1e565b14614b76579082910981805f03168092046002816003021880820260020302808202600203028082026002030280820260020302808202600203028091026002030293600183805f03040190848311900302920304170290565b505091500490565b906001600160801b0382168092036141665756fe0aedd6bde10e3aa2adec092b02a3e3e805795516cda41f27aa145b8f300af87addf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa2646970667358221220170a66356ae2a8a64b26f643e5a93d930154bae57c050fc67cd6b497768faf9064736f6c634300081a0033" as Hex;
export const PositionManager = {
    abi,
    bytecode,
    deployedBytecode,
};
