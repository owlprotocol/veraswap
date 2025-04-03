import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IERC20 } from "../artifacts/IERC20.js";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetERC20ApproveCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint;
}

export interface GetERC20ApproveCallsReturnType extends GetCallsReturnType {
    allowance: bigint;
}

/**
 * Get spender allowance and return `IERC20.approve(account, spender)` call if allowance below `minAmount`
 * @dev Assumes `token.balanceOf(account) > minAmount`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getERC20ApproveCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetERC20ApproveCallsParams,
): Promise<GetERC20ApproveCallsReturnType> {
    const { chainId, token, account, spender, minAmount } = params;
    // Amount to approve if current allowance < minAmount
    const approveAmount = params.approveAmount ?? minAmount;
    invariant(approveAmount >= minAmount, "approveAmount must be >= minAmount");

    const allowance = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [account, spender],
        }),
    );

    if (allowance >= minAmount) {
        return { allowance, calls: [] };
    }

    const call = {
        to: token,
        data: encodeFunctionData({
            abi: IERC20.abi,
            functionName: "approve",
            args: [spender, approveAmount],
        }),
        value: 0n,
    };

    return { allowance, calls: [call] };
}
