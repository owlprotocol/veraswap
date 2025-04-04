import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IERC20 } from "../artifacts/IERC20.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getPermit2PermitCalls } from "./getPermit2PermitCalls.js";
import { CallArgs } from "../smartaccount/ExecLib.js";

export interface GetERC20TransferFromCallsParams extends GetCallsParams {
    token: Address;
    funder: Address;
    minAmount: bigint;
    targetAmount?: bigint;
}

export interface GetERC20TransferFromCallsReturnType extends GetCallsReturnType {
    balance: bigint;
}
/**
 * Pull tokens from `funder` to `account`
 * Get balance and return `IERC20.transferFrom` or `IAllowanceTransfer.transferFrom` call if balance below `minAmount`
 * @dev Assumes `token.balanceOf(funder) > minAmount`
 * @dev **May request signature** from `funder` using `getPermit2PermitCalls` if `IAllowanceTransfer.allowance` is insufficient
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getERC20TransferFromCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetERC20TransferFromCallsParams,
): Promise<GetERC20TransferFromCallsReturnType> {
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

    // Regular ERC20 transferFrom
    const allowance = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [funder, account],
        }),
    );
    if (allowance >= amount) {
        const call = {
            to: token,
            data: encodeFunctionData({
                abi: IERC20.abi,
                functionName: "transferFrom",
                args: [funder, account, amount],
            }),
            value: 0n,
        };

        return { balance, calls: [call] };
    }

    // Increase Permit2 allowance if insufficient
    const calls: CallArgs[] = [];
    const permit2Calls = await getPermit2PermitCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account,
        spender: funder,
        minAmount: amount,
        approveExpiration: Date.now() + 60 * 60 * 24 * 30, // 30 days
    });
    calls.push(...permit2Calls.calls);

    // Permit2 transferFrom
    const transferFromCall = {
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
