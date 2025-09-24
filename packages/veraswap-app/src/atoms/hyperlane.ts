import { LOCAL_HYPERLANE_CONTRACTS, isMultichainToken } from "@owlprotocol/veraswap-sdk";
import { IInterchainGasPaymaster, GasRouter, InterchainGasPaymaster } from "@owlprotocol/veraswap-sdk/artifacts";
import { atom, Atom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Address, numberToHex } from "viem";
import { readContractQueryOptions } from "wagmi/query";
import { mapKeys } from "lodash-es";
import { disabledQueryOptions } from "./disabledQuery.js";
import { chainInAtom, chainOutAtom } from "./tokens.js";
import { transactionTypeAtom } from "./uniswap.js";
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

    // Want to map chainId to addresses but keys are chain names. Filter out any keys not in metadata
    // NOTE: 24/09/2025 - This was breaking prod since there was a chain in addresses not in metadata
    const chainNamesWithMetadata = Object.keys(hyperlaneRegistry.addresses).filter((key) => key in metadata);
    const addressesByChainId = Object.fromEntries(
        chainNamesWithMetadata.map((chainName) => [
            metadata[chainName].chainId,
            hyperlaneRegistry.addresses[chainName],
        ]),
    ) as Record<number, HyperlaneChainAddresses>;

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

    return hyperlaneRegistry.addresses[chainOut.id]?.mailbox ?? null;
});

export const tokenRouterQuoteGasPaymentQueryAtom = atomWithQuery((get) => {
    const chainOut = get(chainOutAtom);
    const transactionType = get(transactionTypeAtom);

    if (!chainOut || !transactionType || !(transactionType.type === "SWAP_BRIDGE" || transactionType.type === "BRIDGE"))
        return disabledQueryOptions as any;

    const { currencyIn: bridgeCurrencyIn } =
        transactionType.type === "SWAP_BRIDGE" ? transactionType.bridge : transactionType;

    // Only get quote if we are bridging with Hyperlane
    if (!isMultichainToken(bridgeCurrencyIn) || !bridgeCurrencyIn.hyperlaneAddress) {
        return disabledQueryOptions as any;
    }

    // Hyperlane Token
    return readContractQueryOptions(config, {
        chainId: bridgeCurrencyIn.chainId,
        address: bridgeCurrencyIn.hyperlaneAddress,
        abi: GasRouter.abi,
        functionName: "quoteGasPayment",
        args: [chainOut.id],
    });
}) as Atom<AtomWithQueryResult<bigint>>;

export const igpDestinationGasLimitQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const callRemoteGas = 1_000_000n;
    const hyperlaneRegistry = get(hyperlaneRegistryAtom);

    if (!chainIn || !chainOut || !hyperlaneRegistry) return disabledQueryOptions as any;

    const interchainGasPaymaster =
        hyperlaneRegistry.addresses[chainIn.id]?.interchainGasPaymaster ??
        LOCAL_HYPERLANE_CONTRACTS[chainIn.id]?.mockInterchainGasPaymaster;

    if (!interchainGasPaymaster) return disabledQueryOptions as any;

    //TODO: Set stale as MAX as overhead never changes
    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: interchainGasPaymaster,
        abi: InterchainGasPaymaster.abi,
        functionName: "destinationGasLimit",
        args: [chainOut.id, numberToHex(callRemoteGas) as unknown as bigint],
    });
}) as Atom<AtomWithQueryResult<bigint>>;

export const igpQuotePaymentQueryAtom = atomWithQuery((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const hyperlaneRegistry = get(hyperlaneRegistryAtom);

    if (!chainIn || !chainOut || !hyperlaneRegistry) return disabledQueryOptions as any;

    const interchainGasPaymaster =
        hyperlaneRegistry.addresses[chainIn.id]?.interchainGasPaymaster ??
        LOCAL_HYPERLANE_CONTRACTS[chainIn.id]?.mockInterchainGasPaymaster;

    if (!interchainGasPaymaster) return disabledQueryOptions as any;

    const { data: callRemoteGasWithOverhead } = get(igpDestinationGasLimitQueryAtom);
    if (!callRemoteGasWithOverhead) return disabledQueryOptions as any;

    return readContractQueryOptions(config, {
        chainId: chainIn.id,
        address: interchainGasPaymaster,
        abi: IInterchainGasPaymaster.abi,
        functionName: "quoteGasPayment",
        args: [chainOut.id, numberToHex(callRemoteGasWithOverhead) as unknown as bigint],
    });
}) as Atom<AtomWithQueryResult<bigint>>;
