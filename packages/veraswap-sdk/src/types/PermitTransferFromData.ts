import type { Address, Hex } from "viem";

export type PermitTransferFromData = {
    dest: Address;
    func: Hex;
    value: bigint;
};
