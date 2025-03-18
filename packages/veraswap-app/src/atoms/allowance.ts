import { PERMIT2_ADDRESS, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress } from "viem";
import { getAccount } from "@wagmi/core";
import { readContractQueryOptions } from "wagmi/query";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { tokenInAtom } from "./tokens.js";
import { config } from "@/config.js";

// Selected tokenIn Permit2 allowance
export const tokenInPermit2AllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "allowance",
            args: [account.address ?? zeroAddress, PERMIT2_ADDRESS],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInPermit2AllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInPermit2AllowanceQueryAtom).data ?? null;
});
// Selected tokenIn UniversalRouter allowance (via Permit2)
export const tokenInRouterAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowancePermit2Abi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: PERMIT2_ADDRESS,
            functionName: "allowance",
            args: [
                account.address ?? zeroAddress,
                tokenIn?.address ?? zeroAddress,
                tokenIn?.chainId ? UNISWAP_CONTRACTS[tokenIn.chainId].UNIVERSAL_ROUTER : zeroAddress,
            ],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInRouterAllowanceAtom = atom<bigint | null>((get) => {
    const data = get(tokenInRouterAllowanceQueryAtom).data;
    return data ? data[0] : null;
});
