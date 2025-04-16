import { atomWithQuery } from "jotai-tanstack-query";
import { getBytecode, getClient } from "@wagmi/core";
import { Client, LocalAccount } from "viem";
import {
    kernelSmartAccountAddressQueryOptions,
    kernelSmartAccountInitDataQueryOptions,
} from "@owlprotocol/veraswap-sdk";
import { chainInAtom, chainOutAtom } from "./tokens.js";

import { accountAtom } from "./account.js";
import { config } from "@/config.js";

export const kernelSmartAccountInitDataAtom = atomWithQuery((get) => {
    const account = get(accountAtom);
    const chain = get(chainInAtom);
    // TODO: check account is defined
    const signer = account.address ? ({ type: "local", address: account.address } as LocalAccount) : undefined;

    const client = getClient(config, { chainId: chain?.id }) as Client;

    return kernelSmartAccountInitDataQueryOptions({ signer, client });
});

export const kernelSmartAccountAddressAtom = atomWithQuery((get) => {
    const initData = get(kernelSmartAccountInitDataAtom).data ?? null;
    return kernelSmartAccountAddressQueryOptions(initData);
});

export const kernelExistChainInAtom = atomWithQuery((get) => {
    const { data: address } = get(kernelSmartAccountAddressAtom);
    const chain = get(chainInAtom);
    const chainId = chain?.id ?? undefined;

    return {
        queryKey: ["kernelAccountExists", "chainIn", address, chainId],
        queryFn: async () => {
            if (!address || chainId) return;

            return await getBytecode(config, {
                address,
                chainId,
            });
        },
        staleTime: Infinity,
        enabled: !!address && !!chainId,
    };
});

export const kernelExistsChainOutAtom = atomWithQuery((get) => {
    const { data: address } = get(kernelSmartAccountAddressAtom);
    const chain = get(chainOutAtom);
    const chainId = chain?.id ?? undefined;

    return {
        queryKey: ["kernelAccountExists", "chainOut", address, chainId],
        queryFn: async () => {
            if (!address || !chainId) return;

            return await getBytecode(config, {
                address,
                chainId,
            });
        },
        staleTime: Infinity,
        enabled: !!address && !!chainId,
    };
});
