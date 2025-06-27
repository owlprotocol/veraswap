import { Address, encodeFunctionData } from "viem";

import { transfer as transferAbi } from "../artifacts/IERC20.js";

import { CallArgs } from "./ExecLib.js";

export interface RecoveryParams {
    chainId: number;
    kernelAddress: Address;
    nativeAmount?: bigint;
    tokenTransfers?: {
        tokenAddress: Address;
        amount: bigint;
    }[];
}

export function createRecoveryCalls(walletAddress: Address, params: RecoveryParams) {
    const { kernelAddress, nativeAmount, tokenTransfers } = params;

    const calls: (CallArgs & { account: Address })[] = [];

    if (nativeAmount && nativeAmount > 0n) {
        calls.push({
            to: walletAddress,
            data: "0x",
            value: nativeAmount,
            account: kernelAddress,
        });
    }

    if (tokenTransfers) {
        for (const { tokenAddress, amount } of tokenTransfers) {
            if (amount > 0n) {
                calls.push({
                    to: tokenAddress,
                    data: encodeFunctionData({
                        abi: [transferAbi],
                        args: [walletAddress, amount],
                    }),
                    account: kernelAddress,
                });
            }
        }
    }

    return calls;
}
