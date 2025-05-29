import { queryOptions } from "@tanstack/react-query";
import { Config, readContract } from "@wagmi/core";
import { Address, numberToHex, parseUnits, zeroAddress } from "viem";

import { UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { USD_CURRENCIES } from "../currency/usdCurrencies.js";
import { getCurrencyHops } from "../swap/getCurrencyHops.js";
import { DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";
import {
    metaQuoteExactOutputBest,
    V4MetaQuoteExactBestParams,
    V4MetaQuoteExactBestReturnType,
} from "../uniswap/V4MetaQuoter.js";

export async function getTokenDollarValue(
    config: Config,
    { tokenAddress, chainId }: { tokenAddress?: Address; chainId?: number },
) {
    if (!tokenAddress || !chainId) return 0n;

    const v4MetaQuoter = UNISWAP_CONTRACTS[chainId]!.v4MetaQuoter!;
    const hopCurrencies = getCurrencyHops(chainId);

    const usdCurrency = USD_CURRENCIES[chainId] ?? { address: zeroAddress, decimals: 18 };

    const quote = (await readContract(config, {
        chainId,
        abi: [metaQuoteExactOutputBest],
        address: v4MetaQuoter,
        functionName: "metaQuoteExactOutputBest",
        // @ts-expect-error wrong type since query key can't have a bigint
        args: [
            {
                exactAmount: numberToHex(parseUnits("1", usdCurrency.decimals)),
                exactCurrency: usdCurrency.address,
                variableCurrency: tokenAddress,
                hopCurrencies: hopCurrencies.filter((c) => c !== usdCurrency.address && c !== tokenAddress),
                poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
            },
        ] as V4MetaQuoteExactBestParams,
    })) as V4MetaQuoteExactBestReturnType;

    const bestSwap = quote[2];
    if (bestSwap === 0) return 0n;

    const value = bestSwap === 1 ? quote[0].variableAmount : quote[1].variableAmount;
    return value;
}

export function getTokenDollarValueQueryOptions(
    config: Config,
    { tokenAddress, chainId }: { tokenAddress?: Address; chainId?: number },
) {
    return queryOptions({
        queryKey: ["getTokenDollarValue", tokenAddress, chainId],
        queryFn: () => getTokenDollarValue(config, { tokenAddress, chainId }),
        enabled: !!tokenAddress && !!chainId,
    });
}
