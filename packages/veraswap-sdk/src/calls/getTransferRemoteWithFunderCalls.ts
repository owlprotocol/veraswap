import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, Hex } from "viem";

import { CallArgs } from "../smartaccount/ExecLib.js";
import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getPermit2TransferFromCalls } from "./Permit2/getPermit2TransferFromCalls.js";
import { getTransferRemoteWithApproveCalls } from "./getTransferRemoteWithApproveCalls.js";
import { TokenStandard } from "../types/Token.js";

export interface GetTransferRemoteWithFunderCallsParams extends GetCallsParams {
    funder: Address;
    tokenStandard: TokenStandard & ("HypERC20" | "HypERC20Collateral");
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
    permit2?: {
        approveAmount?: bigint | "MAX_UINT_160";
        minExpiration?: number;
        approveExpiration?: number | "MAX_UINT_48";
        sigDeadline?: bigint;
    };
}

/**
 * Get call to fund & set appprovals for `TokenRouter.transferRemote` call
 * @dev Assumes `token.balanceOf(account) > amount`
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getTransferRemoteWithFunderCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetTransferRemoteWithFunderCallsParams,
): Promise<GetCallsReturnType> {
    const { chainId, account, funder, tokenStandard, token, destination, recipient, amount, hookMetadata, hook } =
        params;

    // Default to MAX_UINT_160 if not provided
    const permit2 = {
        approveAmount: params.permit2?.approveAmount ?? "MAX_UINT_160",
        minExpiration: params.permit2?.minExpiration,
        approveExpiration: params.permit2?.approveExpiration ?? "MAX_UINT_48",
        sigDeadline: params.permit2?.sigDeadline,
    };

    const calls: (CallArgs & { account: Address })[] = [];

    let wrappedToken = token;
    if (tokenStandard === "HypERC20Collateral") {
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

    // Approve HypERC20Collateral and call `transferRemote`
    const transferRemoteCall = await getTransferRemoteWithApproveCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        tokenStandard,
        token,
        destination,
        recipient,
        amount,
        hookMetadata,
        hook,
        approveAmount: params.approveAmount,
    });
    calls.push(...transferRemoteCall.calls);

    return { calls };
}
