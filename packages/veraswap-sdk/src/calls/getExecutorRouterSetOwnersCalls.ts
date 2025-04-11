import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData } from "viem";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";

export interface GetExecutorRouterSetOwnersParams extends GetCallsParams {
    router: Address;
    owners: { domain: number; router: Address; owner: Address; enabled: boolean }[];
}

export interface GetExecutorRouterSetOwnersReturnType extends GetCallsReturnType {
    isOwner: readonly boolean[];
}

/**
 * Call `ERC7579ExecutorRouter.setAccountOwners(owners)` for owners in undesired state
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getExecutorRouterSetOwnersCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetExecutorRouterSetOwnersParams,
): Promise<GetExecutorRouterSetOwnersReturnType> {
    const { chainId, account, router, owners } = params;

    const isOwner = await Promise.all(
        owners.map((owner) =>
            queryClient.fetchQuery(
                readContractQueryOptions(wagmiConfig, {
                    chainId,
                    address: router,
                    abi: ERC7579ExecutorRouter.abi,
                    functionName: "owners",
                    args: [account, owner.domain, owner.router, owner.owner],
                }),
            ),
        ),
    );
    // Find all owner configs that do not match
    const ownerUpdates = owners.filter((owner, idx) => owner.enabled != isOwner[idx]);
    if (ownerUpdates.length == 0) {
        // Skip update if all owners are already in desired state
        return { isOwner, calls: [] };
    }

    const call = {
        account,
        to: router,
        data: encodeFunctionData({
            abi: ERC7579ExecutorRouter.abi,
            functionName: "setAccountOwners",
            args: [ownerUpdates],
        }),
        value: 0n,
    };
    return { isOwner, calls: [call] };
}
