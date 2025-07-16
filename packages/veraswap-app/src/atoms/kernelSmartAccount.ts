import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { getClient } from "@wagmi/core";
import { Address, Chain, Client, Hash, Hex, Transport, zeroHash } from "viem";
import { kernelInitDataQueryOptions, LOCAL_KERNEL_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { atom, Atom } from "jotai";
import { getBytecodeQueryOptions, readContractQueryOptions } from "@wagmi/core/query";
import { KernelFactory } from "@owlprotocol/veraswap-sdk/artifacts/KernelFactory";
import { atomFamily } from "jotai/utils";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { chainInAtom, chainOutAtom } from "./tokens.js";

import { accountAtom } from "./account.js";
import { disabledQueryAtom, disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

export const kernelInitDataAtom = atomWithQuery((get) => {
    const account = get(accountAtom);
    if (!account?.address) return disabledQueryOptions as any;

    // Hardcode chain id since kernel address is the same on all chains
    const client = getClient(config, { chainId: 1 }) as Client<Transport, Chain>;
    if (!client.chain.id) return disabledQueryAtom as any;

    return kernelInitDataQueryOptions({ owner: account.address, client });
}) as unknown as Atom<AtomWithQueryResult<Hex>>;

export const kernelAddressQueryAtom = atomWithQuery<Address>((get) => {
    const { data: initData } = get(kernelInitDataAtom);
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    if (!initData || !factoryAddress) return disabledQueryOptions as any;
    // Hardcode chain id since kernel address is the same on all chains
    return readContractQueryOptions(config, {
        chainId: 1,
        address: factoryAddress,
        abi: KernelFactory.abi,
        functionName: "getAddress",
        args: [initData, zeroHash],
    });
}) as Atom<AtomWithQueryResult<Address>>;

export const kernelBytecodeChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: address } = get(kernelAddressQueryAtom);

    if (!chainIn || !address) return disabledQueryOptions as any;

    return getBytecodeQueryOptions(config, {
        chainId: chainIn.id,
        address,
    });
}) as Atom<AtomWithQueryResult<Hex>>;

export const kernelBytecodeChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: address } = get(kernelAddressQueryAtom);

    if (!chainOut || !address) return disabledQueryOptions as any;

    return getBytecodeQueryOptions(config, {
        chainId: chainOut.id,
        address,
    });
}) as Atom<AtomWithQueryResult<Hex>>;
