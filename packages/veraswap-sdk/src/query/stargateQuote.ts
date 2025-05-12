import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Address, Hex, numberToHex, padHex } from "viem";
import { arbitrum, mainnet } from "viem/chains";
import { Config } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";

import { quoteTaxi } from "../artifacts/ITokenMessaging.js";

const STARGATE_TOKEN_MESSAGING = {
    [arbitrum.id]: "0x19cFCE47eD54a88614648DC3f19A5980097007dD",
    [mainnet.id]: "0x6d6620eFa72948C5f68A3C8646d58C00d3f4A980",
} as const satisfies Record<number, Address>;

// From https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/mainnet-contracts
export const CHAIN_ID_TO_ENDPOINT_ID = {
    [arbitrum.id]: 30110,
    [mainnet.id]: 30101,
} as const satisfies Record<number, number>;

// const stargateMainnetQuoteUrl = "https://stargate.finance/api/v1/routes";
// TODO: Add testnet URL when supported
// const stargateTestnetQuoteUrl = "";

export const STARGATE_NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

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
    srcChain: number;
    dstChain: number;
    srcToken?: Address;
    dstToken?: Address;
    isMainnet: boolean;
}

export function stargateQuoteQueryOptions(queryClient: QueryClient, wagmiConfig: Config, params: StargateQuoteParams) {
    return queryOptions({
        queryKey: stargateQuoteQueryKey(params),
        queryFn: () => stargateQuote(queryClient, wagmiConfig, params),
        retry: 1,
    });
}

export function stargateQuoteQueryKey({
    sender,
    receiver,
    amount,
    srcChain,
    dstChain,
    srcToken = STARGATE_NATIVE_TOKEN_ADDRESS,
    dstToken = STARGATE_NATIVE_TOKEN_ADDRESS,
}: StargateQuoteParams) {
    return ["stargateQuote", sender, receiver, amount, srcChain, dstChain, srcToken, dstToken];
}

export async function stargateQuote(
    queryClient: QueryClient,
    wagmiConfig: Config,
    {
        sender,
        receiver,
        amount,
        srcChain,
        dstChain,
        srcToken = STARGATE_NATIVE_TOKEN_ADDRESS,
        dstToken = STARGATE_NATIVE_TOKEN_ADDRESS,
        isMainnet,
    }: StargateQuoteParams,
) {
    // Don't want to pay in LayerZero token
    const payInLzToken = false;

    const quote = await queryClient.fetchQuery(
        readContractQueryOptions(wagmiConfig, {
            chainId: srcChain,
            address: STARGATE_TOKEN_MESSAGING[srcChain as keyof typeof STARGATE_TOKEN_MESSAGING],
            abi: [quoteTaxi],
            functionName: "quoteTaxi",
            args: [
                {
                    dstEid: CHAIN_ID_TO_ENDPOINT_ID[dstChain as keyof typeof CHAIN_ID_TO_ENDPOINT_ID],
                    sender,
                    composeMsg: "0x",
                    receiver: padHex(receiver, { size: 32 }),
                    // @ts-expect-error use hex for query key
                    amountSD: Number(amount / 10n ** 12n),
                    // amountSD: numberToHex(amount / 10n ** 12n),
                    extraOptions: "0x",
                },
                payInLzToken,
            ],
        }),
    );

    return quote.nativeFee;
    // TODO: remove when stargate supports it
    // if (!isMainnet) throw new Error("Testnet is not supported yet");
    //
    // const baseUrl = isMainnet ? stargateMainnetQuoteUrl : stargateTestnetQuoteUrl;
    // const response = await fetch(
    //     `${baseUrl}/?srcToken=${srcToken}&dstToken=${dstToken}&srcAddress=${sender}&dstAddress=${receiver}&srcChainKey=${srcChainKey}&dstChainKey=${dstChainKey}&srcAmount=${amount}&dstAmountMin=0`,
    // );
    // if (!response.ok) throw new Error("Registry fetch failed");
    // const responseJson = (await response.json()) as StargateQuoteResponse;
    // const v2TaxiQuote = responseJson.routes.find((route) => route.bridge === "StargateV2Bridge:taxi");
    // if (v2TaxiQuote && !v2TaxiQuote.error) {
    //     return {
    //         // TODO: add approval step if not using native token
    //         transaction: v2TaxiQuote.steps[0].transaction,
    //         duration: v2TaxiQuote.duration.estimated,
    //         fees: v2TaxiQuote.fees[0].amount,
    //     };
    // }
    //
    // const v1TaxiQuote = responseJson.routes.find((route) => route.bridge === "StargateV1Bridge:taxi");
    // if (v1TaxiQuote && !v1TaxiQuote.error) {
    //     return {
    //         // TODO: add approval step if not using native token
    //         transaction: v1TaxiQuote.steps[0].transaction,
    //         duration: v1TaxiQuote.duration.estimated,
    //         fees: v1TaxiQuote.fees[0].amount,
    //     };
    // }
    //
    // const error = v2TaxiQuote?.error?.message ?? v1TaxiQuote?.error?.message ?? "No quote available";
    // throw new Error(error);
}
