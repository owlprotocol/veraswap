import { Address, TypedDataDomain, TypedData } from "viem";

export interface PermitDetails {
    token: Address;
    amount: bigint;
    expiration: number;
    nonce: number;
}
export interface PermitSingle {
    details: PermitDetails;
    spender: Address;
    sigDeadline: bigint;
}
export interface PermitBatch {
    details: PermitDetails[];
    spender: Address;
    sigDeadline: bigint;
}
export interface PermitSingleData {
    domain: TypedDataDomain;
    types: TypedData;
    values: PermitSingle;
}
export interface PermitBatchData {
    domain: TypedDataDomain;
    types: TypedData;
    values: PermitBatch;
}
