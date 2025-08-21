export const addInitialLiquidity = {
    type: "function",
    name: "addInitialLiquidity",
    inputs: [{ name: "lpOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const addLiquidityPool = {
    type: "function",
    name: "addLiquidityPool",
    inputs: [{ name: "newLiquidityPool_", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const addValidCaller = {
    type: "function",
    name: "addValidCaller",
    inputs: [{ name: "newValidCallerHash_", type: "bytes32", internalType: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const allowance = {
    type: "function",
    name: "allowance",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const burn = {
    type: "function",
    name: "burn",
    inputs: [{ name: "value", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const burnFrom = {
    type: "function",
    name: "burnFrom",
    inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const decimals = {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
} as const;
export const distributeTaxTokens = {
    type: "function",
    name: "distributeTaxTokens",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const initialize = {
    type: "function",
    name: "initialize",
    inputs: [
        { name: "integrationAddresses_", type: "address[3]", internalType: "address[3]" },
        { name: "baseParams_", type: "bytes", internalType: "bytes" },
        { name: "supplyParams_", type: "bytes", internalType: "bytes" },
        { name: "taxParams_", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const isLiquidityPool = {
    type: "function",
    name: "isLiquidityPool",
    inputs: [{ name: "queryAddress_", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const isValidCaller = {
    type: "function",
    name: "isValidCaller",
    inputs: [{ name: "queryHash_", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const liquidityPools = {
    type: "function",
    name: "liquidityPools",
    inputs: [],
    outputs: [{ name: "liquidityPools_", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
} as const;
export const name = {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const removeLiquidityPool = {
    type: "function",
    name: "removeLiquidityPool",
    inputs: [{ name: "removedLiquidityPool_", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const removeValidCaller = {
    type: "function",
    name: "removeValidCaller",
    inputs: [{ name: "removedValidCallerHash_", type: "bytes32", internalType: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setProjectTaxRates = {
    type: "function",
    name: "setProjectTaxRates",
    inputs: [
        { name: "newProjectBuyTaxBasisPoints_", type: "uint16", internalType: "uint16" },
        { name: "newProjectSellTaxBasisPoints_", type: "uint16", internalType: "uint16" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setProjectTaxRecipient = {
    type: "function",
    name: "setProjectTaxRecipient",
    inputs: [{ name: "projectTaxRecipient_", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setSwapThresholdBasisPoints = {
    type: "function",
    name: "setSwapThresholdBasisPoints",
    inputs: [{ name: "swapThresholdBasisPoints_", type: "uint16", internalType: "uint16" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const symbol = {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const totalBuyTaxBasisPoints = {
    type: "function",
    name: "totalBuyTaxBasisPoints",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const totalSellTaxBasisPoints = {
    type: "function",
    name: "totalSellTaxBasisPoints",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const totalSupply = {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const transfer = {
    type: "function",
    name: "transfer",
    inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const transferFrom = {
    type: "function",
    name: "transferFrom",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const validCallers = {
    type: "function",
    name: "validCallers",
    inputs: [],
    outputs: [{ name: "validCallerHashes_", type: "bytes32[]", internalType: "bytes32[]" }],
    stateMutability: "view",
} as const;
export const withdrawERC20 = {
    type: "function",
    name: "withdrawERC20",
    inputs: [
        { name: "token_", type: "address", internalType: "address" },
        { name: "amount_", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const withdrawETH = {
    type: "function",
    name: "withdrawETH",
    inputs: [{ name: "amount_", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const AutoSwapThresholdUpdated = {
    type: "event",
    name: "AutoSwapThresholdUpdated",
    inputs: [
        { name: "oldThreshold", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newThreshold", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const ExternalCallError = {
    type: "event",
    name: "ExternalCallError",
    inputs: [{ name: "identifier", type: "uint256", indexed: false, internalType: "uint256" }],
    anonymous: false,
} as const;
export const InitialLiquidityAdded = {
    type: "event",
    name: "InitialLiquidityAdded",
    inputs: [
        { name: "tokenA", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "tokenB", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "lpToken", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const LimitsUpdated = {
    type: "event",
    name: "LimitsUpdated",
    inputs: [
        { name: "oldMaxTokensPerTransaction", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newMaxTokensPerTransaction", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "oldMaxTokensPerWallet", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newMaxTokensPerWallet", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const LiquidityPoolAdded = {
    type: "event",
    name: "LiquidityPoolAdded",
    inputs: [{ name: "addedPool", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const LiquidityPoolCreated = {
    type: "event",
    name: "LiquidityPoolCreated",
    inputs: [{ name: "addedPool", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const LiquidityPoolRemoved = {
    type: "event",
    name: "LiquidityPoolRemoved",
    inputs: [{ name: "removedPool", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const ProjectTaxBasisPointsChanged = {
    type: "event",
    name: "ProjectTaxBasisPointsChanged",
    inputs: [
        { name: "oldBuyBasisPoints", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newBuyBasisPoints", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "oldSellBasisPoints", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "newSellBasisPoints", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const ProjectTaxRecipientUpdated = {
    type: "event",
    name: "ProjectTaxRecipientUpdated",
    inputs: [{ name: "treasury", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const RevenueAutoSwap = { type: "event", name: "RevenueAutoSwap", inputs: [], anonymous: false } as const;
export const Transfer = {
    type: "event",
    name: "Transfer",
    inputs: [
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "value", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const ValidCallerAdded = {
    type: "event",
    name: "ValidCallerAdded",
    inputs: [{ name: "addedValidCaller", type: "bytes32", indexed: false, internalType: "bytes32" }],
    anonymous: false,
} as const;
export const ValidCallerRemoved = {
    type: "event",
    name: "ValidCallerRemoved",
    inputs: [{ name: "removedValidCaller", type: "bytes32", indexed: false, internalType: "bytes32" }],
    anonymous: false,
} as const;
export const AdapterParamsMustBeEmpty = { type: "error", name: "AdapterParamsMustBeEmpty", inputs: [] } as const;
export const AdditionToPoolIsBelowPerTransactionMinimum = {
    type: "error",
    name: "AdditionToPoolIsBelowPerTransactionMinimum",
    inputs: [],
} as const;
export const AdditionToPoolWouldExceedPerAddressCap = {
    type: "error",
    name: "AdditionToPoolWouldExceedPerAddressCap",
    inputs: [],
} as const;
export const AdditionToPoolWouldExceedPoolCap = {
    type: "error",
    name: "AdditionToPoolWouldExceedPoolCap",
    inputs: [],
} as const;
export const AddressAlreadySet = { type: "error", name: "AddressAlreadySet", inputs: [] } as const;
export const AllowanceDecreasedBelowZero = { type: "error", name: "AllowanceDecreasedBelowZero", inputs: [] } as const;
export const AlreadyInitialised = { type: "error", name: "AlreadyInitialised", inputs: [] } as const;
export const ApprovalCallerNotOwnerNorApproved = {
    type: "error",
    name: "ApprovalCallerNotOwnerNorApproved",
    inputs: [],
} as const;
export const ApprovalQueryForNonexistentToken = {
    type: "error",
    name: "ApprovalQueryForNonexistentToken",
    inputs: [],
} as const;
export const ApproveFromTheZeroAddress = { type: "error", name: "ApproveFromTheZeroAddress", inputs: [] } as const;
export const ApproveToTheZeroAddress = { type: "error", name: "ApproveToTheZeroAddress", inputs: [] } as const;
export const AuctionStatusIsNotEnded = { type: "error", name: "AuctionStatusIsNotEnded", inputs: [] } as const;
export const AuctionStatusIsNotOpen = { type: "error", name: "AuctionStatusIsNotOpen", inputs: [] } as const;
export const AuxCallFailed = {
    type: "error",
    name: "AuxCallFailed",
    inputs: [
        { name: "modules", type: "address[]", internalType: "address[]" },
        { name: "value", type: "uint256", internalType: "uint256" },
        { name: "data", type: "bytes", internalType: "bytes" },
        { name: "txGas", type: "uint256", internalType: "uint256" },
    ],
} as const;
export const BalanceMismatch = { type: "error", name: "BalanceMismatch", inputs: [] } as const;
export const BalanceQueryForZeroAddress = { type: "error", name: "BalanceQueryForZeroAddress", inputs: [] } as const;
export const BidMustBeBelowTheFloorForRefundDuringAuction = {
    type: "error",
    name: "BidMustBeBelowTheFloorForRefundDuringAuction",
    inputs: [],
} as const;
export const BidMustBeBelowTheFloorWhenReducingQuantity = {
    type: "error",
    name: "BidMustBeBelowTheFloorWhenReducingQuantity",
    inputs: [],
} as const;
export const BondingCurveError = {
    type: "error",
    name: "BondingCurveError",
    inputs: [{ name: "error", type: "uint8", internalType: "enum IErrors.BondingCurveErrorType" }],
} as const;
export const BurnExceedsBalance = { type: "error", name: "BurnExceedsBalance", inputs: [] } as const;
export const BurnFromTheZeroAddress = { type: "error", name: "BurnFromTheZeroAddress", inputs: [] } as const;
export const CallerIsNotAdminNorFactory = { type: "error", name: "CallerIsNotAdminNorFactory", inputs: [] } as const;
export const CallerIsNotDepositBoxOwner = { type: "error", name: "CallerIsNotDepositBoxOwner", inputs: [] } as const;
export const CallerIsNotFactory = { type: "error", name: "CallerIsNotFactory", inputs: [] } as const;
export const CallerIsNotFactoryOrProjectOwner = {
    type: "error",
    name: "CallerIsNotFactoryOrProjectOwner",
    inputs: [],
} as const;
export const CallerIsNotFactoryProjectOwnerOrPool = {
    type: "error",
    name: "CallerIsNotFactoryProjectOwnerOrPool",
    inputs: [],
} as const;
export const CallerIsNotPlatformAdmin = {
    type: "error",
    name: "CallerIsNotPlatformAdmin",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
} as const;
export const CallerIsNotSuperAdmin = {
    type: "error",
    name: "CallerIsNotSuperAdmin",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
} as const;
export const CallerIsNotTheManager = { type: "error", name: "CallerIsNotTheManager", inputs: [] } as const;
export const CallerIsNotTheOwner = { type: "error", name: "CallerIsNotTheOwner", inputs: [] } as const;
export const CallerMustBeLzApp = { type: "error", name: "CallerMustBeLzApp", inputs: [] } as const;
export const CanOnlyReduce = { type: "error", name: "CanOnlyReduce", inputs: [] } as const;
export const CannotAddLiquidityOnCreateAndUseDRIPool = {
    type: "error",
    name: "CannotAddLiquidityOnCreateAndUseDRIPool",
    inputs: [],
} as const;
export const CannotSetNewManagerToTheZeroAddress = {
    type: "error",
    name: "CannotSetNewManagerToTheZeroAddress",
    inputs: [],
} as const;
export const CannotSetNewOwnerToTheZeroAddress = {
    type: "error",
    name: "CannotSetNewOwnerToTheZeroAddress",
    inputs: [],
} as const;
export const CannotSetToZeroAddress = { type: "error", name: "CannotSetToZeroAddress", inputs: [] } as const;
export const CannotWithdrawThisToken = { type: "error", name: "CannotWithdrawThisToken", inputs: [] } as const;
export const CollectionAlreadyRevealed = { type: "error", name: "CollectionAlreadyRevealed", inputs: [] } as const;
export const ContractIsDecommissioned = { type: "error", name: "ContractIsDecommissioned", inputs: [] } as const;
export const ContractIsNotPaused = { type: "error", name: "ContractIsNotPaused", inputs: [] } as const;
export const ContractIsPaused = { type: "error", name: "ContractIsPaused", inputs: [] } as const;
export const DecreasedAllowanceBelowZero = { type: "error", name: "DecreasedAllowanceBelowZero", inputs: [] } as const;
export const DeployerOnly = { type: "error", name: "DeployerOnly", inputs: [] } as const;
export const DeploymentError = { type: "error", name: "DeploymentError", inputs: [] } as const;
export const DepositBoxIsNotOpen = { type: "error", name: "DepositBoxIsNotOpen", inputs: [] } as const;
export const DestinationIsNotTrustedSource = {
    type: "error",
    name: "DestinationIsNotTrustedSource",
    inputs: [],
} as const;
export const DriPoolAddressCannotBeAddressZero = {
    type: "error",
    name: "DriPoolAddressCannotBeAddressZero",
    inputs: [],
} as const;
export const GasLimitIsTooLow = { type: "error", name: "GasLimitIsTooLow", inputs: [] } as const;
export const IncorrectConfirmationValue = { type: "error", name: "IncorrectConfirmationValue", inputs: [] } as const;
export const IncorrectPayment = { type: "error", name: "IncorrectPayment", inputs: [] } as const;
export const InitialLiquidityAlreadyAdded = {
    type: "error",
    name: "InitialLiquidityAlreadyAdded",
    inputs: [],
} as const;
export const InitialLiquidityNotYetAdded = { type: "error", name: "InitialLiquidityNotYetAdded", inputs: [] } as const;
export const InsufficientAllowance = { type: "error", name: "InsufficientAllowance", inputs: [] } as const;
export const InvalidAdapterParams = { type: "error", name: "InvalidAdapterParams", inputs: [] } as const;
export const InvalidAddress = { type: "error", name: "InvalidAddress", inputs: [] } as const;
export const InvalidEndpointCaller = { type: "error", name: "InvalidEndpointCaller", inputs: [] } as const;
export const InvalidMinGas = { type: "error", name: "InvalidMinGas", inputs: [] } as const;
export const InvalidOracleSignature = { type: "error", name: "InvalidOracleSignature", inputs: [] } as const;
export const InvalidPayload = { type: "error", name: "InvalidPayload", inputs: [] } as const;
export const InvalidReceiver = { type: "error", name: "InvalidReceiver", inputs: [] } as const;
export const InvalidSourceSendingContract = {
    type: "error",
    name: "InvalidSourceSendingContract",
    inputs: [],
} as const;
export const InvalidTotalShares = { type: "error", name: "InvalidTotalShares", inputs: [] } as const;
export const LPLockUpMustFitUint88 = { type: "error", name: "LPLockUpMustFitUint88", inputs: [] } as const;
export const LimitsCanOnlyBeRaised = { type: "error", name: "LimitsCanOnlyBeRaised", inputs: [] } as const;
export const LiquidityPoolCannotBeAddressZero = {
    type: "error",
    name: "LiquidityPoolCannotBeAddressZero",
    inputs: [],
} as const;
export const LiquidityPoolMustBeAContractAddress = {
    type: "error",
    name: "LiquidityPoolMustBeAContractAddress",
    inputs: [],
} as const;
export const ListLengthMismatch = { type: "error", name: "ListLengthMismatch", inputs: [] } as const;
export const MachineAddressCannotBeAddressZero = {
    type: "error",
    name: "MachineAddressCannotBeAddressZero",
    inputs: [],
} as const;
export const ManagerUnauthorizedAccount = { type: "error", name: "ManagerUnauthorizedAccount", inputs: [] } as const;
export const MaxBidQuantityIs255 = { type: "error", name: "MaxBidQuantityIs255", inputs: [] } as const;
export const MaxPublicMintAllowanceExceeded = {
    type: "error",
    name: "MaxPublicMintAllowanceExceeded",
    inputs: [
        { name: "requested", type: "uint256", internalType: "uint256" },
        { name: "alreadyMinted", type: "uint256", internalType: "uint256" },
        { name: "maxAllowance", type: "uint256", internalType: "uint256" },
    ],
} as const;
export const MaxSupplyTooHigh = { type: "error", name: "MaxSupplyTooHigh", inputs: [] } as const;
export const MaxTokensPerTxnExceeded = { type: "error", name: "MaxTokensPerTxnExceeded", inputs: [] } as const;
export const MaxTokensPerWalletExceeded = { type: "error", name: "MaxTokensPerWalletExceeded", inputs: [] } as const;
export const MetadataIsLocked = { type: "error", name: "MetadataIsLocked", inputs: [] } as const;
export const MinGasLimitNotSet = { type: "error", name: "MinGasLimitNotSet", inputs: [] } as const;
export const MintERC2309QuantityExceedsLimit = {
    type: "error",
    name: "MintERC2309QuantityExceedsLimit",
    inputs: [],
} as const;
export const MintToZeroAddress = { type: "error", name: "MintToZeroAddress", inputs: [] } as const;
export const MintZeroQuantity = { type: "error", name: "MintZeroQuantity", inputs: [] } as const;
export const MintingIsClosedForever = { type: "error", name: "MintingIsClosedForever", inputs: [] } as const;
export const NewBuyTaxBasisPointsExceedsMaximum = {
    type: "error",
    name: "NewBuyTaxBasisPointsExceedsMaximum",
    inputs: [],
} as const;
export const NewSellTaxBasisPointsExceedsMaximum = {
    type: "error",
    name: "NewSellTaxBasisPointsExceedsMaximum",
    inputs: [],
} as const;
export const NoETHForLiquidityPair = { type: "error", name: "NoETHForLiquidityPair", inputs: [] } as const;
export const NoPaymentDue = { type: "error", name: "NoPaymentDue", inputs: [] } as const;
export const NoRefundForCaller = { type: "error", name: "NoRefundForCaller", inputs: [] } as const;
export const NoStoredMessage = { type: "error", name: "NoStoredMessage", inputs: [] } as const;
export const NoTokenForLiquidityPair = { type: "error", name: "NoTokenForLiquidityPair", inputs: [] } as const;
export const NoTrustedPathRecord = { type: "error", name: "NoTrustedPathRecord", inputs: [] } as const;
export const NothingToClaim = { type: "error", name: "NothingToClaim", inputs: [] } as const;
export const OperationDidNotSucceed = { type: "error", name: "OperationDidNotSucceed", inputs: [] } as const;
export const OracleSignatureHasExpired = { type: "error", name: "OracleSignatureHasExpired", inputs: [] } as const;
export const OwnerQueryForNonexistentToken = {
    type: "error",
    name: "OwnerQueryForNonexistentToken",
    inputs: [],
} as const;
export const OwnershipNotInitializedForExtraData = {
    type: "error",
    name: "OwnershipNotInitializedForExtraData",
    inputs: [],
} as const;
export const ParamTooLargeEndDate = { type: "error", name: "ParamTooLargeEndDate", inputs: [] } as const;
export const ParamTooLargeMinETH = { type: "error", name: "ParamTooLargeMinETH", inputs: [] } as const;
export const ParamTooLargePerAddressMax = { type: "error", name: "ParamTooLargePerAddressMax", inputs: [] } as const;
export const ParamTooLargePoolPerTxnMinETH = {
    type: "error",
    name: "ParamTooLargePoolPerTxnMinETH",
    inputs: [],
} as const;
export const ParamTooLargePoolSupply = { type: "error", name: "ParamTooLargePoolSupply", inputs: [] } as const;
export const ParamTooLargeStartDate = { type: "error", name: "ParamTooLargeStartDate", inputs: [] } as const;
export const ParamTooLargeVestingDays = { type: "error", name: "ParamTooLargeVestingDays", inputs: [] } as const;
export const ParametersDoNotMatchSignedMessage = {
    type: "error",
    name: "ParametersDoNotMatchSignedMessage",
    inputs: [],
} as const;
export const PassedConfigDoesNotMatchApproved = {
    type: "error",
    name: "PassedConfigDoesNotMatchApproved",
    inputs: [],
} as const;
export const PauseCutOffHasPassed = { type: "error", name: "PauseCutOffHasPassed", inputs: [] } as const;
export const PaymentMustCoverPerMintFee = { type: "error", name: "PaymentMustCoverPerMintFee", inputs: [] } as const;
export const PermitDidNotSucceed = { type: "error", name: "PermitDidNotSucceed", inputs: [] } as const;
export const PlatformAdminCannotBeAddressZero = {
    type: "error",
    name: "PlatformAdminCannotBeAddressZero",
    inputs: [],
} as const;
export const PlatformTreasuryCannotBeAddressZero = {
    type: "error",
    name: "PlatformTreasuryCannotBeAddressZero",
    inputs: [],
} as const;
export const PoolIsAboveMinimum = { type: "error", name: "PoolIsAboveMinimum", inputs: [] } as const;
export const PoolIsBelowMinimum = { type: "error", name: "PoolIsBelowMinimum", inputs: [] } as const;
export const PoolPhaseIsClosed = { type: "error", name: "PoolPhaseIsClosed", inputs: [] } as const;
export const PoolPhaseIsNotAfter = { type: "error", name: "PoolPhaseIsNotAfter", inputs: [] } as const;
export const PoolVestingNotYetComplete = { type: "error", name: "PoolVestingNotYetComplete", inputs: [] } as const;
export const ProjectOwnerCannotBeAddressZero = {
    type: "error",
    name: "ProjectOwnerCannotBeAddressZero",
    inputs: [],
} as const;
export const ProofInvalid = { type: "error", name: "ProofInvalid", inputs: [] } as const;
export const QuantityExceedsMaxPossibleCollectionSupply = {
    type: "error",
    name: "QuantityExceedsMaxPossibleCollectionSupply",
    inputs: [],
} as const;
export const QuantityExceedsRemainingCollectionSupply = {
    type: "error",
    name: "QuantityExceedsRemainingCollectionSupply",
    inputs: [],
} as const;
export const QuantityExceedsRemainingPhaseSupply = {
    type: "error",
    name: "QuantityExceedsRemainingPhaseSupply",
    inputs: [],
} as const;
export const ReferralIdAlreadyUsed = { type: "error", name: "ReferralIdAlreadyUsed", inputs: [] } as const;
export const RequestingMoreThanAvailableBalance = {
    type: "error",
    name: "RequestingMoreThanAvailableBalance",
    inputs: [],
} as const;
export const RequestingMoreThanRemainingAllocation = {
    type: "error",
    name: "RequestingMoreThanRemainingAllocation",
    inputs: [
        { name: "previouslyMinted", type: "uint256", internalType: "uint256" },
        { name: "requested", type: "uint256", internalType: "uint256" },
        { name: "remainingAllocation", type: "uint256", internalType: "uint256" },
    ],
} as const;
export const RoyaltyFeeWillExceedSalePrice = {
    type: "error",
    name: "RoyaltyFeeWillExceedSalePrice",
    inputs: [],
} as const;
export const ShareTotalCannotBeZero = { type: "error", name: "ShareTotalCannotBeZero", inputs: [] } as const;
export const SliceOutOfBounds = { type: "error", name: "SliceOutOfBounds", inputs: [] } as const;
export const SliceOverflow = { type: "error", name: "SliceOverflow", inputs: [] } as const;
export const SuperAdminCannotBeAddressZero = {
    type: "error",
    name: "SuperAdminCannotBeAddressZero",
    inputs: [],
} as const;
export const SupplyTotalMismatch = { type: "error", name: "SupplyTotalMismatch", inputs: [] } as const;
export const SupportWindowIsNotOpen = { type: "error", name: "SupportWindowIsNotOpen", inputs: [] } as const;
export const TaxFreeAddressCannotBeAddressZero = {
    type: "error",
    name: "TaxFreeAddressCannotBeAddressZero",
    inputs: [],
} as const;
export const TaxPeriodStillInForce = { type: "error", name: "TaxPeriodStillInForce", inputs: [] } as const;
export const TemplateCannotBeAddressZero = { type: "error", name: "TemplateCannotBeAddressZero", inputs: [] } as const;
export const TemplateNotFound = { type: "error", name: "TemplateNotFound", inputs: [] } as const;
export const ThisMintIsClosed = { type: "error", name: "ThisMintIsClosed", inputs: [] } as const;
export const TotalSharesMustMatchDenominator = {
    type: "error",
    name: "TotalSharesMustMatchDenominator",
    inputs: [],
} as const;
export const TransferAmountExceedsBalance = {
    type: "error",
    name: "TransferAmountExceedsBalance",
    inputs: [],
} as const;
export const TransferCallerNotOwnerNorApproved = {
    type: "error",
    name: "TransferCallerNotOwnerNorApproved",
    inputs: [],
} as const;
export const TransferFailed = { type: "error", name: "TransferFailed", inputs: [] } as const;
export const TransferFromIncorrectOwner = { type: "error", name: "TransferFromIncorrectOwner", inputs: [] } as const;
export const TransferFromZeroAddress = { type: "error", name: "TransferFromZeroAddress", inputs: [] } as const;
export const TransferToNonERC721ReceiverImplementer = {
    type: "error",
    name: "TransferToNonERC721ReceiverImplementer",
    inputs: [],
} as const;
export const TransferToZeroAddress = { type: "error", name: "TransferToZeroAddress", inputs: [] } as const;
export const URIQueryForNonexistentToken = { type: "error", name: "URIQueryForNonexistentToken", inputs: [] } as const;
export const UnrecognisedVRFMode = { type: "error", name: "UnrecognisedVRFMode", inputs: [] } as const;
export const VRFCoordinatorCannotBeAddressZero = {
    type: "error",
    name: "VRFCoordinatorCannotBeAddressZero",
    inputs: [],
} as const;
export const ValueExceedsMaximum = { type: "error", name: "ValueExceedsMaximum", inputs: [] } as const;
export const functions = [
    addInitialLiquidity,
    addLiquidityPool,
    addValidCaller,
    allowance,
    approve,
    balanceOf,
    burn,
    burnFrom,
    decimals,
    distributeTaxTokens,
    initialize,
    isLiquidityPool,
    isValidCaller,
    liquidityPools,
    name,
    removeLiquidityPool,
    removeValidCaller,
    setProjectTaxRates,
    setProjectTaxRecipient,
    setSwapThresholdBasisPoints,
    symbol,
    totalBuyTaxBasisPoints,
    totalSellTaxBasisPoints,
    totalSupply,
    transfer,
    transferFrom,
    validCallers,
    withdrawERC20,
    withdrawETH,
] as const;
export const events = [
    Approval,
    AutoSwapThresholdUpdated,
    ExternalCallError,
    InitialLiquidityAdded,
    LimitsUpdated,
    LiquidityPoolAdded,
    LiquidityPoolCreated,
    LiquidityPoolRemoved,
    ProjectTaxBasisPointsChanged,
    ProjectTaxRecipientUpdated,
    RevenueAutoSwap,
    Transfer,
    ValidCallerAdded,
    ValidCallerRemoved,
] as const;
export const errors = [
    AdapterParamsMustBeEmpty,
    AdditionToPoolIsBelowPerTransactionMinimum,
    AdditionToPoolWouldExceedPerAddressCap,
    AdditionToPoolWouldExceedPoolCap,
    AddressAlreadySet,
    AllowanceDecreasedBelowZero,
    AlreadyInitialised,
    ApprovalCallerNotOwnerNorApproved,
    ApprovalQueryForNonexistentToken,
    ApproveFromTheZeroAddress,
    ApproveToTheZeroAddress,
    AuctionStatusIsNotEnded,
    AuctionStatusIsNotOpen,
    AuxCallFailed,
    BalanceMismatch,
    BalanceQueryForZeroAddress,
    BidMustBeBelowTheFloorForRefundDuringAuction,
    BidMustBeBelowTheFloorWhenReducingQuantity,
    BondingCurveError,
    BurnExceedsBalance,
    BurnFromTheZeroAddress,
    CallerIsNotAdminNorFactory,
    CallerIsNotDepositBoxOwner,
    CallerIsNotFactory,
    CallerIsNotFactoryOrProjectOwner,
    CallerIsNotFactoryProjectOwnerOrPool,
    CallerIsNotPlatformAdmin,
    CallerIsNotSuperAdmin,
    CallerIsNotTheManager,
    CallerIsNotTheOwner,
    CallerMustBeLzApp,
    CanOnlyReduce,
    CannotAddLiquidityOnCreateAndUseDRIPool,
    CannotSetNewManagerToTheZeroAddress,
    CannotSetNewOwnerToTheZeroAddress,
    CannotSetToZeroAddress,
    CannotWithdrawThisToken,
    CollectionAlreadyRevealed,
    ContractIsDecommissioned,
    ContractIsNotPaused,
    ContractIsPaused,
    DecreasedAllowanceBelowZero,
    DeployerOnly,
    DeploymentError,
    DepositBoxIsNotOpen,
    DestinationIsNotTrustedSource,
    DriPoolAddressCannotBeAddressZero,
    GasLimitIsTooLow,
    IncorrectConfirmationValue,
    IncorrectPayment,
    InitialLiquidityAlreadyAdded,
    InitialLiquidityNotYetAdded,
    InsufficientAllowance,
    InvalidAdapterParams,
    InvalidAddress,
    InvalidEndpointCaller,
    InvalidMinGas,
    InvalidOracleSignature,
    InvalidPayload,
    InvalidReceiver,
    InvalidSourceSendingContract,
    InvalidTotalShares,
    LPLockUpMustFitUint88,
    LimitsCanOnlyBeRaised,
    LiquidityPoolCannotBeAddressZero,
    LiquidityPoolMustBeAContractAddress,
    ListLengthMismatch,
    MachineAddressCannotBeAddressZero,
    ManagerUnauthorizedAccount,
    MaxBidQuantityIs255,
    MaxPublicMintAllowanceExceeded,
    MaxSupplyTooHigh,
    MaxTokensPerTxnExceeded,
    MaxTokensPerWalletExceeded,
    MetadataIsLocked,
    MinGasLimitNotSet,
    MintERC2309QuantityExceedsLimit,
    MintToZeroAddress,
    MintZeroQuantity,
    MintingIsClosedForever,
    NewBuyTaxBasisPointsExceedsMaximum,
    NewSellTaxBasisPointsExceedsMaximum,
    NoETHForLiquidityPair,
    NoPaymentDue,
    NoRefundForCaller,
    NoStoredMessage,
    NoTokenForLiquidityPair,
    NoTrustedPathRecord,
    NothingToClaim,
    OperationDidNotSucceed,
    OracleSignatureHasExpired,
    OwnerQueryForNonexistentToken,
    OwnershipNotInitializedForExtraData,
    ParamTooLargeEndDate,
    ParamTooLargeMinETH,
    ParamTooLargePerAddressMax,
    ParamTooLargePoolPerTxnMinETH,
    ParamTooLargePoolSupply,
    ParamTooLargeStartDate,
    ParamTooLargeVestingDays,
    ParametersDoNotMatchSignedMessage,
    PassedConfigDoesNotMatchApproved,
    PauseCutOffHasPassed,
    PaymentMustCoverPerMintFee,
    PermitDidNotSucceed,
    PlatformAdminCannotBeAddressZero,
    PlatformTreasuryCannotBeAddressZero,
    PoolIsAboveMinimum,
    PoolIsBelowMinimum,
    PoolPhaseIsClosed,
    PoolPhaseIsNotAfter,
    PoolVestingNotYetComplete,
    ProjectOwnerCannotBeAddressZero,
    ProofInvalid,
    QuantityExceedsMaxPossibleCollectionSupply,
    QuantityExceedsRemainingCollectionSupply,
    QuantityExceedsRemainingPhaseSupply,
    ReferralIdAlreadyUsed,
    RequestingMoreThanAvailableBalance,
    RequestingMoreThanRemainingAllocation,
    RoyaltyFeeWillExceedSalePrice,
    ShareTotalCannotBeZero,
    SliceOutOfBounds,
    SliceOverflow,
    SuperAdminCannotBeAddressZero,
    SupplyTotalMismatch,
    SupportWindowIsNotOpen,
    TaxFreeAddressCannotBeAddressZero,
    TaxPeriodStillInForce,
    TemplateCannotBeAddressZero,
    TemplateNotFound,
    ThisMintIsClosed,
    TotalSharesMustMatchDenominator,
    TransferAmountExceedsBalance,
    TransferCallerNotOwnerNorApproved,
    TransferFailed,
    TransferFromIncorrectOwner,
    TransferFromZeroAddress,
    TransferToNonERC721ReceiverImplementer,
    TransferToZeroAddress,
    URIQueryForNonexistentToken,
    UnrecognisedVRFMode,
    VRFCoordinatorCannotBeAddressZero,
    ValueExceedsMaximum,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IAgentToken = {
    abi,
};
