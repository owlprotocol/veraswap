import { BigNumber } from "@ethersproject/bignumber";
import { queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, padHex } from "viem";

import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_NATIVE } from "../constants/stargate.js";
import { StargateSendParam } from "../types/StargateSendParam.js";

import { stargateGetFee } from "./stargateGetFee.js";

export interface StargateETHQuoteParams {
    receiver: Address;
    amount: bigint;
    srcChain: number;
    dstChain: number;
    slippage?: number; // Default 0.005 (0.5%)
}

export interface StargateETHQuote {
    type: "ETH";
    amountFeeRemoved: bigint;
    minAmountLDFeeRemoved: bigint;
    fee: bigint;
}

export function stargateETHQuoteQueryOptions(wagmiConfig: Config, params: StargateETHQuoteParams) {
    return queryOptions({
        queryKey: stargateETHQuoteQueryKey(params),
        queryFn: () => stargateETHQuote(wagmiConfig, params),
        retry: 1,
    });
}

export function stargateETHQuoteQueryKey({ receiver, amount, srcChain, dstChain }: StargateETHQuoteParams) {
    return ["stargateETHQuote", srcChain, dstChain, receiver, amount.toString()];
}

const fullPercent = 1000000; // 100% in base percentage of 0.0001%
export async function stargateETHQuote(
    wagmiConfig: Config,
    { receiver, amount, srcChain, dstChain, slippage = 0.005 }: StargateETHQuoteParams,
): Promise<StargateETHQuote | null> {
    invariant(slippage >= 0 && slippage < 1, "Slippage must be between 0.0001 and 1");
    invariant(dstChain in STARGATE_POOL_NATIVE, "Destination chain is not supported by Stargate for ETH");
    invariant(srcChain in STARGATE_POOL_NATIVE, "Source chain is not supported by Stargate for ETH");

    const slippageOppositePercentFull = fullPercent - slippage * fullPercent;

    const minAmountLD = BigNumber.from(amount as unknown as number)
        .mul(slippageOppositePercentFull)
        .div(fullPercent)
        .toBigInt();

    const sendParamFullAmount = {
        dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
        to: padHex(receiver, { size: 32 }),
        amountLD: amount,
        minAmountLD,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
    } as StargateSendParam;

    const poolAddress = STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE];

    const nativeFeeFullAmount = await stargateGetFee(wagmiConfig, srcChain, poolAddress, sendParamFullAmount);

    // Amount too low
    if (nativeFeeFullAmount === null) return null;

    const amountFeeRemoved = amount - nativeFeeFullAmount;

    const minAmountLDFeeRemoved = BigNumber.from(amountFeeRemoved as unknown as number)
        .mul(slippageOppositePercentFull)
        .div(fullPercent)
        .toBigInt();

    const sendParam = {
        ...sendParamFullAmount,
        amountLD: amountFeeRemoved,
        minAmountLD: minAmountLDFeeRemoved,
    } as StargateSendParam;

    const nativeFee = await stargateGetFee(wagmiConfig, srcChain, poolAddress, sendParam);

    // Amount too low
    if (nativeFee === null) return null;

    return { type: "ETH", amountFeeRemoved, fee: nativeFee, minAmountLDFeeRemoved };
}
