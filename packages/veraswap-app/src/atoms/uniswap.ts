import { atomWithQuery, AtomWithQueryResult, queryClientAtom } from "jotai-tanstack-query";
import {
    getRouteSteps,
    getUniswapV4Address,
    CURRENCY_HOPS,
    UNISWAP_CONTRACTS,
    isRouteSwap,
    isRouteBridge,
    isRouteSwapBridge,
    isRouteBridgeSwap,
} from "@owlprotocol/veraswap-sdk";
import { atom, Atom } from "jotai";
import { numberToHex } from "viem";
import { queryOptions } from "@tanstack/react-query";
import { currencyInAtom, currencyOutAtom, tokenInAmountAtom } from "./tokens.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

export const routeStepsAtom = atomWithQuery((get) => {
    const queryClient = get(queryClientAtom);
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);
    const amountIn = get(tokenInAmountAtom);

    if (!currencyIn || !currencyOut || !amountIn) return disabledQueryOptions as any;

    const currencyInAddress = getUniswapV4Address(currencyIn);
    const currencyOutAddress = getUniswapV4Address(currencyOut);

    return queryOptions({
        queryFn: async () => {
            const route = await getRouteSteps(queryClient, config, {
                currencyIn,
                currencyOut,
                amountIn,
                currencyHopsByChain: CURRENCY_HOPS,
                contractsByChain: UNISWAP_CONTRACTS,
            });

            return route;
        },
        queryKey: [
            "getRouteSteps",
            currencyIn.chainId,
            currencyInAddress,
            currencyOut.chainId,
            currencyOutAddress,
            numberToHex(amountIn),
        ],
    });
}) as Atom<AtomWithQueryResult<Awaited<ReturnType<typeof getRouteSteps>>>>;

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<"BRIDGE" | "SWAP" | "SWAP_BRIDGE" | "BRIDGE_SWAP" | null>((get) => {
    const steps = get(routeStepsAtom).data;
    if (!steps) return null;
    if (isRouteBridge(steps)) return "BRIDGE";
    if (isRouteSwap(steps)) return "SWAP";
    if (isRouteSwapBridge(steps)) return "SWAP_BRIDGE";
    if (isRouteBridgeSwap(steps)) return "BRIDGE_SWAP";

    return null;
});

export const submittedTransactionTypeAtom = atom<"BRIDGE" | "SWAP" | "SWAP_BRIDGE" | "BRIDGE_SWAP" | null>(null);
