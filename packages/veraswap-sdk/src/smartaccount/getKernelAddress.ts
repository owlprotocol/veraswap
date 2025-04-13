import { Address, encodePacked, Hash, Hex, keccak256 } from "viem";

import { predictDeterministicAddressERC1967 } from "./LibClone.js";

export interface GetKernelAddressParams {
    data: Hex;
    salt: Hash;
    implementation: Address;
    factoryAddress: Address;
}
/**
 * Get Kernel v3.1 Address
 * @params Kernel init params
 * @return Kernel address
 */
export function getKernelAddress({ data, salt, implementation, factoryAddress }: GetKernelAddressParams): Address {
    const actualSalt = keccak256(encodePacked(["bytes", "bytes32"], [data, salt]));
    return predictDeterministicAddressERC1967(implementation, actualSalt, factoryAddress);
}
