import { QueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { Config } from "wagmi";

import { CallArgs } from "../smartaccount/ExecLib.js";

/**
 * Common params for all `get...Calls` functions with `chainId, account` params
 */
export interface GetCallsParams {
    chainId: number;
    account: Address;
}

/**
 * Common return type for all `get...Calls` functions that return list of `calls`
 */
export interface GetCallsReturnType {
    calls: (CallArgs & { account: Address })[];
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
