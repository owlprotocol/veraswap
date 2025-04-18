import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as permit2AllowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { Atom, atom, WritableAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { GetBalanceReturnType } from "@wagmi/core";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, formatUnits } from "viem";
import {
    PERMIT2_ADDRESS,
    UNISWAP_CONTRACTS,
    isNativeCurrency,
    getUniswapV4Address,
    Currency,
    isMultichainToken,
} from "@owlprotocol/veraswap-sdk";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { accountAtom } from "./account.js";
import { currencyInAtom, currencyOutAtom } from "./tokens.js";
import { currenciesAtom } from "./chains.js";
import { kernelAddressChainInQueryAtom, kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { disabledQueryAtom, disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

/***** Atom Family *****/
export const currencyBalanceAtomFamily = atomFamily(
    ({ currency, account }: { currency: Currency; account: Address }) =>
        atomWithQuery<bigint>(() => {
            if (isNativeCurrency(currency)) {
                // Get native balance
                return {
                    ...(getBalanceQueryOptions(config, {
                        address: account,
                        chainId: currency.chainId,
                    }) as any),
                    select: (data: GetBalanceReturnType) => data.value,
                };
            }

            const tokenAddress = isMultichainToken(currency)
                ? (currency.hyperlaneAddress ?? currency.address)
                : currency.address;
            return readContractQueryOptions(config, {
                abi: [balanceOfAbi],
                chainId: currency.chainId,
                address: tokenAddress,
                functionName: "balanceOf",
                args: [account],
            });
        }),
    (a, b) =>
        a.account === b.account &&
        a.currency.chainId === b.currency.chainId &&
        getUniswapV4Address(a.currency) === getUniswapV4Address(b.currency),
) as unknown as AtomFamily<{ currency: Currency; account: Address }, Atom<AtomWithQueryResult<bigint>>>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
currencyBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const tokenAllowanceAtomFamily = atomFamily(
    ({ currency, account, spender }: { currency: Currency; account: Address; spender: Address }) =>
        atomWithQuery<bigint>(() => {
            if (isNativeCurrency(currency)) return disabledQueryOptions as any;

            // Get ERC20 allowance
            const tokenAddress = isMultichainToken(currency)
                ? (currency.hyperlaneAddress ?? currency.address)
                : currency.address;
            return readContractQueryOptions(config, {
                abi: [allowanceAbi],
                chainId: currency.chainId,
                address: tokenAddress,
                functionName: "allowance",
                args: [account, spender],
            }) as any;
        }),
    (a, b) =>
        a.account === b.account &&
        a.spender === b.spender &&
        a.currency.chainId === b.currency.chainId &&
        getUniswapV4Address(a.currency) === getUniswapV4Address(b.currency),
) as unknown as AtomFamily<
    { currency: Currency; account: Address; spender: Address },
    Atom<AtomWithQueryResult<bigint>>
>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenAllowanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const tokenPermit2AllowanceAtomFamily = atomFamily(
    ({ currency, account, spender }: { currency: Currency; account: Address; spender: Address }) =>
        atomWithQuery<[bigint, number, number]>(() => {
            if (isNativeCurrency(currency)) return disabledQueryOptions as any;

            // Get ERC20 allowance
            const tokenAddress = isMultichainToken(currency)
                ? (currency.hyperlaneAddress ?? currency.address)
                : currency.address;
            return readContractQueryOptions(config, {
                abi: [permit2AllowanceAbi],
                chainId: currency.chainId,
                address: PERMIT2_ADDRESS,
                functionName: "allowance",
                args: [account, tokenAddress, spender],
            }) as any;
        }),
    (a, b) =>
        a.account === b.account &&
        a.spender === b.spender &&
        a.currency.chainId === b.currency.chainId &&
        getUniswapV4Address(a.currency) === getUniswapV4Address(b.currency),
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
