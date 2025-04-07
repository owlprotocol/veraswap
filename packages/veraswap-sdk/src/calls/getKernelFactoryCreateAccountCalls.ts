import { Config } from "@wagmi/core";
import { QueryClient } from "@tanstack/react-query";

import { readContractQueryOptions, getBytecodeQueryOptions } from "wagmi/query";
import { Address, encodeFunctionData, Hex } from "viem";

import { GetCallsParams, GetCallsReturnType } from "./getCalls.js";
import { KernelFactory } from "../artifacts/KernelFactory.js";

export interface GetKernelFactoryCreateAccountParams extends GetCallsParams {
    initData: Hex;
    salt: Hex;
    factoryAddress: Address;
}

export interface GetKernelFactoryCreateAccountReturnType extends GetCallsReturnType {
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
        return { kernelAddress, calls: [] };
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

    return { kernelAddress, calls: [call] };
}
