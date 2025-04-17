import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, numberToHex } from "viem";
import { LOCAL_KERNEL_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
import { readContractQueryOptions } from "@wagmi/core/query";
import { OwnableSignatureExecutor } from "@owlprotocol/veraswap-sdk/artifacts/OwnableSignatureExecutor";
import { chainInAtom, chainOutAtom } from "./tokens.js";

import { disabledQueryOptions } from "./disabledQuery.js";
import { kernelAddressChainInQueryAtom, kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { config } from "@/config.js";

export const executorIsInitializedChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: kernelAddress } = get(kernelAddressChainInQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainIn || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "isInitialized",
        args: [kernelAddress],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const executorIsInitializedChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: kernelAddress } = get(kernelAddressChainOutQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainOut || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "isInitialized",
        args: [kernelAddress],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const executorGetOwnersChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: kernelAddress } = get(kernelAddressChainInQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainIn || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getOwners",
        args: [kernelAddress],
    });
}) as Atom<AtomWithQueryResult<readonly Address[]>>;

export const executorGetOwnersChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: kernelAddress } = get(kernelAddressChainOutQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainOut || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getOwners",
        args: [kernelAddress],
    });
}) as Atom<AtomWithQueryResult<readonly Address[]>>;

export const executorGetNonceChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const { data: kernelAddress } = get(kernelAddressChainInQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainIn || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getNonce",
        args: [kernelAddress, numberToHex(0n) as unknown as bigint],
    });
}) as Atom<AtomWithQueryResult<readonly Address[]>>;

export const executorGetNonceChainOutQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const { data: kernelAddress } = get(kernelAddressChainOutQueryAtom);
    const executor = LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor;

    if (!chainOut || !kernelAddress || !executor) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: executor,
        abi: OwnableSignatureExecutor.abi,
        functionName: "getNonce",
        args: [kernelAddress, numberToHex(0n) as unknown as bigint],
    });
}) as Atom<AtomWithQueryResult<readonly Address[]>>;
