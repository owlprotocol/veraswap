import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";

import { OwnableSignatureExecutor } from "../artifacts/OwnableSignatureExecutor.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetOwnableExecutorAddOwnerCallsParams extends GetCallsParams {
    executor: Address;
    owner: Address;
}

export interface GetOwnableExecutorAddOwnerCallsReturnType extends GetCallsReturnType {
    isInitialized: boolean;
    owners: readonly Address[];
}

/**
 * Call `OwnableExecutor.addOwner(owner)` if `owner` is not yet added
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getOwnableExecutorAddOwnerCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetOwnableExecutorAddOwnerCallsParams,
): Promise<GetOwnableExecutorAddOwnerCallsReturnType> {
    const { chainId, account, executor, owner } = params;

    const isInitialized = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: executor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "isInitialized",
            args: [account],
        }),
    );

    if (!isInitialized) {
        // Skip `getOwners` call as it will revert
        const call = {
            account,
            to: executor,
            data: encodeFunctionData({
                abi: OwnableSignatureExecutor.abi,
                functionName: "addOwner",
                args: [owner],
            }),
            value: 0n,
        };
        return { isInitialized, owners: [], calls: [call] };
    }

    const owners = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: executor,
            abi: OwnableSignatureExecutor.abi,
            functionName: "getOwners",
            args: [account],
        }),
    );

    if (owners.includes(owner)) {
        return { isInitialized, owners, calls: [] };
    }

    const call = {
        account,
        to: executor,
        data: encodeFunctionData({
            abi: OwnableSignatureExecutor.abi,
            functionName: "addOwner",
            args: [owner],
        }),
        value: 0n,
    };
    return { isInitialized, owners, calls: [call] };
}
