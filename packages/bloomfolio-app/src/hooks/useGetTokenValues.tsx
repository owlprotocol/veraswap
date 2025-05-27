import {
    DEFAULT_POOL_PARAMS,
    V4MetaQuoteExactBestParams,
    V4MetaQuoteExactBestReturnType,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk";
import { Address, numberToHex, zeroAddress } from "viem";
import { useQueries } from "@tanstack/react-query";

import { metaQuoteExactOutputBest } from "@owlprotocol/veraswap-sdk/artifacts/IV4MetaQuoter";
import { readContractQueryOptions } from "wagmi/query";
import { BigNumber } from "@ethersproject/bignumber";
import { config } from "@/config.js";
import { getCurrencyHops } from "@/constants/tokens.js";
import { USD_CURRENCIES } from "@/pages/BasketPage.js";

export const unitsToQuote = 10n ** 18n;

export function useGetTokenValues({
    chainId,
    basketDetails,
    // quoteCurrency,
}: {
    chainId: number;
    basketDetails: readonly { addr: Address; units: bigint }[];
    // quoteCurrency: { address: Address; decimals: number };
}) {
    const v4MetaQuoter = UNISWAP_CONTRACTS[chainId]!.v4MetaQuoter!;
    const hopCurrencies = getCurrencyHops(chainId);

    const usdCurrency = USD_CURRENCIES[chainId] ?? { address: zeroAddress, decimals: 18 };

    return useQueries({
        queries: basketDetails.map((allocation) =>
            // TODO: cast return type
            readContractQueryOptions(config, {
                chainId,
                abi: [metaQuoteExactOutputBest],
                address: v4MetaQuoter,
                functionName: "metaQuoteExactOutputBest",
                // @ts-expect-error wrong type since query key can't have a bigint
                args: [
                    {
                        // exactAmount: numberToHex(allocation.units * unitsToQuote),
                        exactAmount: numberToHex(10n ** BigInt(usdCurrency.decimals)),
                        exactCurrency: usdCurrency.address,
                        variableCurrency: allocation.addr,
                        hopCurrencies: hopCurrencies.filter((c) => c !== usdCurrency.address && c !== allocation.addr),
                        poolKeyOptions: Object.values(DEFAULT_POOL_PARAMS),
                    },
                ] as V4MetaQuoteExactBestParams,
            }),
        ),
        combine: (results) => ({
            data: results.map((result, idx) => {
                if (!result.data) return 0n;
                // @ts-ignore result.data does exist
                const data = result.data as V4MetaQuoteExactBestReturnType;

                const bestSwap = data[2];
                if (bestSwap === 0) return 0n;

                const variableAmount = data[(bestSwap - 1) as 0 | 1].variableAmount;
                const units = basketDetails[idx].units;

                return (
                    BigNumber.from(variableAmount as unknown as number)
                        .mul(unitsToQuote as unknown as number)
                        .div(units as unknown as number)
                        // .div(unitsToQuote)
                        .toBigInt()
                );
            }),
            pending: results.some((result) => result.isPending),
        }),
    });
}
