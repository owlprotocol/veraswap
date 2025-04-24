import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as permit2AllowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { Atom, atom, WritableAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getBalanceQueryOptions, readContractQueryOptions } from "wagmi/query";
import { GetBalanceReturnType } from "@wagmi/core";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, formatUnits } from "viem";
import { getTokenAddress, PERMIT2_ADDRESS, Token, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { accountAtom } from "./account.js";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { tokensAtom } from "./chains.js";
import { kernelAddressChainInQueryAtom, kernelAddressChainOutQueryAtom } from "./kernelSmartAccount.js";
import { disabledQueryAtom, disabledQueryOptions } from "./disabledQuery.js";
import { config } from "@/config.js";

/***** Atom Family *****/
export const tokenBalanceAtomFamily = atomFamily(
    ({ token, account }: { token: Token; account: Address }) =>
        atomWithQuery<bigint>(() => {
            if (token.standard === "NativeToken") {
                // Get native balance
                return {
                    ...(getBalanceQueryOptions(config, {
                        address: account,
                        chainId: token.chainId,
                    }) as any),
                    select: (data: GetBalanceReturnType) => data.value,
                };
            }

            // Get ERC20 balance
            const tokenAddress = getTokenAddress(token);
            return readContractQueryOptions(config, {
                abi: [balanceOfAbi],
                chainId: token.chainId,
                address: tokenAddress,
                functionName: "balanceOf",
                args: [account],
            });
        }),
    (a, b) => a.account === b.account && a.token.chainId === b.token.chainId && a.token.address === b.token.address,
) as unknown as AtomFamily<{ token: Token; account: Address }, Atom<AtomWithQueryResult<bigint>>>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const tokenAllowanceAtomFamily = atomFamily(
    ({ token, account, spender }: { token: Token; account: Address; spender: Address }) =>
        atomWithQuery<bigint>(() => {
            if (token.standard === "NativeToken") return disabledQueryOptions as any;

            // Get ERC20 allowance
            const tokenAddress = getTokenAddress(token);
            return readContractQueryOptions(config, {
                abi: [allowanceAbi],
                chainId: token.chainId,
                address: tokenAddress,
                functionName: "allowance",
                args: [account, spender],
            }) as any;
        }),
    (a, b) =>
        a.account === b.account &&
        a.spender === b.spender &&
        a.token.chainId === b.token.chainId &&
        a.token.address === b.token.address,
) as unknown as AtomFamily<{ token: Token; account: Address; spender: Address }, Atom<AtomWithQueryResult<bigint>>>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenAllowanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

export const tokenPermit2AllowanceAtomFamily = atomFamily(
    ({ token, account, spender }: { token: Token; account: Address; spender: Address }) =>
        atomWithQuery<[bigint, number, number]>(() => {
            if (token.standard === "NativeToken") return disabledQueryOptions as any;

            // Get ERC20 allowance
            const tokenAddress = getTokenAddress(token);
            return readContractQueryOptions(config, {
                abi: [permit2AllowanceAbi],
                chainId: token.chainId,
                address: PERMIT2_ADDRESS,
                functionName: "allowance",
                args: [account, tokenAddress, spender],
            }) as any;
        }),
    (a, b) =>
        a.account === b.account &&
        a.spender === b.spender &&
        a.token.chainId === b.token.chainId &&
        a.token.address === b.token.address,
) as unknown as AtomFamily<
    { token: Token; account: Address; spender: Address },
    Atom<AtomWithQueryResult<[bigint, number, number]>>
>;
// https://jotai.org/docs/utilities/family#caveat-memory-leaks
tokenPermit2AllowanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000); //same as tanstack query gcTime

/***** Balances *****/
export const tokenInAccountBalanceQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const account = get(accountAtom);
    if (!token || !account?.address) return get(disabledQueryAtom) as any;

    return get(tokenBalanceAtomFamily({ token, account: account.address }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAccountBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInAccountBalanceQueryAtom).data ?? null;
});

