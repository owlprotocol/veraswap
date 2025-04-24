import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address } from "viem";

import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { getSuperchainBridgeTransaction } from "../superchain/getSuperchainBridgeTransaction.js";

import { getERC20ApproveCalls } from "./ERC20/getERC20ApproveCalls.js";
import { GetCallsParams } from "./getCalls.js";

export interface GetSuperchainBridgeWithApproveCallsParams extends GetCallsParams {
    tokenStandard: "HypSuperchainERC20Collateral" | "SuperchainERC20";
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    approveAmount?: bigint | "MAX_UINT_256";
}

/**
 * Get `IERC20.approve` call and `SuperchainTokenBridge.sendERC20` call
 * @dev Make sure to check `owner` balance is sufficient beforehand (if needed)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getSuperchainBridgeWithApproveCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetSuperchainBridgeWithApproveCallsParams,
): Promise<{ calls: (CallArgs & { account: Address })[] }> {
    const { chainId, account, tokenStandard, token, destination, recipient, amount } = params;

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

    const approvalCall = await getERC20ApproveCalls(queryClient, wagmiConfig, {
        chainId,
        token: wrappedToken,
        account,
        spender: token,
        minAmount: amount,
        approveAmount: params.approveAmount ?? "MAX_UINT_256", // default to MAX_UINT_256 approval for HypERC20Collateral
    });
    // Add required approval
    calls.push(...approvalCall.calls);

    // Encode transfer remote call
    const transferRemoteCall = getSuperchainBridgeTransaction({
        token: wrappedToken,
        recipient,
        amount,
        destination,
    });
    calls.push({ ...transferRemoteCall, account });

    return { calls };
}
