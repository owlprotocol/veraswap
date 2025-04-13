import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData, Hex } from "viem";
import { getBytecodeQueryOptions, readContractQueryOptions } from "wagmi/query";

import { KernelFactory } from "../artifacts/KernelFactory.js";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";

export interface GetKernelFactoryCreateAccountParams extends GetCallsParams {
    initData: Hex;
    salt: Hex;
    factoryAddress: Address;
}

export interface GetKernelFactoryCreateAccountReturnType extends GetCallsReturnType {
    exists: boolean;
    kernelAddress: Address;
}

/**
 * Call `ERC7579ExecutorRouter.setAccountOwners(owners)` for owners in undesired state
 * @param queryClient
 * @param wagmiConfig
 * @param params
 */
export async function getKernelFactoryCreateAccountCalls(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetKernelFactoryCreateAccountParams,
): Promise<GetKernelFactoryCreateAccountReturnType> {
    const { chainId, account, initData, salt, factoryAddress } = params;

    const kernelAddress = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId,
            address: factoryAddress,
            abi: KernelFactory.abi,
            functionName: "getAddress",
            args: [initData, salt],
        }),
    );

    const code: Hex | undefined = await queryClient.fetchQuery(
        getBytecodeQueryOptions(wagmiConfig, { chainId, address: kernelAddress }),
    );

    if (code && code !== "0x") {
        return { kernelAddress, exists: true, calls: [] };
    }

    const call = {
        account,
        to: factoryAddress,
        data: encodeFunctionData({
            abi: KernelFactory.abi,
            functionName: "createAccount",
            args: [initData, salt],
        }),
        value: 0n,
    };

    return { kernelAddress, exists: false, calls: [call] };
}
