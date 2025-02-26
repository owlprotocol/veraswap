export const errors = [
    {
        type: "error",
        name: "AllowanceExpired",
        inputs: [{ name: "deadline", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "ExcessiveInvalidation", inputs: [] },
    {
        type: "error",
        name: "InsufficientAllowance",
        inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "InvalidAmount", inputs: [{ name: "maxAmount", type: "uint256", internalType: "uint256" }] },
    { type: "error", name: "LengthMismatch", inputs: [] },
    {
        type: "error",
        name: "AlreadySubscribed",
        inputs: [
            { name: "tokenId", type: "uint256", internalType: "uint256" },
            { name: "subscriber", type: "address", internalType: "address" },
        ],
    },
    {
        type: "error",
        name: "BurnNotificationReverted",
        inputs: [
            { name: "subscriber", type: "address", internalType: "address" },
            { name: "reason", type: "bytes", internalType: "bytes" },
        ],
    },
    { type: "error", name: "DeadlinePassed", inputs: [{ name: "deadline", type: "uint256", internalType: "uint256" }] },
    { type: "error", name: "GasLimitTooLow", inputs: [] },
    {
        type: "error",
        name: "ModifyLiquidityNotificationReverted",
        inputs: [
            { name: "subscriber", type: "address", internalType: "address" },
            { name: "reason", type: "bytes", internalType: "bytes" },
        ],
    },
    { type: "error", name: "NoCodeSubscriber", inputs: [] },
    { type: "error", name: "NoSelfPermit", inputs: [] },
    { type: "error", name: "NonceAlreadyUsed", inputs: [] },
    { type: "error", name: "NotApproved", inputs: [{ name: "caller", type: "address", internalType: "address" }] },
    { type: "error", name: "NotSubscribed", inputs: [] },
    { type: "error", name: "PoolManagerMustBeLocked", inputs: [] },
    { type: "error", name: "SignatureDeadlineExpired", inputs: [] },
    {
        type: "error",
        name: "SubscriptionReverted",
        inputs: [
            { name: "subscriber", type: "address", internalType: "address" },
            { name: "reason", type: "bytes", internalType: "bytes" },
        ],
    },
    { type: "error", name: "Unauthorized", inputs: [] },
    { type: "error", name: "AlreadyUnlocked", inputs: [] },
    {
        type: "error",
        name: "CurrenciesOutOfOrderOrEqual",
        inputs: [
            { name: "currency0", type: "address", internalType: "address" },
            { name: "currency1", type: "address", internalType: "address" },
        ],
    },
    { type: "error", name: "CurrencyNotSettled", inputs: [] },
    { type: "error", name: "InvalidCaller", inputs: [] },
    { type: "error", name: "ManagerLocked", inputs: [] },
    { type: "error", name: "MustClearExactPositiveDelta", inputs: [] },
    { type: "error", name: "NonzeroNativeValue", inputs: [] },
    { type: "error", name: "PoolNotInitialized", inputs: [] },
    { type: "error", name: "ProtocolFeeCurrencySynced", inputs: [] },
    { type: "error", name: "ProtocolFeeTooLarge", inputs: [{ name: "fee", type: "uint24", internalType: "uint24" }] },
    { type: "error", name: "SwapAmountCannotBeZero", inputs: [] },
    {
        type: "error",
        name: "TickSpacingTooLarge",
        inputs: [{ name: "tickSpacing", type: "int24", internalType: "int24" }],
    },
    {
        type: "error",
        name: "TickSpacingTooSmall",
        inputs: [{ name: "tickSpacing", type: "int24", internalType: "int24" }],
    },
    { type: "error", name: "UnauthorizedDynamicLPFeeUpdate", inputs: [] },
    { type: "error", name: "UnsupportedProtocolError", inputs: [] },
    { type: "error", name: "DelegateCallNotAllowed", inputs: [] },
    { type: "error", name: "ContractLocked", inputs: [] },
    {
        type: "error",
        name: "DeltaNotNegative",
        inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
    },
    {
        type: "error",
        name: "DeltaNotPositive",
        inputs: [{ name: "currency", type: "address", internalType: "Currency" }],
    },
    { type: "error", name: "InputLengthMismatch", inputs: [] },
    { type: "error", name: "InsufficientBalance", inputs: [] },
    { type: "error", name: "InvalidContractSignature", inputs: [] },
    { type: "error", name: "InvalidEthSender", inputs: [] },
    { type: "error", name: "InvalidSignature", inputs: [] },
    { type: "error", name: "InvalidSignatureLength", inputs: [] },
    { type: "error", name: "InvalidSigner", inputs: [] },
    {
        type: "error",
        name: "MaximumAmountExceeded",
        inputs: [
            { name: "maximumAmount", type: "uint128", internalType: "uint128" },
            { name: "amountRequested", type: "uint128", internalType: "uint128" },
        ],
    },
    {
        type: "error",
        name: "MinimumAmountInsufficient",
        inputs: [
            { name: "minimumAmount", type: "uint128", internalType: "uint128" },
            { name: "amountReceived", type: "uint128", internalType: "uint128" },
        ],
    },
    { type: "error", name: "NotPoolManager", inputs: [] },
    {
        type: "error",
        name: "UnsupportedAction",
        inputs: [{ name: "action", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "ETHNotAccepted", inputs: [] },
    {
        type: "error",
        name: "ExecutionFailed",
        inputs: [
            { name: "commandIndex", type: "uint256", internalType: "uint256" },
            { name: "message", type: "bytes", internalType: "bytes" },
        ],
    },
    { type: "error", name: "TransactionDeadlinePassed", inputs: [] },
    { type: "error", name: "BalanceTooLow", inputs: [] },
    { type: "error", name: "FromAddressIsNotOwner", inputs: [] },
    { type: "error", name: "InsufficientETH", inputs: [] },
    { type: "error", name: "InsufficientToken", inputs: [] },
    { type: "error", name: "InvalidAction", inputs: [{ name: "action", type: "bytes4", internalType: "bytes4" }] },
    { type: "error", name: "InvalidBips", inputs: [] },
    {
        type: "error",
        name: "InvalidCommandType",
        inputs: [{ name: "commandType", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "InvalidPath", inputs: [] },
    { type: "error", name: "InvalidReserves", inputs: [] },
    {
        type: "error",
        name: "NotAuthorizedForToken",
        inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    },
    { type: "error", name: "OnlyMintAllowed", inputs: [] },
    { type: "error", name: "SliceOutOfBounds", inputs: [] },
    { type: "error", name: "UnsafeCast", inputs: [] },
    { type: "error", name: "V2InvalidPath", inputs: [] },
    { type: "error", name: "V2TooLittleReceived", inputs: [] },
    { type: "error", name: "V2TooMuchRequested", inputs: [] },
    { type: "error", name: "V3InvalidAmountOut", inputs: [] },
    { type: "error", name: "V3InvalidCaller", inputs: [] },
    { type: "error", name: "V3InvalidSwap", inputs: [] },
    { type: "error", name: "V3TooLittleReceived", inputs: [] },
    { type: "error", name: "V3TooMuchRequested", inputs: [] },
    {
        type: "error",
        name: "V4TooLittleReceived",
        inputs: [
            { name: "minAmountOutReceived", type: "uint256", internalType: "uint256" },
            { name: "amountReceived", type: "uint256", internalType: "uint256" },
        ],
    },
    {
        type: "error",
        name: "V4TooMuchRequested",
        inputs: [
            { name: "maxAmountInRequested", type: "uint256", internalType: "uint256" },
            { name: "amountRequested", type: "uint256", internalType: "uint256" },
        ],
    },
    {
        type: "error",
        name: "NotEnoughLiquidity",
        inputs: [{ name: "poolId", type: "bytes32", internalType: "PoolId" }],
    },
    { type: "error", name: "NotSelf", inputs: [] },
    { type: "error", name: "QuoteSwap", inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }] },
    { type: "error", name: "UnexpectedCallSuccess", inputs: [] },
    {
        type: "error",
        name: "UnexpectedRevertBytes",
        inputs: [{ name: "revertData", type: "bytes", internalType: "bytes" }],
    },
] as const;
