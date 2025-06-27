import { atom, Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, Chain, zeroHash, Hash, Hex } from "viem";
import { kernelInitDataQueryOptions, LOCAL_KERNEL_CONTRACTS, LOCAL_CURRENCIES } from "@owlprotocol/veraswap-sdk";
import { getBytecodeQueryOptions, readContractQueryOptions, getBalanceQueryOptions } from "@wagmi/core/query";
import { KernelFactory } from "@owlprotocol/veraswap-sdk/artifacts/KernelFactory";
import { atomFamily } from "jotai/utils";
import { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { balanceOf as balanceOfAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { accountAtom } from "./account.js";
import { disabledQueryAtom, disabledQueryOptions } from "./disabledQuery.js";
import { currenciesAtom } from "./chains.js";
import { chains } from "@/config.js";
import { config } from "@/config.js";

// Interface for kernel account info
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

// Interface for token balance info
export interface TokenBalanceInfo {
    tokenAddress: Address;
    symbol: string;
    decimals: number;
    balance: bigint;
    currency: Currency;
}

// Atom to get kernel init data for the current user
export const kernelInitDataForOwnerAtom = atomWithQuery((get) => {
    const account = get(accountAtom);
    if (!account?.address) return disabledQueryOptions as any;

    // Use the first chain as default for init data (it's the same across chains)
    const defaultChain = chains[0];

    return kernelInitDataQueryOptions({
        owner: account.address,
        client: config.getClient({ chainId: defaultChain.id }),
    });
}) as unknown as Atom<AtomWithQueryResult<Hex>>;

// Atom family to get kernel address for each chain
export const kernelAddressForChainAtomFamily = atomFamily(
    ({
        chainId,
        factoryAddress,
        initData,
        initSalt,
    }: {
        chainId: number;
        factoryAddress: Address;
        initData: Hex;
        initSalt: Hash;
    }) =>
        atomWithQuery<Address>(() => {
            return readContractQueryOptions(config, {
                chainId,
                address: factoryAddress,
                abi: KernelFactory.abi,
                functionName: "getAddress",
                args: [initData, initSalt],
            }) as any;
        }),
    (a, b) =>
        a.chainId === b.chainId &&
        a.factoryAddress === b.factoryAddress &&
        a.initData === b.initData &&
        a.initSalt === b.initSalt,
) as unknown as AtomFamily<
    { chainId: number; factoryAddress: Address; initData: Hex; initSalt: Hash },
    Atom<AtomWithQueryResult<Address>>
>;

// Atom family to check if kernel account is deployed (has bytecode)
export const kernelDeploymentStatusAtomFamily = atomFamily(
    ({ chainId, address }: { chainId: number; address: Address }) =>
        atomWithQuery<Hex>(() => {
            return getBytecodeQueryOptions(config, {
                chainId,
                address,
            }) as any;
        }),
    (a, b) => a.chainId === b.chainId && a.address === b.address,
) as unknown as AtomFamily<{ chainId: number; address: Address }, Atom<AtomWithQueryResult<Hex>>>;

// Atom family to get kernel account balance
export const kernelBalanceAtomFamily = atomFamily(
    ({ chainId, address }: { chainId: number; address: Address }) =>
        atomWithQuery<bigint>(() => {
            return {
                ...(getBalanceQueryOptions(config, {
                    chainId,
                    address,
                }) as any),
                select: (data: { value: bigint }) => data.value,
            };
        }),
    (a, b) => a.chainId === b.chainId && a.address === b.address,
) as unknown as AtomFamily<{ chainId: number; address: Address }, Atom<AtomWithQueryResult<bigint>>>;

// Atom family to get token balance for a specific token
export const tokenBalanceAtomFamily = atomFamily(
    ({
        chainId,
        address,
        tokenAddress,
        decimals,
    }: {
        chainId: number;
        address: Address;
        tokenAddress: Address;
        decimals: number;
    }) =>
        atomWithQuery<bigint>(() => {
            return readContractQueryOptions(config, {
                chainId,
                address: tokenAddress,
                abi: [balanceOfAbi],
                functionName: "balanceOf",
                args: [address],
            }) as any;
        }),
    (a, b) =>
        a.chainId === b.chainId &&
        a.address === b.address &&
        a.tokenAddress === b.tokenAddress &&
        a.decimals === b.decimals,
) as unknown as AtomFamily<
    { chainId: number; address: Address; tokenAddress: Address; decimals: number },
    Atom<AtomWithQueryResult<bigint>>
>;

// Set garbage collection for the atom families
kernelAddressForChainAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);
kernelDeploymentStatusAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);
kernelBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);
tokenBalanceAtomFamily.setShouldRemove((createdAt) => Date.now() - createdAt > 5 * 60 * 1000);

export const allKernelAccountsAtom = atom((get) => {
    const account = get(accountAtom);
    const { data: initData } = get(kernelInitDataForOwnerAtom);
    const allCurrencies = get(currenciesAtom);

    if (!account?.address || !initData) return [];

    const kernelAccounts: KernelAccountInfo[] = [];
    const factoryAddress = LOCAL_KERNEL_CONTRACTS.kernelFactory;

    // Show all kernel addresses across all chains
    for (const chain of chains) {
        const { data: kernelAddress } = get(
            kernelAddressForChainAtomFamily({
                chainId: chain.id,
                factoryAddress,
                initData,
                initSalt: zeroHash,
            }),
        );

        if (kernelAddress) {
            // Check deployment status
            const { data: bytecode } = get(
                kernelDeploymentStatusAtomFamily({
                    chainId: chain.id,
                    address: kernelAddress,
                }),
            );

            // Get native balance
            const { data: balance } = get(
                kernelBalanceAtomFamily({
                    chainId: chain.id,
                    address: kernelAddress,
                }),
            );

            // Get token balances for this chain
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

            for (const currency of allChainCurrencies) {
                if (!currency.isNative && "address" in currency && currency.address) {
                    const { data: tokenBalance } = get(
                        tokenBalanceAtomFamily({
                            chainId: chain.id,
                            address: kernelAddress,
                            tokenAddress: currency.address,
                            decimals: currency.decimals || 18,
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
            }

            kernelAccounts.push({
                chainId: chain.id,
                chain,
                kernelAddress,
                isDeployed: Boolean(bytecode && bytecode !== "0x"), // Has bytecode = deployed
                balance: balance || 0n,
                tokenBalances,
            });
        }
    }

    return kernelAccounts;
});

// Atom to get total stuck funds across all chains (native + tokens)
export const totalStuckFundsAtom = atom((get) => {
    const kernelAccounts = get(allKernelAccountsAtom);
    let totalNative = 0n;
    let totalTokenCount = 0;

    for (const account of kernelAccounts) {
        // Add native balance
        totalNative += account.balance;

        // Count tokens with balances
        totalTokenCount += account.tokenBalances.length;
    }

    return {
        native: totalNative,
        tokenCount: totalTokenCount,
    };
});

// Atom to check if user has any stuck funds
export const hasStuckFundsAtom = atom((get) => {
    const totalFunds = get(totalStuckFundsAtom);
    return totalFunds.native > 0n || totalFunds.tokenCount > 0;
});
