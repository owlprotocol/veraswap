import { Address, encodeAbiParameters, Hash, Hex, zeroHash } from "viem";

export enum ERC7579ExecutionMode {
    SINGLE = 0,
    BATCH = 1,
    SINGLE_SIGNATURE = 2,
    BATCH_SIGNATURE = 3,
    NOOP = 4,
}

export type ERC7579RouterMessage<T extends ERC7579ExecutionMode> = T extends
    | ERC7579ExecutionMode.SINGLE_SIGNATURE
    | ERC7579ExecutionMode.BATCH_SIGNATURE
    ? ERC7579RouterSignedMessage<T>
    : T extends ERC7579ExecutionMode.SINGLE | ERC7579ExecutionMode.BATCH
      ? ERC7579RouterDirectMessage<T>
      : ERC7579RouterNoopMessage;

export interface ERC7579RouterBaseMessage {
    owner: Address;
    account: Address;
    initData?: Hex;
    initSalt?: Hash;
    executionMode: ERC7579ExecutionMode;
    callData?: Hex;
    nonce?: bigint;
    validAfter?: number;
    validUntil?: number;
    signature?: Hex;
}

export interface ERC7579RouterNoopMessage extends ERC7579RouterBaseMessage {
    executionMode: ERC7579ExecutionMode.NOOP;
    callData?: undefined;
    nonce?: undefined;
    validAfter?: undefined;
    validUntil?: undefined;
    signature?: undefined;
}

export interface ERC7579RouterDirectMessage<
    T extends ERC7579ExecutionMode.SINGLE | ERC7579ExecutionMode.BATCH =
        | ERC7579ExecutionMode.SINGLE
        | ERC7579ExecutionMode.BATCH,
> extends ERC7579RouterBaseMessage {
    executionMode: T;
    callData: Hex;
    nonce?: undefined;
    validAfter?: undefined;
    validUntil?: undefined;
    signature?: undefined;
}

export interface ERC7579RouterSignedMessage<
    T extends ERC7579ExecutionMode.SINGLE_SIGNATURE | ERC7579ExecutionMode.BATCH_SIGNATURE =
        | ERC7579ExecutionMode.SINGLE_SIGNATURE
        | ERC7579ExecutionMode.BATCH_SIGNATURE,
> extends ERC7579RouterBaseMessage {
    executionMode: T;
    callData: Hex;
    nonce: bigint;
    validAfter: number;
    validUntil: number;
    signature: Hex;
}

export function encodeERC7579RouterMessage(params: ERC7579RouterBaseMessage): Hex {
    return encodeAbiParameters(
        [
            { type: "address", name: "owner" },
            { type: "address", name: "account" },
            { type: "bytes", name: "initData" },
            { type: "bytes32", name: "initSalt" },
            {
                name: "executionMode",
                type: "uint8",
                internalType: "enum ERC7579ExecutorMessage.ExecutionMode",
            },
            { type: "bytes", name: "callData" },
            { type: "uint256", name: "nonce" },
            { type: "uint48", name: "validAfter" },
            { type: "uint48", name: "validUntil" },
            { type: "bytes", name: "signature" },
        ],
        [
            params.owner,
            params.account,
            params.initData ?? "0x",
            params.initSalt ?? zeroHash,
            params.executionMode,
            params.callData ?? "0x",
            params.nonce ?? 0n,
            params.validAfter ?? 0,
            params.validUntil ?? 0,
            params.signature ?? "0x",
        ],
    );
}
