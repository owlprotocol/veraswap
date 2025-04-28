export const PACKAGE_VERSION = {
    type: "function",
    name: "PACKAGE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const destinationGas = {
    type: "function",
    name: "destinationGas",
    inputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const domains = {
    type: "function",
    name: "domains",
    inputs: [],
    outputs: [{ name: "", type: "uint32[]", internalType: "uint32[]" }],
    stateMutability: "view",
} as const;
export const enrollRemoteRouter = {
    type: "function",
    name: "enrollRemoteRouter",
    inputs: [
        { name: "_domain", type: "uint32", internalType: "uint32" },
        { name: "_router", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const enrollRemoteRouters = {
    type: "function",
    name: "enrollRemoteRouters",
    inputs: [
        { name: "_domains", type: "uint32[]", internalType: "uint32[]" },
        { name: "_addresses", type: "bytes32[]", internalType: "bytes32[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const handle = {
    type: "function",
    name: "handle",
    inputs: [
        { name: "_origin", type: "uint32", internalType: "uint32" },
        { name: "_sender", type: "bytes32", internalType: "bytes32" },
        { name: "_message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const hook = {
    type: "function",
    name: "hook",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPostDispatchHook" }],
    stateMutability: "view",
} as const;
export const interchainSecurityModule = {
    type: "function",
    name: "interchainSecurityModule",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IInterchainSecurityModule" }],
    stateMutability: "view",
} as const;
export const localDomain = {
    type: "function",
    name: "localDomain",
    inputs: [],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
} as const;
export const mailbox = {
    type: "function",
    name: "mailbox",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IMailbox" }],
    stateMutability: "view",
} as const;
export const owner = {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const quoteGasPayment = {
    type: "function",
    name: "quoteGasPayment",
    inputs: [{ name: "_destinationDomain", type: "uint32", internalType: "uint32" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const renounceOwnership = {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const routers = {
    type: "function",
    name: "routers",
    inputs: [{ name: "_domain", type: "uint32", internalType: "uint32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const setDestinationGas = {
    type: "function",
    name: "setDestinationGas",
    inputs: [
        { name: "domain", type: "uint32", internalType: "uint32" },
        { name: "gas", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setDestinationGas__uint32_uint256_array = {
    type: "function",
    name: "setDestinationGas",
    inputs: [
        {
            name: "gasConfigs",
            type: "tuple[]",
            internalType: "struct GasRouter.GasRouterConfig[]",
            components: [
                { name: "domain", type: "uint32", internalType: "uint32" },
                { name: "gas", type: "uint256", internalType: "uint256" },
            ],
        },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setHook = {
    type: "function",
    name: "setHook",
    inputs: [{ name: "_hook", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setInterchainSecurityModule = {
    type: "function",
    name: "setInterchainSecurityModule",
    inputs: [{ name: "_module", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const transferOwnership = {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unenrollRemoteRouter = {
    type: "function",
    name: "unenrollRemoteRouter",
    inputs: [{ name: "_domain", type: "uint32", internalType: "uint32" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unenrollRemoteRouters = {
    type: "function",
    name: "unenrollRemoteRouters",
    inputs: [{ name: "_domains", type: "uint32[]", internalType: "uint32[]" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const GasSet = {
    type: "event",
    name: "GasSet",
    inputs: [
        { name: "domain", type: "uint32", indexed: false, internalType: "uint32" },
        { name: "gas", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const HookSet = {
    type: "event",
    name: "HookSet",
    inputs: [{ name: "_hook", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const Initialized = {
    type: "event",
    name: "Initialized",
    inputs: [{ name: "version", type: "uint8", indexed: false, internalType: "uint8" }],
    anonymous: false,
} as const;
export const IsmSet = {
    type: "event",
    name: "IsmSet",
    inputs: [{ name: "_ism", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const OwnershipTransferred = {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
        { name: "previousOwner", type: "address", indexed: true, internalType: "address" },
        { name: "newOwner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const functions = [
    PACKAGE_VERSION,
    destinationGas,
    domains,
    enrollRemoteRouter,
    enrollRemoteRouters,
    handle,
    hook,
    interchainSecurityModule,
    localDomain,
    mailbox,
    owner,
    quoteGasPayment,
    renounceOwnership,
    routers,
    setDestinationGas,
    setDestinationGas__uint32_uint256_array,
    setHook,
    setInterchainSecurityModule,
    transferOwnership,
    unenrollRemoteRouter,
    unenrollRemoteRouters,
] as const;
export const events = [GasSet, HookSet, Initialized, IsmSet, OwnershipTransferred] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const GasRouter = {
    abi,
};
