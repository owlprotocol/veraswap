import { Hex } from "viem";

export const PACKAGE_VERSION = {
    type: "function",
    name: "PACKAGE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const hookType = {
    type: "function",
    name: "hookType",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "pure",
} as const;
export const owner = {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const pause = {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const paused = {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const postDispatch = {
    type: "function",
    name: "postDispatch",
    inputs: [
        { name: "metadata", type: "bytes", internalType: "bytes" },
        { name: "message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const quoteDispatch = {
    type: "function",
    name: "quoteDispatch",
    inputs: [
        { name: "metadata", type: "bytes", internalType: "bytes" },
        { name: "message", type: "bytes", internalType: "bytes" },
    ],
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
export const supportsMetadata = {
    type: "function",
    name: "supportsMetadata",
    inputs: [{ name: "metadata", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "pure",
} as const;
export const transferOwnership = {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const unpause = {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
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
export const Paused = {
    type: "event",
    name: "Paused",
    inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const Unpaused = {
    type: "event",
    name: "Unpaused",
    inputs: [{ name: "account", type: "address", indexed: false, internalType: "address" }],
    anonymous: false,
} as const;
export const functions = [
    PACKAGE_VERSION,
    hookType,
    owner,
    pause,
    paused,
    postDispatch,
    quoteDispatch,
    renounceOwnership,
    supportsMetadata,
    transferOwnership,
    unpause,
] as const;
export const events = [OwnershipTransferred, Paused, Unpaused] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60808060405234605a575f543360018060a01b0382167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a36001600160a81b0319163360ff60a01b1916175f5561061f908161005f8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8063086011b91461040a5780633f4ba83a146103715780635c975abb1461034d578063715018a6146102f65780638456cb59146102965780638da5cb5b1461026f57806393c44847146101ec578063aaccd230146101c1578063e445e7dd146101a6578063e5320bb9146101605763f2fde38b14610092575f80fd5b3461015c57602036600319011261015c576004356001600160a01b0381169081900361015c576100c061052f565b8015610108575f80546001600160a01b03198116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b60405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608490fd5b5f80fd5b3461015c57602036600319011261015c5760043567ffffffffffffffff811161015c5761019c6101966020923690600401610423565b9061050a565b6040519015158152f35b3461015c575f36600319011261015c57602060405160078152f35b3461015c576101e26101dd6101d536610451565b50509061050a565b6104a3565b60206040515f8152f35b3461015c575f36600319011261015c576040516040810181811067ffffffffffffffff82111761025b576040526006815260406020820191650d4b8c4c4b8d60d21b83528151928391602083525180918160208501528484015e5f828201840152601f01601f19168101030190f35b634e487b7160e01b5f52604160045260245ffd5b3461015c575f36600319011261015c575f546040516001600160a01b039091168152602090f35b3461015c575f36600319011261015c576102ae61052f565b6102b66105a3565b5f805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b3461015c575f36600319011261015c5761030e61052f565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461015c575f36600319011261015c57602060ff5f5460a01c166040519015158152f35b3461015c575f36600319011261015c5761038961052f565b5f5460ff8160a01c16156103ce5760ff60a01b19165f556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b60405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b6044820152606490fd5b6104196101dd6101d536610451565b6104216105a3565b005b9181601f8401121561015c5782359167ffffffffffffffff831161015c576020838186019501011161015c57565b604060031982011261015c5760043567ffffffffffffffff811161015c578161047c91600401610423565b929092916024359067ffffffffffffffff821161015c5761049f91600401610423565b9091565b156104aa57565b60405162461bcd60e51b815260206004820152603260248201527f4162737472616374506f73744469737061746368486f6f6b3a20696e76616c6960448201527119081b595d1859185d18481d985c9a585b9d60721b6064820152608490fd5b90801591821561051957505090565b6001925061ffff9161052a91610586565b161490565b5f546001600160a01b0316330361054257565b606460405162461bcd60e51b815260206004820152602060248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152fd5b906002811061059d5760021161015c573560f01c90565b50505f90565b60ff5f5460a01c166105b157565b60405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b6044820152606490fdfea264697066735822122006191e9201ebd733744bd27a734d7b676c4b79ebb153d90eb2e65c89e6e0aed264736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c8063086011b91461040a5780633f4ba83a146103715780635c975abb1461034d578063715018a6146102f65780638456cb59146102965780638da5cb5b1461026f57806393c44847146101ec578063aaccd230146101c1578063e445e7dd146101a6578063e5320bb9146101605763f2fde38b14610092575f80fd5b3461015c57602036600319011261015c576004356001600160a01b0381169081900361015c576100c061052f565b8015610108575f80546001600160a01b03198116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b60405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608490fd5b5f80fd5b3461015c57602036600319011261015c5760043567ffffffffffffffff811161015c5761019c6101966020923690600401610423565b9061050a565b6040519015158152f35b3461015c575f36600319011261015c57602060405160078152f35b3461015c576101e26101dd6101d536610451565b50509061050a565b6104a3565b60206040515f8152f35b3461015c575f36600319011261015c576040516040810181811067ffffffffffffffff82111761025b576040526006815260406020820191650d4b8c4c4b8d60d21b83528151928391602083525180918160208501528484015e5f828201840152601f01601f19168101030190f35b634e487b7160e01b5f52604160045260245ffd5b3461015c575f36600319011261015c575f546040516001600160a01b039091168152602090f35b3461015c575f36600319011261015c576102ae61052f565b6102b66105a3565b5f805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b3461015c575f36600319011261015c5761030e61052f565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461015c575f36600319011261015c57602060ff5f5460a01c166040519015158152f35b3461015c575f36600319011261015c5761038961052f565b5f5460ff8160a01c16156103ce5760ff60a01b19165f556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b60405162461bcd60e51b815260206004820152601460248201527314185d5cd8589b194e881b9bdd081c185d5cd95960621b6044820152606490fd5b6104196101dd6101d536610451565b6104216105a3565b005b9181601f8401121561015c5782359167ffffffffffffffff831161015c576020838186019501011161015c57565b604060031982011261015c5760043567ffffffffffffffff811161015c578161047c91600401610423565b929092916024359067ffffffffffffffff821161015c5761049f91600401610423565b9091565b156104aa57565b60405162461bcd60e51b815260206004820152603260248201527f4162737472616374506f73744469737061746368486f6f6b3a20696e76616c6960448201527119081b595d1859185d18481d985c9a585b9d60721b6064820152608490fd5b90801591821561051957505090565b6001925061ffff9161052a91610586565b161490565b5f546001600160a01b0316330361054257565b606460405162461bcd60e51b815260206004820152602060248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152fd5b906002811061059d5760021161015c573560f01c90565b50505f90565b60ff5f5460a01c166105b157565b60405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b6044820152606490fdfea264697066735822122006191e9201ebd733744bd27a734d7b676c4b79ebb153d90eb2e65c89e6e0aed264736f6c634300081a0033" as Hex;
export const PausableHook = {
    abi,
    bytecode,
    deployedBytecode,
};
