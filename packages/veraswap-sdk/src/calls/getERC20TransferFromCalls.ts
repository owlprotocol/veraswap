import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IERC20 } from "../artifacts/IERC20.js";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

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
 * Get balance and return `IERC20.transferFrom` call if balance below `minAmount`
 * @dev Assumes `token.allowance(funder, account) >= amount`
 * @dev Assumes `token.balanceOf(funder) > amount`
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
    const call = {
        account,
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
