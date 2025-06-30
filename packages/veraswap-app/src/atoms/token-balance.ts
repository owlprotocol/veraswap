import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as permit2AllowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { Atom, atom, WritableAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { GetBalanceReturnType } from "@wagmi/core";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, formatUnits, parseUnits } from "viem";

import {
    PERMIT2_ADDRESS,
    UNISWAP_CONTRACTS,
    getUniswapV4Address,
    Currency,
    USD_CURRENCIES,
    STARGATE_TOKEN_POOLS,
} from "@owlprotocol/veraswap-sdk";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { getTokenDollarValueQueryOptions } from "@owlprotocol/veraswap-sdk";
import { groupBy } from "lodash-es";
import { accountAtom } from "./account.js";
import { currencyInAtom, currencyOutAtom, tokenInAmountAtom } from "./tokens.js";
import { kernelAddressChainInQueryAtom, kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { disabledQueryAtom, disabledQueryOptions } from "./disabledQuery.js";
import { routeMultichainAtom, transactionTypeAtom } from "./uniswap.js";
import { orbiterQuoteAtom, orbiterRouterAtom } from "./orbiter.js";
import { currenciesAtom } from "./chains.js";

import { stargateQuoteAtom } from "./stargate.js";
import { config } from "@/config.js";

/***** Atom Family *****/
export const currencyBalanceAtomFamily = atomFamily(
    ({ currency, account }: { currency: Currency; account: Address }) =>
        atomWithQuery<bigint>(() => {
            if (currency.isNative) {
                // Get native balance
                return {
                    ...(getBalanceQueryOptions(config, {
                        address: account,
                        chainId: currency.chainId,
                    }) as any),
                    select: (data: GetBalanceReturnType) => data.value,
                };
            }

            return readContractQueryOptions(config, {
                abi: [balanceOfAbi],
                chainId: currency.chainId,
                address: currency.address,
                functionName: "balanceOf",
                args: [account],
            });
        }),
    (a, b) => a.account === b.account && a.currency.equals(b.currency),
) as unknown as AtomFamily<{ currency: Currency; account: Address }, Atom<AtomWithQueryResult<bigint>>>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
currencyBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const currencyMultichainBalanceAtomFamily = atomFamily(
    (symbol: string) =>
        atom((get) => {
            const currencyGroups = get(currenciesBySymbolAtom);
            const matchingCurrencies = currencyGroups[symbol];
            const account = get(accountAtom);

            const currenciesWithBalance = matchingCurrencies.map((currency) => {
                const balanceRaw = account?.address
                    ? (get(currencyBalanceAtomFamily({ currency, account: account.address })).data ?? 0n)
                    : 0n;
                const decimals = currency.decimals ?? 18;
                const balance = Number(formatUnits(balanceRaw, decimals));

                return {
                    currency,
                    balance,
                };
            });

            const totalBalance = currenciesWithBalance.reduce((sum, item) => sum + item.balance, 0);

            return {
                balance: totalBalance,
                currencies: currenciesWithBalance,
            };
        }),
    (a, b) => a === b,
);
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
currencyMultichainBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

export const tokenAllowanceAtomFamily = atomFamily(
    ({ currency, account, spender }: { currency: Currency; account: Address; spender: Address }) =>
        atomWithQuery<bigint>(() => {
            if (currency.isNative) return disabledQueryOptions as any;

            return readContractQueryOptions(config, {
                abi: [allowanceAbi],
                chainId: currency.chainId,
                address: currency.address,
                functionName: "allowance",
                args: [account, spender],
            }) as any;
        }),
    (a, b) => a.account === b.account && a.spender === b.spender && a.currency.equals(b.currency),
) as unknown as AtomFamily<
    { currency: Currency; account: Address; spender: Address },
    Atom<AtomWithQueryResult<bigint>>
>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenAllowanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const tokenPermit2AllowanceAtomFamily = atomFamily(
    ({ currency, account, spender }: { currency: Currency; account: Address; spender: Address }) =>
        atomWithQuery<[bigint, number, number]>(() => {
            if (currency.isNative) return disabledQueryOptions as any;

            return readContractQueryOptions(config, {
                abi: [permit2AllowanceAbi],
                chainId: currency.chainId,
                address: PERMIT2_ADDRESS,
                functionName: "allowance",
                args: [account, currency.address, spender],
            }) as any;
        }),
    (a, b) => a.account === b.account && a.spender === b.spender && a.currency.equals(b.currency),
) as unknown as AtomFamily<
    { currency: Currency; account: Address; spender: Address },
    Atom<AtomWithQueryResult<[bigint, number, number]>>
>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenPermit2AllowanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

/***** Balances *****/
export const tokenInAccountBalanceQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const account = get(accountAtom);
    if (!currency || !account?.address) return get(disabledQueryAtom) as any;

    return get(currencyBalanceAtomFamily({ currency, account: account.address }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAccountBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInAccountBalanceQueryAtom).data ?? null;
});

