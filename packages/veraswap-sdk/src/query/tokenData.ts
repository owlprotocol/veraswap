/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Config, readContract } from "@wagmi/core";
import { Address, Chain, zeroAddress } from "viem";
import * as chains from "viem/chains";

import { tokenRegistryData } from "./tokenRegistryData.js";
import { symbol as symbolAbi, decimals as decimalsAbi, name as nameAbi } from "../artifacts/MockERC20.js";
import { inkSepolia, unichainSepolia } from "../chains.js";

// TODO: use viem registry?
export const chainIdToBlockchain: Record<number, string> = {
    1: "ethereum",
    56: "smartchain",
    137: "polygon",
    43114: "avalanche",
    1337: "localhost",
};
export const getChainById = (chainId: number): Chain | undefined => {
    const chain = (Object.values(chains) as Chain[]).find((chain) => chain.id === chainId) as Chain | undefined;
    if (chain) return chain;

    if (inkSepolia.id === chainId) return inkSepolia;
    if (unichainSepolia.id === chainId) return unichainSepolia;
};

export function tokenDataQueryOptions(
    config: Config,
    {
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
    },
) {
    return {
        queryKey: tokenDataQueryKey({ chainId, address }),
        queryFn: () =>
            tokenData(config, {
                address,
                chainId,
                symbol,
                decimals,
            }),
    };
}

export function tokenDataQueryKey({ chainId, address }: { chainId: number; address: Address }) {
    return ["tokenData", chainId, address];
}

export async function tokenData(
    config: Config,
    {
        chainId,
        address,
        name,
        symbol,
        decimals,
    }: {
        chainId: number;
        address: Address;
        name?: string;
        symbol?: string;
        decimals?: number;
    },
) {
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
            chainId,
            address,
            abi: [nameAbi],
            functionName: "name",
        }),
        readContract(config, {
            chainId,
            address,
            abi: [symbolAbi],
            functionName: "symbol",
        }),
        readContract(config, {
            chainId,
            address,
            abi: [decimalsAbi],
            functionName: "decimals",
        }),
        tokenRegistryData({ blockchain, address }),
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
}
