export const __constructor__ = {
    type: "function",
    name: "__constructor__",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const relayERC20 = {
    type: "function",
    name: "relayERC20",
    inputs: [
        { name: "_token", type: "address", internalType: "address" },
        { name: "_from", type: "address", internalType: "address" },
        { name: "_to", type: "address", internalType: "address" },
        { name: "_amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const sendERC20 = {
    type: "function",
    name: "sendERC20",
    inputs: [
        { name: "_token", type: "address", internalType: "address" },
        { name: "_to", type: "address", internalType: "address" },
        { name: "_amount", type: "uint256", internalType: "uint256" },
        { name: "_chainId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "msgHash_", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "nonpayable",
} as const;
export const version = {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const RelayERC20 = {
    type: "event",
    name: "RelayERC20",
    inputs: [
        { name: "token", type: "address", indexed: true, internalType: "address" },
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "source", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const SendERC20 = {
    type: "event",
    name: "SendERC20",
    inputs: [
        { name: "token", type: "address", indexed: true, internalType: "address" },
        { name: "from", type: "address", indexed: true, internalType: "address" },
        { name: "to", type: "address", indexed: true, internalType: "address" },
        { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "destination", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
} as const;
export const InvalidCrossDomainSender = { type: "error", name: "InvalidCrossDomainSender", inputs: [] } as const;
export const InvalidERC7802 = { type: "error", name: "InvalidERC7802", inputs: [] } as const;
export const Unauthorized = { type: "error", name: "Unauthorized", inputs: [] } as const;
export const ZeroAddress = { type: "error", name: "ZeroAddress", inputs: [] } as const;
export const functions = [__constructor__, relayERC20, sendERC20, version] as const;
export const events = [RelayERC20, SendERC20] as const;
export const errors = [InvalidCrossDomainSender, InvalidERC7802, Unauthorized, ZeroAddress] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const ISuperchainTokenBridge = {
    abi,
};
