import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { localChains, mainnetChains, testnetChains } from "../../chains/index.js";
import { UNISWAP_CONTRACTS } from "../../constants/index.js";
import { Currency } from "../../currency/currency.js";
import { MultichainToken } from "../../currency/multichainToken.js";
import { getCurrencyHops } from "../../swap/getCurrencyHops.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";

import { getMetaQuoteExactInputMultichain } from "./getMetaQuoteExactInputMultichain.js";
import { MetaQuoteBestMultihop, MetaQuoteBestSingle, MetaQuoteBestType } from "./MetaQuoter.js";

// TODO: Remove 'New' from the name, set it up to avoid conflicts with the old one
export interface NewRouteComponentSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    amountOut: bigint;
    bestQuoteSingle: MetaQuoteBestSingle;
    bestQuoteMultihop: MetaQuoteBestMultihop;
    bestQuoteType: MetaQuoteBestType;
}

export interface NewRouteComponentBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
}

export type NewRouteComponent = NewRouteComponentSwap | NewRouteComponentBridge;

export type GetNewRouteMultichainReturnType = {
    flows: [NewRouteComponent, ...NewRouteComponent[]];
    amountOut: bigint;
} | null;

export interface GetNewRouteMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    currencyHopsByChain?: Record<number, Address[] | undefined>;
    contractsByChain?: Record<number, { metaQuoter?: Address } | undefined>;
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
export async function getNewRouteMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetNewRouteMultichainParams,
): Promise<GetNewRouteMultichainReturnType> {
    const { currencyIn, currencyOut, amountIn } = params;

    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // TODO: Probably should remove these overrides
    const allChains = [...testnetChains, ...mainnetChains, ...localChains];
    const contractsByChain =
        params.contractsByChain ??
        Object.fromEntries(
            allChains.map((chain) => [
                chain.id,
                {
                    weth9: UNISWAP_CONTRACTS[chain.id]?.weth9 ?? zeroAddress,
                    metaQuoter: UNISWAP_CONTRACTS[chain.id]?.metaQuoter ?? zeroAddress,
                },
            ]),
        );
    const currencyHopsByChain = Object.fromEntries(allChains.map((chain) => [chain.id, getCurrencyHops(chain.id)]));

    // BRIDGE ONLY
    // BRIDGE: Native token bridge
    // TODO: account for bridge and gas fees
    if (currencyIn.isNative && currencyOut.isNative) {
        return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: amountIn };
    }

    if (currencyIn instanceof MultichainToken) {
        // BRIDGE
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: amountIn };
        }
    }

    // SWAP with pre-swap, post-swap bridging
    // Find crosschain pools
    const route = await getMetaQuoteExactInputMultichain(queryClient, wagmiConfig, {
        ...params,
        contractsByChain,
        currencyHopsByChain,
    });
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const flows: NewRouteComponent[] = [];

    const swap: NewRouteComponentSwap = {
        type: "SWAP",
        chainId: route.currencyIn.chainId,
        ...route,
    };

    if (!swap.currencyIn.equals(currencyIn)) {
        // Add input bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn,
            currencyOut: swap.currencyIn,
        });
    }
    // Add swap
    flows.push(swap);
    if (!swap.currencyOut.equals(currencyOut)) {
        // Add output bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn: swap.currencyOut,
            currencyOut,
        });
    }

    return { flows: flows as [NewRouteComponent, ...NewRouteComponent[]], amountOut: route.amountOut };
}
