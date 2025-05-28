import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex, zeroAddress } from "viem";

import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../../types/PoolKey.js";

import { MetaQuoteBestType, metaQuoteExactInputBest } from "./MetaQuoter.js";

export interface GetMetaQuoteExactInputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    /** @default currencyHops [zeroAddress] (native currency) */
    currencyHops?: Address[];
    contracts: {
        metaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

export function getMetaQuoteExactInputQueryOptions(wagmiConfig: Config, params: GetMetaQuoteExactInputParams) {
    const {
        chainId,
        currencyOut,
        amountIn,
        currencyIn,
        contracts,
        currencyHops = [zeroAddress],
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    return readContractQueryOptions(wagmiConfig, {
        chainId,
        address: contracts.metaQuoter,
        abi: [metaQuoteExactInputBest],
        functionName: "metaQuoteExactInputBest",
        args: [
            {
                exactCurrency: currencyOut,
                variableCurrency: currencyIn,
                // Filter out hop currencies that are the same as currencyIn or currencyOut
                hopCurrencies: currencyHops.filter((hopToken) => hopToken !== currencyOut && hopToken !== currencyIn),
                exactAmount: numberToHex(amountIn) as unknown as bigint,
                // @ts-expect-error Viem type inference issue
                poolKeyOptions,
            } as const,
        ],
    });
}

export function getMetaQuoteExactInputAmountQueryOptions(wagmiConfig: Config, params: GetMetaQuoteExactInputParams) {
    return queryOptions({
        ...getMetaQuoteExactInputQueryOptions(wagmiConfig, params),
        select: (data) => {
            if (!data) return null;

            const [bestQuoteSingle, bestQuoteMultihop, bestQuoteType] = data;
            if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.None) {
                return 0n;
            } else if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
                return bestQuoteSingle.variableAmount;
            }
            return bestQuoteMultihop.variableAmount;
        },
    });
}

export async function getMetaQuoteExactInput(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactInputParams,
) {
    return queryClient.fetchQuery(getMetaQuoteExactInputQueryOptions(wagmiConfig, params));
}

export async function getMetaQuoteExactInputAmount(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactInputParams,
): Promise<bigint> {
    const [bestQuoteSingle, bestQuoteMultihop, bestQuoteType] = await getMetaQuoteExactInput(
        queryClient,
        wagmiConfig,
        params,
    );
    if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.None) {
        return 0n;
    } else if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
        return bestQuoteSingle.variableAmount;
    }
    return bestQuoteMultihop.variableAmount;
}
