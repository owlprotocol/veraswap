import { BigNumber } from "@ethersproject/bignumber";
import { queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, padHex } from "viem";

import { CHAIN_ID_TO_ENDPOINT_ID, STARGATE_TOKEN_POOLS } from "../constants/stargate.js";
import { StargateSendParam } from "../types/StargateSendParam.js";

import { stargateGetFee } from "./stargateGetFee.js";

export type StargateTokenSymbol = "USDC"; // Add more tokens as they become available

export interface StargateTokenQuoteParams {
    receiver: Address;
    tokenSymbol: StargateTokenSymbol;
    amount: bigint;
    srcChain: number;
    dstChain: number;
    slippage?: number; // Default 0.005 (0.5%)
}

export interface StargateTokenQuote {
    amount: bigint;
    minAmountLD: bigint;
    fee: bigint;
}

export function stargateTokenQuoteQueryOptions(wagmiConfig: Config, params: StargateTokenQuoteParams) {
    return queryOptions({
        queryKey: stargateTokenQuoteQueryKey(params),
        queryFn: () => stargateTokenQuote(wagmiConfig, params),
        retry: 1,
    });
}

export function stargateTokenQuoteQueryKey({
    receiver,
    tokenSymbol,
    amount,
    srcChain,
    dstChain,
}: StargateTokenQuoteParams) {
    return ["stargateTokenQuote", srcChain, dstChain, tokenSymbol, receiver, amount.toString()];
}

const fullPercent = 1000000; // 100% in base percentage of 0.0001%

export async function stargateTokenQuote(
    wagmiConfig: Config,
    { receiver, tokenSymbol, amount, srcChain, dstChain, slippage = 0.005 }: StargateTokenQuoteParams,
): Promise<StargateTokenQuote | null> {
    invariant(slippage >= 0 && slippage < 1, "Slippage must be between 0.0001 and 1");
    invariant(tokenSymbol in STARGATE_TOKEN_POOLS, `Token symbol ${tokenSymbol} is not supported`);

    const pools = STARGATE_TOKEN_POOLS[tokenSymbol];
    const poolAddress = pools[srcChain as keyof typeof pools];
    invariant(!!poolAddress, `Source chain ${srcChain} is not supported by Stargate for ${tokenSymbol}`);
    invariant(dstChain in pools, `Destination chain ${dstChain} is not supported by Stargate for ${tokenSymbol}`);

    const slippageOppositePercentFull = fullPercent - slippage * fullPercent;

    const minAmountLD = BigNumber.from(amount as unknown as number)
        .mul(slippageOppositePercentFull)
        .div(fullPercent)
        .toBigInt();

    const sendParam = {
        dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
        to: padHex(receiver, { size: 32 }),
        amountLD: amount,
        minAmountLD,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
    } as StargateSendParam;

    const nativeFee = await stargateGetFee(wagmiConfig, srcChain, poolAddress, sendParam);

    // Amount too low
    if (nativeFee === null) return null;

    return { amount, fee: nativeFee, minAmountLD };
}
