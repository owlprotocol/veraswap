import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, encodeFunctionData } from "viem";

import { ERC7579ExecutorRouter } from "../artifacts/ERC7579ExecutorRouter.js";
import { SuperchainERC7579ExecutorRouter } from "../artifacts/SuperchainERC7579ExecutorRouter.js";
import { SUPERCHAIN_ERC7579_ROUTER } from "../constants/superchain.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetExecutorRouterSetOwnersParams extends GetCallsParams {
    router: Address;
    owners: { domain: number; router: Address; owner: Address; enabled: boolean }[];
    withSuperchain?: boolean;
}

export interface GetExecutorRouterSetOwnersReturnType extends GetCallsReturnType {
    isOwner: readonly boolean[];
}

function ownersReadContractQueryOptions(
    wagmiConfig: Config,
    params: {
        chainId: number;
        router: Address;
        account: Address;
        owner: { domain: number; router: Address; owner: Address };
        withSuperchain?: boolean;
    },
) {
    const { chainId, router, account, owner, withSuperchain } = params;
    if (!withSuperchain) {
        return readContractQueryOptions(wagmiConfig, {
            chainId,
            address: router,
            abi: ERC7579ExecutorRouter.abi,
            functionName: "owners",
            args: [account, owner.domain, owner.router, owner.owner],
        });
    }

    return readContractQueryOptions(wagmiConfig, {
        chainId,
        address: SUPERCHAIN_ERC7579_ROUTER,
        abi: SuperchainERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [account, BigInt(owner.domain), owner.owner],
    });
}

function getSetAccountOwnersCall(
    router: Address,
    ownerUpdates: { domain: number; router: Address; owner: Address; enabled: boolean }[],
    withSuperchain?: boolean,
) {
    if (!withSuperchain) {
        return {
            to: router,
            data: encodeFunctionData({
                abi: ERC7579ExecutorRouter.abi,
                functionName: "setAccountOwners",
                args: [ownerUpdates],
            }),
            value: 0n,
        };
    }

    const ownerUpdatesSuperchain = ownerUpdates.map((update) => ({
        domain: BigInt(update.domain),
        owner: update.owner,
        enabled: update.enabled,
    }));

    return {
        to: SUPERCHAIN_ERC7579_ROUTER,
        data: encodeFunctionData({
            abi: SuperchainERC7579ExecutorRouter.abi,
            functionName: "setAccountOwners",
            args: [ownerUpdatesSuperchain],
        }),
        value: 0n,
    };
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
    const { chainId, account, router, owners, withSuperchain } = params;

    const isOwner = await Promise.all(
        owners.map((owner) =>
            queryClient.fetchQuery(
                ownersReadContractQueryOptions(wagmiConfig, { chainId, router, account, owner, withSuperchain }),
            ),
        ),
    );
    // Find all owner configs that do not match
    const ownerUpdates = owners.filter((owner, idx) => owner.enabled != isOwner[idx]);
    if (ownerUpdates.length == 0) {
        // Skip update if all owners are already in desired state
        return { isOwner, calls: [] };
    }

    const call = { ...getSetAccountOwnersCall(router, ownerUpdates, withSuperchain), account };
    return { isOwner, calls: [call] };
}
