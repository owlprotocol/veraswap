import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import invariant from "tiny-invariant";
import { Address, encodeFunctionData } from "viem";

import { IERC20 } from "../../artifacts/IERC20.js";
import { MAX_UINT_256 } from "../../constants/uint256.js";
import { GetCallsParams, GetCallsReturnType } from "../getCalls.js";

export interface GetERC20ApproveCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint | "MAX_UINT_256";
}

export interface GetERC20ApproveCallsReturnType extends GetCallsReturnType {
    allowance: bigint;
}

/**
 * Approve tokens from `account` to `spender`
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
    // Check amount invariants
    invariant(minAmount <= MAX_UINT_256, "minAmount must be <= MAX_UINT_256");
    invariant(
        params.approveAmount === undefined ||
            params.approveAmount === "MAX_UINT_256" ||
            (minAmount <= params.approveAmount && params.approveAmount <= MAX_UINT_256),
        "approveAmount must be minAmount <= approveAmount <= MAX_UINT_256",
    );
    const approveAmount = params.approveAmount === "MAX_UINT_256" ? MAX_UINT_256 : (params.approveAmount ?? minAmount);

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
        account,
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
