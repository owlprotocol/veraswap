import {
    getUniswapV4Address,
    StargateQuoteParams,
    STARGATE_NATIVE_TOKEN_ADDRESS,
    stargateQuoteQueryOptions,
    StargateQuoteResponse,
    isNativeCurrency,
} from "@owlprotocol/veraswap-sdk";
import { Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { zeroAddress } from "viem";
import { accountAtom } from "./account.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { chainInAtom, chainOutAtom, currencyInAtom, currencyOutAtom, tokenInAmountAtom } from "./tokens.js";
import { transactionTypeAtom, routeMultichainAtom } from "./uniswap.js";

export const stargateQuoteAtom = atomWithQuery((get) => {
    const account = get(accountAtom);

    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);

    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);

    const tokenInAmount = get(tokenInAmountAtom);

    const transactionType = get(transactionTypeAtom);
    const routeMultichain = get(routeMultichainAtom);

    if (!currencyIn || !currencyOut || !chainIn || !chainOut || !transactionType || !tokenInAmount || !account.address)
        return disabledQueryOptions;

    const kernelAddressChainOut = get(kernelAddressChainOutQueryAtom).data;

    // Kernel address is only used when bridging and then swapping
    const receiver = transactionType.type === "BRIDGE_SWAP" ? kernelAddressChainOut : account.address;
    if (!receiver) return disabledQueryOptions as any;

    // Only supports mainnet for now
    if (chainIn.testnet) return disabledQueryOptions as any;

    if (transactionType.type === "SWAP") return disabledQueryOptions as any;

    const chainInSymbol = chainIn.nativeCurrency.symbol;
    const chainOutSymbol = chainOut.nativeCurrency.symbol;

    let amount: bigint;

    if (transactionType.type === "SWAP_BRIDGE") {
        // TODO: Handle USDC
        if (currencyOut.isNative && (currencyOut.symbol !== "ETH" || chainInSymbol !== "ETH")) {
            // If bridging on output a native token, must be ETH on both chains
            return disabledQueryOptions as any;
        }

        // Need to have an estimate of the amout out
        if (!routeMultichain.data) return disabledQueryOptions as any;

        amount = routeMultichain.data?.amountOut;

        // Type is either "BRIDGE" or "BRIDGE_SWAP"
    } else {
        // TODO: Handle USDC
        if (!currencyIn.isNative || currencyIn.symbol !== "ETH" || chainOutSymbol !== "ETH") {
            // If bridging on input a native token, must be ETH on both chains
            return disabledQueryOptions as any;
        }

        amount = tokenInAmount;
    }

    const bridgeTransactionType = transactionType.type === "BRIDGE" ? transactionType : transactionType.bridge;
    const srcToken = isNativeCurrency(bridgeTransactionType.currencyIn)
        ? STARGATE_NATIVE_TOKEN_ADDRESS
        : bridgeTransactionType.currencyIn.address;
    const dstToken = isNativeCurrency(bridgeTransactionType.currencyOut)
        ? STARGATE_NATIVE_TOKEN_ADDRESS
        : bridgeTransactionType.currencyOut.address;

    const params: StargateQuoteParams = {
        srcChainKey: chainIn.name,
        dstChainKey: chainOut.name,
        srcToken,
        dstToken,
        amount,
        receiver,
        sender: account.address,
        isMainnet: true,
    };

    return stargateQuoteQueryOptions(params);
}) as unknown as Atom<AtomWithQueryResult<StargateQuoteResponse>>;
