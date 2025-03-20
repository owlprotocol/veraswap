import type { Address, Hex } from "viem";

export interface PermitTransferFromData {
    dest: Address;
    func: Hex;
    value: bigint;
}
