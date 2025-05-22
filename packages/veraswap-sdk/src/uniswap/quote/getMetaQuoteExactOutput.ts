import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex } from "viem";

import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../../types/PoolKey.js";
import { metaQuoteExactOutputBest, V4MetaQuoteBestType } from "../V4MetaQuoter.js";

export interface GetMetaQuoteExactOutputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountOut: bigint;
    currencyHops: Address[];
    contracts: {
        v4MetaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

export function getMetaQuoteExactOutputQueryOptions(wagmiConfig: Config, params: GetMetaQuoteExactOutputParams) {
    const {
        chainId,
        currencyOut,
        amountOut,
        currencyIn,
        contracts,
        currencyHops,
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    return readContractQueryOptions(wagmiConfig, {
        chainId,
        address: contracts.v4MetaQuoter,
        abi: [metaQuoteExactOutputBest],
        functionName: "metaQuoteExactOutputBest",
        args: [
            {
                exactCurrency: currencyOut,
                variableCurrency: currencyIn,
                hopCurrencies: currencyHops.filter((hopToken) => hopToken !== currencyOut && hopToken !== currencyIn),
                exactAmount: numberToHex(amountOut) as unknown as bigint,
                // @ts-expect-error Viem type inference issue
                poolKeyOptions,
            } as const,
        ],
    });
}

export function getMetaQuoteExactOutputAmountQueryOptions(wagmiConfig: Config, params: GetMetaQuoteExactOutputParams) {
    return queryOptions({
        ...getMetaQuoteExactOutputQueryOptions(wagmiConfig, params),
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

export async function getMetaQuoteExactOutput(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactOutputParams,
) {
    return queryClient.fetchQuery(getMetaQuoteExactOutputQueryOptions(wagmiConfig, params));
}

export async function getMetaQuoteExactOutputAmount(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetMetaQuoteExactOutputParams,
): Promise<bigint> {
    const [bestQuoteSingle, bestQuoteMultihop, bestQuoteType] = await getMetaQuoteExactOutput(
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
