import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, Hex } from "viem";

import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { getTransferRemoteCall } from "../swap/getTransferRemoteCall.js";

import { getERC20ApproveCalls } from "./ERC20/getERC20ApproveCalls.js";
import { GetCallsParams } from "./getCalls.js";

export interface GetTransferRemoteWithApproveCallsParams extends GetCallsParams {
    tokenStandard: "HypERC20" | "HypERC20Collateral";
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
    approveAmount?: bigint | "MAX_UINT_256";
}

/**
 * Get `IERC20.approve` call (if HypERC20Collateral) and `TokenRouter.transferRemote` call
 * @dev Make sure to check `owner` balance is sufficient beforehand (if needed)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getTransferRemoteWithApproveCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetTransferRemoteWithApproveCallsParams,
): Promise<{ calls: (CallArgs & { account: Address })[] }> {
    const { chainId, account, tokenStandard, token, destination, recipient, amount, hookMetadata, hook } = params;

    const calls: (CallArgs & { account: Address })[] = [];

    // Start fetching gas payment quote in background
    const gasPaymentPromise = queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: token,
            abi: HypERC20Collateral.abi,
            functionName: "quoteGasPayment",
            args: [destination],
        }),
    );

    if (tokenStandard === "HypERC20Collateral") {
        // HypERC20Collateral requires approval for wrapped token
        const wrappedToken = await queryClient.fetchQuery(
            readContractQueryOptions(wagmiConfig, {
                chainId,
                address: token,
                abi: HypERC20Collateral.abi,
                functionName: "wrappedToken",
                args: [],
            }),
        );
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
    }

    const gasPayment = await gasPaymentPromise;

    // Encode transfer remote call
    const transferRemoteCall = getTransferRemoteCall({
        address: token,
        destination,
        recipient,
        amount,
        hook,
        hookMetadata,
        bridgePayment: gasPayment,
    });
    calls.push({ ...transferRemoteCall, account });

    return { calls };
}
