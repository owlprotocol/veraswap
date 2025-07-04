import { atom, Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, Chain, zeroHash, Hash, Hex } from "viem";
import { LOCAL_KERNEL_CONTRACTS, LOCAL_CURRENCIES, getUniswapV4Address } from "@owlprotocol/veraswap-sdk";
import { getBytecodeQueryOptions, readContractQueryOptions, getBalanceQueryOptions } from "@wagmi/core/query";
import { atomFamily } from "jotai/utils";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { balanceOf as balanceOfAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { accountAtom } from "./account.js";
import { disabledQueryOptions } from "./disabledQuery.js";
import { currenciesAtom } from "./chains.js";
import { kernelInitDataAtom, kernelFactoryGetAddressAtomFamily } from "./kernelSmartAccount.js";
import { chains } from "@/config.js";
import { config } from "@/config.js";

export interface KernelAccountInfo {
    chainId: number;
    chain: Chain;
    kernelAddress: Address;
    isDeployed: boolean;
    balance: bigint;
    tokenBalances: Array<{
        tokenAddress: Address;
        symbol: string;
        decimals: number;
        balance: bigint;
        currency: Currency;
    }>;
}

const kernelDeploymentStatusAtomFamily = atomFamily(
    ({ chainId, address }: { chainId: number; address: Address }) =>
        atomWithQuery<Hex | undefined>(() => {
            if (!chainId || !address) return disabledQueryOptions as any;

            return getBytecodeQueryOptions(config, {
                chainId,
                address,
            }) as any;
        }),
    (a, b) => a.chainId === b.chainId && a.address === b.address,
) as unknown as AtomFamily<{ chainId: number; address: Address }, Atom<AtomWithQueryResult<Hex | undefined>>>;

const kernelBalanceAtomFamily = atomFamily(
    ({ chainId, address }: { chainId: number; address: Address }) =>
        atomWithQuery<{ value: bigint }>(() => {
            if (!chainId || !address) return disabledQueryOptions as any;

            return getBalanceQueryOptions(config, {
                chainId,
                address,
            });
        }),
    (a, b) => a.chainId === b.chainId && a.address === b.address,
) as unknown as AtomFamily<{ chainId: number; address: Address }, Atom<AtomWithQueryResult<{ value: bigint }>>>;

const tokenBalanceAtomFamily = atomFamily(
    ({ chainId, address, tokenAddress }: { chainId: number; address: Address; tokenAddress: Address }) =>
        atomWithQuery<bigint>(() => {
            if (!chainId || !address || !tokenAddress) return disabledQueryOptions as any;

            return readContractQueryOptions(config, {
                chainId,
                address: tokenAddress,
                abi: [balanceOfAbi],
                functionName: "balanceOf",
                args: [address],
            }) as any;
        }),
    (a, b) => a.chainId === b.chainId && a.address === b.address && a.tokenAddress === b.tokenAddress,
) as unknown as AtomFamily<
    { chainId: number; address: Address; tokenAddress: Address },
    Atom<AtomWithQueryResult<bigint>>
>;

kernelDeploymentStatusAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);
kernelBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);
tokenBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

export const allKernelAccountsAtom = atom((get) => {
    const account = get(accountAtom);
    const { data: initData } = get(kernelInitDataAtom);
    const allCurrencies = get(currenciesAtom);

    if (!account?.address || !initData) return [];

    const kernelAccounts: KernelAccountInfo[] = [];
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    chains.forEach((chain) => {
        const { data: kernelAddress } = get(
            kernelFactoryGetAddressAtomFamily({
                chainId: chain.id,
                factoryAddress,
                initData,
                initSalt: zeroHash,
            }),
        );

        if (kernelAddress) {
            const { data: bytecode } = get(
                kernelDeploymentStatusAtomFamily({
                    chainId: chain.id,
                    address: kernelAddress,
                }),
            );

            const { data: balance } = get(
                kernelBalanceAtomFamily({
                    chainId: chain.id,
                    address: kernelAddress,
                }),
            );

            const chainCurrencies = allCurrencies.filter((currency) => currency.chainId === chain.id);
            const localChainCurrencies = LOCAL_CURRENCIES.filter((currency) => currency.chainId === chain.id);
            const allChainCurrencies = [...chainCurrencies, ...localChainCurrencies];

            const tokenBalances: Array<{
                tokenAddress: Address;
                symbol: string;
                decimals: number;
                balance: bigint;
                currency: Currency;
            }> = [];

            allChainCurrencies.forEach((currency) => {
                if (!currency.isNative) {
                    const { data: tokenBalance } = get(
                        tokenBalanceAtomFamily({
                            chainId: chain.id,
                            address: kernelAddress,
                            tokenAddress: getUniswapV4Address(currency),
                        }),
                    );

                    if (tokenBalance && tokenBalance > 0n) {
                        tokenBalances.push({
                            tokenAddress: currency.address,
                            symbol: currency.symbol || "Unknown",
                            decimals: currency.decimals || 18,
                            balance: tokenBalance,
                            currency,
                        });
                    }
                }
            });

            kernelAccounts.push({
                chainId: chain.id,
                chain,
                kernelAddress,
                isDeployed: Boolean(bytecode),
                balance: balance?.value || 0n,
                tokenBalances,
            });
        }
    });

    return kernelAccounts;
});

export const stuckFundsAtom = atom((get) => {
    const kernelAccounts = get(allKernelAccountsAtom);
    let totalNative = 0n;
    let totalTokenCount = 0;

    for (const account of kernelAccounts) {
        totalNative += account.balance;
        totalTokenCount += account.tokenBalances.length;
    }

    const hasStuckFunds = totalNative > 0n || totalTokenCount > 0;

    return {
        native: totalNative,
        tokenCount: totalTokenCount,
        hasStuckFunds,
    };
});
