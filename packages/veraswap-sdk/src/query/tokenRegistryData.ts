import { queryOptions } from "@tanstack/react-query";
import { Address } from "viem";

export const DEFAULT_REGISTRY = "https://raw.githubusercontent.com/trustwallet/assets/master";
export interface TokenRegistryData {
    name?: string;
    website?: string;
    description?: string;
    explorer?: string;
    type?: string;
    symbol?: string;
    decimals?: number;
    status?: string;
    tags?: string[];
    links?: { name: string; url: string }[];
}

export function tokenRegistryDataQueryOptions({
    blockchain,
    address,
    registry,
}: {
    blockchain: string;
    address: Address;
    registry: string;
}) {
    return queryOptions({
        queryKey: tokenRegistryDataQueryKey({ blockchain, address, registry: registry ?? DEFAULT_REGISTRY }),
        queryFn: () => tokenRegistryData({ blockchain, address, registry: registry ?? DEFAULT_REGISTRY }),
    });
}

export function tokenRegistryDataQueryKey({
    blockchain,
    address,
    registry,
}: {
    blockchain: string;
    address: Address;
    registry: string;
}) {
    return ["tokenRegistryData", blockchain, address, registry];
}

export async function tokenRegistryData({
    blockchain,
    address,
    registry,
}: {
    blockchain: string;
    address: Address;
    registry?: string;
}): Promise<TokenRegistryData> {
    const response = await fetch(`${registry}/blockchains/${blockchain}/assets/${address}/info.json`);
    if (!response.ok) throw new Error("Registry fetch failed");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json();
}
