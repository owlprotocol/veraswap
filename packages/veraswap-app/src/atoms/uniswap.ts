import { atomWithQuery, AtomWithQueryResult, queryClientAtom } from "jotai-tanstack-query";
import {
    getRouteMultichain,
    getUniswapV4Address,
    getTransactionType,
    TransactionType,
} from "@owlprotocol/veraswap-sdk";
import { atom, Atom } from "jotai";
import { numberToHex } from "viem";
import { CURRENCY_HOPS, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk/constants";
import { queryOptions } from "@tanstack/react-query";
import { currencyInAtom, currencyOutAtom, tokenInAmountAtom } from "./tokens.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

// const emptyToken = new Token(1, zeroAddress, 1);
// const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);

//TODO: As tanstack query so that it refreshes
export const routeMultichainAtom = atomWithQuery((get) => {
    const queryClient = get(queryClientAtom);
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);
    const exactAmount = get(tokenInAmountAtom);

    if (!currencyIn || !currencyOut || !exactAmount) return disabledQueryOptions as any;

    const currencyInAddress = getUniswapV4Address(currencyIn);
    const currencyOutAddress = getUniswapV4Address(currencyOut);

    return queryOptions({
        queryFn: async () => {
            const route = await getRouteMultichain(queryClient, config, {
                currencyIn,
                currencyOut,
                exactAmount,
                contractsByChain: UNISWAP_CONTRACTS,
                currencyHopsByChain: CURRENCY_HOPS,
            });

            console.debug({ route });

            return route;
        },
        queryKey: [
            "getRouteMultichain",
            currencyIn.chainId,
            currencyInAddress,
            currencyOut.chainId,
            currencyOutAddress,
            numberToHex(exactAmount),
        ],
    });
}) as Atom<AtomWithQueryResult<Awaited<ReturnType<typeof getRouteMultichain>>>>;

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<TransactionType | null>((get) => {
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);

    const routeMultichain = get(routeMultichainAtom).data;
    if (!currencyIn || !currencyOut || !routeMultichain) return null;

    //TODO: Add better constants
    return getTransactionType({ currencyIn, currencyOut, routeComponents: routeMultichain.flows });
});

export const submittedTransactionTypeAtom = atom<TransactionType | null>(null);
