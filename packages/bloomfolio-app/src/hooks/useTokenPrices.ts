import { useQuery } from "@tanstack/react-query";
import { Codex } from "@codex-data/sdk";
import { GetPriceInput } from "@codex-data/sdk/dist/resources/graphql.js";
import { Address } from "viem";

const CODEX_API_KEY = import.meta.env.VITE_CODEX_API_KEY;

const codexSdk = new Codex(CODEX_API_KEY);

async function fetchTokenData(
    tokens: { address: Address; chainId: number }[],
    days: number = 7,
): Promise<{ timestamp: number; prices: { address: Address; chainId: number; price?: number }[] }[] | null> {
    const daySeconds = 86_400;
    const timestamps: number[] = [];
    const nowSeconds = Math.floor(Date.now() / 1000);
    for (let i = days - 1; i >= 0; i--) {
        timestamps.push(nowSeconds - i * daySeconds);
    }

    const inputs: GetPriceInput[] = timestamps.flatMap((timestamp) =>
        tokens.map(
            (token) =>
                ({
                    address: token.address,
                    networkId: token.chainId,
                    timestamp,
                }) as GetPriceInput,
        ),
    );

    const query = await codexSdk.queries.getTokenPrices({ inputs });
    if (!query.getTokenPrices) return null;

    return timestamps.map((timestamp, i) => ({
        timestamp,
        prices: tokens.map(({ chainId, address }, j) => ({
            chainId,
            address,
            price: query.getTokenPrices![i * tokens.length + j]?.priceUsd,
        })),
    }));
}

export function useTokenPrices(tokens: { address: Address; chainId: number }[], days: number = 7) {
    return useQuery({
        queryKey: ["tokenPrices", tokens.map((t) => [t.address, t.chainId]), days],
        queryFn: () => fetchTokenData(tokens, days),
        retry: 3,
        enabled: tokens.length > 0,
    });
}
