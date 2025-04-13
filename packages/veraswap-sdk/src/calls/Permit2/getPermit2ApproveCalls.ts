import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData } from "viem";

import { IAllowanceTransfer } from "../../artifacts/IAllowanceTransfer.js";
import { MAX_UINT_160, MAX_UINT_256, MAX_UINT_48 } from "../../constants/uint256.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";
import { CallArgs } from "../../smartaccount/ExecLib.js";
import { getERC20ApproveCalls } from "../ERC20/getERC20ApproveCalls.js";
import { GetCallsParams, GetCallsReturnType } from "../getCalls.js";

export interface GetPermit2ApproveCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint | "MAX_UINT_160";
    minExpiration?: number;
    approveExpiration: number | "MAX_UINT_48";
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
    const now = Math.floor(Date.now() / 1000) + 60; // +1min

    const { chainId, token, account, spender, minAmount } = params;
    const approveExpiration = params.approveExpiration === "MAX_UINT_48" ? MAX_UINT_48 : params.approveExpiration;
    // Check amount invariants
    invariant(minAmount <= MAX_UINT_160, "minAmount must be <= MAX_UINT_160");
    invariant(
        params.approveAmount === undefined ||
            params.approveAmount === "MAX_UINT_160" ||
            (minAmount <= params.approveAmount && params.approveAmount <= MAX_UINT_160),
        "approveAmount must be minAmount <= approveAmount <= MAX_UINT_160",
    );
    const approveAmount = params.approveAmount === "MAX_UINT_160" ? MAX_UINT_160 : (params.approveAmount ?? minAmount);

    // Check timestamp invariants
    invariant(
        params.minExpiration === undefined || (now <= params.minExpiration && params.minExpiration <= MAX_UINT_48),
        "minExpiration must be now <= minExpiration <= MAX_UINT_48",
    );
    const minExpiration = params.minExpiration ?? now;
    invariant(
        minExpiration <= approveExpiration && approveExpiration <= MAX_UINT_48,
        "approveExpiration must be minExpiration <= approveExpiration <= MAX_UINT_48",
    );

    const calls: (CallArgs & { account: Address })[] = [];

    const [allowance, expiration] = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account, token, spender],
        }),
    );
    if (allowance >= minAmount && expiration > minExpiration) {
        // Assume ERC20 is sufficiently approved
        return { allowance, expiration, calls };
    }

    // Check if PERMIT2 is approved
    const erc20ApproveCalls = await getERC20ApproveCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account,
        spender: PERMIT2_ADDRESS,
        //ERC20 has to be approved with approveAmount, some contracts have optimizations when allowance is infinite
        minAmount: approveAmount,
        approveAmount: approveAmount === MAX_UINT_160 ? MAX_UINT_256 : approveAmount,
    });
    calls.push(...erc20ApproveCalls.calls);

    const permit2ApproveCall = {
        account,
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
