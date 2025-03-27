import { Hex } from "viem";

export const _constructor = {
    type: "constructor",
    inputs: [
        { name: "_mailbox", type: "address", internalType: "address" },
        { name: "_ism", type: "address", internalType: "address" },
        { name: "_executor", type: "address", internalType: "address" },
        { name: "_factory", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
} as const;
export const callRemote = {
    type: "function",
    name: "callRemote",
    inputs: [
        { name: "destination", type: "uint32", internalType: "uint32" },
        { name: "router", type: "address", internalType: "address" },
        { name: "account", type: "address", internalType: "address" },
        { name: "initData", type: "bytes", internalType: "bytes" },
        { name: "initSalt", type: "bytes32", internalType: "bytes32" },
        { name: "executionMode", type: "uint8", internalType: "enum ERC7579ExecutorMessage.ExecutionMode" },
        { name: "callData", type: "bytes", internalType: "bytes" },
        { name: "nonce", type: "uint256", internalType: "uint256" },
        { name: "validAfter", type: "uint48", internalType: "uint48" },
        { name: "validUntil", type: "uint48", internalType: "uint48" },
        { name: "signature", type: "bytes", internalType: "bytes" },
        { name: "hookMetadata", type: "bytes", internalType: "bytes" },
        { name: "hook", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "payable",
} as const;
export const handle = {
    type: "function",
    name: "handle",
    inputs: [
        { name: "origin", type: "uint32", internalType: "uint32" },
        { name: "sender", type: "bytes32", internalType: "bytes32" },
        { name: "message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
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
export const owners = {
    type: "function",
    name: "owners",
    inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "domain", type: "uint32", internalType: "uint32" },
        { name: "router", type: "address", internalType: "address" },
        { name: "owner", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
} as const;
export const setAccountOwners = {
    type: "function",
    name: "setAccountOwners",
    inputs: [
        {
            name: "_owners",
            type: "tuple[]",
            internalType: "struct ERC7579ExecutorRouter.RemoteRouterOwner[]",
            components: [
                { name: "domain", type: "uint32", internalType: "uint32" },
                { name: "router", type: "address", internalType: "address" },
                { name: "owner", type: "address", internalType: "address" },
                { name: "enabled", type: "bool", internalType: "bool" },
            ],
        },
    ],
    outputs: [],
    stateMutability: "nonpayable",
} as const;
export const AccountCreated = {
    type: "event",
    name: "AccountCreated",
    inputs: [{ name: "account", type: "address", indexed: true, internalType: "address" }],
    anonymous: false,
} as const;
export const AccountRemoteRouterOwnerSet = {
    type: "event",
    name: "AccountRemoteRouterOwnerSet",
    inputs: [
        { name: "account", type: "address", indexed: true, internalType: "address" },
        { name: "domain", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "router", type: "address", indexed: false, internalType: "address" },
        { name: "owner", type: "address", indexed: false, internalType: "address" },
        { name: "enabled", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
} as const;
export const RemoteCallDispatched = {
    type: "event",
    name: "RemoteCallDispatched",
    inputs: [
        { name: "destination", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "router", type: "address", indexed: true, internalType: "address" },
        { name: "account", type: "address", indexed: true, internalType: "address" },
        {
            name: "executionMode",
            type: "uint8",
            indexed: false,
            internalType: "enum ERC7579ExecutorMessage.ExecutionMode",
        },
        { name: "messageId", type: "bytes32", indexed: false, internalType: "bytes32" },
    ],
    anonymous: false,
} as const;
export const RemoteCallProcessed = {
    type: "event",
    name: "RemoteCallProcessed",
    inputs: [
        { name: "origin", type: "uint32", indexed: true, internalType: "uint32" },
        { name: "router", type: "address", indexed: true, internalType: "address" },
        { name: "account", type: "address", indexed: true, internalType: "address" },
        {
            name: "executionMode",
            type: "uint8",
            indexed: false,
            internalType: "enum ERC7579ExecutorMessage.ExecutionMode",
        },
    ],
    anonymous: false,
} as const;
export const AccountDeploymentFailed = {
    type: "error",
    name: "AccountDeploymentFailed",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
} as const;
export const InvalidExecutorMode = { type: "error", name: "InvalidExecutorMode", inputs: [] } as const;
export const InvalidRemoteRouterOwner = {
    type: "error",
    name: "InvalidRemoteRouterOwner",
    inputs: [
        { name: "account", type: "address", internalType: "address" },
        { name: "domain", type: "uint32", internalType: "uint32" },
        { name: "router", type: "address", internalType: "address" },
        { name: "owner", type: "address", internalType: "address" },
    ],
} as const;
export const functions = [
    _constructor,
    callRemote,
    handle,
    interchainSecurityModule,
    localDomain,
    mailbox,
    owners,
    setAccountOwners,
] as const;
export const events = [AccountCreated, AccountRemoteRouterOwnerSet, RemoteCallDispatched, RemoteCallProcessed] as const;
export const errors = [AccountDeploymentFailed, InvalidExecutorMode, InvalidRemoteRouterOwner] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x6101208060405234610158576080816111da8038038091610020828561020a565b8339810103126101585761003381610241565b9061004060208201610241565b610058606061005160408501610241565b9301610241565b92803b156101c557813b158015906101b4575b1561016f576001600160a01b0316608081905260405163234d8e3d60e21b815290602090829060049082905afa908115610164575f91610121575b5060a0526001600160a01b0390811660c05290811660e0521661010052604051610f849081610256823960805181818160c801528181610633015261078f015260a051816101be015260c051816080015260e0518181816108ec015281816109a001528181610a8b0152610aec01526101005181610c150152f35b90506020813d60201161015c575b8161013c6020938361020a565b81010312610158575163ffffffff81168103610158575f6100a6565b5f80fd5b3d915061012f565b6040513d5f823e3d90fd5b60405162461bcd60e51b815260206004820152601a60248201527f4d61696c626f78436c69656e743a20696e76616c69642069736d0000000000006044820152606490fd5b506001600160a01b0382161561006b565b60405162461bcd60e51b815260206004820152601e60248201527f4d61696c626f78436c69656e743a20696e76616c6964206d61696c626f7800006044820152606490fd5b601f909101601f19168101906001600160401b0382119082101761022d57604052565b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036101585756fe6080806040526004361015610012575f80fd5b5f905f3560e01c90816356d5d47514610735575080636b318edb1461043d5780636cc56dd2146101e25780638d3638f4146101a1578063a9ba883f146100f7578063d5438eae146100b25763de523cf31461006b575f80fd5b346100af57806003193601126100af576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b80fd5b50346100af57806003193601126100af576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346100af5760803660031901126100af576004356001600160a01b03811691908290036100af5760243563ffffffff8116810361019d57610137610d86565b606435939092906001600160a01b038516850361019d578160409163ffffffff9352806020522091165f5260205260405f209060018060a01b03165f5260205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b5080fd5b50346100af57806003193601126100af57602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b50346100af5760203660031901126100af576004356001600160401b03811161019d573660238201121561019d5780600401356001600160401b038111610429576040519161023760208360051b0184610db0565b8183526024602084019260071b8201019036821161042557602401915b81831061038e57505050815b815181101561038a5780606061027860019385610f06565b5101511515338552846020526040852063ffffffff806102988588610f06565b515116165f5260205260405f20838060a01b0360206102b78588610f06565b51015116848060a01b03165f5260205260405f20838060a01b0360406102dd8588610f06565b51015116848060a01b03165f5260205260405f209060ff8019835416911617905563ffffffff61030d8285610f06565b515116828060a01b0360206103228487610f06565b51015116838060a01b0360406103388588610f06565b5101511660606103488588610f06565b510151151590604051928352602083015260408201527f175cd3003251d11cae2f62eb276150cdd7b63211224a369a1306e8ab4585ab2160603392a301610260565b8280f35b6080833603126104255760405190608082018281106001600160401b0382111761041157604052833563ffffffff8116810361040d5782526103d260208501610d9c565b60208301526103e360408501610d9c565b6040830152606084013590811515820361040d578260209260606080950152815201920191610254565b8680fd5b634e487b7160e01b87526041600452602487fd5b8480fd5b634e487b7160e01b83526041600452602483fd5b506101a03660031901126100af57610453610d73565b6024356001600160a01b03811692919083900361019d57610472610d86565b926064356001600160401b03811161073157610492903690600401610de5565b9160a4359460058610156104255760c4356001600160401b03811161072d576104bf903690600401610de5565b91610104359165ffffffffffff831680930361040d57610124359065ffffffffffff821680920361072957610144356001600160401b0381116107255761050a903690600401610de5565b610164356001600160401b0381116107215761052a903690600401610de5565b94610184356001600160a01b038116949085900361071d57604051978894336020870152600160a01b60019003169a8b6040870152606086016101409052610160860161057691610e4d565b608435608087015261058b60a087018f610ee5565b858103601f190160c08701526105a091610e4d565b9160e43560e0860152610100850152610120840152601f19838203016101408401526105cb91610e4d565b03601f19810185526105dd9085610db0565b6040519283926242e0f760e61b845263ffffffff16948560048501528660248501526044840160a0905260a4840161061491610e4d565b83810360031901606485015261062991610e4d565b60848301919091527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169183910381345a94602095f19485156107115780956106b7575b50507f0969334fc4129ebe97faf63bf18238d71e8426ce8639a2dd83707b518c2f55b960406020966106a982518092610ee5565b8688820152a4604051908152f35b909594506020863d602011610709575b816106d460209383610db0565b810103126100af5750935192937f0969334fc4129ebe97faf63bf18238d71e8426ce8639a2dd83707b518c2f55b96040610675565b3d91506106c7565b604051903d90823e3d90fd5b8a80fd5b8980fd5b8880fd5b8780fd5b8580fd5b8380fd5b90506060366003190112610b8b5761074b610d73565b60243591604435916001600160401b038311610b8b5736602384011215610b8b5782600401356001600160401b038111610b8b5783016024810192368411610b8b577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610d2757506101409084900312610b8b576107d660248401610d9c565b936107e360448501610d9c565b9260648501356001600160401b038111610b8b5781602461080692880101610de5565b9560a4860135946005861015610b8b5760c48701356001600160401b038111610b8b57836024610838928a0101610de5565b9160e488013561084b6101048a01610e3a565b926108596101248b01610e3a565b956101448b0135906001600160401b038211610b8b57602461087d928d0101610de5565b6001600160a01b039182169b90938216918811610cd65780516001600160a01b039098169a8d98610bce575b5050600489036108e1575b868b8b8b5f80516020610f2f833981519152602063ffffffff8e6108db6040518096610ee5565b1692a480f35b6002890361099557507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b1561040d576109408b91889660405198899788968796632fc1a95960e21b885260048801610e96565b039134905af1801561098a57610975575b5050602063ffffffff5f80516020610f2f833981519152925b9287925f80806108b4565b8161097f91610db0565b61042557845f610951565b6040513d84823e3d90fd5b60038903610a3757507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b1561040d576109f48b918896604051988997889687966307da8ad760e41b885260048801610e96565b039134905af1801561098a57610a22575b5050602063ffffffff5f80516020610f2f8339815191529261096a565b81610a2c91610db0565b61042557845f610a05565b5f8b81526020818152604080832063ffffffff8c16845282528083206001600160a01b038e811685529083528184209085168452909152902054949650945050505060ff1615610b9e5750859083610ae0577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b15610adc576109f4918391604051808095819463d26cdce360e01b83528c60048401610e71565b8280fd5b905060018303610b8f577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b15610b8b57610b3d915f91604051808095819463e508600360e01b83528b60048401610e71565b039134905af18015610b8057610b6a575b50602063ffffffff5f80516020610f2f8339815191529261096a565b610b779195505f90610db0565b5f936020610b4e565b6040513d5f823e3d90fd5b5f80fd5b63f483256360e01b5f5260045ffd5b856084918663ffffffff8660405194631c328bbf60e01b8652600486015216602484015260448301526064820152fd5b8c3b6108a95760849293949596979850602091610c08916040519485938493633a9b44eb60e21b8552604060048601526044850190610e4d565b910135602483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af18015610b8057610c98575b50893b15610c8557908a95949392918a7f805996f252884581e2f74cf3d2b03564d5ec26ccc90850ae12653dc1b72d1fa25f80a25f806108a9565b8963524c1bff60e01b5f5260045260245ffd5b6020813d602011610cce575b81610cb160209383610db0565b81010312610b8b57516001600160a01b0381168114610c4a575f80fd5b3d9150610ca4565b60405162461bcd60e51b8152602060048201526024808201527f5479706543617374733a2062797465733332546f41646472657373206f766572604482015263666c6f7760e01b6064820152608490fd5b62461bcd60e51b815260206004820152602160248201527f4d61696c626f78436c69656e743a2073656e646572206e6f74206d61696c626f6044820152600f60fb1b6064820152608490fd5b6004359063ffffffff82168203610b8b57565b604435906001600160a01b0382168203610b8b57565b35906001600160a01b0382168203610b8b57565b90601f801991011681019081106001600160401b03821117610dd157604052565b634e487b7160e01b5f52604160045260245ffd5b81601f82011215610b8b578035906001600160401b038211610dd15760405192610e19601f8401601f191660200185610db0565b82845260208383010111610b8b57815f926020809301838601378301015290565b359065ffffffffffff82168203610b8b57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6001600160a01b039091168152604060208201819052610e9392910190610e4d565b90565b94919365ffffffffffff610ed794610e939896829460018060a01b03168952602089015216604087015216606085015260c0608085015260c0840190610e4d565b9160a0818403910152610e4d565b906005821015610ef25752565b634e487b7160e01b5f52602160045260245ffd5b8051821015610f1a5760209160051b010190565b634e487b7160e01b5f52603260045260245ffdfe19d7eb397a52ea52b8d8d505a2ac7154e1c2a55490a036f4fa1c7adff728e7bea2646970667358221220427873c07b7b3726f3ea62c6856e9c60ee1f45aee1eb440f591130aa03d9aa2564736f6c634300081a0033" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f905f3560e01c90816356d5d47514610735575080636b318edb1461043d5780636cc56dd2146101e25780638d3638f4146101a1578063a9ba883f146100f7578063d5438eae146100b25763de523cf31461006b575f80fd5b346100af57806003193601126100af576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b80fd5b50346100af57806003193601126100af576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50346100af5760803660031901126100af576004356001600160a01b03811691908290036100af5760243563ffffffff8116810361019d57610137610d86565b606435939092906001600160a01b038516850361019d578160409163ffffffff9352806020522091165f5260205260405f209060018060a01b03165f5260205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b5080fd5b50346100af57806003193601126100af57602060405163ffffffff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b50346100af5760203660031901126100af576004356001600160401b03811161019d573660238201121561019d5780600401356001600160401b038111610429576040519161023760208360051b0184610db0565b8183526024602084019260071b8201019036821161042557602401915b81831061038e57505050815b815181101561038a5780606061027860019385610f06565b5101511515338552846020526040852063ffffffff806102988588610f06565b515116165f5260205260405f20838060a01b0360206102b78588610f06565b51015116848060a01b03165f5260205260405f20838060a01b0360406102dd8588610f06565b51015116848060a01b03165f5260205260405f209060ff8019835416911617905563ffffffff61030d8285610f06565b515116828060a01b0360206103228487610f06565b51015116838060a01b0360406103388588610f06565b5101511660606103488588610f06565b510151151590604051928352602083015260408201527f175cd3003251d11cae2f62eb276150cdd7b63211224a369a1306e8ab4585ab2160603392a301610260565b8280f35b6080833603126104255760405190608082018281106001600160401b0382111761041157604052833563ffffffff8116810361040d5782526103d260208501610d9c565b60208301526103e360408501610d9c565b6040830152606084013590811515820361040d578260209260606080950152815201920191610254565b8680fd5b634e487b7160e01b87526041600452602487fd5b8480fd5b634e487b7160e01b83526041600452602483fd5b506101a03660031901126100af57610453610d73565b6024356001600160a01b03811692919083900361019d57610472610d86565b926064356001600160401b03811161073157610492903690600401610de5565b9160a4359460058610156104255760c4356001600160401b03811161072d576104bf903690600401610de5565b91610104359165ffffffffffff831680930361040d57610124359065ffffffffffff821680920361072957610144356001600160401b0381116107255761050a903690600401610de5565b610164356001600160401b0381116107215761052a903690600401610de5565b94610184356001600160a01b038116949085900361071d57604051978894336020870152600160a01b60019003169a8b6040870152606086016101409052610160860161057691610e4d565b608435608087015261058b60a087018f610ee5565b858103601f190160c08701526105a091610e4d565b9160e43560e0860152610100850152610120840152601f19838203016101408401526105cb91610e4d565b03601f19810185526105dd9085610db0565b6040519283926242e0f760e61b845263ffffffff16948560048501528660248501526044840160a0905260a4840161061491610e4d565b83810360031901606485015261062991610e4d565b60848301919091527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169183910381345a94602095f19485156107115780956106b7575b50507f0969334fc4129ebe97faf63bf18238d71e8426ce8639a2dd83707b518c2f55b960406020966106a982518092610ee5565b8688820152a4604051908152f35b909594506020863d602011610709575b816106d460209383610db0565b810103126100af5750935192937f0969334fc4129ebe97faf63bf18238d71e8426ce8639a2dd83707b518c2f55b96040610675565b3d91506106c7565b604051903d90823e3d90fd5b8a80fd5b8980fd5b8880fd5b8780fd5b8580fd5b8380fd5b90506060366003190112610b8b5761074b610d73565b60243591604435916001600160401b038311610b8b5736602384011215610b8b5782600401356001600160401b038111610b8b5783016024810192368411610b8b577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03163303610d2757506101409084900312610b8b576107d660248401610d9c565b936107e360448501610d9c565b9260648501356001600160401b038111610b8b5781602461080692880101610de5565b9560a4860135946005861015610b8b5760c48701356001600160401b038111610b8b57836024610838928a0101610de5565b9160e488013561084b6101048a01610e3a565b926108596101248b01610e3a565b956101448b0135906001600160401b038211610b8b57602461087d928d0101610de5565b6001600160a01b039182169b90938216918811610cd65780516001600160a01b039098169a8d98610bce575b5050600489036108e1575b868b8b8b5f80516020610f2f833981519152602063ffffffff8e6108db6040518096610ee5565b1692a480f35b6002890361099557507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b1561040d576109408b91889660405198899788968796632fc1a95960e21b885260048801610e96565b039134905af1801561098a57610975575b5050602063ffffffff5f80516020610f2f833981519152925b9287925f80806108b4565b8161097f91610db0565b61042557845f610951565b6040513d84823e3d90fd5b60038903610a3757507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031691823b1561040d576109f48b918896604051988997889687966307da8ad760e41b885260048801610e96565b039134905af1801561098a57610a22575b5050602063ffffffff5f80516020610f2f8339815191529261096a565b81610a2c91610db0565b61042557845f610a05565b5f8b81526020818152604080832063ffffffff8c16845282528083206001600160a01b038e811685529083528184209085168452909152902054949650945050505060ff1615610b9e5750859083610ae0577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b15610adc576109f4918391604051808095819463d26cdce360e01b83528c60048401610e71565b8280fd5b905060018303610b8f577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316803b15610b8b57610b3d915f91604051808095819463e508600360e01b83528b60048401610e71565b039134905af18015610b8057610b6a575b50602063ffffffff5f80516020610f2f8339815191529261096a565b610b779195505f90610db0565b5f936020610b4e565b6040513d5f823e3d90fd5b5f80fd5b63f483256360e01b5f5260045ffd5b856084918663ffffffff8660405194631c328bbf60e01b8652600486015216602484015260448301526064820152fd5b8c3b6108a95760849293949596979850602091610c08916040519485938493633a9b44eb60e21b8552604060048601526044850190610e4d565b910135602483015203815f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165af18015610b8057610c98575b50893b15610c8557908a95949392918a7f805996f252884581e2f74cf3d2b03564d5ec26ccc90850ae12653dc1b72d1fa25f80a25f806108a9565b8963524c1bff60e01b5f5260045260245ffd5b6020813d602011610cce575b81610cb160209383610db0565b81010312610b8b57516001600160a01b0381168114610c4a575f80fd5b3d9150610ca4565b60405162461bcd60e51b8152602060048201526024808201527f5479706543617374733a2062797465733332546f41646472657373206f766572604482015263666c6f7760e01b6064820152608490fd5b62461bcd60e51b815260206004820152602160248201527f4d61696c626f78436c69656e743a2073656e646572206e6f74206d61696c626f6044820152600f60fb1b6064820152608490fd5b6004359063ffffffff82168203610b8b57565b604435906001600160a01b0382168203610b8b57565b35906001600160a01b0382168203610b8b57565b90601f801991011681019081106001600160401b03821117610dd157604052565b634e487b7160e01b5f52604160045260245ffd5b81601f82011215610b8b578035906001600160401b038211610dd15760405192610e19601f8401601f191660200185610db0565b82845260208383010111610b8b57815f926020809301838601378301015290565b359065ffffffffffff82168203610b8b57565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6001600160a01b039091168152604060208201819052610e9392910190610e4d565b90565b94919365ffffffffffff610ed794610e939896829460018060a01b03168952602089015216604087015216606085015260c0608085015260c0840190610e4d565b9160a0818403910152610e4d565b906005821015610ef25752565b634e487b7160e01b5f52602160045260245ffd5b8051821015610f1a5760209160051b010190565b634e487b7160e01b5f52603260045260245ffdfe19d7eb397a52ea52b8d8d505a2ac7154e1c2a55490a036f4fa1c7adff728e7bea2646970667358221220427873c07b7b3726f3ea62c6856e9c60ee1f45aee1eb440f591130aa03d9aa2564736f6c634300081a0033" as Hex;
export const ERC7579ExecutorRouter = {
    abi,
    bytecode,
    deployedBytecode,
};
