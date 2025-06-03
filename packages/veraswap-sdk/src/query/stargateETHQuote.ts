import { BigNumber } from "@ethersproject/bignumber";
import { queryOptions } from "@tanstack/react-query";
import { Config, readContract } from "@wagmi/core";
import invariant from "tiny-invariant";
import { AbiParameterToPrimitiveType, Address, padHex } from "viem";

import { quoteOFT, quoteSend } from "../artifacts/IStargate.js";
import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_POOL_NATIVE } from "../stargate/constants.js";

export interface StargateETHQuoteParams {
    receiver: Address;
    amount: bigint;
    srcChain: number;
    dstChain: number;
    slippage?: number; // Default 0.005 (0.5%)
}

export interface StargateETHQuote {
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

type SendParams = AbiParameterToPrimitiveType<(typeof quoteOFT)["inputs"][0]>;

const fullPercent = 1000000; // 100% in base percentage of 0.0001%
async function stargateETHGetFee(wagmiConfig: Config, srcChain: number, sendParams: SendParams) {
    const quoteOFTResult = await readContract(wagmiConfig, {
        chainId: srcChain,
        address: STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE],
        abi: [quoteOFT],
        functionName: "quoteOFT",
        args: [sendParams],
    });

    const receipt = quoteOFTResult[2];

    // Amount is too low
    if (receipt.amountReceivedLD === 0n) return null;

    // TODO: remove this if unnecessary when already using slippage?
    //ts-expect-error use hex instead of bigint for query key
    // sendParams.minAmountLD = numberToHex(receipt.amountReceivedLD);

    // Don't want to pay in LayerZero token
    const payInLzToken = false;

    const quote = await readContract(wagmiConfig, {
        chainId: srcChain,
        address: STARGATE_POOL_NATIVE[srcChain as keyof typeof STARGATE_POOL_NATIVE],
        abi: [quoteSend],
        functionName: "quoteSend",
        args: [sendParams, payInLzToken],
    });

    return quote.nativeFee;
}

export async function stargateETHQuote(
    wagmiConfig: Config,
    { receiver, amount, srcChain, dstChain, slippage = 0.05 }: StargateETHQuoteParams,
): Promise<StargateETHQuote | null> {
    invariant(slippage >= 0 && slippage < 1, "Slippage must be between 0.0001 and 1");

    const slippageOppositePercentFull = fullPercent - slippage * fullPercent;

    const minAmountLD = BigNumber.from(amount as unknown as number)
        .mul(slippageOppositePercentFull)
        .div(fullPercent)
        .toBigInt();

    const sendParamsFullAmount = {
        dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
        to: padHex(receiver, { size: 32 }),
        amountLD: amount,
        minAmountLD,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
    } as SendParams;

    const nativeFeeFullAmount = await stargateETHGetFee(wagmiConfig, srcChain, sendParamsFullAmount);

    // Amount too low
    if (nativeFeeFullAmount === null) return null;

    const amountFeeRemoved = amount - nativeFeeFullAmount;

    const minAmountLDFeeRemoved = BigNumber.from(amountFeeRemoved as unknown as number)
        .mul(slippageOppositePercentFull)
        .div(fullPercent)
        .toBigInt();

    const sendParams = {
        ...sendParamsFullAmount,
        amountLD: amountFeeRemoved,
        minAmountLD: minAmountLDFeeRemoved,
    } as SendParams;

    const nativeFee = await stargateETHGetFee(wagmiConfig, srcChain, sendParams);

    // Amount too low
    if (nativeFee === null) return null;

    return { amountFeeRemoved, fee: nativeFee, minAmountLDFeeRemoved };
}
