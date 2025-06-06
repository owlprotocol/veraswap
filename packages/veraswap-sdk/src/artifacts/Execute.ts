import { Hex } from "viem";

export const execute = {
    type: "function",
    name: "execute",
    inputs: [
        { name: "execMode", type: "bytes32", internalType: "ExecMode" },
        { name: "executionCalldata", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "returnData", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
} as const;
export const TryExecuteUnsuccessful = {
    type: "event",
    name: "TryExecuteUnsuccessful",
    inputs: [
        { name: "batchExecutionindex", type: "uint256", indexed: false, internalType: "uint256" },
        { name: "result", type: "bytes", indexed: false, internalType: "bytes" },
    ],
    anonymous: false,
} as const;
export const functions = [execute] as const;
export const events = [TryExecuteUnsuccessful] as const;
export const errors = [] as const;
export const abi = [...functions, ...events, ...errors] as const;

export const bytecode =
    "0x60808060405234601557610640908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c63e9ae5c5314610025575f80fd5b604036600319011261034c576004359060243567ffffffffffffffff811161034c573660238201121561034c5780600401359167ffffffffffffffff831161034c576024820190366024858501011161034c57600885901b946001600160f81b031916600160f81b810361027457505090915035016024604482019101359160ff60f81b1680155f1461018057506100bc826104d9565b915f5b818110610130575050505b6040518091602082016020835281518091526040830190602060408260051b8601019301915f905b82821061010157505050500390f35b919360019193955060206101208192603f198a82030186528851610440565b96019201920185949391926100f2565b80610164602061014360019486886105ca565b61014c816105ec565b6101596040830183610600565b939092013590610594565b61016e8287610559565b526101798186610559565b50016100bf565b600160f81b0361024157610193826104d9565b915f5b8181106101a5575050506100ca565b806101d960206101b860019486886105ca565b6101c1816105ec565b6101ce6040830183610600565b93909201359061056d565b6101e38388610559565b52156101f0575b01610196565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb761023961021e8388610559565b51604051918291858352604060208401526040830190610440565b0390a16101ea565b60405162461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b806103505750508260141161034c573560601c916034811061034c5760331901906058810190603801356102a6610490565b946001600160f81b031916806102da57506102c093610594565b6102c982610538565b526102d381610538565b505b6100ca565b600160f81b03610241576102ed9361056d565b6102f683610538565b526102d5575b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb761034461032983610538565b516040519182915f8352604060208401526040830190610440565b0390a16100ca565b5f80fd5b939492936001600160f81b031903610410575061036b610490565b938060141161034c575f91359060131901806038604051960186373891859060601c5af4913d81523d5f602083013e60203d8201016040526103ac84610538565b526001600160f81b031916600160f81b81036103cd5750156102fc576100ca565b610241576102d55760405162461bcd60e51b815260206004820152601360248201527211195b1959d85d1958d85b1b0819985a5b1959606a1b6044820152606490fd5b62461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b67ffffffffffffffff811161047c5760051b60200190565b634e487b7160e01b5f52604160045260245ffd5b6040805190919080830167ffffffffffffffff81118282101761047c576040526001815291601f1901825f5b8281106104c857505050565b8060606020809385010152016104bc565b906104e382610464565b60405190601f01601f1916810167ffffffffffffffff81118282101761047c576040528281528092610517601f1991610464565b01905f5b82811061052757505050565b80606060208093850101520161051b565b8051156105455760200190565b634e487b7160e01b5f52603260045260245ffd5b80518210156105455760209160051b010190565b905f928491604051958692833738935af1913d82523d5f602084013e60203d830101604052565b90925f92819594604051968792833738935af1156105c1573d82523d5f602084013e60203d830101604052565b503d5f823e3d90fd5b91908110156105455760051b81013590605e198136030182121561034c570190565b356001600160a01b038116810361034c5790565b903590601e198136030182121561034c570180359067ffffffffffffffff821161034c5760200191813603831361034c5756fea164736f6c634300081a000a" as Hex;
export const deployedBytecode =
    "0x6080806040526004361015610012575f80fd5b5f3560e01c63e9ae5c5314610025575f80fd5b604036600319011261034c576004359060243567ffffffffffffffff811161034c573660238201121561034c5780600401359167ffffffffffffffff831161034c576024820190366024858501011161034c57600885901b946001600160f81b031916600160f81b810361027457505090915035016024604482019101359160ff60f81b1680155f1461018057506100bc826104d9565b915f5b818110610130575050505b6040518091602082016020835281518091526040830190602060408260051b8601019301915f905b82821061010157505050500390f35b919360019193955060206101208192603f198a82030186528851610440565b96019201920185949391926100f2565b80610164602061014360019486886105ca565b61014c816105ec565b6101596040830183610600565b939092013590610594565b61016e8287610559565b526101798186610559565b50016100bf565b600160f81b0361024157610193826104d9565b915f5b8181106101a5575050506100ca565b806101d960206101b860019486886105ca565b6101c1816105ec565b6101ce6040830183610600565b93909201359061056d565b6101e38388610559565b52156101f0575b01610196565b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb761023961021e8388610559565b51604051918291858352604060208401526040830190610440565b0390a16101ea565b60405162461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b806103505750508260141161034c573560601c916034811061034c5760331901906058810190603801356102a6610490565b946001600160f81b031916806102da57506102c093610594565b6102c982610538565b526102d381610538565b505b6100ca565b600160f81b03610241576102ed9361056d565b6102f683610538565b526102d5575b7fe723f28f104e46b47fd3531f3608374ac226bcf3ddda334a23a266453e0efdb761034461032983610538565b516040519182915f8352604060208401526040830190610440565b0390a16100ca565b5f80fd5b939492936001600160f81b031903610410575061036b610490565b938060141161034c575f91359060131901806038604051960186373891859060601c5af4913d81523d5f602083013e60203d8201016040526103ac84610538565b526001600160f81b031916600160f81b81036103cd5750156102fc576100ca565b610241576102d55760405162461bcd60e51b815260206004820152601360248201527211195b1959d85d1958d85b1b0819985a5b1959606a1b6044820152606490fd5b62461bcd60e51b815260206004820152600b60248201526a155b9cdd5c1c1bdc9d195960aa1b6044820152606490fd5b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b67ffffffffffffffff811161047c5760051b60200190565b634e487b7160e01b5f52604160045260245ffd5b6040805190919080830167ffffffffffffffff81118282101761047c576040526001815291601f1901825f5b8281106104c857505050565b8060606020809385010152016104bc565b906104e382610464565b60405190601f01601f1916810167ffffffffffffffff81118282101761047c576040528281528092610517601f1991610464565b01905f5b82811061052757505050565b80606060208093850101520161051b565b8051156105455760200190565b634e487b7160e01b5f52603260045260245ffd5b80518210156105455760209160051b010190565b905f928491604051958692833738935af1913d82523d5f602084013e60203d830101604052565b90925f92819594604051968792833738935af1156105c1573d82523d5f602084013e60203d830101604052565b503d5f823e3d90fd5b91908110156105455760051b81013590605e198136030182121561034c570190565b356001600160a01b038116810361034c5790565b903590601e198136030182121561034c570180359067ffffffffffffffff821161034c5760200191813603831361034c5756fea164736f6c634300081a000a" as Hex;
export const Execute = {
    abi,
    bytecode,
    deployedBytecode,
};
