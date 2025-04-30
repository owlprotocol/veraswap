import { atomWithQuery, AtomWithQueryResult, queryClientAtom } from "jotai-tanstack-query";
import { getRouteMultichain, getUniswapV4Address, PoolKey, quoteQueryOptions } from "@owlprotocol/veraswap-sdk";
import { Token, CurrencyAmount, Ether } from "@uniswap/sdk-core";
import { Atom, WritableAtom } from "jotai";
import { Address, numberToHex, zeroAddress } from "viem";
import { UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk/constants";
import { queryOptions } from "@tanstack/react-query";
import { currencyInAtom, currencyOutAtom, tokenInAmountAtom, transactionTypeAtom } from "./tokens.js";
import { orbiterAmountOutAtom } from "./orbiter.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

// const emptyToken = new Token(1, zeroAddress, 1);
// const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emptyPoolKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress,
};

/** v4Quoter.quoteExactInputSingle(...): QueryResult */
export const quoteInAtom = atomWithQuery((get) => {
    const tokenInAmount = get(tokenInAmountAtom);

    const transactionType = get(transactionTypeAtom);

    const orbiterAmountOut = get(orbiterAmountOutAtom);

    let chainId: number = 0;
    let poolKey: PoolKey = emptyPoolKey;
    let tokenInAddress: Address = zeroAddress;
    let tokenInDecimals = 18;

    if (transactionType?.type === "SWAP") {
        chainId = transactionType.chainId;
        poolKey = transactionType.poolKey;
        const currencyIn = transactionType.currencyIn;
        tokenInAddress = getUniswapV4Address(currencyIn);
        tokenInDecimals = tokenInDecimals;
    } else if (transactionType?.type === "SWAP_BRIDGE" || transactionType?.type === "BRIDGE_SWAP") {
        chainId = transactionType.swap.chainId;
        poolKey = transactionType.swap.poolKey;
        const currencyIn = transactionType.swap.currencyIn;
        tokenInAddress = getUniswapV4Address(currencyIn);
        tokenInDecimals = currencyIn.decimals;
    }

    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId]?.v4Quoter : zeroAddress;

    if (!quoterAddress) {
        console.warn("Quoter address not found for chain id ", chainId);
    }

    const enabled = chainId != 0 && poolKey != emptyPoolKey && !!tokenInAmount && !!quoterAddress;

    let amountIn = tokenInAmount;

    // TODO: generalize to any bridging that involves orbiter (e.g. USDC)
    if (transactionType?.type === "BRIDGE_SWAP" && transactionType?.bridge.currencyIn.isNative && orbiterAmountOut) {
        amountIn = orbiterAmountOut;
    }

    // Query args MUST be defined
    const currencyIn =
        tokenInAddress === zeroAddress ? Ether.onChain(chainId) : new Token(chainId, tokenInAddress, tokenInDecimals);
    const exactCurrencyAmount = CurrencyAmount.fromRawAmount(currencyIn, (amountIn ?? 0).toString());

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey,
            exactCurrencyAmount,
            quoteType: "quoteExactInputSingle",
            quoterAddress: quoterAddress!,
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>;

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
                currencyHopsByChain: {},
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
