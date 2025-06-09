import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { SUPERCHAIN_SWEEP_ADDRESS } from "../../chains/supersim.js";
import { HYPERLANE_ROUTER_SWEEP_ADDRESS } from "../../constants/hyperlane.js";
import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../../constants/orbiter.js";
import { Currency, isMultichainToken } from "../../currency/currency.js";
import { MultichainToken } from "../../currency/multichainToken.js";
import { NativeCurrency } from "../../currency/nativeCurrency.js";
import { OrbiterQuote, OrbiterQuoteParams, orbiterQuoteQueryOptions } from "../../query/orbiterQuote.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";

import { getMetaQuoteExactInputMultichain } from "./getMetaQuoteExactInputMultichain.js";
import { MetaQuoteBestMultihop, MetaQuoteBestSingle, MetaQuoteBestType } from "./MetaQuoter.js";

export interface RouteStepBase {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    amountOut: bigint;
    recipient?: Address;
}

// Swap components
export interface RouteStepUniswap extends RouteStepBase {
    type: "uniswap";
    bestQuoteSingle: MetaQuoteBestSingle;
    bestQuoteMultihop: MetaQuoteBestMultihop;
    bestQuoteType: MetaQuoteBestType;
}

// Bridge components
export interface RouteStepOrbiter extends RouteStepBase {
    type: "orbiter";
    currencyIn: NativeCurrency;
    currencyOut: NativeCurrency;
    quote: OrbiterQuote;
}

export interface RouteStepHyperlane extends RouteStepBase {
    type: "hyperlane";
    currencyIn: MultichainToken;
    currencyOut: MultichainToken;
}

export interface RouteStepStargate extends RouteStepBase {
    type: "stargate";
}

export interface RouteStepSuperchain extends RouteStepBase {
    type: "superchain";
    currencyIn: MultichainToken;
    currencyOut: MultichainToken;
}

export type RouteStepBridge = RouteStepOrbiter | RouteStepHyperlane | RouteStepStargate | RouteStepSuperchain;

export type RouteStep = RouteStepUniswap | RouteStepBridge;

// Used to render UI preview
export function isRouteStepSwap(component: RouteStep): component is RouteStepUniswap {
    return component.type === "uniswap";
}
export function isRouteStepBridge(component: RouteStep): component is RouteStepBridge {
    return ["orbiter", "hyperlane", "stargate", "superchain"].includes(component.type);
}

export function isRouteSwap(steps: RouteStep[]): steps is [RouteStepUniswap] {
    return steps.length === 1 && isRouteStepSwap(steps[0]);
}
export function isRouteBridge(steps: RouteStep[]): steps is [RouteStepBridge] {
    return steps.length === 1 && isRouteStepBridge(steps[0]);
}
export function isRouteSwapBridge(steps: RouteStep[]): steps is [RouteStepUniswap, RouteStepBridge] {
    return steps.length === 2 && isRouteStepSwap(steps[0]) && isRouteStepBridge(steps[1]);
}
export function isRouteBridgeSwap(steps: RouteStep[]): steps is [RouteStepBridge, RouteStepUniswap] {
    return steps.length === 2 && isRouteStepBridge(steps[0]) && isRouteStepSwap(steps[1]);
}