export const tokenInKernelBalanceQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    return get(tokenBalanceAtomFamily({ token, account }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenOutAccountBalanceQueryAtom = atom((get) => {
    const token = get(tokenOutAtom);
    const account = get(accountAtom);
    if (!token || !account?.address) return get(disabledQueryAtom) as any;

    return get(tokenBalanceAtomFamily({ token, account: account.address }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenOutKernelBalanceQueryAtom = atom((get) => {
    const token = get(tokenOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    return get(tokenBalanceAtomFamily({ token, account }));
}) as Atom<AtomWithQueryResult<bigint>>;

/***** Allowances *****/
export const tokenInAllowanceAccountToKernelQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const account = get(accountAtom);
    const { data: spender } = get(kernelAddressChainInQueryAtom);
    if (!token || !account?.address || !spender) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ token, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceAccountToPermit2QueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const account = get(accountAtom);
    if (!token || !account?.address) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ token, account: account.address, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceAccountToPermit2Atom = atom<bigint | null>((get) => {
    return get(tokenInAllowanceAccountToPermit2QueryAtom).data ?? null;
});

export const tokenInAllowanceKernelToPermit2QueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ token, account, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

export const tokenInAllowanceKernelToHypERC20CollateralQueryAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);

    if (
        !tokenIn ||
        !account ||
        (tokenIn.standard !== "HypERC20Collateral" && tokenIn.standard !== "HypSuperchainERC20Collateral")
    ) {
        return get(disabledQueryAtom) as any;
    }
    // tokenIn will actually be tokenIn.collateralAddress
    return get(tokenAllowanceAtomFamily({ token: tokenIn, account, spender: tokenIn.address }));
}) as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

export const tokenOutAllowanceKernelToPermit2QueryAtom = atom((get) => {
    const token = get(tokenOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    return get(tokenAllowanceAtomFamily({ token, account, spender: PERMIT2_ADDRESS }));
}) as Atom<AtomWithQueryResult<bigint>>;

/***** Permit2 Allowances *****/
export const tokenInPermit2AllowanceAccountToKernelQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const account = get(accountAtom);
    const { data: spender } = get(kernelAddressChainInQueryAtom);
    if (!token || !account?.address || !spender) return get(disabledQueryAtom) as any;

    return get(tokenPermit2AllowanceAtomFamily({ token, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenInPermit2AllowanceAccountToUniswapRouterQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const account = get(accountAtom);
    if (!token || !account?.address) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[token.chainId];
    if (!uniswapContracts) return disabledQueryOptions as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ token, account: account.address, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenInPermit2AllowanceKernelToUniswapRouterQueryAtom = atom((get) => {
    const token = get(tokenInAtom);
    const { data: account } = get(kernelAddressChainInQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[token.chainId];
    if (!uniswapContracts) return get(disabledQueryAtom) as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ token, account, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenOutPermit2AllowanceKernelToUniswapRouterQueryAtom = atom((get) => {
    const token = get(tokenOutAtom);
    const { data: account } = get(kernelAddressChainOutQueryAtom);
    if (!token || !account) return get(disabledQueryAtom) as any;

    const uniswapContracts = UNISWAP_CONTRACTS[token.chainId];
    if (!uniswapContracts) return get(disabledQueryAtom) as any;
    const spender = uniswapContracts.universalRouter;

    return get(tokenPermit2AllowanceAtomFamily({ token, account, spender }));
}) as Atom<AtomWithQueryResult<readonly [bigint, number, number]>>;

export const tokenBalancesAtom = atom((get) => {
    const allTokens = get(tokensAtom);
    const account = get(accountAtom);

    return allTokens.map((token) => {
        const balanceRaw = account.address
            ? (get(tokenBalanceAtomFamily({ token, account: account.address })).data ?? 0n)
            : 0n;
        const decimals = token?.decimals ?? 18;
        const balance = Number(formatUnits(balanceRaw, decimals));

        return {
            token,
            balance,
        };
    });
});
