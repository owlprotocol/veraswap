import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress } from "viem";
import { readContractQueryOptions } from "wagmi/query";
import { getAccount } from "@wagmi/core";
import { balanceOf as balanceOfAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";

import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { config } from "@/config.js";

// Selected tokenIn balance
export const tokenInBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBalanceQueryAtom).data ?? null;
});

// Selected tokenOut balance
export const tokenOutBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenOut = get(tokenOutAtom);
    const enabled = !!tokenOut || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenOut?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenOut?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenOutBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenOutBalanceQueryAtom).data ?? null;
});
