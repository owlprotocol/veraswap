export const __constructor__ = {
    type: "function",
    name: "__constructor__",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const crossDomainMessageContext = {
    type: "function",
    name: "crossDomainMessageContext",
    inputs: [],
    outputs: [
        { name: "sender_", type: "address", internalType: "address" },
        { name: "source_", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
} as const;
export const crossDomainMessageSender = {
    type: "function",
    name: "crossDomainMessageSender",
    inputs: [],
    outputs: [{ name: "sender_", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const crossDomainMessageSource = {
    type: "function",
    name: "crossDomainMessageSource",
    inputs: [],
    outputs: [{ name: "source_", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const messageNonce = {
    type: "function",
    name: "messageNonce",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const messageVersion = {
    type: "function",
    name: "messageVersion",
    inputs: [],
    outputs: [{ name: "", type: "uint16", internalType: "uint16" }],
    stateMutability: "view",
} as const;
export const relayMessage = {
    type: "function",
    name: "relayMessage",
    inputs: [
        {
            name: "_id",
            type: "tuple",
            internalType: "struct Identifier",
            components: [
                { name: "origin", type: "address", internalType: "address" },
                { name: "blockNumber", type: "uint256", internalType: "uint256" },
                { name: "logIndex", type: "uint256", internalType: "uint256" },
                { name: "timestamp", type: "uint256", internalType: "uint256" },
                { name: "chainId", type: "uint256", internalType: "uint256" },
            ],
        },
        { name: "_sentMessage", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "returnData_", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
} as const;
export const sendMessage = {
    type: "function",
    name: "sendMessage",
    inputs: [
        { name: "_destination", type: "uint256", internalType: "uint256" },
        { name: "_target", type: "address", internalType: "address" },
        { name: "_message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "nonpayable",
} as const;
export const successfulMessages = {
    type: "function",
    name: "successfulMessages",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const version = {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const RelayedMessage = {
    type: "event",
    name: "RelayedMessage",
    inputs: [
        { name: "source", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "messageNonce", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "messageHash", type: "bytes32", indexed: true, internalType: "bytes32" },
    ],
    anonymous: false,
} as const;
export const SentMessage = {
    type: "event",
    name: "SentMessage",
    inputs: [
        { name: "destination", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "target", type: "address", indexed: true, internalType: "address" },
        { name: "messageNonce", type: "uint256", indexed: true, internalType: "uint256" },
        { name: "sender", type: "address", indexed: false, internalType: "address" },
        { name: "message", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const EventPayloadNotSentMessage = { type: "error", name: "EventPayloadNotSentMessage", inputs: [] } as const;
export const IdOriginNotL2ToL2CrossDomainMessenger = {
    type: "error",
    name: "IdOriginNotL2ToL2CrossDomainMessenger",
    inputs: [],
} as const;
export const InvalidChainId = { type: "error", name: "InvalidChainId", inputs: [] } as const;
export const MessageAlreadyRelayed = { type: "error", name: "MessageAlreadyRelayed", inputs: [] } as const;
export const MessageDestinationNotRelayChain = {
    type: "error",
    name: "MessageDestinationNotRelayChain",
    inputs: [],
} as const;
export const MessageDestinationSameChain = { type: "error", name: "MessageDestinationSameChain", inputs: [] } as const;
export const MessageTargetCrossL2Inbox = { type: "error", name: "MessageTargetCrossL2Inbox", inputs: [] } as const;
export const MessageTargetL2ToL2CrossDomainMessenger = {
    type: "error",
    name: "MessageTargetL2ToL2CrossDomainMessenger",
    inputs: [],
} as const;
export const NotEntered = { type: "error", name: "NotEntered", inputs: [] } as const;
export const ReentrantCall = { type: "error", name: "ReentrantCall", inputs: [] } as const;
export const TargetCallFailed = { type: "error", name: "TargetCallFailed", inputs: [] } as const;
export const functions = [
    __constructor__,
    crossDomainMessageContext,
    crossDomainMessageSender,
    crossDomainMessageSource,
    messageNonce,
    messageVersion,
    relayMessage,
    sendMessage,
    successfulMessages,
    version,
] as const;
export const events = [RelayedMessage, SentMessage] as const;
export const errors = [
    EventPayloadNotSentMessage,
    IdOriginNotL2ToL2CrossDomainMessenger,
    InvalidChainId,
    MessageAlreadyRelayed,
    MessageDestinationNotRelayChain,
    MessageDestinationSameChain,
    MessageTargetCrossL2Inbox,
    MessageTargetL2ToL2CrossDomainMessenger,
    NotEntered,
    ReentrantCall,
    TargetCallFailed,
] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const IL2ToL2CrossDomainMessenger = {
    abi,
};
