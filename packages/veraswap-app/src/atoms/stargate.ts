import {
    STARGATE_POOL_NATIVE,
    StargateETHQuote,
    StargateETHQuoteParams,
    stargateETHQuoteQueryOptions,
} from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { accountAtom } from "./account.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { chainInAtom, chainOutAtom, currencyInAtom, currencyOutAtom, tokenInAmountAtom } from "./tokens.js";
import { transactionTypeAtom, routeMultichainAtom } from "./uniswap.js";
import { config } from "@/config.js";

export const stargateQuoteAtom = atomWithQuery((get) => {
    const account = get(accountAtom);

    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);

    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);

    const tokenInAmount = get(tokenInAmountAtom);

    const transactionType = get(transactionTypeAtom);
    const routeMultichain = get(routeMultichainAtom);

    if (!currencyIn || !currencyOut || !chainIn || !chainOut || !transactionType || !tokenInAmount)
        return disabledQueryOptions;

    const kernelAddressChainOut = get(kernelAddressChainOutQueryAtom).data;

    if (transactionType.type === "SWAP") return disabledQueryOptions as any;

    // Kernel address is only used when bridging and then swapping
    const receiver =
        transactionType.type === "BRIDGE_SWAP"
            ? kernelAddressChainOut
            : (account.address ?? "0x0000000000000000000000000000000000000001");

    if (!receiver) return disabledQueryOptions as any;

    const bridge = transactionType.type === "BRIDGE" ? transactionType : transactionType.bridge;

    const bridgeSymbol = bridge.currencyIn.symbol!;

    // TODO: handle USDC bridging
    if (bridge.currencyIn.isNative) {
        if (bridgeSymbol !== "ETH" || !(chainIn.id in STARGATE_POOL_NATIVE && chainOut.id in STARGATE_POOL_NATIVE)) {
            return disabledQueryOptions as any;
        }
        // } else if (bridgeSymbol === "USDC") {
        //     if (!(chainIn.id in STARGATE_POOL_USDC && chainOut.id in STARGATE_POOL_USDC)) {
        //         return disabledQueryOptions as any;
        //     }
    } else {
        return disabledQueryOptions as any;
    }

    let amount: bigint;

    if (transactionType.type === "SWAP_BRIDGE") {
        // Need to have an estimate of the amout out
        if (!routeMultichain.data) return disabledQueryOptions as any;

        amount = routeMultichain.data?.amountOut;
    } else {
        // Type is either "BRIDGE" or "BRIDGE_SWAP"
        amount = tokenInAmount;
    }

    if (bridgeSymbol === "ETH") {
        // Native bridging
        const params: StargateETHQuoteParams = {
            srcChain: chainIn.id,
            dstChain: chainOut.id,
            amount,
            receiver,
        };

        return stargateETHQuoteQueryOptions(config, params);
    }

    // TODO: Handle USDC bridging
    // const params: StargateTokenQuoteParams = {
    //     srcChain: chainIn.id,
    //     dstChain: chainOut.id,
    //     tokenSymbol: bridgeSymbol,
    //     amount,
    //     receiver,
    // };
    // return stargateTokenQuoteQueryOptions
    return disabledQueryOptions as any;
}) as unknown as Atom<AtomWithQueryResult<StargateETHQuote | null>>;
