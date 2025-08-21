import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "name", type: "string", internalType: "string" },
        { name: "symbol", type: "string", internalType: "string" },
        { name: "decimals", type: "uint8", internalType: "uint8" },
        { name: "_projectBuyTaxBasisPoints", type: "uint16", internalType: "uint16" },
        { name: "_projectSellTaxBasisPoints", type: "uint16", internalType: "uint16" },
    ],
    stateMutability: "nonpayable",
} as const;
export const DOMAIN_SEPARATOR = {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const allowance = {
    type: "function",
    name: "allowance",
    inputs: [
        { name: "", type: "address", internalType: "address" },
        { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const approve = {
    type: "function",
    name: "approve",
    inputs: [
        { name: "spender", type: "address", internalType: "address" },
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const balanceOf = {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const burn = {
    type: "function",
    name: "burn",
    inputs: [
        { name: "from", type: "address", internalType: "address" },
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
export const isLiquidityPool = {
    type: "function",
    name: "isLiquidityPool",
    inputs: [{ name: "queryAddress_", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const mint = {
    type: "function",
    name: "mint",
    inputs: [
        { name: "to", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const name = {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const nonces = {
    type: "function",
    name: "nonces",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const permit = {
    type: "function",
    name: "permit",
    inputs: [
        { name: "owner", type: "address", internalType: "address" },
        { name: "spender", type: "address", internalType: "address" },
        { name: "value", type: "uint256", internalType: "uint256" },
        { name: "deadline", type: "uint256", internalType: "uint256" },
        { name: "v", type: "uint8", internalType: "uint8" },
        { name: "r", type: "bytes32", internalType: "bytes32" },
        { name: "s", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const projectBuyTaxBasisPoints = {
    type: "function",
    name: "projectBuyTaxBasisPoints",
    inputs: [],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
} as const;
export const projectSellTaxBasisPoints = {
    type: "function",
    name: "projectSellTaxBasisPoints",
    inputs: [],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
} as const;
export const setLiquidityPoolAddress = {
    type: "function",
    name: "setLiquidityPoolAddress",
    inputs: [{ name: "_liquidityPool", type: "address", internalType: "address" }],
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
        { name: "amount", type: "uint256", internalType: "uint256" },
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
        { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
} as const;
export const uniswapV2Pair = {
    type: "function",
    name: "uniswapV2Pair",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const Approval = {
    type: "event",
    name: "Approval",
    inputs: [
        { name: "owner", type: "address", indexed: true, internalType: "address" },
        { name: "spender", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const Transfer = {
    type: "event",
    name: "Transfer",
    inputs: [
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
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
    _constructor,
    DOMAIN_SEPARATOR,
    allowance,
    approve,
    balanceOf,
    burn,
    decimals,
    isLiquidityPool,
    mint,
    name,
    nonces,
    permit,
    projectBuyTaxBasisPoints,
    projectSellTaxBasisPoints,
    setLiquidityPoolAddress,
    symbol,
    totalBuyTaxBasisPoints,
    totalSellTaxBasisPoints,
    totalSupply,
    transfer,
    transferFrom,
    uniswapV2Pair,
] as const;
export const events = [Approval, Transfer] as const;
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

export const bytecode =
    "0x60e0806040523461045e57611341803803809161001c8285610462565b833981019060a08183031261045e5780516001600160401b03811161045e5782610047918301610485565b602082015190926001600160401b03821161045e57610067918301610485565b91604082015160ff8116810361045e5761008f6080610088606086016104da565b94016104da565b825190926001600160401b0382116103825781906100ad5f546104e9565b601f8111610404575b50602090601f83116001146103a1575f92610396575b50508160011b915f199060031b1c1916175f555b83516001600160401b038111610382576100fb6001546104e9565b601f811161031f575b50602094601f82116001146102bc579481929394955f926102b1575b50508160011b915f199060031b1c1916176001555b6080524660a0526040515f905f54918161014e846104e9565b9182825260208201946001811690815f14610295575060011461024b575b61017892500382610462565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a081526101ec60c082610462565b51902060c0526006805463ffffffff60a01b191660a09390931b61ffff60a01b169290921760b09190911b61ffff60b01b16179055604051610dff90816105228239608051816106e5015260a05181610a4e015260c05181610a740152f35b505f80805290915f805160206113218339815191525b8183106102795750509060206101789282010161016c565b6020919350806001915483858801015201910190918392610261565b60ff191686525061017892151560051b8201602001905061016c565b015190505f80610120565b601f1982169560015f52805f20915f5b888110610307575083600195969798106102ef575b505050811b01600155610135565b01515f1960f88460031b161c191690555f80806102e1565b919260206001819286850151815501940192016102cc565b60015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6601f830160051c81019160208410610378575b601f0160051c01905b81811061036d5750610104565b5f8155600101610360565b9091508190610357565b634e487b7160e01b5f52604160045260245ffd5b015190505f806100cc565b5f8080528281209350601f198516905b8181106103ec57509084600195949392106103d4575b505050811b015f556100e0565b01515f1960f88460031b161c191690555f80806103c7565b929360206001819287860151815501950193016103b1565b5f80529091505f80516020611321833981519152601f840160051c81019160208510610454575b90601f859493920160051c01905b81811061044657506100b6565b5f8155849350600101610439565b909150819061042b565b5f80fd5b601f909101601f19168101906001600160401b0382119082101761038257604052565b81601f8201121561045e578051906001600160401b03821161038257604051926104b9601f8401601f191660200185610462565b8284526020838301011161045e57815f9260208093018386015e8301015290565b519061ffff8216820361045e57565b90600182811c92168015610517575b602083101461050357565b634e487b7160e01b5f52602260045260245ffd5b91607f16916104f856fe6080806040526004361015610012575f80fd5b5f3560e01c908163038272b6146109665750806306fdde03146108c4578063095ea7b31461084b57806318160ddd1461082e57806323b872dd14610709578063313ce567146106cc5780633644e515146106aa57806340c10f191461064a57806349bd5a5e1461062257806363986aba146105e457806370a08231146105ac5780637ecebe001461057457806395d89b411461049a5780639dc29fac1461043a578063a45cae0214610103578063a9059cbb146103de578063b2c5c9eb146103ba578063d505accf146101b0578063dd62ed3e14610160578063e85455d71461012b5763eeae0f9714610103575f80fd5b34610127575f36600319011261012757602061ffff60065460a01c16604051908152f35b5f80fd5b34610127576020366003190112610127576020610146610a1f565b6006546040516001600160a01b0392831691909216148152f35b3461012757604036600319011261012757610179610a1f565b610181610a35565b6001600160a01b039182165f908152600460209081526040808320949093168252928352819020549051908152f35b346101275760e0366003190112610127576101c9610a1f565b6101d1610a35565b6044356064359260843560ff8116809103610127574285106103755760805f916020936101fc610a4b565b9060018060a01b03169687855260058652604085209889549960018b01905560405190878201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c984528a604084015260018060a01b03169a8b6060840152898784015260a083015260c082015260c0815261027960e0826109bf565b519020604051908682019261190160f01b845260228301526042820152604281526102a56062826109bf565b519020906040519182528482015260a435604082015260c435606082015282805260015afa1561036a575f516001600160a01b031680151580610361575b1561032b577f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925916020915f526004825260405f20855f5282528060405f2055604051908152a3005b60405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b6044820152606490fd5b508281146102e3565b6040513d5f823e3d90fd5b60405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152606490fd5b34610127575f36600319011261012757602061ffff60065460b01c16604051908152f35b346101275760403660031901126101275761041c6103fa610a1f565b60018060a01b036006541690813314918215610427575b506024359033610bc5565b602060405160018152f35b6001600160a01b03821614915083610411565b34610127576040366003190112610127575f610454610a1f565b5f80516020610dd383398151915260206024359260018060a01b0316928385526003825260408520610487828254610c95565b90558060025403600255604051908152a3005b34610127575f366003190112610127576040515f6001546104ba81610987565b808452906001811690811561055057506001146104f2575b6104ee836104e2818503826109bf565b604051918291826109f5565b0390f35b60015f9081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6939250905b808210610536575090915081016020016104e26104d2565b91926001816020925483858801015201910190929161051e565b60ff191660208086019190915291151560051b840190910191506104e290506104d2565b34610127576020366003190112610127576001600160a01b03610595610a1f565b165f526005602052602060405f2054604051908152f35b34610127576020366003190112610127576001600160a01b036105cd610a1f565b165f526003602052602060405f2054604051908152f35b34610127576020366003190112610127576001600160a01b03610605610a1f565b166bffffffffffffffffffffffff60a01b60065416176006555f80f35b34610127575f366003190112610127576006546040516001600160a01b039091168152602090f35b3461012757604036600319011261012757610663610a1f565b5f5f80516020610dd383398151915260206024359361068485600254610c74565b6002556001600160a01b03168084526003825260408085208054870190555194855293a3005b34610127575f3660031901126101275760206106c4610a4b565b604051908152f35b34610127575f36600319011261012757602060405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b3461012757606036600319011261012757610722610a1f565b61072a610a35565b6001600160a01b0382165f81815260046020908152604080832033845290915290205490916044359160018101610793575b5060065461041c946001600160a01b03909116938414938415610780575b50610bc5565b6001600160a01b0383161493508561077a565b82811061081f578290039383156108105733156108015761041c94845f52600460205260405f2060018060a01b0333165f526020528060405f2055604051908152847f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560203393a39361075c565b63b2fa1ef360e01b5f5260045ffd5b6356fdae6560e11b5f5260045ffd5b6313be252b60e01b5f5260045ffd5b34610127575f366003190112610127576020600254604051908152f35b3461012757604036600319011261012757610864610a1f565b335f8181526004602090815260408083206001600160a01b03909516808452948252918290206024359081905591519182527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a3602060405160018152f35b34610127575f366003190112610127576040515f80546108e381610987565b8084529060018116908115610550575060011461090a576104ee836104e2818503826109bf565b5f8080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563939250905b80821061094c575090915081016020016104e26104d2565b919260018160209254838588010152019101909291610934565b34610127575f3660031901126101275760209061ffff60065460b01c168152f35b90600182811c921680156109b5575b60208310146109a157565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610996565b90601f8019910116810190811067ffffffffffffffff8211176109e157604052565b634e487b7160e01b5f52604160045260245ffd5b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361012757565b602435906001600160a01b038216820361012757565b467f000000000000000000000000000000000000000000000000000000000000000003610a96577f000000000000000000000000000000000000000000000000000000000000000090565b6040515f905f549181610aa884610987565b9182825260208201946001811690815f14610ba95750600114610b4c575b610ad2925003826109bf565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a08152610b4660c0826109bf565b51902090565b505f80805290917f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818310610b8d575050906020610ad292820101610ac6565b6020919350806001915483858801015201910190918392610b75565b60ff1916865250610ad292151560051b82016020019050610ac6565b90926001600160a01b038216929091908315610c65576001600160a01b038516948515610c5657845f5260036020528160405f205410610c475781602093610c1b925f80516020610dd383398151915296610cb5565b90845f526003835260405f20908154039055845f526003825260405f20818154019055604051908152a3565b635dd58b8b60e01b5f5260045ffd5b633a954ecd60e21b5f5260045ffd5b630b07e54560e11b5f5260045ffd5b91908201809211610c8157565b634e487b7160e01b5f52601160045260245ffd5b91908203918211610c8157565b81810292918115918404141715610c8157565b9392919091809415610dcc576006545f936001600160a01b038083169116811480610dbc575b15610d68575060b01c61ffff169081610d47575b50505b81610cfb575050565b92610d449293305f52600360205260405f20610d18848254610c74565b905560405183815230916001600160a01b0316905f80516020610dd383398151915290602090a3610c95565b90565b610d59610d6093949261271092610ca2565b0490610c74565b905f80610cef565b6001600160a01b0384161480610dac575b610d85575b5050610cf2565b60a01c61ffff16908115610d7e5761271092935090610da391610ca2565b04905f80610d7e565b5061ffff8160a01c161515610d79565b5061ffff8260b01c161515610cdb565b9350505056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa164736f6c634300081a000a290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f3560e01c908163038272b6146109665750806306fdde03146108c4578063095ea7b31461084b57806318160ddd1461082e57806323b872dd14610709578063313ce567146106cc5780633644e515146106aa57806340c10f191461064a57806349bd5a5e1461062257806363986aba146105e457806370a08231146105ac5780637ecebe001461057457806395d89b411461049a5780639dc29fac1461043a578063a45cae0214610103578063a9059cbb146103de578063b2c5c9eb146103ba578063d505accf146101b0578063dd62ed3e14610160578063e85455d71461012b5763eeae0f9714610103575f80fd5b34610127575f36600319011261012757602061ffff60065460a01c16604051908152f35b5f80fd5b34610127576020366003190112610127576020610146610a1f565b6006546040516001600160a01b0392831691909216148152f35b3461012757604036600319011261012757610179610a1f565b610181610a35565b6001600160a01b039182165f908152600460209081526040808320949093168252928352819020549051908152f35b346101275760e0366003190112610127576101c9610a1f565b6101d1610a35565b6044356064359260843560ff8116809103610127574285106103755760805f916020936101fc610a4b565b9060018060a01b03169687855260058652604085209889549960018b01905560405190878201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c984528a604084015260018060a01b03169a8b6060840152898784015260a083015260c082015260c0815261027960e0826109bf565b519020604051908682019261190160f01b845260228301526042820152604281526102a56062826109bf565b519020906040519182528482015260a435604082015260c435606082015282805260015afa1561036a575f516001600160a01b031680151580610361575b1561032b577f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925916020915f526004825260405f20855f5282528060405f2055604051908152a3005b60405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b6044820152606490fd5b508281146102e3565b6040513d5f823e3d90fd5b60405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152606490fd5b34610127575f36600319011261012757602061ffff60065460b01c16604051908152f35b346101275760403660031901126101275761041c6103fa610a1f565b60018060a01b036006541690813314918215610427575b506024359033610bc5565b602060405160018152f35b6001600160a01b03821614915083610411565b34610127576040366003190112610127575f610454610a1f565b5f80516020610dd383398151915260206024359260018060a01b0316928385526003825260408520610487828254610c95565b90558060025403600255604051908152a3005b34610127575f366003190112610127576040515f6001546104ba81610987565b808452906001811690811561055057506001146104f2575b6104ee836104e2818503826109bf565b604051918291826109f5565b0390f35b60015f9081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6939250905b808210610536575090915081016020016104e26104d2565b91926001816020925483858801015201910190929161051e565b60ff191660208086019190915291151560051b840190910191506104e290506104d2565b34610127576020366003190112610127576001600160a01b03610595610a1f565b165f526005602052602060405f2054604051908152f35b34610127576020366003190112610127576001600160a01b036105cd610a1f565b165f526003602052602060405f2054604051908152f35b34610127576020366003190112610127576001600160a01b03610605610a1f565b166bffffffffffffffffffffffff60a01b60065416176006555f80f35b34610127575f366003190112610127576006546040516001600160a01b039091168152602090f35b3461012757604036600319011261012757610663610a1f565b5f5f80516020610dd383398151915260206024359361068485600254610c74565b6002556001600160a01b03168084526003825260408085208054870190555194855293a3005b34610127575f3660031901126101275760206106c4610a4b565b604051908152f35b34610127575f36600319011261012757602060405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b3461012757606036600319011261012757610722610a1f565b61072a610a35565b6001600160a01b0382165f81815260046020908152604080832033845290915290205490916044359160018101610793575b5060065461041c946001600160a01b03909116938414938415610780575b50610bc5565b6001600160a01b0383161493508561077a565b82811061081f578290039383156108105733156108015761041c94845f52600460205260405f2060018060a01b0333165f526020528060405f2055604051908152847f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560203393a39361075c565b63b2fa1ef360e01b5f5260045ffd5b6356fdae6560e11b5f5260045ffd5b6313be252b60e01b5f5260045ffd5b34610127575f366003190112610127576020600254604051908152f35b3461012757604036600319011261012757610864610a1f565b335f8181526004602090815260408083206001600160a01b03909516808452948252918290206024359081905591519182527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a3602060405160018152f35b34610127575f366003190112610127576040515f80546108e381610987565b8084529060018116908115610550575060011461090a576104ee836104e2818503826109bf565b5f8080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563939250905b80821061094c575090915081016020016104e26104d2565b919260018160209254838588010152019101909291610934565b34610127575f3660031901126101275760209061ffff60065460b01c168152f35b90600182811c921680156109b5575b60208310146109a157565b634e487b7160e01b5f52602260045260245ffd5b91607f1691610996565b90601f8019910116810190811067ffffffffffffffff8211176109e157604052565b634e487b7160e01b5f52604160045260245ffd5b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361012757565b602435906001600160a01b038216820361012757565b467f000000000000000000000000000000000000000000000000000000000000000003610a96577f000000000000000000000000000000000000000000000000000000000000000090565b6040515f905f549181610aa884610987565b9182825260208201946001811690815f14610ba95750600114610b4c575b610ad2925003826109bf565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a08152610b4660c0826109bf565b51902090565b505f80805290917f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818310610b8d575050906020610ad292820101610ac6565b6020919350806001915483858801015201910190918392610b75565b60ff1916865250610ad292151560051b82016020019050610ac6565b90926001600160a01b038216929091908315610c65576001600160a01b038516948515610c5657845f5260036020528160405f205410610c475781602093610c1b925f80516020610dd383398151915296610cb5565b90845f526003835260405f20908154039055845f526003825260405f20818154019055604051908152a3565b635dd58b8b60e01b5f5260045ffd5b633a954ecd60e21b5f5260045ffd5b630b07e54560e11b5f5260045ffd5b91908201809211610c8157565b634e487b7160e01b5f52601160045260245ffd5b91908203918211610c8157565b81810292918115918404141715610c8157565b9392919091809415610dcc576006545f936001600160a01b038083169116811480610dbc575b15610d68575060b01c61ffff169081610d47575b50505b81610cfb575050565b92610d449293305f52600360205260405f20610d18848254610c74565b905560405183815230916001600160a01b0316905f80516020610dd383398151915290602090a3610c95565b90565b610d59610d6093949261271092610ca2565b0490610c74565b905f80610cef565b6001600160a01b0384161480610dac575b610d85575b5050610cf2565b60a01c61ffff16908115610d7e5761271092935090610da391610ca2565b04905f80610d7e565b5061ffff8160a01c161515610d79565b5061ffff8260b01c161515610cdb565b9350505056feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa164736f6c634300081a000a" as Hex;
export const MockAgentToken = {
    abi,
    bytecode,
    deployedBytecode,
};
