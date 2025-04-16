import { queryOptions } from "@tanstack/react-query";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toKernelPluginManager } from "@zerodev/sdk/accounts";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Address, Chain, Client, Hex, LocalAccount, Transport } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";

import { LOCAL_KERNEL_CONTRACTS } from "../constants/kernel.js";
import { getKernelInitData } from "../smartaccount/getKernelInitData.js";
import { installOwnableExecutor } from "../smartaccount/OwnableExecutor.js";

export interface KernelInitParams {
    owner: Address;
    client: Client<Transport, Chain>;
}

export async function kernelInitDataQueryFn({ owner, client }: KernelInitParams): Promise<Hex> {
    const entryPoint = { address: entryPoint07Address, version: "0.7" } as const;
    const signer = { type: "local", address: owner } as LocalAccount;

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
                owner,
                executor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
            }),
        ],
    });
}

export function kernelInitDataQueryOptions({ owner, client }: KernelInitParams) {
    return queryOptions({
        queryKey: ["kernelInitData", client.chain.id, owner],
        queryFn: () => kernelInitDataQueryFn({ owner, client }),
    });
}
