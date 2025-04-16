import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { getClient } from "@wagmi/core";
import { Address, Chain, Client, Hash, Hex, LocalAccount, numberToHex, Transport, zeroHash } from "viem";
import { kernelInitDataQueryOptions, LOCAL_KERNEL_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
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
    const chain = get(chainInAtom);
    if (!account?.address || !chain) return disabledQueryOptions as any;

    //Note: This doesn't actually matter rn
    const client = getClient(config, { chainId: chain.id }) as Client<Transport, Chain>;

    return kernelInitDataQueryOptions({ owner: account.address, client });
}) as unknown as Atom<AtomWithQueryResult<Hex>>;

export const kernelFactoryGetAddressAtomFamily = atomFamily(
    ({
        chainId,
        factoryAddress,
        initData,
        initSalt,
    }: {
        chainId: number;
        factoryAddress: Address;
        initData: Hex;
        initSalt: Hash;
    }) =>
        atomWithQuery<Address>(() => {
            return readContractQueryOptions(config, {
                chainId,
                address: factoryAddress,
                abi: KernelFactory.abi,
                functionName: "getAddress",
                args: [initData, initSalt],
            }) as any;
        }),
    (a, b) =>
        a.chainId === b.chainId &&
        a.factoryAddress === b.factoryAddress &&
        a.initData === b.initData &&
        a.initSalt === b.initSalt,
) as unknown as AtomFamily<
    { chainId: number; factoryAddress: Address; initData: Hex; initSalt: Hash },
    Atom<AtomWithQueryResult<Address>>
>;

export const kernelAddressChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: initData } = get(kernelInitDataAtom);
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    if (!chainIn || !initData || !factoryAddress) return get(disabledQueryAtom) as any;

    return get(
        kernelFactoryGetAddressAtomFamily({ chainId: chainIn.id, factoryAddress, initData, initSalt: zeroHash }),
    );
}) as Atom<AtomWithQueryResult<Address>>;

export const kernelAddressChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: initData } = get(kernelInitDataAtom);
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    if (!chainOut || !initData || !factoryAddress) return get(disabledQueryAtom) as any;

    return get(
        kernelFactoryGetAddressAtomFamily({ chainId: chainOut.id, factoryAddress, initData, initSalt: zeroHash }),
    );
}) as Atom<AtomWithQueryResult<Address>>;

export const kernelBytecodeChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: address } = get(kernelAddressChainInQueryAtom);

    if (!chainIn || !address) return disabledQueryOptions as any;

    return getBytecodeQueryOptions(config, {
        chainId: chainIn.id,
        address,
    });
}) as Atom<AtomWithQueryResult<Hex>>;

export const kernelBytecodeChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: address } = get(kernelAddressChainOutQueryAtom);

    if (!chainOut || !address) return disabledQueryOptions as any;

    return getBytecodeQueryOptions(config, {
        chainId: chainOut.id,
        address,
    });
}) as Atom<AtomWithQueryResult<Hex>>;
