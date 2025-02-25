import { Config, readContract } from "@wagmi/core";
import { Address, Chain, zeroAddress } from "viem";
import * as chains from "viem/chains";

import { symbol as symbolAbi, decimals as decimalsAbi, name as nameAbi } from "../artifacts/MockERC20.js";
import { fetchTokenRegistryData } from "../fetchTokenRegistryData.js";

//TODO: use viem registry?
export const chainIdToBlockchain: Record<number, string> = {
    1: "ethereum",
    56: "smartchain",
    137: "polygon",
    43114: "avalanche",
    1337: "localhost",
};
export const getChainById = (chainId: number) => {
    //@ts-expect-error
    return Object.values(chains).find((chain) => chain.id === chainId) as Chain;
};


export function fetchCurrencyQueryOptions(config: Config, {
    chainId,
    address,
    symbol,
    decimals,
}: {
    chainId: number;
    address: Address;
    name?: string;
    symbol?: string;
    decimals?: number;
}) {
  return {  queryKey: ["currency-data", chainId, address],
    queryFn: () =>
        fetchCurrencyData(config, {
            address,
            chainId,
            symbol,
            decimals,
        }),
}
}

export async function fetchCurrencyData(config: Config, {
    address,
    chainId,
    name,
    symbol,
    decimals,
}: {
    address: Address;
    chainId: number;
    name?: string;
    symbol?: string;
    decimals?: number;
}) {
    const blockchain = chainIdToBlockchain[chainId];

    if (address == zeroAddress) {
        const nativeChain = getChainById(chainId);
        if (!nativeChain) {
            return {
                symbolError: `Unsupported chain: ${chainId}`,
                decimalsError: `Unsupported chain: ${chainId}`,
            };
        }
        return {
            symbol: nativeChain.nativeCurrency.symbol,
            decimals: nativeChain.nativeCurrency.decimals,
        };
    }

    const results = await Promise.allSettled([
        readContract(config, {
            address,
            abi: [nameAbi],
            functionName: "name",
            chainId,
        }),
        readContract(config, {
            address,
            abi: [symbolAbi],
            functionName: "symbol",
            chainId,
        }),
        readContract(config, {
            address,
            abi: [decimalsAbi],
            functionName: "decimals",
            chainId,
        }),
        fetchTokenRegistryData({blockchain, address}),
    ]);

    const [nameResult, symbolResult, decimalsResult, registryResult] = results;

    // Use the data in this order: default, onchain, registry
    return {
        name:
            name ??
            (nameResult.status === "fulfilled" ? nameResult.value : undefined) ??
            (registryResult.status === "fulfilled" ? registryResult.value?.name : undefined),
        symbol:
            symbol ??
            (symbolResult.status === "fulfilled" ? symbolResult.value : undefined) ??
            (registryResult.status === "fulfilled" ? registryResult.value?.symbol : undefined),
        decimals:
            decimals ??
            (decimalsResult.status === "fulfilled" ? decimalsResult.value : undefined) ??
            (registryResult.status === "fulfilled" ? registryResult.value?.decimals : undefined),
        nameError: nameResult.status === "rejected" ? nameResult.reason.message : undefined,
        symbolError: symbolResult.status === "rejected" ? symbolResult.reason.message : undefined,
        decimalsError: decimalsResult.status === "rejected" ? decimalsResult.reason.message : undefined,
        registryError: registryResult.status === "rejected" ? registryResult.reason.message : undefined,
    };
};
