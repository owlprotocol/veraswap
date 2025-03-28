import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [{ name: "_localDomain", type: "uint32", internalType: "uint32" }],
    stateMutability: "nonpayable",
} as const;
export const PACKAGE_VERSION = {
    type: "function",
    name: "PACKAGE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
} as const;
export const VERSION = {
    type: "function",
    name: "VERSION",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
} as const;
export const defaultHook = {
    type: "function",
    name: "defaultHook",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPostDispatchHook" }],
    stateMutability: "view",
} as const;
export const defaultIsm = {
    type: "function",
    name: "defaultIsm",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IInterchainSecurityModule" }],
    stateMutability: "view",
} as const;
export const delivered = {
    type: "function",
    name: "delivered",
    inputs: [{ name: "_id", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const deployedBlock = {
    type: "function",
    name: "deployedBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const dispatch = {
    type: "function",
    name: "dispatch",
    inputs: [
        { name: "destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "messageBody", type: "bytes", internalType: "bytes" },
        { name: "metadata", type: "bytes", internalType: "bytes" },
        { name: "hook", type: "address", internalType: "contract IPostDispatchHook" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "payable",
} as const;
export const dispatch_uint32_bytes32_bytes_bytes = {
    type: "function",
    name: "dispatch",
    inputs: [
        { name: "destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "messageBody", type: "bytes", internalType: "bytes" },
        { name: "hookMetadata", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "payable",
} as const;
export const dispatch_uint32_bytes32_bytes = {
    type: "function",
    name: "dispatch",
    inputs: [
        { name: "_destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "_recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "_messageBody", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "payable",
} as const;
export const initialize = {
    type: "function",
    name: "initialize",
    inputs: [
        { name: "_owner", type: "address", internalType: "address" },
        { name: "_defaultIsm", type: "address", internalType: "address" },
        { name: "_defaultHook", type: "address", internalType: "address" },
        { name: "_requiredHook", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const latestDispatchedId = {
    type: "function",
    name: "latestDispatchedId",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
} as const;
export const localDomain = {
    type: "function",
    name: "localDomain",
    inputs: [],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
} as const;
export const nonce = {
    type: "function",
    name: "nonce",
    inputs: [],
    outputs: [{ name: "", type: "uint32", internalType: "uint32" }],
    stateMutability: "view",
} as const;
export const owner = {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const process = {
    type: "function",
    name: "process",
    inputs: [
        { name: "_metadata", type: "bytes", internalType: "bytes" },
        { name: "_message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
} as const;
export const processedAt = {
    type: "function",
    name: "processedAt",
    inputs: [{ name: "_id", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint48", internalType: "uint48" }],
    stateMutability: "view",
} as const;
export const processor = {
    type: "function",
    name: "processor",
    inputs: [{ name: "_id", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
} as const;
export const quoteDispatch = {
    type: "function",
    name: "quoteDispatch",
    inputs: [
        { name: "destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "messageBody", type: "bytes", internalType: "bytes" },
        { name: "metadata", type: "bytes", internalType: "bytes" },
        { name: "hook", type: "address", internalType: "contract IPostDispatchHook" },
    ],
    outputs: [{ name: "fee", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const quoteDispatch_uint32_bytes32_bytes = {
    type: "function",
    name: "quoteDispatch",
    inputs: [
        { name: "destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "messageBody", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "fee", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const quoteDispatch_uint32_bytes32_bytes_bytes = {
    type: "function",
    name: "quoteDispatch",
    inputs: [
        { name: "destinationDomain", type: "uint32", internalType: "uint32" },
        { name: "recipientAddress", type: "bytes32", internalType: "bytes32" },
        { name: "messageBody", type: "bytes", internalType: "bytes" },
        { name: "defaultHookMetadata", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "fee", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
} as const;
export const recipientIsm = {
    type: "function",
    name: "recipientIsm",
    inputs: [{ name: "_recipient", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address", internalType: "contract IInterchainSecurityModule" }],
    stateMutability: "view",
} as const;
export const renounceOwnership = {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const requiredHook = {
    type: "function",
    name: "requiredHook",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IPostDispatchHook" }],
    stateMutability: "view",
} as const;
export const setDefaultHook = {
    type: "function",
    name: "setDefaultHook",
    inputs: [{ name: "_hook", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setDefaultIsm = {
    type: "function",
    name: "setDefaultIsm",
    inputs: [{ name: "_module", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const setRequiredHook = {
    type: "function",
    name: "setRequiredHook",
    inputs: [{ name: "_hook", type: "address", internalType: "address" }],
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
export const DefaultHookSet = {
    type: "event",
    name: "DefaultHookSet",
    inputs: [{ name: "hook", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const DefaultIsmSet = {
    type: "event",
    name: "DefaultIsmSet",
    inputs: [{ name: "module", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const Dispatch = {
    type: "event",
    name: "Dispatch",
    inputs: [
        { name: "sender", type: "address", indexed: true, internalType: "address" },
        { name: "destination", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "recipient", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "message", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const DispatchId = {
    type: "event",
    name: "DispatchId",
    inputs: [{ name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" }],
    anonymous: false,
} as const;
export const Initialized = {
    type: "event",
    name: "Initialized",
    inputs: [{ name: "version", type: "uint8", indexed: false, internalType: "uint8" }],
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
export const Process = {
    type: "event",
    name: "Process",
    inputs: [
        { name: "origin", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "sender", type: "bytes32", indexed: true, internalType: "bytes32" },
        { name: "recipient", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
} as const;
export const ProcessId = {
    type: "event",
    name: "ProcessId",
    inputs: [{ name: "messageId", type: "bytes32", indexed: true, internalType: "bytes32" }],
    anonymous: false,
} as const;
export const RequiredHookSet = {
    type: "event",
    name: "RequiredHookSet",
    inputs: [{ name: "hook", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const functions = [
    _constructor,
    PACKAGE_VERSION,
    VERSION,
    defaultHook,
    defaultIsm,
    delivered,
    deployedBlock,
    dispatch,
    dispatch_uint32_bytes32_bytes_bytes,
    dispatch_uint32_bytes32_bytes,
    initialize,
    latestDispatchedId,
    localDomain,
    nonce,
    owner,
    process,
    processedAt,
    processor,
    quoteDispatch,
    quoteDispatch_uint32_bytes32_bytes,
    quoteDispatch_uint32_bytes32_bytes_bytes,
    recipientIsm,
    renounceOwnership,
    requiredHook,
    setDefaultHook,
    setDefaultIsm,
    setRequiredHook,
    transferOwnership,
] as const;
export const events = [
    DefaultHookSet,
    DefaultIsmSet,
    Dispatch,
    DispatchId,
    Initialized,
    OwnershipTransferred,
    Process,
    ProcessId,
    RequiredHookSet,
] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60c034607e57601f611b7138819003918201601f19168301916001600160401b03831184841017608257808492602094604052833981010312607e575163ffffffff81168103607e574360805260a052604051611ada9081610097823960805181610c42015260a051818181610c0601528181610cf301526119440152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffdfe6080806040526004361015610012575f80fd5b5f905f3560e01c90816307a2fda1146112cd5750806310b83dc0146112b3578063134fbb4f146112965780631426b7f4146112295780633d1250b71461120157806348aee8d4146111db5780635d1fe5a9146111a95780636e5f516e14611181578063715018a6146111265780637c39d13014610c8557806381d2ea9514610c6557806382ea7bfe14610c2a5780638d3638f414610be95780638da5cb5b14610bc057806393c4484714610b7257806399b0480914610b035780639c42bd1814610983578063affed0e01461095f578063d6d08a0914610936578063e495f1d4146108f6578063e70f48ac146108c0578063f2fde38b14610883578063f794687a14610814578063f7ccd321146107e0578063f8c8765e1461042f578063fa31de01146101655763ffa1ad7414610147575f80fd5b34610162578060031936011261016257602060405160038152f35b80fd5b5061016f36611486565b6068549192916001600160a01b031690811561041c575b6101929084848761191d565b91825160208401209485606655606554600163ffffffff82160163ffffffff81116104085763ffffffff169063ffffffff19161760655563ffffffff604051916020835216907f769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c8143391806102096020820189611462565b0390a460405190847f788dbc1b7152732178210e7f4d9d010ef016f9eafbe66786bd7169f56e0c353a8780a2606954630aaccd2360e41b83526040600484015286906001600160a01b03166020848061027b61026960448301878c6114c6565b82810360031901602484015289611462565b0381845afa9384156103ba5782946103cd575b508334106103c5575b803b1561037a5781604051809263086011b960e01b8252604060048301528187816102dc6102ca8d8860448501916114c6565b8281036003190160248401528c611462565b03925af180156103ba576103a1575b505060018060a01b03169034039234841161038d5790859291813b156103895761034b94610339916040519687958694859363086011b960e01b8552604060048601528960448601916114c6565b83810360031901602485015290611462565b03925af1801561037e57610365575b602082604051908152f35b610370838092611424565b61037a578161035a565b5080fd5b6040513d85823e3d90fd5b8380fd5b634e487b7160e01b86526011600452602486fd5b816103ab91611424565b6103b657855f6102eb565b8580fd5b6040513d84823e3d90fd5b349350610297565b915092506020813d602011610400575b816103ea60209383611424565b810103126103fc57869051925f61028e565b5f80fd5b3d91506103dd565b634e487b7160e01b89526011600452602489fd5b6068546001600160a01b03169150610186565b5034610162576080366003190112610162576104496113a7565b602435906001600160a01b038216808303610389576044356001600160a01b0381168082036103b6576064356001600160a01b038116939092908484036107dc5787549660ff8860081c1615978880996107cf575b80156107b8575b1561075c5760ff1981166001178a558861074b575b506104d460ff8a5460081c166104cf81611a6d565b611a6d565b6104dd33611a04565b6104e56119ac565b3b156106fc57606780546001600160a01b031916821790557fa76ad0adbf45318f8633aa0210f711273d50fbb6fef76ed95bbae97082c75daa8880a26105296119ac565b3b156106ac57606880546001600160a01b031916821790557f65a63e5066ee2fcdf9d32a7f1bf7ce71c76066f19d0609dddccd334ab87237d78680a261056d6119ac565b3b1561065b57606980546001600160a01b031916821790557f329ec8e2438a73828ecf31a6568d7a91d7b1d79e342b0692914fd053d1a002b18480a26105b16119ac565b6001600160a01b03811615610607576105c990611a04565b6105d05780f35b61ff001981541681557f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498602060405160018152a180f35b60405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608490fd5b60405162461bcd60e51b815260206004820152602360248201527f4d61696c626f783a20726571756972656420686f6f6b206e6f7420636f6e74726044820152621858dd60ea1b6064820152608490fd5b60405162461bcd60e51b815260206004820152602260248201527f4d61696c626f783a2064656661756c7420686f6f6b206e6f7420636f6e74726160448201526118dd60f21b6064820152608490fd5b60405162461bcd60e51b815260206004820152602160248201527f4d61696c626f783a2064656661756c742049534d206e6f7420636f6e747261636044820152601d60fa1b6064820152608490fd5b61ffff19166101011789555f6104ba565b60405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608490fd5b50303b1580156104a55750600160ff8216146104a5565b50600160ff82161061049e565b8780fd5b503461016257602061080c6107f4366113bd565b6068546001600160a01b03169590949193919061173a565b604051908152f35b50346101625760203660031901126101625761082e6113a7565b6108366119ac565b803b156106fc57606780546001600160a01b0319166001600160a01b039290921691821790557fa76ad0adbf45318f8633aa0210f711273d50fbb6fef76ed95bbae97082c75daa8280a280f35b50346101625760203660031901126101625761089d6113a7565b6108a56119ac565b6001600160a01b03811615610607576108bd90611a04565b80f35b50346101625760203660031901126101625760206108e46108df6113a7565b611873565b6040516001600160a01b039091168152f35b503461016257602036600319011261016257602061092c6004355f52606a60205265ffffffffffff60405f205460a01c16151590565b6040519015158152f35b50346101625780600319360112610162576069546040516001600160a01b039091168152602090f35b5034610162578060031936011261016257602063ffffffff60655416604051908152f35b50346101625761099236611486565b606854919493926001600160a01b039092169185908315610af0575b6109b8939461191d565b9060018060a01b03606954169360206040518096630aaccd2360e41b82526040600483015281806109f0610269604483018b896114c6565b03915afa948515610ae5578495610aaa575b5091602091610339610a349460405195869485938493630aaccd2360e41b8552604060048601528a60448601916114c6565b03916001600160a01b03165afa9081156103ba578291610a78575b508201809211610a6457602082604051908152f35b634e487b7160e01b81526011600452602490fd5b90506020813d602011610aa2575b81610a9360209383611424565b810103126103fc57515f610a4f565b3d9150610a86565b91929094506020823d602011610add575b81610ac860209383611424565b810103126103fc579051939091906020610a02565b3d9150610abb565b6040513d86823e3d90fd5b6068546001600160a01b031693506109ae565b503461016257602036600319011261016257610b1d6113a7565b610b256119ac565b803b156106ac57606880546001600160a01b0319166001600160a01b039290921691821790557f65a63e5066ee2fcdf9d32a7f1bf7ce71c76066f19d0609dddccd334ab87237d78280a280f35b503461016257806003193601126101625750610bbc604051610b95604082611424565b60068152650d4b8c4c4b8d60d21b6020820152604051918291602083526020830190611462565b0390f35b50346101625780600319360112610162576033546040516001600160a01b039091168152602090f35b5034610162578060031936011261016257602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461016257806003193601126101625760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b503461016257602061080c610c793661132c565b9594909493919361173a565b5060403660031901126103fc5760043567ffffffffffffffff81116103fc57610cb29036906004016112fe565b9060243567ffffffffffffffff81116103fc57610cd39036906004016112fe565b9092816001116103fc576003843560f81c036110ea5781602d116103fc577f000000000000000000000000000000000000000000000000000000000000000063ffffffff16602985013560e01c036110a557610d2e82611446565b610d3b6040519182611424565b828152602081019036848701116103fc57838683375f6020858301015251902092610d7c845f52606a60205265ffffffffffff60405f205460a01c16151590565b6110605782604d116103fc57602d8501356001600160a01b03811161100f576001600160a01b031693610dae85611873565b60405192604084019084821067ffffffffffffffff831117610ffb5760409182523385524365ffffffffffff1660208681019182525f868152606a82529384209651875492516001600160d01b03199093166001600160a01b03919091161760a09290921b65ffffffffffff60a01b1691909117909555879563ffffffff92918a91610ece91610ebb91610e4c8c610e468188611a4c565b96611a5e565b986040519b8c9a8b998a98167f0d381c2a574ae8f04e213db7cfb4df8df712cdbd427d9868ffef380660ca65748a80a47f1cae38cdd3d3919489272725a5ae62a4f48b2989b0dae843d3c279fee18073a98780a2637bf41d7760e11b85526040600486015260448501916114c6565b828103600319016024840152898c6114c6565b03926001600160a01b03165af1908115610f71575f91610fc0575b5015610f7c57610ef98184611a4c565b91610f048285611a5e565b91813b156103fc575f93610f4f63ffffffff92604051978896879586956356d5d47560e01b8752166004860152602485015260606044850152604d6064850192604c190191016114c6565b039134905af18015610f7157610f63575080f35b610f6f91505f90611424565b005b6040513d5f823e3d90fd5b606460405162461bcd60e51b815260206004820152602060248201527f4d61696c626f783a2049534d20766572696669636174696f6e206661696c65646044820152fd5b90506020813d602011610ff3575b81610fdb60209383611424565b810103126103fc575180151581036103fc575f610ee9565b3d9150610fce565b634e487b7160e01b5f52604160045260245ffd5b60405162461bcd60e51b8152602060048201526024808201527f5479706543617374733a2062797465733332546f41646472657373206f766572604482015263666c6f7760e01b6064820152608490fd5b60405162461bcd60e51b815260206004820152601a60248201527f4d61696c626f783a20616c72656164792064656c6976657265640000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601f60248201527f4d61696c626f783a20756e65787065637465642064657374696e6174696f6e006044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527326b0b4b63137bc1d103130b2103b32b939b4b7b760611b6044820152606490fd5b346103fc575f3660031901126103fc5761113e6119ac565b603380546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346103fc575f3660031901126103fc576067546040516001600160a01b039091168152602090f35b346103fc5760203660031901126103fc576004355f52606a602052602060018060a01b0360405f205416604051908152f35b602061080c6111e9366113bd565b6068546001600160a01b03169590949193919061150f565b346103fc575f3660031901126103fc576068546040516001600160a01b039091168152602090f35b346103fc5760203660031901126103fc576112426113a7565b61124a6119ac565b803b1561065b57606980546001600160a01b0319166001600160a01b039290921691821790557f329ec8e2438a73828ecf31a6568d7a91d7b1d79e342b0692914fd053d1a002b15f80a2005b346103fc575f3660031901126103fc576020606654604051908152f35b602061080c6112c13661132c565b9594909493919361150f565b346103fc5760203660031901126103fc576020906004355f52606a825265ffffffffffff60405f205460a01c168152f35b9181601f840112156103fc5782359167ffffffffffffffff83116103fc57602083818601950101116103fc57565b60a06003198201126103fc5760043563ffffffff811681036103fc57916024359160443567ffffffffffffffff81116103fc578161136c916004016112fe565b929092916064359067ffffffffffffffff82116103fc5761138f916004016112fe565b90916084356001600160a01b03811681036103fc5790565b600435906001600160a01b03821682036103fc57565b60806003198201126103fc5760043563ffffffff811681036103fc57916024359160443567ffffffffffffffff81116103fc57816113fd916004016112fe565b929092916064359067ffffffffffffffff82116103fc57611420916004016112fe565b9091565b90601f8019910116810190811067ffffffffffffffff821117610ffb57604052565b67ffffffffffffffff8111610ffb57601f01601f191660200190565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b60606003198201126103fc5760043563ffffffff811681036103fc5791602435916044359067ffffffffffffffff82116103fc57611420916004016112fe565b908060209392818452848401375f828201840152601f01601f1916010190565b9161150c93916114fe916040855260408501916114c6565b916020818403910152611462565b90565b955f959194909391929091906001600160a01b03851615611727575b9061153791868961191d565b93845160208601209687606655606554600163ffffffff82160163ffffffff81116117135763ffffffff169063ffffffff19161760655563ffffffff604051916020835216907f769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c8143391806115ae602082018b611462565b0390a460405192867f788dbc1b7152732178210e7f4d9d010ef016f9eafbe66786bd7169f56e0c353a5f80a2606954630aaccd2360e41b85526001600160a01b031660208580611603898888600485016114e6565b0381845afa948515610f71575f956116df575b508434106116d7575b803b156103fc575f604051809263086011b960e01b82528188816116488c8b8b600485016114e6565b03925af18015610f71576116c2575b506001600160a01b031692349081039190821161038d57833b156103b65760405163086011b960e01b81529486948694909385939092849261169c92600485016114e6565b03925af180156103ba576116af57505090565b6116ba828092611424565b610162575090565b6116cf9196505f90611424565b5f945f611657565b34945061161f565b9094506020813d60201161170b575b816116fb60209383611424565b810103126103fc5751935f611616565b3d91506116ee565b634e487b7160e01b5f52601160045260245ffd5b6068546001600160a01b0316945061152b565b95949291906001600160a01b03861615611860575b61175b9394959661191d565b606954604051630aaccd2360e41b8152939192919060209085906001600160a01b0316818061178f888888600485016114e6565b03915afa938415610f71575f94611823575b5093602092916117c9949560405195869485938493630aaccd2360e41b8552600485016114e6565b03916001600160a01b03165afa908115610f71575f916117f1575b5081018091116117135790565b90506020813d60201161181b575b8161180c60209383611424565b810103126103fc57515f6117e4565b3d91506117ff565b92919350936020833d602011611858575b8161184160209383611424565b810103126103fc57915191939192909160206117a1565b3d9150611834565b6068546001600160a01b0316955061174f565b5f8091604051602081019063de523cf360e01b825260048152611897602482611424565b51915afa3d15611915573d906118ac82611446565b916118ba6040519384611424565b82523d5f602084013e5b8061190b575b6118df575b506067546001600160a01b031690565b6020818051810103126103fc57602001516001600160a01b038116908190036103fc5780156118cf5790565b50805115156118ca565b6060906118c4565b606554604051600360f81b60208201526001600160e01b031960e092831b811660218301527f0000000000000000000000000000000000000000000000000000000000000000831b811660258301523360298301529290911b9091166049820152604d8101919091529161150c91606d91849181908484013781015f838201520301601f198101835282611424565b6033546001600160a01b031633036119c057565b606460405162461bcd60e51b815260206004820152602060248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152fd5b603380546001600160a01b039283166001600160a01b0319821681179092559091167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3565b906009116103fc576005013560e01c90565b906029116103fc576009013590565b15611a7457565b60405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b6064820152608490fdfea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f905f3560e01c90816307a2fda1146112cd5750806310b83dc0146112b3578063134fbb4f146112965780631426b7f4146112295780633d1250b71461120157806348aee8d4146111db5780635d1fe5a9146111a95780636e5f516e14611181578063715018a6146111265780637c39d13014610c8557806381d2ea9514610c6557806382ea7bfe14610c2a5780638d3638f414610be95780638da5cb5b14610bc057806393c4484714610b7257806399b0480914610b035780639c42bd1814610983578063affed0e01461095f578063d6d08a0914610936578063e495f1d4146108f6578063e70f48ac146108c0578063f2fde38b14610883578063f794687a14610814578063f7ccd321146107e0578063f8c8765e1461042f578063fa31de01146101655763ffa1ad7414610147575f80fd5b34610162578060031936011261016257602060405160038152f35b80fd5b5061016f36611486565b6068549192916001600160a01b031690811561041c575b6101929084848761191d565b91825160208401209485606655606554600163ffffffff82160163ffffffff81116104085763ffffffff169063ffffffff19161760655563ffffffff604051916020835216907f769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c8143391806102096020820189611462565b0390a460405190847f788dbc1b7152732178210e7f4d9d010ef016f9eafbe66786bd7169f56e0c353a8780a2606954630aaccd2360e41b83526040600484015286906001600160a01b03166020848061027b61026960448301878c6114c6565b82810360031901602484015289611462565b0381845afa9384156103ba5782946103cd575b508334106103c5575b803b1561037a5781604051809263086011b960e01b8252604060048301528187816102dc6102ca8d8860448501916114c6565b8281036003190160248401528c611462565b03925af180156103ba576103a1575b505060018060a01b03169034039234841161038d5790859291813b156103895761034b94610339916040519687958694859363086011b960e01b8552604060048601528960448601916114c6565b83810360031901602485015290611462565b03925af1801561037e57610365575b602082604051908152f35b610370838092611424565b61037a578161035a565b5080fd5b6040513d85823e3d90fd5b8380fd5b634e487b7160e01b86526011600452602486fd5b816103ab91611424565b6103b657855f6102eb565b8580fd5b6040513d84823e3d90fd5b349350610297565b915092506020813d602011610400575b816103ea60209383611424565b810103126103fc57869051925f61028e565b5f80fd5b3d91506103dd565b634e487b7160e01b89526011600452602489fd5b6068546001600160a01b03169150610186565b5034610162576080366003190112610162576104496113a7565b602435906001600160a01b038216808303610389576044356001600160a01b0381168082036103b6576064356001600160a01b038116939092908484036107dc5787549660ff8860081c1615978880996107cf575b80156107b8575b1561075c5760ff1981166001178a558861074b575b506104d460ff8a5460081c166104cf81611a6d565b611a6d565b6104dd33611a04565b6104e56119ac565b3b156106fc57606780546001600160a01b031916821790557fa76ad0adbf45318f8633aa0210f711273d50fbb6fef76ed95bbae97082c75daa8880a26105296119ac565b3b156106ac57606880546001600160a01b031916821790557f65a63e5066ee2fcdf9d32a7f1bf7ce71c76066f19d0609dddccd334ab87237d78680a261056d6119ac565b3b1561065b57606980546001600160a01b031916821790557f329ec8e2438a73828ecf31a6568d7a91d7b1d79e342b0692914fd053d1a002b18480a26105b16119ac565b6001600160a01b03811615610607576105c990611a04565b6105d05780f35b61ff001981541681557f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498602060405160018152a180f35b60405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608490fd5b60405162461bcd60e51b815260206004820152602360248201527f4d61696c626f783a20726571756972656420686f6f6b206e6f7420636f6e74726044820152621858dd60ea1b6064820152608490fd5b60405162461bcd60e51b815260206004820152602260248201527f4d61696c626f783a2064656661756c7420686f6f6b206e6f7420636f6e74726160448201526118dd60f21b6064820152608490fd5b60405162461bcd60e51b815260206004820152602160248201527f4d61696c626f783a2064656661756c742049534d206e6f7420636f6e747261636044820152601d60fa1b6064820152608490fd5b61ffff19166101011789555f6104ba565b60405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608490fd5b50303b1580156104a55750600160ff8216146104a5565b50600160ff82161061049e565b8780fd5b503461016257602061080c6107f4366113bd565b6068546001600160a01b03169590949193919061173a565b604051908152f35b50346101625760203660031901126101625761082e6113a7565b6108366119ac565b803b156106fc57606780546001600160a01b0319166001600160a01b039290921691821790557fa76ad0adbf45318f8633aa0210f711273d50fbb6fef76ed95bbae97082c75daa8280a280f35b50346101625760203660031901126101625761089d6113a7565b6108a56119ac565b6001600160a01b03811615610607576108bd90611a04565b80f35b50346101625760203660031901126101625760206108e46108df6113a7565b611873565b6040516001600160a01b039091168152f35b503461016257602036600319011261016257602061092c6004355f52606a60205265ffffffffffff60405f205460a01c16151590565b6040519015158152f35b50346101625780600319360112610162576069546040516001600160a01b039091168152602090f35b5034610162578060031936011261016257602063ffffffff60655416604051908152f35b50346101625761099236611486565b606854919493926001600160a01b039092169185908315610af0575b6109b8939461191d565b9060018060a01b03606954169360206040518096630aaccd2360e41b82526040600483015281806109f0610269604483018b896114c6565b03915afa948515610ae5578495610aaa575b5091602091610339610a349460405195869485938493630aaccd2360e41b8552604060048601528a60448601916114c6565b03916001600160a01b03165afa9081156103ba578291610a78575b508201809211610a6457602082604051908152f35b634e487b7160e01b81526011600452602490fd5b90506020813d602011610aa2575b81610a9360209383611424565b810103126103fc57515f610a4f565b3d9150610a86565b91929094506020823d602011610add575b81610ac860209383611424565b810103126103fc579051939091906020610a02565b3d9150610abb565b6040513d86823e3d90fd5b6068546001600160a01b031693506109ae565b503461016257602036600319011261016257610b1d6113a7565b610b256119ac565b803b156106ac57606880546001600160a01b0319166001600160a01b039290921691821790557f65a63e5066ee2fcdf9d32a7f1bf7ce71c76066f19d0609dddccd334ab87237d78280a280f35b503461016257806003193601126101625750610bbc604051610b95604082611424565b60068152650d4b8c4c4b8d60d21b6020820152604051918291602083526020830190611462565b0390f35b50346101625780600319360112610162576033546040516001600160a01b039091168152602090f35b5034610162578060031936011261016257602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b503461016257806003193601126101625760206040517f00000000000000000000000000000000000000000000000000000000000000008152f35b503461016257602061080c610c793661132c565b9594909493919361173a565b5060403660031901126103fc5760043567ffffffffffffffff81116103fc57610cb29036906004016112fe565b9060243567ffffffffffffffff81116103fc57610cd39036906004016112fe565b9092816001116103fc576003843560f81c036110ea5781602d116103fc577f000000000000000000000000000000000000000000000000000000000000000063ffffffff16602985013560e01c036110a557610d2e82611446565b610d3b6040519182611424565b828152602081019036848701116103fc57838683375f6020858301015251902092610d7c845f52606a60205265ffffffffffff60405f205460a01c16151590565b6110605782604d116103fc57602d8501356001600160a01b03811161100f576001600160a01b031693610dae85611873565b60405192604084019084821067ffffffffffffffff831117610ffb5760409182523385524365ffffffffffff1660208681019182525f868152606a82529384209651875492516001600160d01b03199093166001600160a01b03919091161760a09290921b65ffffffffffff60a01b1691909117909555879563ffffffff92918a91610ece91610ebb91610e4c8c610e468188611a4c565b96611a5e565b986040519b8c9a8b998a98167f0d381c2a574ae8f04e213db7cfb4df8df712cdbd427d9868ffef380660ca65748a80a47f1cae38cdd3d3919489272725a5ae62a4f48b2989b0dae843d3c279fee18073a98780a2637bf41d7760e11b85526040600486015260448501916114c6565b828103600319016024840152898c6114c6565b03926001600160a01b03165af1908115610f71575f91610fc0575b5015610f7c57610ef98184611a4c565b91610f048285611a5e565b91813b156103fc575f93610f4f63ffffffff92604051978896879586956356d5d47560e01b8752166004860152602485015260606044850152604d6064850192604c190191016114c6565b039134905af18015610f7157610f63575080f35b610f6f91505f90611424565b005b6040513d5f823e3d90fd5b606460405162461bcd60e51b815260206004820152602060248201527f4d61696c626f783a2049534d20766572696669636174696f6e206661696c65646044820152fd5b90506020813d602011610ff3575b81610fdb60209383611424565b810103126103fc575180151581036103fc575f610ee9565b3d9150610fce565b634e487b7160e01b5f52604160045260245ffd5b60405162461bcd60e51b8152602060048201526024808201527f5479706543617374733a2062797465733332546f41646472657373206f766572604482015263666c6f7760e01b6064820152608490fd5b60405162461bcd60e51b815260206004820152601a60248201527f4d61696c626f783a20616c72656164792064656c6976657265640000000000006044820152606490fd5b60405162461bcd60e51b815260206004820152601f60248201527f4d61696c626f783a20756e65787065637465642064657374696e6174696f6e006044820152606490fd5b60405162461bcd60e51b815260206004820152601460248201527326b0b4b63137bc1d103130b2103b32b939b4b7b760611b6044820152606490fd5b346103fc575f3660031901126103fc5761113e6119ac565b603380546001600160a01b031981169091555f906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b346103fc575f3660031901126103fc576067546040516001600160a01b039091168152602090f35b346103fc5760203660031901126103fc576004355f52606a602052602060018060a01b0360405f205416604051908152f35b602061080c6111e9366113bd565b6068546001600160a01b03169590949193919061150f565b346103fc575f3660031901126103fc576068546040516001600160a01b039091168152602090f35b346103fc5760203660031901126103fc576112426113a7565b61124a6119ac565b803b1561065b57606980546001600160a01b0319166001600160a01b039290921691821790557f329ec8e2438a73828ecf31a6568d7a91d7b1d79e342b0692914fd053d1a002b15f80a2005b346103fc575f3660031901126103fc576020606654604051908152f35b602061080c6112c13661132c565b9594909493919361150f565b346103fc5760203660031901126103fc576020906004355f52606a825265ffffffffffff60405f205460a01c168152f35b9181601f840112156103fc5782359167ffffffffffffffff83116103fc57602083818601950101116103fc57565b60a06003198201126103fc5760043563ffffffff811681036103fc57916024359160443567ffffffffffffffff81116103fc578161136c916004016112fe565b929092916064359067ffffffffffffffff82116103fc5761138f916004016112fe565b90916084356001600160a01b03811681036103fc5790565b600435906001600160a01b03821682036103fc57565b60806003198201126103fc5760043563ffffffff811681036103fc57916024359160443567ffffffffffffffff81116103fc57816113fd916004016112fe565b929092916064359067ffffffffffffffff82116103fc57611420916004016112fe565b9091565b90601f8019910116810190811067ffffffffffffffff821117610ffb57604052565b67ffffffffffffffff8111610ffb57601f01601f191660200190565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b60606003198201126103fc5760043563ffffffff811681036103fc5791602435916044359067ffffffffffffffff82116103fc57611420916004016112fe565b908060209392818452848401375f828201840152601f01601f1916010190565b9161150c93916114fe916040855260408501916114c6565b916020818403910152611462565b90565b955f959194909391929091906001600160a01b03851615611727575b9061153791868961191d565b93845160208601209687606655606554600163ffffffff82160163ffffffff81116117135763ffffffff169063ffffffff19161760655563ffffffff604051916020835216907f769f711d20c679153d382254f59892613b58a97cc876b249134ac25c80f9c8143391806115ae602082018b611462565b0390a460405192867f788dbc1b7152732178210e7f4d9d010ef016f9eafbe66786bd7169f56e0c353a5f80a2606954630aaccd2360e41b85526001600160a01b031660208580611603898888600485016114e6565b0381845afa948515610f71575f956116df575b508434106116d7575b803b156103fc575f604051809263086011b960e01b82528188816116488c8b8b600485016114e6565b03925af18015610f71576116c2575b506001600160a01b031692349081039190821161038d57833b156103b65760405163086011b960e01b81529486948694909385939092849261169c92600485016114e6565b03925af180156103ba576116af57505090565b6116ba828092611424565b610162575090565b6116cf9196505f90611424565b5f945f611657565b34945061161f565b9094506020813d60201161170b575b816116fb60209383611424565b810103126103fc5751935f611616565b3d91506116ee565b634e487b7160e01b5f52601160045260245ffd5b6068546001600160a01b0316945061152b565b95949291906001600160a01b03861615611860575b61175b9394959661191d565b606954604051630aaccd2360e41b8152939192919060209085906001600160a01b0316818061178f888888600485016114e6565b03915afa938415610f71575f94611823575b5093602092916117c9949560405195869485938493630aaccd2360e41b8552600485016114e6565b03916001600160a01b03165afa908115610f71575f916117f1575b5081018091116117135790565b90506020813d60201161181b575b8161180c60209383611424565b810103126103fc57515f6117e4565b3d91506117ff565b92919350936020833d602011611858575b8161184160209383611424565b810103126103fc57915191939192909160206117a1565b3d9150611834565b6068546001600160a01b0316955061174f565b5f8091604051602081019063de523cf360e01b825260048152611897602482611424565b51915afa3d15611915573d906118ac82611446565b916118ba6040519384611424565b82523d5f602084013e5b8061190b575b6118df575b506067546001600160a01b031690565b6020818051810103126103fc57602001516001600160a01b038116908190036103fc5780156118cf5790565b50805115156118ca565b6060906118c4565b606554604051600360f81b60208201526001600160e01b031960e092831b811660218301527f0000000000000000000000000000000000000000000000000000000000000000831b811660258301523360298301529290911b9091166049820152604d8101919091529161150c91606d91849181908484013781015f838201520301601f198101835282611424565b6033546001600160a01b031633036119c057565b606460405162461bcd60e51b815260206004820152602060248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152fd5b603380546001600160a01b039283166001600160a01b0319821681179092559091167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e05f80a3565b906009116103fc576005013560e01c90565b906029116103fc576009013590565b15611a7457565b60405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b6064820152608490fdfea164736f6c634300081a000a" as Hex;
export const Mailbox = {
    abi,
    bytecode,
    deployedBytecode,
};
