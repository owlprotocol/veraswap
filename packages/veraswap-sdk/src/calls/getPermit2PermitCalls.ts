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

export interface GetPermit2PermitCallsParams extends GetCallsParams {
    token: Address;
    spender: Address;
    minAmount: bigint;
    approveAmount?: bigint;
    minExpiration?: number;
    approveExpiration: number;
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

    const [allowance, expiration, nonce] = await queryClient.fetchQuery(
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
        return { allowance, expiration, calls: [] };
    }

    //uint48 nonce
    const permitSingle: PermitSingle = {
        details: {
            token,
            amount: approveAmount,
            expiration: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            nonce,
        },
        spender,
        sigDeadline: BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60),
    };
    const permitData = AllowanceTransfer.getPermitData(permitSingle, PERMIT2_ADDRESS, chainId);
    console.debug(permitData);
    const signature = await signTypedData(wagmiConfig, {
        account,
        domain: permitData.domain as TypedDataDomain,
        types: permitData.types,
        primaryType: "PermitSingle",
        message: permitData.values as unknown as Record<string, unknown>,
    });

    const call = {
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
