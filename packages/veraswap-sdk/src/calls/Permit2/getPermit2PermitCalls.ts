import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData } from "viem";

import { permit_address___address_uint160_uint48_uint48__address_uint256__bytes } from "../../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../../constants/uniswap.js";
import { GetCallsParams, GetCallsReturnType } from "../getCalls.js";

import { getPermit2PermitSignature } from "./getPermit2PermitSignature.js";

export interface GetPermit2PermitCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint | "MAX_UINT_160";
    minExpiration?: number;
    approveExpiration: number | "MAX_UINT_48";
    sigDeadline?: bigint;
}

export interface GetPermit2PermitCallsReturnType extends GetCallsReturnType {
    allowance: bigint;
    expiration: number;
}

/**
 * Get spender Permit2 allowance and return `IAllowance.permit(account, permitDetails, signature)` call if allowance below `minAmount` or expired
 * @devs **Requires** `signTypedMessage` call from `account`
 * @dev Assumes `token.balanceOf(account) > minAmount`
 * @dev Assumes `token.allowance(account, PERMIT2) > minAmount`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getPermit2PermitCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetPermit2PermitCallsParams,
): Promise<GetPermit2PermitCallsReturnType> {
    const { account } = params;

    const { allowance, expiration, permitSingle, signature } = await getPermit2PermitSignature(
        queryClient,
        wagmiConfig,
        params,
    );

    if (!permitSingle || !signature) {
        return { allowance, expiration, calls: [] };
    }

    const call = {
        // Technically, this can be called from ANY account
        account,
        to: PERMIT2_ADDRESS as Address,
        data: encodeFunctionData({
            abi: [permit_address___address_uint160_uint48_uint48__address_uint256__bytes],
            functionName: "permit",
            args: [account, permitSingle, signature],
        }),
        value: 0n,
    };

    return { allowance, expiration, calls: [call] };
}
