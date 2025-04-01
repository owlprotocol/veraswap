import { Address } from "viem";
import { CallArgs } from "../smartaccount/ExecLib.js";
import { QueryClient } from "@tanstack/react-query";
import { Config } from "wagmi";

/**
 * Common params for all `get*Calls` functions
 */
export interface GetCallsParams {
    chainId: number;
    account: Address;
}

/**
 * Common return type for all `get*Calls` functio
 */
export interface GetCallsReturnType {
    calls: CallArgs[];
}

/**
 * Get calls function type
 * Note: `satisfies` keyword does not work on function declarations so just here for informational purposes
 * https://github.com/microsoft/TypeScript/issues/51556
 */
export type GetCallsFn<P extends GetCallsParams = GetCallsParams, R extends GetCallsReturnType = GetCallsReturnType> = (
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: P,
) => R;
