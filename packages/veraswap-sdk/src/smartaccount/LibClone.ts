/***** LibClone TS Helpers *****/

import { Address, Hash, Hex, keccak256 } from "viem";

/**
 * TS Implementation for `LibClone.initCodeERC1967`
 * @param implementation
 * @returns init bytecode
 */
export function getInitCodeERC1967(implementation: Address): Hex {
    return `0x603d3d8160223d3973${implementation.replace("0x", "")}60095155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3`;
}

export function getInitCodeHashERC1967(implementation: Address): Hash {
    return keccak256(getInitCodeERC1967(implementation));
}
