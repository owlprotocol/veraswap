import { Address, concatHex, encodeAbiParameters, Hex, toHex } from "viem";

export interface CallArgs {
    to: Address;
    data?: Hex;
    value?: bigint;
}
export type DelegateCallArgs = Omit<CallArgs, "value">;

export function encodeCallArgsSingle(args: CallArgs): Hex {
    const callData = concatHex([args.to, toHex(args.value ?? 0n, { size: 32 }), args.data ?? "0x"]);
    return callData;
}

export function encodeCallArgsBatch(args: CallArgs[]): Hex {
    return encodeAbiParameters(
        [
            {
                name: "executionBatch",
                type: "tuple[]",
                components: [
                    {
                        name: "target",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "callData",
                        type: "bytes",
                    },
                ],
            },
        ],
        [
            args.map((arg) => {
                return {
                    target: arg.to,
                    value: arg.value ?? 0n,
                    callData: arg.data ?? "0x",
                };
            }),
        ],
    );
}
