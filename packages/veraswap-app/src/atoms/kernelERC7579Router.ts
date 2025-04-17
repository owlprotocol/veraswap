import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { HYPERLANE_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
import { readContractQueryOptions } from "@wagmi/core/query";
import { ERC7579ExecutorRouter } from "@owlprotocol/veraswap-sdk/artifacts";
import { chainInAtom, chainOutAtom } from "./tokens.js";

import { disabledQueryOptions } from "./disabledQuery.js";
import { kernelAddressChainInQueryAtom, kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { accountAtom } from "./account.js";
import { config } from "@/config.js";

export const erc7579RouterAccountIsOwnerChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddressChainIn } = get(kernelAddressChainInQueryAtom);

    if (!chainIn || !chainOut || !kernelAddressChainIn || !account?.address) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id].erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id].erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: erc7579RouterIn,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddressChainIn, chainOut.id, erc7579RouterOut, account.address],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterAccountIsOwnerChainOutQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddressChainOut } = get(kernelAddressChainOutQueryAtom);

    if (!chainIn || !chainOut || !kernelAddressChainOut || !account?.address) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id].erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id].erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddressChainOut, chainIn.id, erc7579RouterIn, account.address],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterKernelIsOwnerChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const { data: kernelAddressChainIn } = get(kernelAddressChainInQueryAtom);
    const { data: kernelAddressChainOut } = get(kernelAddressChainOutQueryAtom);

    if (!chainIn || !chainOut || !kernelAddressChainIn || !kernelAddressChainOut) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id].erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id].erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: erc7579RouterIn,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddressChainIn, chainOut.id, erc7579RouterOut, kernelAddressChainOut],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterKernelIsOwnerChainOutQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const { data: kernelAddressChainIn } = get(kernelAddressChainInQueryAtom);
    const { data: kernelAddressChainOut } = get(kernelAddressChainOutQueryAtom);

    if (!chainIn || !chainOut || !kernelAddressChainOut || !kernelAddressChainIn) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id].erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id].erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddressChainOut, chainIn.id, erc7579RouterIn, kernelAddressChainIn],
    });
}) as Atom<AtomWithQueryResult<boolean>>;
