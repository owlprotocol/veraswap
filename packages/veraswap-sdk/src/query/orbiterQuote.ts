import { queryOptions } from "@tanstack/react-query";
import { Address, Hex } from "viem";

// @ts-expect-error Add tsJson function to bigints for serialization
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const orbiterQuoteMainnetUrl = "https://api.orbiter.finance/quote";

export interface OrbiterQuote {
    steps: {
        action: "bridge" | "swap";
        tx: {
            data: Hex;
            to: Address;
            value: string;
            gasLimit: string;
        };
    }[];
    details: {
        sourceTokenAmount: string;
        destTokenAmount: string;
        rate: number;
        slippageTolerance: number;
        midTokenSymbol: string;
        minDestTokenAmount: string;
    };
}

export interface OrbiterQuoteResponse {
    status: string;
    message: string;
    result: OrbiterQuote;
}

export interface OrbiterQuoteParams {
    sourceChainId: number;
    destChainId: number;
    sourceToken: Address;
    destToken: Address;
    amount: bigint;
    userAddress: Address;
    targetRecipient?: Address;
    slippage?: number;
}

export function orbiterQuoteQueryOptions(params: OrbiterQuoteParams, isMainnet = true) {
    return queryOptions({
        queryKey: orbiterQuoteQueryKey(params, isMainnet),
        queryFn: () => orbiterQuote(params, isMainnet),
        retry: 1,
    });
}

export function orbiterQuoteQueryKey(params: OrbiterQuoteParams, isMainnet: boolean) {
    return [
        "orbiterQuote",
        ...Object.keys(params).map((k) => {
            const value = params[k as keyof OrbiterQuoteParams];
            return typeof value === "bigint" ? `${value}` : value;
        }),
        isMainnet,
    ];
}

export async function orbiterQuote(
    {
        amount,
        destChainId,
        destToken,
        sourceChainId,
        sourceToken,
        userAddress,
        slippage,
        targetRecipient,
    }: OrbiterQuoteParams,
    isMainnet = true,
) {
    if (!isMainnet) {
        throw new Error("Orbiter quote is only available on mainnet");
    }
    const url = isMainnet ? orbiterQuoteMainnetUrl : "";

    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sourceChainId: sourceChainId.toString(),
            destChainId: destChainId.toString(),
            sourceToken,
            destToken,
            amount: amount.toString(),
            userAddress,
            targetRecipient,
            slippage,
        }),
        method: "POST",
    });
    if (!response.ok) throw new Error("Orbiter Quote fetch failed");
    const responseJson = (await response.json()) as OrbiterQuoteResponse;

    if (responseJson.status !== "success")
        throw new Error("Orbiter Quote fetch failed with message: " + responseJson.message);

    return responseJson.result;
}
