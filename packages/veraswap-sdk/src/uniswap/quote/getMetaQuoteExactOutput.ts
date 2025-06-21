import { QueryClient, queryOptions } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, numberToHex, zeroAddress } from "viem";

import { DEFAULT_POOL_PARAMS, PoolKeyOptions } from "../../types/PoolKey.js";

import { MetaQuoteBestType, metaQuoteExactOutputBest } from "./MetaQuoter.js";

export interface GetMetaQuoteExactOutputParams {
    chainId: number;
    currencyIn: Address;
    currencyOut: Address;
    amountOut: bigint;
    /** @default currencyHops [zeroAddress] (native currency) */
    currencyHops?: Address[];
    contracts: {
        metaQuoter: Address;
    };
    poolKeyOptions?: PoolKeyOptions[];
}

export function getMetaQuoteExactOutputQueryOptions(wagmiConfig: Config, params: GetMetaQuoteExactOutputParams) {
    const {
        chainId,
        currencyIn,
        currencyOut,
        amountOut,
        contracts,
        currencyHops = [zeroAddress],
        poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS),
    } = params;

    return readContractQueryOptions(wagmiConfig, {
        chainId,
        address: contracts.metaQuoter,
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
            if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.None) {
                return 0n;
            } else if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
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
    if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.None) {
        return 0n;
    } else if ((bestQuoteType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
        return bestQuoteSingle.variableAmount;
    }
    return bestQuoteMultihop.variableAmount;
}
