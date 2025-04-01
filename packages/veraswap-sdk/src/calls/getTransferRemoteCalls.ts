import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, Hex } from "viem";

import { CallArgs } from "../smartaccount/ExecLib.js";
import { getTransferRemoteCall } from "../swap/getTransferRemoteCall.js";
import { HypERC20Collateral } from "../artifacts/HypERC20Collateral.js";
import { getERC20TransferFromCalls } from "./getERC20TransferFromCalls.js";
import { getERC20ApproveCalls } from "./getERC20ApproveCalls.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetTransferRemoteCallsParams extends GetCallsParams {
    funder: Address;
    tokenStandard: "HypERC20" | "HypERC20Collateral";
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
}

/**
 * Get call to fund & set appprovals for `TokenRouter.transferRemote` call
 * @dev Make sure to check `owner` balance is sufficient beforehand (if needed)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getTransferRemoteCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetTransferRemoteCallsParams,
): Promise<GetCallsReturnType> {
    const { chainId, account, funder, tokenStandard, token, destination, recipient, amount, hookMetadata, hook } =
        params;
    const calls: CallArgs[] = [];

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

    // Fund owner if necessary
    const transferFromCall = await getERC20TransferFromCalls(queryClient, wagmiConfig, {
        chainId,
        token: wrappedToken,
        account,
        funder,
        minAmount: amount,
    });
    calls.push(...transferFromCall.calls);

    // Approve HypERC20Collateral and call `transferRemote`
    const transferRemoteCall = await getTransferRemoteWithApprovalCalls(queryClient, wagmiConfig, {
        chainId,
        account,
        tokenStandard,
        token,
        destination,
        recipient,
        amount,
        hookMetadata,
        hook,
    });
    calls.push(...transferRemoteCall.calls);

    return { calls };
}

export interface GetTransferRemoteWithApprovalCallsParams extends GetCallsParams {
    tokenStandard: "HypERC20" | "HypERC20Collateral";
    token: Address;
    destination: number;
    recipient: Address;
    amount: bigint;
    hookMetadata?: Hex;
    hook?: Address;
}

/**
 * Get `IERC20.approve` call (if HypERC20Collateral) and `TokenRouter.transferRemote` call
 * @dev Make sure to check `owner` balance is sufficient beforehand (if needed)
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getTransferRemoteWithApprovalCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetTransferRemoteWithApprovalCallsParams,
): Promise<{ calls: CallArgs[] }> {
    const { chainId, account, tokenStandard, token, destination, recipient, amount, hookMetadata, hook } = params;

    const calls: CallArgs[] = [];

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
    calls.push(transferRemoteCall);

    return { calls };
}
