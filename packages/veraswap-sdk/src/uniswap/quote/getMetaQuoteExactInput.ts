import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex } from "viem";

import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../../types/PoolKey.js";
import { metaQuoteExactInputBest, V4MetaQuoteBestType } from "../V4MetaQuoter.js";

export interface GetMetaQuoteExactInputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountIn: bigint;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
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
        currencyHops,
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    return readContractQueryOptions(wagmiConfig, {
        chainId,
        address: contracts.v4MetaQuoter,
        abi: [metaQuoteExactInputBest],
        functionName: "metaQuoteExactInputBest",
        args: [
            {
                exactCurrency: currencyOut,
                variableCurrency: currencyIn,
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
            if ((bestQuoteType as V4MetaQuoteBestType) === V4MetaQuoteBestType.None) {
                return 0n;
            } else if ((bestQuoteType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Single) {
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
    if ((bestQuoteType as V4MetaQuoteBestType) === V4MetaQuoteBestType.None) {
        return 0n;
    } else if ((bestQuoteType as V4MetaQuoteBestType) === V4MetaQuoteBestType.Single) {
        return bestQuoteSingle.variableAmount;
    }
    return bestQuoteMultihop.variableAmount;
}
