import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IERC20 } from "../../artifacts/IERC20.js";
import { IAllowanceTransfer } from "../../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";
import { GetCallsParams, GetCallsReturnType } from "../getCalls.js";
import { getPermit2PermitCalls } from "./getPermit2PermitCalls.js";
import { CallArgs } from "../../smartaccount/ExecLib.js";

export interface GetPermit2TransferFromCallsParams extends GetCallsParams {
    token: Address;
    funder: Address;
    minAmount: bigint;
    targetAmount?: bigint;
    approveAmount?: bigint | "MAX_UINT_160";
    minExpiration?: number;
    approveExpiration: number | "MAX_UINT_48";
    sigDeadline?: bigint;
}

export interface GetPermit2TransferFromCallsReturnType extends GetCallsReturnType {
    balance: bigint;
}
/**
 * Pull tokens from `funder` to `account`
 * Get balance and return `IAllowanceTransfer.transferFrom` call if balance below `minAmount`
 * @dev Assumes `token.balanceOf(funder) > minAmount`
 * @dev **May request signature** from `funder` using `getPermit2PermitCalls` if `IAllowanceTransfer.allowance` is insufficient
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getPermit2TransferFromCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetPermit2TransferFromCallsParams,
): Promise<GetPermit2TransferFromCallsReturnType> {
    const { chainId, token, account, funder, minAmount } = params;
    // Amount to approve if current allowance < minAmount
    const targetAmount = params.targetAmount ?? minAmount;
    invariant(targetAmount >= minAmount, "targetAmount must be >= minAmount");

    const balance = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [account],
        }),
    );

    if (balance >= minAmount) {
        return { balance, calls: [] };
    }
    // Transfer amount
    const amount = targetAmount - balance;

    // Increase Permit2 allowance if insufficient
    const calls: (CallArgs & { account: Address })[] = [];
    const permit2Calls = await getPermit2PermitCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account: funder,
        spender: account,
        minAmount: amount,
        approveAmount: params.approveAmount,
        minExpiration: params.minExpiration,
        approveExpiration: params.approveExpiration,
        sigDeadline: params.sigDeadline,
    });
    calls.push(...permit2Calls.calls.map((call) => ({ ...call, account }))); //override account of Permit2.permit call (anyone can submit this)

    // Permit2 transferFrom
    const transferFromCall = {
        account,
        to: PERMIT2_ADDRESS as Address,
        data: encodeFunctionData({
            abi: IAllowanceTransfer.abi,
            functionName: "transferFrom",
            args: [funder, account, amount, token],
        }),
        value: 0n,
    };
    calls.push(transferFromCall);

    return { balance, calls };
}
