import { LOCAL_HYPERLANE_CONTRACTS, isMultichainToken } from "@owlprotocol/veraswap-sdk";
import { HypERC20Collateral, IInterchainGasPaymaster } from "@owlprotocol/veraswap-sdk/artifacts";
import { atom, Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, numberToHex } from "viem";
import { readContractQueryOptions } from "wagmi/query";
import { mapKeys } from "lodash-es";
import { disabledQueryOptions } from "./disabledQuery.js";
import { chainInAtom, chainOutAtom, currencyInAtom } from "./tokens.js";
import { config } from "@/config.js";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry.js";

export const hyperlaneRegistryQueryAtom = atomWithQuery(hyperlaneRegistryOptions);

export interface HyperlaneChainMetadata {
    chainId: number;
    name: string;
    blocks: {
        confirmations: number;
        estimateBlockTime: number;
        reorgPeriod: string;
    };
    estimateBlockTime: number;
    deployer: {
        name: string;
        url: string;
    };
    displayName: string;
    domainId: number;
    gasCurrencyCoinGeckoId: string;
    nativeToken: {
        decimals: number;
        name: string;
        symbol: string;
    };
    protocol: string;
    technicalStack: string;
}

export interface HyperlaneChainAddresses {
    domainRoutingIsm: Address;
    domainRoutingIsmFactory: Address;
    fallbackDomainRoutingHook: Address;
    fallbackRoutingHook: Address;
    interchainGasPaymaster: Address;
    interchainSecurityModule: Address;
    mailbox: Address;
    merkleTreeHook: Address;
    proxyAdmin: Address;
    staticAggregationHookFactory: Address;
    staticAggregationIsmFactory: Address;
    staticMerkleRootMultisigIsmFactory: Address;
    staticMerkleRootWeightedMultisigIsmFactory: Address;
    staticMessageIdMultisigIsmFactory: Address;
    staticMessageIdWeightedMultisigIsmFactory: Address;
    storageGasOracle: Address;
    testRecipient: Address;
    validatorAnnounce: Address;
}

// Get Hyperlane Registry result and remap by chainId
export const hyperlaneRegistryAtom = atom((get) => {
    const { data: hyperlaneRegistry } = get(hyperlaneRegistryQueryAtom);
    if (!hyperlaneRegistry) return null;

    const metadata = hyperlaneRegistry.metadata as Record<string, HyperlaneChainMetadata>;
    // Remap metadata & addresses by chainId
    const metadataByChainId = mapKeys(metadata, (value) => value.chainId) as Record<number, HyperlaneChainMetadata>;
    const addressesByChainId = mapKeys(hyperlaneRegistry.addresses, (_, key) => metadata[key].chainId) as Record<
        number,
        HyperlaneChainAddresses
    >;

    return {
        metadata: metadataByChainId,
        addresses: addressesByChainId,
    };
});

export const hyperlaneMailboxChainOut = atom((get) => {
    const hyperlaneRegistry = get(hyperlaneRegistryAtom);
    if (!hyperlaneRegistry) return null;
    const chainOut = get(chainOutAtom);
    if (!chainOut) return null;

    return hyperlaneRegistry.addresses[chainOut.id].mailbox;
});

export const hypERC20CollateralWrappedTokenQueryAtom = atomWithQuery((get) => {
    const currencyIn = get(currencyInAtom);

    if (!currencyIn) return disabledQueryOptions as any;

    if (!currencyIn || !isMultichainToken(currencyIn) || currencyIn.isHypERC20() || !currencyIn.hyperlaneAddress) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: currencyIn.chainId,
        address: currencyIn.address,
        abi: HypERC20Collateral.abi,
        functionName: "wrappedToken",
        args: [],
    });
}) as Atom<AtomWithQueryResult<Address>>;

export const tokenRouterQuoteGasPaymentQueryAtom = atomWithQuery((get) => {
    const currencyIn = get(currencyInAtom);
    const chainOut = get(chainOutAtom);

    if (!currencyIn || !chainOut) return disabledQueryOptions as any;
    if (!isMultichainToken(currencyIn) || currencyIn.isHypERC20() || !currencyIn.hyperlaneAddress) {
        return disabledQueryOptions as any;
    }

    return readContractQueryOptions(config, {
        chainId: currencyIn.chainId,
        address: currencyIn.address,
        abi: HypERC20Collateral.abi,
        functionName: "quoteGasPayment",
        args: [chainOut.id],
    });
}) as Atom<AtomWithQueryResult<bigint>>;

export const igpQuotePaymentQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const callRemoteGas = 1_000_000n;
    const hyperlaneRegistry = get(hyperlaneRegistryAtom);

    if (!chainIn || !chainOut || !hyperlaneRegistry) return disabledQueryOptions as any;

    const interchainGasPaymaster =
        hyperlaneRegistry.addresses[chainIn.id]?.interchainGasPaymaster ??
        LOCAL_HYPERLANE_CONTRACTS[chainIn.id]?.mockInterchainGasPaymaster;

    if (!interchainGasPaymaster) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: interchainGasPaymaster,
        abi: IInterchainGasPaymaster.abi,
        functionName: "quoteGasPayment",
        args: [chainOut.id, numberToHex(callRemoteGas) as unknown as bigint],
    });
}) as Atom<AtomWithQueryResult<bigint>>;
