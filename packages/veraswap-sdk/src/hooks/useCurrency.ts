import { useMemo } from "react";
import { Currency, Token, Ether } from "@uniswap/sdk-core";
import { useQuery } from "@tanstack/react-query";
import { Config, readContract } from "@wagmi/core";
import { Address, Chain, zeroAddress } from "viem";
import * as chains from "viem/chains";

import { MockERC20 } from "../artifacts/MockERC20.js";

const chainIdToBlockchain: Record<number, string> = {
    1: "ethereum",
    56: "smartchain",
    137: "polygon",
    43114: "avalanchec",
    1337: "localhost",
};

interface UseCurrencyParams {
    chainId: number;
    address: Address;
    decimals?: number;
    symbol?: string;
    config: Config;
}

interface TokenInfo {
    symbol: string;
    decimals: number;
}

export function useCurrency({
    chainId,
    address,
    decimals: providedDecimals,
    symbol: providedSymbol,
    config,
}: UseCurrencyParams): {
    currency: Currency | undefined;
    error: string | undefined;
    isLoading: boolean;
} {
    const needsSymbol = useMemo(() => !providedSymbol, [providedSymbol]);
    const needsDecimals = useMemo(() => typeof providedDecimals === "undefined", [providedDecimals]);

    const isNativeCurrency = address === zeroAddress;

    const { data, isLoading } = useQuery({
        ...fetchCurrencyQueryOptions({
            chainId,
            address,
            config,
            symbol: providedSymbol,
            decimals: providedDecimals,
        }),
        enabled: needsSymbol || needsDecimals,
    });

    const currency = useMemo(() => {
        if (!needsSymbol && !needsDecimals) {
            return new Token(chainId, address, providedDecimals!, providedSymbol!);
        }

        if (!data || !data.symbol || typeof data.decimals !== "number") {
            return undefined;
        }
        if (isNativeCurrency) {
            // TODO: handle other native currencies
            // Rn will set ETH and decimals 18
            return Ether.onChain(chainId);
        }

        return new Token(chainId, address, data.decimals, data.symbol);
    }, [needsSymbol, needsDecimals, data, isNativeCurrency, chainId, address, providedDecimals, providedSymbol]);

    const errorMessage = useMemo(() => {
        return data?.decimalsError || data?.symbolError || data?.registryError || null;
    }, [data]);

    return {
        currency,
        error: errorMessage,
        isLoading,
    };
}

const fetchCurrencyData = async ({
    address,
    chainId,
    config,
    providedSymbol,
    providedDecimals,
}: {
    address: Address;
    chainId: number;
    config: Config;
    providedSymbol?: string;
    providedDecimals?: number;
}) => {
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
            abi: MockERC20.abi,
            functionName: "symbol",
            chainId,
        }),

        readContract(config, {
            address,
            abi: MockERC20.abi,
            functionName: "decimals",
            chainId,
        }),

        fetchTokenRegistryData(blockchain, address),
    ]);

    const [symbolResult, decimalsResult, registryResult] = results;

    return {
        symbol:
            providedSymbol ??
            (symbolResult.status === "fulfilled" ? symbolResult.value : undefined) ??
            (registryResult.status === "fulfilled" ? registryResult.value?.symbol : undefined),
        decimals:
            providedDecimals ??
            (decimalsResult.status === "fulfilled" ? decimalsResult.value : undefined) ??
            (registryResult.status === "fulfilled" ? registryResult.value?.decimals : undefined),
        symbolError: symbolResult.status === "rejected" ? symbolResult.reason.message : undefined,
        decimalsError: decimalsResult.status === "rejected" ? decimalsResult.reason.message : undefined,
        registryError: registryResult.status === "rejected" ? registryResult.reason.message : undefined,
    };
};

export const fetchCurrencyQueryOptions = ({
    chainId,
    address,
    config,
    symbol,
    decimals,
}: {
    chainId: number;
    address: Address;
    config: Config;
    symbol?: string;
    decimals?: number;
}) => ({
    queryKey: ["currency-data", chainId, address],
    queryFn: () =>
        fetchCurrencyData({
            address,
            chainId,
            config,
            providedSymbol: symbol,
            providedDecimals: decimals,
        }),
});

const DEFAULT_REGISTRY = "https://raw.githubusercontent.com/trustwallet/assets/master";

const fetchTokenRegistryData = async (
    blockchain: string,
    address: Address,
    registry: string = DEFAULT_REGISTRY,
): Promise<TokenInfo> => {
    const response = await fetch(`${registry}/blockchains/${blockchain}/assets/${address}/info.json`);
    if (!response.ok) throw new Error("Registry fetch failed");
    const data = await response.json();
    if (!data.symbol || typeof data.decimals !== "number") {
        throw new Error("Invalid registry data");
    }
    return data;
};

export const getChainById = (chainId: number) => {
    //@ts-expect-error
    return Object.values(chains).find((chain) => chain.id === chainId) as Chain;
};
