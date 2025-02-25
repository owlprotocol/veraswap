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
    tags?: string[]
    links?: {name: string, url: string}[]
}
export async function fetchTokenRegistryData({blockchain, address, registry} :{
    blockchain: string,
    address: Address,
    registry?: string
}): Promise<TokenRegistryData> {
    const response = await fetch(`${registry}/blockchains/${blockchain}/assets/${address}/info.json`);
    if (!response.ok) throw new Error("Registry fetch failed");
    return response.json();
};