// Get route steps
export interface GetRouteStepsParams {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    recipient?: Address;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<number, { metaQuoter?: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}
/**
 * Get list of asset flows to get from currencyIn to currencyOut
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of asset flows which either represent:
 *  - assets on same chain to be swapped
 *  - assets on different chains that are remote tokens of each other
 */
export async function getRouteSteps(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetRouteStepsParams,
): Promise<RouteStep[] | null> {
    const { currencyIn, currencyOut, amountIn, recipient } = params;

    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // BRIDGE ONLY
    // TODO: account for bridge and gas fees
    const bridgeOnly = await getRouteStepBridge(queryClient, wagmiConfig, {
        currencyIn,
        currencyOut,
        amountIn,
        recipient,
    });
    if (bridgeOnly) return [bridgeOnly];

    // SWAP with pre-swap, post-swap bridging
    // Get multichain quotes, searching for v3/v4 pools across supported chains
    // TODO: Update getMetaQuoteExactInputMultichain to have a version that accounts for pre-swap bridging amount reduction
    const route = await getMetaQuoteExactInputMultichain(queryClient, wagmiConfig, params);
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const components: RouteStep[] = [];

    const swap: RouteStepUniswap = {
        type: "uniswap",
        amountIn,
        recipient,
        ...route,
    };

    if (!swap.currencyIn.equals(currencyIn)) {
        // Add input bridge flow
        const bridgeInput = await getRouteStepBridge(queryClient, wagmiConfig, {
            currencyIn,
            currencyOut: swap.currencyIn,
            amountIn: swap.amountIn,
            // Note recipient is not set here as this will be sent to smart account
        });
        if (!bridgeInput) return null; // No bridge available
        components.push(bridgeInput);
    }
    // Add swap
    components.push(swap);
    if (!swap.currencyOut.equals(currencyOut)) {
        // Add output bridge flow
        const bridgeOutput = await getRouteStepBridge(queryClient, wagmiConfig, {
            currencyIn: swap.currencyOut,
            currencyOut,
            amountIn: swap.amountOut,
            recipient,
        });
        if (!bridgeOutput) return null; // No bridge available
        components.push(bridgeOutput);

        // Override swap recipient for post-swap bridge call
        if (bridgeOutput.type === "orbiter") {
            swap.recipient = ORBITER_BRIDGE_SWEEP_ADDRESS;
        } else if (bridgeOutput.type === "superchain") {
            swap.recipient = SUPERCHAIN_SWEEP_ADDRESS;
        } else if (bridgeOutput.type === "hyperlane") {
            swap.recipient = HYPERLANE_ROUTER_SWEEP_ADDRESS;
        }
    }

    return components;
}

// TODO: Implement quoting for Hyperlane/Orbiter
// TODO: Add Stargate and more
export async function getRouteStepBridge(
    queryClient: QueryClient,
    _: Config,
    {
        currencyIn,
        currencyOut,
        amountIn,
        recipient,
    }: {
        currencyIn: Currency;
        currencyOut: Currency;
        amountIn: bigint;
        recipient?: Address;
    },
): Promise<null | RouteStepOrbiter | RouteStepHyperlane | RouteStepStargate | RouteStepSuperchain> {
    if (currencyIn.isNative && currencyOut.isNative) {
        // Bridge: Native token bridge defaults to Orbiter (for now)
        // TODO: Quote bridge here?

        const quoteParams: OrbiterQuoteParams = {
            sourceChainId: currencyIn.chainId,
            destChainId: currencyOut.chainId,
            sourceToken: zeroAddress,
            destToken: zeroAddress,
            amount: amountIn,
            userAddress: zeroAddress, //TODO: Can this be changed???
            targetRecipient: recipient,
        };
        const quote = await queryClient.fetchQuery(orbiterQuoteQueryOptions(quoteParams));

        return {
            type: "orbiter",
            currencyIn,
            currencyOut,
            quote,
            amountIn,
            amountOut: amountIn,
            recipient,
        };
    }

    if (isMultichainToken(currencyIn) && isMultichainToken(currencyOut)) {
        // Bridge: currencyOut is a remote token of currencyIn
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            // Superchain: Both tokens are SuperERC20
            if (currencyIn.isSuperERC20() && currencyOut.isSuperERC20()) {
                return { type: "superchain", currencyIn, currencyOut, amountIn, amountOut: amountIn, recipient };
            }
            // Hyperlane: CurrencyIn has a Hyperlane address
            if (currencyIn.hyperlaneAddress != null) {
                return { type: "hyperlane", currencyIn, currencyOut, amountIn, amountOut: amountIn, recipient };
            }
        }
    }

    return null; // Only supported are Superchain/Hyperlane
}
