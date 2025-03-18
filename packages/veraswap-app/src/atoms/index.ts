import { atom, WritableAtom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { quoteQueryOptions, UNISWAP_CONTRACTS, getRemoteTokenAddressAndBridge } from "@owlprotocol/veraswap-sdk";
import { parseUnits, zeroAddress } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";

import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { chainInAtom } from "./chain.js";
import { poolKeyInAtom } from "./pool-key.js";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry.js";
import { config } from "@/config.js";

//TODO: Add additional atom write logic to clear values when certain atoms are written (eg. when network is changed, tokenIn should be cleared), for now this can be done manually

export const hyperlaneRegistryQueryAtom = atomWithQuery(hyperlaneRegistryOptions);

export const remoteTokenInfoAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    const chainIn = get(chainInAtom);

    if (!tokenOut || !chainIn) return null;

    return getRemoteTokenAddressAndBridge(tokenOut.chainId, tokenOut.address, chainIn.id);
});

export const tokenInAmountInputAtom = atom<string>("");
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;
    return parseUnits(tokenInAmountInput, tokenIn.decimals!);
});

const emptyToken = new Token(1, zeroAddress, 1);
const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emptyPoolKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress,
};

// Uniswap Quote
// type inference fails?
export const quoteInAtom = atomWithQuery((get) => {
    const poolKey = get(poolKeyInAtom);
    const chainIn = get(chainInAtom);
    const tokenIn = get(tokenInAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const enabled = !!poolKey && !!chainIn && !!tokenInAmount;
    //TODO: Should we create these classes in the atoms? => Might pose challenge if we add custom fields
    const chainId = chainIn?.id ?? 0;
    const currencyIn = tokenIn ? new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals) : emptyToken;
    const exactCurrencyAmount =
        tokenIn && tokenInAmount
            ? CurrencyAmount.fromRawAmount(currencyIn, tokenInAmount.toString())
            : emptyCurrencyAmount;
    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId].QUOTER : zeroAddress;

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey: poolKey ?? emptyPoolKey,
            exactCurrencyAmount: exactCurrencyAmount,
            quoteType: "quoteExactInputSingle",
            quoterAddress,
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>;

export * from "./allowance.js";
export * from "./chain.js";
export * from "./hyperlane-helpers.js";
export * from "./pool-key.js";
export * from "./step.js";
export * from "./token-balance.js";
export * from "./tokens.js";
export * from "./transaction.js";
