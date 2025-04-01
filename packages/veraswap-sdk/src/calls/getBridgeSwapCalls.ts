import { QueryClient } from "@tanstack/react-query";
import { Address, Hex } from "viem";
import { Config } from "wagmi";
import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { getTransferRemoteCalls } from "./getTransferRemoteCalls.js";

export interface GetBridgeSwapCallsParams extends GetCallsParams {
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
 * Get bridge swap calls
 * @param _queryClient
 * @param _wagmiConfig
 */
export function getBridgeSwapCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetBridgeSwapCallsParams,
): Promise<GetCallsReturnType> {
    //TODO: Add swap calls
    return getTransferRemoteCalls(queryClient, wagmiConfig, params);
}
