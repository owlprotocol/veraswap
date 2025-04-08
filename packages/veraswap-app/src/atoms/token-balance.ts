import { balanceOf as balanceOfAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { GetBalanceReturnType } from "@wagmi/core";
import { atomWithQuery } from "jotai-tanstack-query";
import { Address, zeroAddress } from "viem";
import { Token } from "@owlprotocol/veraswap-sdk";
import { accountAtom, tokensAtom } from "./index.js";
import { config } from "@/config.js";

export const tokenBalanceAtomFamily = atomFamily((token: Token) =>
    atomWithQuery<number>((get) => {
        const account = get(accountAtom);
        const address = account?.address ?? zeroAddress;
        const isConnected = !!account?.address;

        if (token.standard === "NativeToken") {
            return {
                ...(getBalanceQueryOptions(config, {
                    address: address as Address,
                    chainId: token.chainId,
                }) as any),
                enabled: isConnected,
                select: (data: GetBalanceReturnType) => Number(data.value) / 10 ** token.decimals,
            };
        }

        return {
            ...(readContractQueryOptions(config, {
                abi: [balanceOfAbi],
                chainId: token.chainId,
                address: token.address as Address,
                functionName: "balanceOf",
                args: [address],
            }) as any),
            enabled: isConnected,
            select: (data: bigint) => Number(data) / 10 ** token.decimals,
        };
    }),
);

export const tokenBalancesAtom = atom((get) => {
    const allTokens = get(tokensAtom);
    const account = get(accountAtom);

    return allTokens.map((token) => ({
        token,
        balance: account.address ? get(tokenBalanceAtomFamily(token)).data : 0,
    }));
});
