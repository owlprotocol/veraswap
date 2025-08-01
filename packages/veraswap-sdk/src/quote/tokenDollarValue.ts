import { queryOptions } from "@tanstack/react-query";
import { Config, readContract } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, numberToHex, parseUnits, zeroAddress } from "viem";

import { UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { USD_CURRENCIES } from "../currency/usdCurrencies.js";
import { getCurrencyHops } from "../swap/getCurrencyHops.js";
import { DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";
import { metaQuoteExactOutputBest } from "../uniswap/quote/MetaQuoter.js";

const tokenDollarQuoteAmount = (decimals: number) => parseUnits("1", decimals);

export async function getTokenDollarValue(
    config: Config,
    { tokenAddress, chainId }: { tokenAddress?: Address; chainId?: number },
) {
    if (!tokenAddress || !chainId) return 0n;

    // TODO: remove all this once we know metaQuoter is always available
    const metaQuoter = UNISWAP_CONTRACTS[chainId]!.metaQuoter;
    invariant(metaQuoter, `Meta quoter not found for chain ${chainId}.`);

    const hopCurrencies = getCurrencyHops(chainId);

    const usdCurrency = USD_CURRENCIES[chainId] ?? { address: zeroAddress, decimals: 18 };

    // 1 USD is always 1 USD
    if (usdCurrency.address === tokenAddress) return tokenDollarQuoteAmount(usdCurrency.decimals);

    const quote = await readContract(config, {
        chainId,
        abi: [metaQuoteExactOutputBest],
        address: metaQuoter,
        functionName: "metaQuoteExactOutputBest",
        args: [
            {
                exactAmount: numberToHex(tokenDollarQuoteAmount(usdCurrency.decimals)) as unknown as bigint,
                exactCurrency: usdCurrency.address,
                variableCurrency: tokenAddress,
                hopCurrencies: hopCurrencies.filter((c) => c !== usdCurrency.address && c !== tokenAddress),
                poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
            },
        ],
    });

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
