import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "_name", type: "string", internalType: "string" },
        { name: "_symbol", type: "string", internalType: "string" },
        { name: "_decimals", type: "uint8", internalType: "uint8" },
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
export const symbol = {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
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
export const functions = [
    _constructor,
    DOMAIN_SEPARATOR,
    allowance,
    approve,
    balanceOf,
    burn,
    decimals,
    mint,
    name,
    nonces,
    permit,
    symbol,
    totalSupply,
    transfer,
    transferFrom,
] as const;
export const events = [Approval, Transfer] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60e0806040523461040657610f8b803803809161001c828561040a565b83398101906060818303126104065780516001600160401b038111610406578261004791830161042d565b60208201519092906001600160401b0381116104065760409161006b91840161042d565b91015160ff811681036104065782516001600160401b038111610337576100925f54610482565b601f81116103b7575b506020601f821160011461035657819293945f9261034b575b50508160011b915f199060031b1c1916175f555b81516001600160401b038111610337576100e3600154610482565b601f81116102d4575b50602092601f821160011461027357928192935f92610268575b50508160011b915f199060031b1c1916176001555b6080524660a0526040515f905f54918161013484610482565b9182825260208201946001811690815f1461024c5750600114610202575b61015e9250038261040a565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a081526101d260c08261040a565b51902060c052604051610ab090816104bb8239608051816105e3015260a051816108e3015260c051816109090152f35b505f80805290915f80516020610f6b8339815191525b81831061023057505090602061015e92820101610152565b6020919350806001915483858801015201910190918392610218565b60ff191686525061015e92151560051b82016020019050610152565b015190505f80610106565b601f1982169360015f52805f20915f5b8681106102bc57508360019596106102a4575b505050811b0160015561011b565b01515f1960f88460031b161c191690555f8080610296565b91926020600181928685015181550194019201610283565b60015f527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6601f830160051c8101916020841061032d575b601f0160051c01905b81811061032257506100ec565b5f8155600101610315565b909150819061030c565b634e487b7160e01b5f52604160045260245ffd5b015190505f806100b4565b601f198216905f8052805f20915f5b81811061039f57509583600195969710610387575b505050811b015f556100c8565b01515f1960f88460031b161c191690555f808061037a565b9192602060018192868b015181550194019201610365565b5f80525f80516020610f6b833981519152601f830160051c810191602084106103fc575b601f0160051c01905b8181106103f1575061009b565b5f81556001016103e4565b90915081906103db565b5f80fd5b601f909101601f19168101906001600160401b0382119082101761033757604052565b81601f82011215610406578051906001600160401b0382116103375760405192610461601f8401601f19166020018561040a565b8284526020838301011161040657815f9260208093018386015e8301015290565b90600182811c921680156104b0575b602083101461049c57565b634e487b7160e01b5f52602260045260245ffd5b91607f169161049156fe60806040526004361015610011575f80fd5b5f3560e01c806306fdde031461076d578063095ea7b3146106f457806318160ddd146106d757806323b872dd14610607578063313ce567146105ca5780633644e515146105a857806340c10f191461053057806370a08231146104f85780637ecebe00146104c057806395d89b41146103e65780639dc29fac14610386578063a9059cbb14610311578063d505accf146101075763dd62ed3e146100b3575f80fd5b34610103576040366003190112610103576100cc6108a7565b6100d46108bd565b6001600160a01b039182165f908152600460209081526040808320949093168252928352819020549051908152f35b5f80fd5b346101035760e0366003190112610103576101206108a7565b6101286108bd565b6044356064359260843560ff8116809103610103574285106102cc5760805f916020936101536108e0565b9060018060a01b03169687855260058652604085209889549960018b01905560405190878201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c984528a604084015260018060a01b03169a8b6060840152898784015260a083015260c082015260c081526101d060e082610847565b519020604051908682019261190160f01b845260228301526042820152604281526101fc606282610847565b519020906040519182528482015260a435604082015260c435606082015282805260015afa156102c1575f516001600160a01b0316801515806102b8575b15610282577f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925916020915f526004825260405f20855f5282528060405f2055604051908152a3005b60405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b6044820152606490fd5b5082811461023a565b6040513d5f823e3d90fd5b60405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152606490fd5b346101035760403660031901126101035761032a6108a7565b60243590335f52600360205260405f206103458382546108d3565b905560018060a01b031690815f52600360205260405f208181540190556040519081525f80516020610a5b83398151915260203392a3602060405160018152f35b34610103576040366003190112610103575f6103a06108a7565b5f80516020610a5b83398151915260206024359260018060a01b03169283855260038252604085206103d38282546108d3565b90558060025403600255604051908152a3005b34610103575f366003190112610103576040515f6001546104068161080f565b808452906001811690811561049c575060011461043e575b61043a8361042e81850382610847565b6040519182918261087d565b0390f35b60015f9081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6939250905b8082106104825750909150810160200161042e61041e565b91926001816020925483858801015201910190929161046a565b60ff191660208086019190915291151560051b8401909101915061042e905061041e565b34610103576020366003190112610103576001600160a01b036104e16108a7565b165f526005602052602060405f2054604051908152f35b34610103576020366003190112610103576001600160a01b036105196108a7565b165f526003602052602060405f2054604051908152f35b34610103576040366003190112610103576105496108a7565b60243590600254908282018092116105945760205f80516020610a5b833981519152915f9360025560018060a01b0316938484526003825260408420818154019055604051908152a3005b634e487b7160e01b5f52601160045260245ffd5b34610103575f3660031901126101035760206105c26108e0565b604051908152f35b34610103575f36600319011261010357602060405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b34610103576060366003190112610103576106206108a7565b6106286108bd565b6001600160a01b039091165f818152600460209081526040808320338452825290912054604435935f80516020610a5b833981519152929185600182016106b2575b5050835f526003825260405f206106828682546108d3565b90556001600160a01b03165f818152600383526040908190208054870190555194855293a3602060405160018152f35b6106bb916108d3565b5f8581526004845260408082203383528552902055858561066a565b34610103575f366003190112610103576020600254604051908152f35b346101035760403660031901126101035761070d6108a7565b335f8181526004602090815260408083206001600160a01b03909516808452948252918290206024359081905591519182527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a3602060405160018152f35b34610103575f366003190112610103576040515f805461078c8161080f565b808452906001811690811561049c57506001146107b35761043a8361042e81850382610847565b5f8080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563939250905b8082106107f55750909150810160200161042e61041e565b9192600181602092548385880101520191019092916107dd565b90600182811c9216801561083d575b602083101461082957565b634e487b7160e01b5f52602260045260245ffd5b91607f169161081e565b90601f8019910116810190811067ffffffffffffffff82111761086957604052565b634e487b7160e01b5f52604160045260245ffd5b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361010357565b602435906001600160a01b038216820361010357565b9190820391821161059457565b467f00000000000000000000000000000000000000000000000000000000000000000361092b577f000000000000000000000000000000000000000000000000000000000000000090565b6040515f905f54918161093d8461080f565b9182825260208201946001811690815f14610a3e57506001146109e1575b61096792500382610847565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a081526109db60c082610847565b51902090565b505f80805290917f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818310610a225750509060206109679282010161095b565b6020919350806001915483858801015201910190918392610a0a565b60ff191686525061096792151560051b8201602001905061095b56feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa26469706673582212209175b000d9a45fc8a8b545f19ece6a224eab493a4f24918e4ec993aaa2b20aec64736f6c634300081a0033290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563" as Hex;
export const deployedBytecode =
    "0x60806040526004361015610011575f80fd5b5f3560e01c806306fdde031461076d578063095ea7b3146106f457806318160ddd146106d757806323b872dd14610607578063313ce567146105ca5780633644e515146105a857806340c10f191461053057806370a08231146104f85780637ecebe00146104c057806395d89b41146103e65780639dc29fac14610386578063a9059cbb14610311578063d505accf146101075763dd62ed3e146100b3575f80fd5b34610103576040366003190112610103576100cc6108a7565b6100d46108bd565b6001600160a01b039182165f908152600460209081526040808320949093168252928352819020549051908152f35b5f80fd5b346101035760e0366003190112610103576101206108a7565b6101286108bd565b6044356064359260843560ff8116809103610103574285106102cc5760805f916020936101536108e0565b9060018060a01b03169687855260058652604085209889549960018b01905560405190878201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c984528a604084015260018060a01b03169a8b6060840152898784015260a083015260c082015260c081526101d060e082610847565b519020604051908682019261190160f01b845260228301526042820152604281526101fc606282610847565b519020906040519182528482015260a435604082015260c435606082015282805260015afa156102c1575f516001600160a01b0316801515806102b8575b15610282577f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925916020915f526004825260405f20855f5282528060405f2055604051908152a3005b60405162461bcd60e51b815260206004820152600e60248201526d24a72b20a624a22fa9a4a3a722a960911b6044820152606490fd5b5082811461023a565b6040513d5f823e3d90fd5b60405162461bcd60e51b815260206004820152601760248201527f5045524d49545f444541444c494e455f455850495245440000000000000000006044820152606490fd5b346101035760403660031901126101035761032a6108a7565b60243590335f52600360205260405f206103458382546108d3565b905560018060a01b031690815f52600360205260405f208181540190556040519081525f80516020610a5b83398151915260203392a3602060405160018152f35b34610103576040366003190112610103575f6103a06108a7565b5f80516020610a5b83398151915260206024359260018060a01b03169283855260038252604085206103d38282546108d3565b90558060025403600255604051908152a3005b34610103575f366003190112610103576040515f6001546104068161080f565b808452906001811690811561049c575060011461043e575b61043a8361042e81850382610847565b6040519182918261087d565b0390f35b60015f9081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6939250905b8082106104825750909150810160200161042e61041e565b91926001816020925483858801015201910190929161046a565b60ff191660208086019190915291151560051b8401909101915061042e905061041e565b34610103576020366003190112610103576001600160a01b036104e16108a7565b165f526005602052602060405f2054604051908152f35b34610103576020366003190112610103576001600160a01b036105196108a7565b165f526003602052602060405f2054604051908152f35b34610103576040366003190112610103576105496108a7565b60243590600254908282018092116105945760205f80516020610a5b833981519152915f9360025560018060a01b0316938484526003825260408420818154019055604051908152a3005b634e487b7160e01b5f52601160045260245ffd5b34610103575f3660031901126101035760206105c26108e0565b604051908152f35b34610103575f36600319011261010357602060405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b34610103576060366003190112610103576106206108a7565b6106286108bd565b6001600160a01b039091165f818152600460209081526040808320338452825290912054604435935f80516020610a5b833981519152929185600182016106b2575b5050835f526003825260405f206106828682546108d3565b90556001600160a01b03165f818152600383526040908190208054870190555194855293a3602060405160018152f35b6106bb916108d3565b5f8581526004845260408082203383528552902055858561066a565b34610103575f366003190112610103576020600254604051908152f35b346101035760403660031901126101035761070d6108a7565b335f8181526004602090815260408083206001600160a01b03909516808452948252918290206024359081905591519182527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591a3602060405160018152f35b34610103575f366003190112610103576040515f805461078c8161080f565b808452906001811690811561049c57506001146107b35761043a8361042e81850382610847565b5f8080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563939250905b8082106107f55750909150810160200161042e61041e565b9192600181602092548385880101520191019092916107dd565b90600182811c9216801561083d575b602083101461082957565b634e487b7160e01b5f52602260045260245ffd5b91607f169161081e565b90601f8019910116810190811067ffffffffffffffff82111761086957604052565b634e487b7160e01b5f52604160045260245ffd5b602060409281835280519182918282860152018484015e5f828201840152601f01601f1916010190565b600435906001600160a01b038216820361010357565b602435906001600160a01b038216820361010357565b9190820391821161059457565b467f00000000000000000000000000000000000000000000000000000000000000000361092b577f000000000000000000000000000000000000000000000000000000000000000090565b6040515f905f54918161093d8461080f565b9182825260208201946001811690815f14610a3e57506001146109e1575b61096792500382610847565b51902060405160208101917f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f835260408201527fc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc660608201524660808201523060a082015260a081526109db60c082610847565b51902090565b505f80805290917f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e5635b818310610a225750509060206109679282010161095b565b6020919350806001915483858801015201910190918392610a0a565b60ff191686525061096792151560051b8201602001905061095b56feddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3efa26469706673582212209175b000d9a45fc8a8b545f19ece6a224eab493a4f24918e4ec993aaa2b20aec64736f6c634300081a0033" as Hex;
export const MockERC20 = {
    abi,
    bytecode,
    deployedBytecode,
};
