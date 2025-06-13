import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address } from "viem";

import { STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { StargateTokenQuote, StargateTokenSymbol } from "../query/stargateTokenQuote.js";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { getStargateTokenBridgeTransaction } from "../stargate/getStargateTokenBridgeTransaction.js";

import { getERC20ApproveCalls } from "./ERC20/getERC20ApproveCalls.js";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getPermit2TransferFromCalls } from "./Permit2/getPermit2TransferFromCalls.js";

export interface GetStargateBridgeWithFunderCallsParams extends GetCallsParams {
    funder: Address;
    token: Address;
    tokenSymbol: StargateTokenSymbol;
    destination: number;
    recipient: Address;
    amount: bigint;
    stargateQuote: StargateTokenQuote;
    approveAmount?: bigint | "MAX_UINT_256";
    permit2?: {
        approveAmount?: bigint | "MAX_UINT_160";
        minExpiration?: number;
        approveExpiration?: number | "MAX_UINT_48";
        sigDeadline?: bigint;
    };
}

/**
 * Get call to fund & set approvals for Stargate bridge call
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getStargateBridgeWithFunderCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetStargateBridgeWithFunderCallsParams,
): Promise<GetCallsReturnType> {
    const { chainId, account, funder, token, destination, recipient, amount, stargateQuote, tokenSymbol } = params;

    // Default to MAX_UINT_160 if not provided
    const permit2 = {
        approveAmount: params.permit2?.approveAmount ?? "MAX_UINT_160",
        minExpiration: params.permit2?.minExpiration,
        approveExpiration: params.permit2?.approveExpiration ?? "MAX_UINT_48",
        sigDeadline: params.permit2?.sigDeadline,
    };

    const calls: (CallArgs & { account: Address })[] = [];

    const transferFromCall = await getPermit2TransferFromCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account,
        funder,
        minAmount: amount,
        ...permit2,
    });
    calls.push(...transferFromCall.calls);

    const pools = STARGATE_TOKEN_POOLS[tokenSymbol];
    const poolAddress = pools[chainId as keyof typeof pools];

    const erc20ApproveCalls = await getERC20ApproveCalls(queryClient, wagmiConfig, {
        chainId,
        token,
        account,
        spender: poolAddress,
        minAmount: amount,
        approveAmount: amount,
    });

    // NOTE: erc20ApproveCalls can be an empty array if there is no approval needed
    calls.push(...erc20ApproveCalls.calls);

    const stargateTx = getStargateTokenBridgeTransaction({
        srcChain: chainId,
        dstChain: destination,
        tokenSymbol: params.tokenSymbol,
        receiver: recipient,
        stargateQuote,
    });
    calls.push({ ...stargateTx, account });

    return { calls };
}
