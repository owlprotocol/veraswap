import { queryOptions } from "@tanstack/react-query";
import { zeroHash, Address, zeroAddress, LocalAccount, Client, Hash } from "viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { entryPoint07Address } from "viem/account-abstraction";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";

interface KernelParams {
    signer: LocalAccount | undefined;
    client: Client | undefined;
}

export async function getInitData({ signer, client }: KernelParams): Promise<Hash | null> {
    if (!signer || !client) {
        return null;
    }
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;

    const ecdsaValidator = await signerToEcdsaValidator(client, {
        entryPoint,
        kernelVersion: KERNEL_V3_1,
        signer,
        validatorAddress: LOCAL_KERNEL_CONTRACTS.ecdsaValidator,
    });

    const kernelPluginManager = await toKernelPluginManager<"0.7">(client, {
        entryPoint,
        kernelVersion: KERNEL_V3_1,
        sudo: ecdsaValidator,
        chainId: client.chain?.id,
    });

    return getKernelInitData({
        kernelPluginManager,
        initHook: false,
        initConfig: [
            installOwnableExecutor({
                owner: signer.address ?? zeroAddress,
                executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            }),
        ],
    });
}

export function getKernelSmartAccountAddress(initData: Hash | null): Address {
    return getKernelAddress({
        data: initData ?? zeroAddress,
        salt: zeroHash,
        implementation: LOCAL_KERNEL_CONTRACTS.kernel,
        factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
    });
}

export function kernelSmartAccountInitDataQueryOptions(params: KernelParams) {
    return queryOptions({
        queryKey: ["kernelInitData", params.signer?.address, params.client?.chain?.id],
        queryFn: () => getInitData(params),
        enabled: !!params.signer?.address && !!params.client?.chain?.id,
        staleTime: Infinity,
    });
}

export function kernelSmartAccountAddressQueryOptions(initData: Hash | null) {
    return queryOptions({
        queryKey: ["kernelSmartAccountAddress", initData],
        queryFn: () => getKernelSmartAccountAddress(initData),
        enabled: !!initData,
        staleTime: Infinity,
    });
}
