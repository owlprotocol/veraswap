import {
    totalSellTaxBasisPoints as totalSellTaxBasisPointsAbi,
    totalBuyTaxBasisPoints as totalBuyTaxBasisPointsAbi,
} from "@owlprotocol/veraswap-sdk/artifacts/IAgentToken";
import { atomWithQuery, AtomWithQueryResult, queryClientAtom } from "jotai-tanstack-query";
import {
    getRouteMultichain,
    getUniswapV4Address,
    getTransactionType,
    TransactionType,
    MetaQuoteBestType,
} from "@owlprotocol/veraswap-sdk";
import { atom, Atom } from "jotai";
import { numberToHex } from "viem";
import { CURRENCY_HOPS, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk/constants";
import { queryOptions } from "@tanstack/react-query";
import { readContractQueryOptions } from "wagmi/query";
import { currencyInAtom, currencyOutAtom, tokenInAmountWithoutFeesAtom } from "./tokens.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

// const emptyToken = new Token(1, zeroAddress, 1);
// const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);

export const currencyInSellTaxBasisPointsAtom = atomWithQuery((get) => {
    const currencyIn = get(currencyInAtom);
    if (!currencyIn) return disabledQueryOptions as any;

    const currencyInAddress = getUniswapV4Address(currencyIn);

    return readContractQueryOptions(config, {
        abi: [totalSellTaxBasisPointsAbi],
        chainId: currencyIn.chainId,
        address: currencyInAddress,
        functionName: "totalSellTaxBasisPoints",
    });
}) as Atom<AtomWithQueryResult<bigint>>;

export const currencyOutBuyTaxBasisPointsAtom = atomWithQuery((get) => {
    const currencyOut = get(currencyOutAtom);
    if (!currencyOut) return disabledQueryOptions as any;

    const currencyOutAddress = getUniswapV4Address(currencyOut);

    return readContractQueryOptions(config, {
        abi: [totalBuyTaxBasisPointsAbi],
        chainId: currencyOut.chainId,
        address: currencyOutAddress,
        functionName: "totalBuyTaxBasisPoints",
    });
}) as Atom<AtomWithQueryResult<bigint>>;

const BP_DENOM = 10000n; // Basis points denominator
const getAmountExcludingTax = (amount: bigint, taxBasisPoints: bigint) => amount - (amount * taxBasisPoints) / BP_DENOM;

//TODO: As tanstack query so that it refreshes
export const routeMultichainAtom = atomWithQuery((get) => {
    const queryClient = get(queryClientAtom);
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);
    const exactAmount = get(tokenInAmountWithoutFeesAtom);

    if (!currencyIn || !currencyOut || !exactAmount) return disabledQueryOptions as any;

    let amountIn = exactAmount;
    const currencyInSellTaxBasisPoints = get(currencyInSellTaxBasisPointsAtom).data ?? 0n;
    if (currencyInSellTaxBasisPoints > 0n) {
        amountIn = getAmountExcludingTax(amountIn, currencyInSellTaxBasisPoints);
    }

    const currencyOutBuyTaxBasisPoints = get(currencyOutBuyTaxBasisPointsAtom).data ?? 0n;

    const currencyInAddress = getUniswapV4Address(currencyIn);
    const currencyOutAddress = getUniswapV4Address(currencyOut);

    return queryOptions({
        queryFn: async () => {
            const route = await getRouteMultichain(queryClient, config, {
                currencyIn,
                currencyOut,
                exactAmount: amountIn,
                contractsByChain: UNISWAP_CONTRACTS,
                currencyHopsByChain: CURRENCY_HOPS,
            });

            if (route && currencyOutBuyTaxBasisPoints > 0n) {
                const amountOutExcludingTax = getAmountExcludingTax(route.amountOut, currencyOutBuyTaxBasisPoints);

                // Get the first swap component and adjust the amount out for tax
                // WARNING: Post-swap flows computed with pre-tax amounts (eg. stargate quoting)
                const swapFlow = route.flows.find((flow) => flow.type === "SWAP");
                if (swapFlow) {
                    if (swapFlow.quote.bestQuoteType === MetaQuoteBestType.Multihop) {
                        swapFlow.quote.bestQuoteMultihop.variableAmount = amountOutExcludingTax;
                    } else if (swapFlow.quote.bestQuoteType === MetaQuoteBestType.Single) {
                        swapFlow.quote.bestQuoteSingle.variableAmount = amountOutExcludingTax;
                    }
                }

                // NOTE: amountOut overriden to account for post-tax amount
                route.amountOut = amountOutExcludingTax;
            }

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
