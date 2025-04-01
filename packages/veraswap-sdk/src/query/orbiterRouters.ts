import { queryOptions } from "@tanstack/react-query";
import { OrbiterRouters } from "../types/OrbiterRouters.js";

const orbiterRoutersMainnetUrl = "https://api.orbiter.finance/sdk/routers/v2?entry=contract";
const orbiterRoutersTestnetUrl = "https://testnet-api.orbiter.finance/sdk/routers/v2?entry=contract";

export interface OrbiterRoutersResponse {
    status: string;
    message: string;
    result: OrbiterRouters[];
}

export function orbiterRoutersQueryOptions(isMainnet: boolean) {
    return queryOptions({
        queryKey: orbiterRoutersQueryKey(isMainnet),
        queryFn: () => orbiterRouters(isMainnet),
        retry: 1,
    });
}

export function orbiterRoutersQueryKey(isMainnet: boolean) {
    return ["orbiterRouters", isMainnet];
}

export async function orbiterRouters(isMainnet: boolean) {
    const url = isMainnet ? orbiterRoutersMainnetUrl : orbiterRoutersTestnetUrl;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Orbiter Routers fetch failed for${isMainnet ? "mainnet" : "testnet"}`);
    const responseJson = (await response.json()) as OrbiterRoutersResponse;

    if (responseJson.status !== "success")
        throw new Error("Orbiter Routers fetch failed with message: " + responseJson.message);

    return responseJson.result;
}
