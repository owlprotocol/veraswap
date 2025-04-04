import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";
import invariant from "tiny-invariant";

import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getERC20ApproveCalls } from "./getERC20ApproveCalls.js";
import { CallArgs } from "../smartaccount/ExecLib.js";

export interface GetPermit2ApproveCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint;
    minExpiration?: number;
    approveExpiration: number;
}

export interface GetPermit2ApproveCallsReturnType extends GetCallsReturnType {
    allowance: bigint;
    expiration: number;
}

/**
 * Get spender Permit2 allowance and return `IAllowance.approve(token, spender, approveAmount, approveExpiration)` call if allowance below `minAmount` or expired
 * @dev Assumes `token.balanceOf(account) > minAmount`
 * @dev Checks if `token.allowance(account, PERMIT2) > minAmount` (adds approval call before `IAllowance.approve`)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getPermit2ApproveCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetPermit2ApproveCallsParams,
): Promise<GetPermit2ApproveCallsReturnType> {
    const { chainId, token, account, spender, minAmount, approveExpiration } = params;
    // Amount to approve if current allowance < minAmount
    const approveAmount = params.approveAmount ?? minAmount;
    invariant(approveAmount >= minAmount, "approveAmount must be >= minAmount");

    // Expiration timestamp for Permit2 approval
    invariant(
        params.minExpiration == undefined || params.minExpiration >= Date.now(),
        "minExpiration must be undefined || >= Date.now()",
    );
    invariant(
        approveExpiration >= (params.minExpiration ?? Date.now()),
        "approveExpiration must be >= (minExpiration ?? Date.now())",
    );

    const calls: CallArgs[] = [];

    //TODO: Make promises concurrent
    // Check if PERMIT2 is approved
    const erc20ApproveCalls = await getERC20ApproveCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account,
        spender: PERMIT2_ADDRESS,
        minAmount,
        approveAmount,
    });
    calls.push(...erc20ApproveCalls.calls);

    const [allowance, expiration] = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account, token, spender],
        }),
    );

    // Default minExpiration to Date.now()
    const minExpiration = params.minExpiration ?? Date.now();
    if (allowance >= minAmount && expiration > minExpiration) {
        return { allowance, expiration, calls };
    }

    const permit2ApproveCall = {
        to: PERMIT2_ADDRESS as Address,
        data: encodeFunctionData({
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [token, spender, approveAmount, approveExpiration],
        }),
        value: 0n,
    };
    calls.push(permit2ApproveCall);

    return { allowance, expiration, calls };
}
