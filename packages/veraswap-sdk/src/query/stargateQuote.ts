import { queryOptions } from "@tanstack/react-query";
import { Address, Hex } from "viem";

const stargateMainnetQuoteUrl = "https://stargate.finance/api/v1/routes";
// TODO: Add testnet URL when supported
const stargateTestnetQuoteUrl = "";

export interface StargateQuoteResponse {
    routes: {
        bridge: "StargateV1Bridge:taxi" | "StargateV2Bridge:taxi" | "StargateV1Bridge:bus" | "StargateV2Bridge:bus";
        dstAmount: string;
        duration: {
            // in seconds
            estimated: number;
        };
        fees: [
            {
                token: Address;
                amount: string;
                type: "message";
                chainKey: string;
            },
        ];
        error: { message: string } | null;
        steps: {
            // can be more
            type: "bridge" | "approve";
            chainKey: string;
            sender: Address;
            transaction: {
                data: Hex;
                to: Address;
                value: string;
                from: Address;
            };
        }[];
    }[];
}

export interface StargateQuoteParams {
    sender: Address;
    receiver: Address;
    amount: bigint;
    srcChainKey: string;
    dstChainKey: string;
    srcToken?: Address;
    dstToken?: Address;
    isMainnet: boolean;
}

export function stargateQuoteQueryOptions(params: StargateQuoteParams) {
    return queryOptions({
        queryKey: stargateQuoteQueryKey(params),
        queryFn: () => stargateQuote(params),
        retry: 1,
    });
}

export function stargateQuoteQueryKey({
    sender,
    receiver,
    amount,
    srcChainKey,
    dstChainKey,
    srcToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    dstToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
}: StargateQuoteParams) {
    return ["stargateQuote", sender, receiver, amount, srcChainKey, dstChainKey, srcToken, dstToken];
}

export async function stargateQuote({
    sender,
    receiver,
    amount,
    srcChainKey,
    dstChainKey,
    srcToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    dstToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    isMainnet,
}: StargateQuoteParams) {
    // TODO: remove when stargate supports it
    if (!isMainnet) throw new Error("Testnet is not supported yet");

    const baseUrl = isMainnet ? stargateMainnetQuoteUrl : stargateTestnetQuoteUrl;
    const response = await fetch(
        `${baseUrl}/?srcToken=${srcToken}&dstToken=${dstToken}&srcAddress=${sender}&dstAddress=${receiver}&srcChainKey=${srcChainKey}&dstChainKey=${dstChainKey}&srcAmount=${amount}&dstAmountMin=0`,
    );
    if (!response.ok) throw new Error("Registry fetch failed");
    const responseJson = (await response.json()) as StargateQuoteResponse;

    const v2TaxiQuote = responseJson.routes.find((route) => route.bridge === "StargateV2Bridge:taxi");
    if (v2TaxiQuote && !v2TaxiQuote.error) {
        return {
            // TODO: add approval step if not using native token
            transaction: v2TaxiQuote.steps[0].transaction,
            duration: v2TaxiQuote.duration.estimated,
            fees: v2TaxiQuote.fees[0].amount,
        };
    }

    const v1TaxiQuote = responseJson.routes.find((route) => route.bridge === "StargateV1Bridge:taxi");
    if (v1TaxiQuote && !v1TaxiQuote.error) {
        return {
            // TODO: add approval step if not using native token
            transaction: v1TaxiQuote.steps[0].transaction,
            duration: v1TaxiQuote.duration.estimated,
            fees: v1TaxiQuote.fees[0].amount,
        };
    }

    const error = v2TaxiQuote?.error?.message ?? v1TaxiQuote?.error?.message ?? "No quote available";
    throw new Error(error);
}
