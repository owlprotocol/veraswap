import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { HYPERLANE_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
import { readContractQueryOptions } from "@wagmi/core/query";
import { ERC7579ExecutorRouter } from "@owlprotocol/veraswap-sdk/artifacts";
import { chainInAtom, chainOutAtom } from "./tokens.js";

import { disabledQueryOptions } from "./disabledQuery.js";
import { accountAtom } from "./account.js";
import { kernelAddressQueryAtom } from "./kernelSmartAccount.js";
import { config } from "@/config.js";

export const erc7579RouterAccountIsOwnerChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelAddressQueryAtom);

    if (!chainIn || !chainOut || !kernelAddress || !account?.address) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id]?.erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: erc7579RouterIn,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, chainOut.id, erc7579RouterOut, account.address],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterAccountIsOwnerChainOutQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const account = get(accountAtom);
    const { data: kernelAddress } = get(kernelAddressQueryAtom);

    if (!chainIn || !chainOut || !kernelAddress || !account?.address) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id]?.erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, chainIn.id, erc7579RouterIn, account.address],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterKernelIsOwnerChainInQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const { data: kernelAddress } = get(kernelAddressQueryAtom);

    if (!chainIn || !chainOut || !kernelAddress) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id]?.erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: erc7579RouterIn,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, chainOut.id, erc7579RouterOut, kernelAddress],
    });
}) as Atom<AtomWithQueryResult<boolean>>;

export const erc7579RouterKernelIsOwnerChainOutQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const { data: kernelAddress } = get(kernelAddressQueryAtom);

    if (!chainIn || !chainOut || !kernelAddress) {
        return disabledQueryOptions as any;
    }

    const erc7579RouterIn = HYPERLANE_CONTRACTS[chainIn.id]?.erc7579Router;
    const erc7579RouterOut = HYPERLANE_CONTRACTS[chainOut.id]?.erc7579Router;

    if (!erc7579RouterIn || !erc7579RouterOut) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: chainOut.id,
        address: erc7579RouterOut,
        abi: ERC7579ExecutorRouter.abi,
        functionName: "owners",
        args: [kernelAddress, chainIn.id, erc7579RouterIn, kernelAddress],
    });
}) as Atom<AtomWithQueryResult<boolean>>;
