import { queryOptions } from "@tanstack/react-query";
import { zeroHash, Address, zeroAddress, LocalAccount, Client } from "viem";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { entryPoint07Address } from "viem/account-abstraction";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { getKernelAddress } from "../smartaccount/getKernelAddress.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";

interface KernelAddressParams {
    signer: LocalAccount | undefined;
    client: Client | undefined;
}

async function getKernelSmartAccountAddress({ signer, client }: KernelAddressParams): Promise<Address | null> {
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

    const initData = await getKernelInitData({
        kernelPluginManager,
        initHook: false,
        initConfig: [
            installOwnableExecutor({
                owner: signer.address ?? zeroAddress,
                executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            }),
        ],
    });

    return getKernelAddress({
        data: initData,
        salt: zeroHash,
        implementation: LOCAL_KERNEL_CONTRACTS.kernel,
        factoryAddress: LOCAL_KERNEL_CONTRACTS.kernelFactory,
    });
}

export function kernelSmartAccountQueryOptions(params: KernelAddressParams) {
    return queryOptions({
        queryKey: ["kernelSmartAccount", params.signer?.address, params.client?.chain?.id],
        queryFn: () => getKernelSmartAccountAddress(params),
        enabled: !!params.signer?.address && !!params.client?.chain?.id,
    });
}
