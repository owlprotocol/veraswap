import { Config, signTypedData } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";
import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData, TypedDataDomain } from "viem";
import invariant from "tiny-invariant";
import { AllowanceTransfer } from "@uniswap/permit2-sdk";

import {
    IAllowanceTransfer,
    permit_address___address_uint160_uint48_uint48__address_uint256__bytes,
} from "../artifacts/IAllowanceTransfer.js";
import { PERMIT2_ADDRESS } from "../constants/uniswap.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { MAX_UINT_160, MAX_UINT_256, MAX_UINT_48 } from "../constants/uint256.js";

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
    const approveAmount = params.approveAmount == "MAX_UINT_160" ? MAX_UINT_160 : (params.approveAmount ?? minAmount);

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
    invariant(
        params.sigDeadline === undefined || (now <= params.sigDeadline && params.sigDeadline <= MAX_UINT_256),
        "sigDeadline must be Date.now + 1min +  <= approveExpiration <= MAX_UINT_256",
    );
    const sigDeadline = params.sigDeadline ?? BigInt(now + 60 * 4); //5min (already 1min buffer);

    // Check allowance
    const [allowance, expiration, nonce] = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [account, token, spender],
        }),
    );

    if (allowance >= minAmount && expiration > minExpiration) {
        return { allowance, expiration, calls: [] };
    }

    //uint48 nonce
    const permitSingle: PermitSingle = {
        details: {
            token,
            amount: approveAmount,
            expiration: approveExpiration,
            nonce,
        },
        spender,
        sigDeadline,
    };
    const permitData = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, chainId);
    const signature = await signTypedData(wagmiConfig, {
        account,
        domain: permitData.domain as TypedDataDomain,
        types: permitData.types,
        primaryType: "PermitSingle",
        message: permitData.values as unknown as Record<string, unknown>,
    });

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
