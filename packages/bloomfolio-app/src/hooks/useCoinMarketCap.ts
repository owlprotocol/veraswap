import { useQuery } from "@tanstack/react-query";

const CMC_API_KEY = import.meta.env.VITE_CMC_API_URL;
const CMC_API_URL = "https://pro-api.coinmarketcap.com/v3";

interface QuoteData {
    timestamp: string;
    quote: {
        USD: {
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            price: number;
        };
    };
}

interface TokenData {
    quotes: QuoteData[];
    id: number;
    name: string;
    symbol: string;
}

interface ApiResponse {
    status: {
        timestamp: string;
        error_code: number;
        error_message: null;
        elapsed: number;
        credit_count: number;
        notice: null;
    };
    data: Record<string, TokenData>;
}

async function fetchTokenData(ids: number[], days: number = 7): Promise<ApiResponse> {
    const idString = ids.join(",");
    const url = `${CMC_API_URL}/cryptocurrency/quotes/historical?id=${idString}&interval=24h&count=${days}&aux=price`;

    console.log("URL:", url);

    // curl -X GET "https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical?id=1839,1027,1&interval=24h&count=7&aux=price" -H "X-CMC_PRO_API_KEY: ba3eb798-a03f-43b6-8c82-031fd019cab5" -H "Accept: application/json"

    console.log("aaaaaaaaa");
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "X-CMC_PRO_API_KEY": CMC_API_KEY,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ status: { error_message: response.statusText } }));
        console.error("API Error:", error);
        throw new Error(`Failed to fetch data: ${error.status?.error_message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Response data:", data);
    return data;
}

export function useTokenPrices(ids: number[], days: number = 7) {
    return useQuery({
        queryKey: ["tokenPrices", ids, days],
        queryFn: () => fetchTokenData(ids, days),
        retry: 3,
    });
}