export const tokenInKernelBalanceQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    return get(currencyBalanceAtomFamily({ currency, account }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenOutAccountBalanceQueryAtom = atom((get) => {
    const currency = get(currencyOutAtom);
    const account = get(accountAtom);
    if (!currency || !account?.address) return get(disabledQueryAtom) as any;

    return get(currencyBalanceAtomFamily({ currency, account: account.address }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenOutKernelBalanceQueryAtom = atom((get) => {
    const currency = get(currencyOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    return get(currencyBalanceAtomFamily({ currency, account }));
}) as Atom<AtomWithQueryResult<bigint>>;

/***** Allowances *****/
export const tokenInAllowanceAccountToKernelQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const account = get(accountAtom);
    const { data: spender } = get(kernelAddressChainInQueryAtom);
    if (!currency || !account?.address || !spender) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ currency, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceAccountToPermit2QueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const account = get(accountAtom);
    if (!currency || !account?.address) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ currency, account: account.address, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceAccountToPermit2Atom = atom<bigint | null>((get) => {
    return get(tokenInAllowanceAccountToPermit2QueryAtom).data ?? null;
});

export const tokenInAllowanceKernelToPermit2QueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ currency, account, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceKernelToHypERC20CollateralQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);

    if (!currency || !account || "collateralAddress" in currency) {
        return get(disabledQueryAtom) as any;
    }
    // tokenIn will actually be tokenIn.collateralAddress
    return get(tokenAllowanceAtomFamily({ currency, account, spender: getUniswapV4Address(currency) }));
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

export const tokenOutAllowanceKernelToPermit2QueryAtom = atom((get) => {
    const currency = get(currencyOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ currency, account, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

/***** Permit2 Allowances *****/
export const tokenInPermit2AllowanceAccountToKernelQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const account = get(accountAtom);
    const { data: spender } = get(kernelAddressChainInQueryAtom);
    if (!currency || !account?.address || !spender) return get(disabledQueryAtom) as any;

    return get(tokenPermit2AllowanceAtomFamily({ currency, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenInPermit2AllowanceAccountToUniswapRouterQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const account = get(accountAtom);
    if (!currency || !account?.address) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[currency.chainId];
    if (!uniswapContracts) return disabledQueryOptions as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ currency, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenInPermit2AllowanceKernelToUniswapRouterQueryAtom = atom((get) => {
    const currency = get(currencyInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[currency.chainId];
    if (!uniswapContracts) return get(disabledQueryAtom) as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ currency, account, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenOutPermit2AllowanceKernelToUniswapRouterQueryAtom = atom((get) => {
    const currency = get(currencyOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!currency || !account) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[currency.chainId];
    if (!uniswapContracts) return get(disabledQueryAtom) as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ currency, account, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const currencyBalancesAtom = atom((get) => {
    const allCurrencies = get(currenciesAtom);
    const account = get(accountAtom);

    return allCurrencies.map((currency) => {
        const balanceRaw = account.address
            ? (get(currencyBalanceAtomFamily({ currency, account: account.address })).data ?? 0n)
            : 0n;
        const decimals = currency.decimals ?? 18;
        const balance = Number(formatUnits(balanceRaw, decimals));

        return {
            currency,
            balance,
        };
    });
});

export const amountOutAtom = atom((get) => {
    const transactionType = get(transactionTypeAtom);
    const orbiterRouter = get(orbiterRouterAtom);
    const currencyOut = get(currencyOutAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const quoterData = get(routeMultichainAtom).data;

    if (!transactionType || !currencyOut || !tokenInAmount) return "";

    const {
        data: orbiterQuote,
        fetchStatus: orbiterQuoteFetchStatus,
        status: orbiterQuoteStatus,
    } = get(orbiterQuoteAtom);

    const {
        data: stargateQuote,
        fetchStatus: stargateQuoteFetchStatus,
        status: stargateQuoteStatus,
    } = get(stargateQuoteAtom);

    let amountOut = "";

    if (transactionType.withSuperchain) {
        if (transactionType.type === "BRIDGE") {
            amountOut = formatUnits(tokenInAmount, currencyOut.decimals);
        } else if (transactionType.type === "SWAP_BRIDGE") {
            if (!quoterData?.amountOut) return "";
            amountOut = formatUnits(quoterData?.amountOut, currencyOut.decimals ?? 18);
        } else if (quoterData) {
            amountOut = formatUnits(quoterData.amountOut, currencyOut?.decimals ?? 18);
        }

        return amountOut;
    }

    // TODO: improve how we show amount out
    if (transactionType?.type === "BRIDGE" || transactionType?.type === "SWAP_BRIDGE") {
        const bridgeCurrencyIn =
            transactionType.type === "BRIDGE" ? transactionType.currencyIn : transactionType.bridge.currencyIn;

        if (
            !bridgeCurrencyIn.symbol ||
            (!bridgeCurrencyIn.isNative && !(bridgeCurrencyIn.symbol in STARGATE_TOKEN_POOLS))
        ) {
            // Must be bridging with Hyperlane even though there is a stargate or orbiter quote
            if (!quoterData) return "";

            amountOut = formatUnits(quoterData.amountOut, currencyOut?.decimals ?? 18);
            return amountOut;
        }

        // TODO: remove orbiter references entirely
        if (stargateQuote && currencyOut) {
            amountOut = formatUnits(
                stargateQuote.type === "ETH" ? stargateQuote.minAmountLDFeeRemoved : stargateQuote.minAmountOut,
                currencyOut.decimals,
            );
        } else if (orbiterRouter && orbiterQuote && currencyOut) {
            const amountOutDecimalsStripped = orbiterQuote.details.minDestTokenAmount.split(".")[0];
            amountOut = formatUnits(BigInt(amountOutDecimalsStripped), currencyOut.decimals);
            // Only shouw
        } else if (!stargateQuote && (stargateQuoteFetchStatus === "fetching" || stargateQuoteStatus === "error")) {
            amountOut = "";
        } else if (!orbiterQuote && (orbiterQuoteFetchStatus === "fetching" || orbiterQuoteStatus === "error")) {
            amountOut = "";
        } else if (!orbiterRouter && currencyOut.symbol === "ETH") {
            // Need to bridge, but there's no provider that supports bridging ETH
            amountOut = formatUnits(0n, currencyOut.decimals ?? 18);
        } else if (!orbiterRouter && orbiterQuoteFetchStatus === "idle" && orbiterQuoteStatus !== "error") {
            amountOut = formatUnits(tokenInAmount ?? 0n, currencyOut?.decimals ?? 18);
        }
    } else if (quoterData) {
        amountOut = formatUnits(quoterData.amountOut, currencyOut?.decimals ?? 18);
    }

    return amountOut;
});

const calculateUsdValueFromQuote = (
    amount: bigint,
    quote: bigint,
    quoteUsdDecimals: number,
    chainId: number,
): number => {
    // Default is Ether decimals
    const currencyUsdDecimals = USD_CURRENCIES[chainId]?.decimals ?? 18;
    const decimalsDiff = currencyUsdDecimals - quoteUsdDecimals;

    // If decimals diff is negative, you need to divide the quote by the absolute decimals difference
    const adjustedQuote = decimalsDiff > 0 ? quote * 10n ** BigInt(decimalsDiff) : quote / 10n ** BigInt(-decimalsDiff);

    const precision = 10000000n;
    const result = (amount * precision) / adjustedQuote;

    return Number(result) / 10000000;
};

// Gets token price in USD
export const tokenDollarValueAtomFamily = atomFamily(
    ({ currency, chainId }: { currency: Currency; chainId: number }) =>
        atomWithQuery<bigint>(() => {
            if (!currency) return disabledQueryOptions as any;

            return {
                ...getTokenDollarValueQueryOptions(config, {
                    tokenAddress: getUniswapV4Address(currency),
                    chainId,
                }),
                // override app default, causes too much flickering
                staleTime: 5 * 60 * 1000,
                refetchInterval: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
            };
        }),
    (a, b) => a.currency.equals(b.currency) && a.chainId === b.chainId,
) as unknown as AtomFamily<{ currency: Currency; chainId: number }, Atom<AtomWithQueryResult<bigint>>>;

// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenDollarValueAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

export const currenciesBySymbolAtom = atom((get) => {
    const allCurrencies = get(currenciesAtom);
    return groupBy(
        allCurrencies.filter((currency) => currency.symbol),
        "symbol",
    );
});

// Gets the best available token price in USD across all chains
export const bestTokenDollarValueAtomFamily = atomFamily(
    (symbol: string) =>
        atom((get) => {
            const currencyGroups = get(currenciesBySymbolAtom);
            const matchingCurrencies = currencyGroups[symbol];

            const quotes = matchingCurrencies.map((currency) => {
                const quote = get(tokenDollarValueAtomFamily({ currency, chainId: currency.chainId }));
                const usdDecimals = USD_CURRENCIES[currency.chainId]?.decimals ?? 6;
                const decimalsDiff = 18 - usdDecimals;

                let normalizedValue: bigint | undefined = undefined;
                if (quote.data) {
                    normalizedValue =
                        decimalsDiff > 0
                            ? quote.data * 10n ** BigInt(decimalsDiff)
                            : quote.data / 10n ** BigInt(-decimalsDiff);
                }

                return {
                    currency,
                    normalizedValue,
                    quote: quote.data,
                    usdDecimals,
                    isLoading: quote.isLoading,
                    isError: quote.isError,
                };
            });

            const validQuotes = quotes.filter((q) => !!q.quote && !q.isError);

            if (validQuotes.length > 0) {
                // return the highest quote and its decimals
                const bestQuote = validQuotes.reduce((max, curr) =>
                    curr.normalizedValue! > max.normalizedValue! ? curr : max,
                );
                return {
                    quote: bestQuote.quote,
                    usdDecimals: bestQuote.usdDecimals,
                };
            }

            // return undefined if all quotes are invalid or loading
            if (quotes.every((q) => q.isLoading || q.isError || !q.quote)) {
                return undefined;
            }
        }),
    (a, b) => a === b,
) as unknown as AtomFamily<string, Atom<{ quote: bigint; usdDecimals: number } | undefined>>;

bestTokenDollarValueAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

// Calculates how much a token is worth in USD
export const currencyUsdBalanceAtomFamily = atomFamily(
    ({ currency, account }: { currency: Currency; account: Address }) =>
        atom((get) => {
            const balanceQuery = get(currencyBalanceAtomFamily({ currency, account }));
            if (!currency.symbol) return undefined;

            // get best quote across all chains
            const bestQuoteData = get(bestTokenDollarValueAtomFamily(currency.symbol));
            if (!balanceQuery.data || !bestQuoteData) return undefined;

            const { quote, usdDecimals } = bestQuoteData;
            return calculateUsdValueFromQuote(balanceQuery.data, quote, usdDecimals, currency.chainId);
        }),
    (a, b) => a.account === b.account && a.currency.equals(b.currency),
);

// https://jotai.org/docs/utilities/family#caveat-memory-leaks
currencyUsdBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

// Shows total USD value
export const currencyMultichainUsdBalanceAtomFamily = atomFamily(
    (symbol: string) =>
        atom((get) => {
            const currencyGroups = get(currenciesBySymbolAtom);
            const matchingCurrencies = currencyGroups[symbol];
            const account = get(accountAtom);

            if (!account?.address) return undefined;

            const balances = matchingCurrencies.map((currency) => {
                const balance = get(currencyBalanceAtomFamily({ currency, account: account.address! }));
                const usdBalance = get(currencyUsdBalanceAtomFamily({ currency, account: account.address! }));
                return { balance: balance.data, usdBalance };
            });

            const validBalances = balances.filter((b) => !!b.balance && !!b.usdBalance);

            if (validBalances.length === 0) return undefined;

            return validBalances.reduce((sum, { usdBalance }) => sum + (usdBalance ?? 0), 0);
        }),
    (a, b) => a === b,
);
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
currencyMultichainUsdBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

export const tokenInUsdValueAtom = atom((get) => {
    const currencyIn = get(currencyInAtom);
    const tokenInAmount = get(tokenInAmountAtom);

    if (!currencyIn?.symbol || !tokenInAmount) return undefined;

    const bestQuoteData = get(bestTokenDollarValueAtomFamily(currencyIn.symbol));
    if (!bestQuoteData) return undefined;

    const { quote, usdDecimals } = bestQuoteData;
    return calculateUsdValueFromQuote(tokenInAmount, quote, usdDecimals, currencyIn.chainId);
});

export const tokenOutUsdValueAtom = atom((get) => {
    const currencyOut = get(currencyOutAtom);
    const amountOut = get(amountOutAtom);

    if (!currencyOut?.symbol || !amountOut) return undefined;

    const bestQuoteData = get(bestTokenDollarValueAtomFamily(currencyOut.symbol));
    if (!bestQuoteData) return undefined;

    const { quote, usdDecimals } = bestQuoteData;
    const amountOutBigInt = parseUnits(amountOut, currencyOut.decimals);
    return calculateUsdValueFromQuote(amountOutBigInt, quote, usdDecimals, currencyOut.chainId);
});
