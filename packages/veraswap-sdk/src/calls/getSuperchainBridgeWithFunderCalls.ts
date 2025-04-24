import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address } from "viem";

import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { TokenStandard } from "../types/Token.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getSuperchainBridgeWithApproveCalls } from "./getSuperchainBridgeWithApproveCalls.js";
import { getPermit2TransferFromCalls } from "./Permit2/getPermit2TransferFromCalls.js";

export interface GetSuperchainBridgeWithFunderCallsParams extends GetCallsParams {
    funder: Address;
    tokenStandard: TokenStandard & ("HypSuperchainERC20Collateral" | "SuperchainERC20");
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    approveAmount?: bigint | "MAX_UINT_256";
    permit2?: {
        approveAmount?: bigint | "MAX_UINT_160";
        minExpiration?: number;
        approveExpiration?: number | "MAX_UINT_48";
        sigDeadline?: bigint;
    };
}

/**
 * Get call to fund & set appprovals for `SuperchainTokenBridge.sendERC20` call
 * @dev Assumes `token.balanceOf(account) > amount`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getSuperchainBridgeWithFunderCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetSuperchainBridgeWithFunderCallsParams,
): Promise<GetCallsReturnType> {
    const { chainId, account, funder, tokenStandard, token, destination, recipient, amount } = params;

    // Default to MAX_UINT_160 if not provided
    const permit2 = {
        approveAmount: params.permit2?.approveAmount ?? "MAX_UINT_160",
        minExpiration: params.permit2?.minExpiration,
        approveExpiration: params.permit2?.approveExpiration ?? "MAX_UINT_48",
        sigDeadline: params.permit2?.sigDeadline,
    };

    const calls: (CallArgs & { account: Address })[] = [];

    let wrappedToken = token;
    if (tokenStandard === "HypSuperchainERC20Collateral") {
        // HypERC20Collateral requires approval for wrapped token
        wrappedToken = await queryClient.fetchQuery(
            readContractQueryOptions(wagmiConfig, {
                chainId,
                address: token,
                abi: HypERC20Collateral.abi,
                functionName: "wrappedToken",
                args: [],
            }),
        );
    }

    // Fund account if necessary
    const transferFromCall = await getPermit2TransferFromCalls(queryClient, wagmiConfig, {
        chainId,
        token: wrappedToken,
        account,
        funder,
        minAmount: amount,
        ...permit2,
    });
    calls.push(...transferFromCall.calls);

    // Approve SuperchainERC20 and call `sendERC20`
    const transferRemoteCall = await getSuperchainBridgeWithApproveCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        tokenStandard,
        token,
        destination,
        recipient,
        amount,
        approveAmount: params.approveAmount,
    });
    calls.push(...transferRemoteCall.calls);

    return { calls };
}
