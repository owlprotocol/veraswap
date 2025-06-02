import { BigNumber } from "@ethersproject/bignumber";
import { queryOptions } from "@tanstack/react-query";
import { Config, readContract } from "@wagmi/core";
import invariant from "tiny-invariant";
import { AbiParameterToPrimitiveType, Address, numberToHex, padHex } from "viem";
import { arbitrum, arbitrumSepolia, mainnet, optimism, sepolia } from "viem/chains";

import { quoteOFT, quoteSend } from "../artifacts/IStargate.js";

// From https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts
export const CHAIN_ID_TO_ENDPOINT_ID = {
    [arbitrum.id]: 30110,
    [mainnet.id]: 30101,
    [arbitrumSepolia.id]: 40231,
    [sepolia.id]: 40161,
    [optimism.id]: 30111,
} as const satisfies Record<number, number>;

// https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts
export const STARGATE_POOL_NATIVE = {
    [arbitrum.id]: "0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F",
    [mainnet.id]: "0x77b2043768d28E9C9aB44E1aBfC95944bcE57931",
    [optimism.id]: "0xe8CDF27AcD73a434D661C84887215F7598e7d0d3",
    [arbitrumSepolia.id]: "0x6fddB6270F6c71f31B62AE0260cfa8E2e2d186E0",
    [sepolia.id]: "0x9Cc7e185162Aa5D1425ee924D97a87A0a34A0706",
} as const satisfies Record<keyof typeof CHAIN_ID_TO_ENDPOINT_ID, Address>;

export const STARGATE_NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export interface StargateETHQuoteParams {
    receiver: Address;
    amount: bigint;
    srcChain: number;
    dstChain: number;
}

export interface StargateETHQuote {
    amountFeeRemoved: bigint;
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
    return ["stargateETHQuote", receiver, amount.toString(), srcChain, dstChain];
}

type SendParams = AbiParameterToPrimitiveType<(typeof quoteOFT)["inputs"][0]>;

async function stargateETHGetFee(wagmiConfig: Config, srcChain: number, sendParams: SendParams, slippage = 0.05) {
    invariant(slippage >= 0 && slippage < 1, "Slippage must be between 0 and 1");
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

    const minAmountLd = BigNumber.from(receipt.amountReceivedLD as unknown as number)
        .mul(slippage)
        .div(100)
        .toBigInt();
    //@ts-expect-error use hex instead of bigint for query key
    sendParams.minAmountLD = numberToHex(minAmountLd);

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
    { receiver, amount, srcChain, dstChain }: StargateETHQuoteParams,
): Promise<StargateETHQuote | null> {
    const sendParamsFullAmount = {
        dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
        to: padHex(receiver, { size: 32 }),
        amountLD: amount,
        minAmountLD: amount,
        extraOptions: "0x",
        composeMsg: "0x",
        oftCmd: "0x",
    } as SendParams;

    const nativeFeeFullAmount = await stargateETHGetFee(wagmiConfig, srcChain, sendParamsFullAmount);

    // Amount too low
    if (nativeFeeFullAmount === null) return null;

    const amountFeeRemoved = amount - nativeFeeFullAmount;

    const sendParams = {
        ...sendParamsFullAmount,
        amountLD: amountFeeRemoved,
        minAmountLD: amountFeeRemoved,
    } as SendParams;

    const nativeFee = await stargateETHGetFee(wagmiConfig, srcChain, sendParams);

    // Amount too low
    if (nativeFee === null) return null;

    return { amountFeeRemoved, fee: nativeFee };
}
