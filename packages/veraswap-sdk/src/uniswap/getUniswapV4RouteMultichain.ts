import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { maxBy, zip } from "lodash-es";
import invariant from "tiny-invariant";
import { Address, zeroAddress } from "viem";

import { ORBITER_BRIDGE_SWEEP_ADDRESS } from "../constants/orbiter.js";
import { Currency, getSharedChainTokenPairs, getUniswapV4Address } from "../currency/currency.js";
import { MultichainToken } from "../currency/multichainToken.js";
import { orbiterQuote } from "../query/orbiterQuote.js";
import { PathKey, PoolKey, PoolKeyOptions, poolKeysToPath } from "../types/PoolKey.js";

import { nativeOnChain } from "./constants/tokens.js";
import { getUniswapV4Route, getUniswapV4RoutesWithLiquidity } from "./getUniswapV4Route.js";

export interface GetUniswapV4RouteMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    exactAmount: bigint;
    contractsByChain: Record<number, { v4StateView: Address; v4Quoter: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}

/**
 * Get best Uniswap V4 Route for chains where token share a deployment
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapV4RouteMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteMultichainParams,
): Promise<{
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    amountOut: bigint;
    gasEstimate: bigint;
} | null> {
    const { currencyIn, currencyOut, currencyHopsByChain, contractsByChain, poolKeyOptions } = params;
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    const routes = (
        await Promise.all(
            tokenPairs.map(async (pair) => {
                const [currIn, currOut] = pair;
                const chainId = currIn.chainId;

                const currencyHops = currencyHopsByChain[chainId] ?? [zeroAddress];
                const contracts = contractsByChain[chainId];
                if (!contracts) return null; // No uniswap deployment on this chain

                let exactAmount = params.exactAmount;
                if (currencyIn.chainId !== currIn.chainId && currencyIn.isNative && currencyIn.symbol === "ETH") {
                    if (nativeOnChain(currIn.chainId).symbol !== "ETH") {
                        // Can only bridge native ETH
                        return null;
                    }

                    const orbiterQuoteResult = await orbiterQuote({
                        amount: exactAmount,
                        destChainId: currIn.chainId,
                        destToken: zeroAddress,
                        sourceChainId: currencyIn.chainId,
                        sourceToken: zeroAddress,
                        // User address doesn't matter, but avoid address zero
                        userAddress: ORBITER_BRIDGE_SWEEP_ADDRESS,
                    });
                    if (!orbiterQuoteResult) return null;

                    exactAmount = BigInt(orbiterQuoteResult.details.minDestTokenAmount);
                }

                const route = await getUniswapV4Route(queryClient, wagmiConfig, {
                    chainId,
                    currencyIn: getUniswapV4Address(currIn),
                    currencyOut: getUniswapV4Address(currOut),
                    currencyHops,
                    exactAmount,
                    contracts,
                    poolKeyOptions,
                });
                if (!route) return null;

                return {
                    ...route,
                    currencyIn: currIn,
                    currencyOut: currOut,
                };
            }),
        )
    ).filter((route) => !!route);

    if (routes.length === 0) return null; // No active liquidity

    const bestRoute = maxBy(routes, (r) => r.amountOut)!;
    return bestRoute;
}

export interface GetUniswapV4RoutesWithLiquidityMultichainParams {
    currencyIn: Currency;
    currencyOut: Currency;
    currencyHopsByChain: Record<number, Address[]>;
    contractsByChain: Record<number, { v4StateView: Address }>;
    poolKeyOptions?: PoolKeyOptions[];
}
/**
 * Take token pair and find which chain(s) they can be swapped on
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns List with token pair & supported routes for that pair
 */
export async function getUniswapV4RoutesWithLiquidityMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RoutesWithLiquidityMultichainParams,
) {
    const { currencyIn, currencyOut, currencyHopsByChain, contractsByChain, poolKeyOptions } = params;
    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap same token");

    const tokenPairs = getSharedChainTokenPairs(currencyIn, currencyOut);

    const routesWithLiquidity = await Promise.all(
        tokenPairs.map(async (pair) => {
            const [currIn, currOut] = pair;
            const chainId = currIn.chainId;
            const currencyHops = currencyHopsByChain[chainId] ?? [zeroAddress]; // Default to just checking native token
            const contracts = contractsByChain[chainId];
            invariant(
                !!contracts,
                `getUniswapV4RoutesWithLiquidityMultichain: contracts undefined for chain ${chainId}`,
            );

            return getUniswapV4RoutesWithLiquidity(queryClient, wagmiConfig, {
                chainId,
                currencyIn: getUniswapV4Address(currIn),
                currencyOut: getUniswapV4Address(currOut),
                currencyHops,
                contracts,
                poolKeyOptions,
            });
        }),
    );

    const multichainRoutes = zip(tokenPairs, routesWithLiquidity).map(([pair, routes]) => {
        return {
            pair: pair!,
            routes: routes!,
        };
    });

    return multichainRoutes;
}

export interface RouteComponentSwap {
    type: "SWAP";
    chainId: number;
    currencyIn: Currency;
    currencyOut: Currency;
    route: PoolKey[];
    path: PathKey[];
    amountOut: bigint;
    gasEstimate: bigint;
}

export interface RouteComponentBridge {
    type: "BRIDGE";
    currencyIn: Currency;
    currencyOut: Currency;
}

export type RouteComponent = RouteComponentSwap | RouteComponentBridge;

export type GetRouteMultichainReturnType = {
    flows: [RouteComponent, ...RouteComponent[]];
    amountOut: bigint;
} | null;

/**
 * Get list of asset flows to get from currencyIn to currencyOut
 * @param queryClient
 * @param wagmiConfig
 * @param params
 * @returns list of asset flows which either represent:
 *  - assets on same chain to be swapped
 *  - assets on different chains that are remote tokens of each other
 */
export async function getRouteMultichain(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetUniswapV4RouteMultichainParams,
): Promise<GetRouteMultichainReturnType> {
    const { currencyIn, currencyOut, exactAmount } = params;

    invariant(currencyIn.equals(currencyOut) === false, "Cannot swap or bridge same token");

    // BRIDGE ONLY
    // BRIDGE: Native token bridge
    // TODO: account for bridge and gas fees
    if (currencyIn.isNative && currencyOut.isNative) {
        return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: exactAmount };
    }

    if (currencyIn instanceof MultichainToken) {
        // BRIDGE
        if (currencyIn.getRemoteToken(currencyOut.chainId)?.equals(currencyOut)) {
            return { flows: [{ type: "BRIDGE", currencyIn, currencyOut }], amountOut: exactAmount };
        }
    }

    // SWAP with pre-swap, post-swap bridging
    // Find crosschain pools
    const route = await getUniswapV4RouteMultichain(queryClient, wagmiConfig, params);
    if (!route) return null;

    // Mixed Bridge/Swap/Bridge
    const flows: RouteComponent[] = [];

    const path = poolKeysToPath(getUniswapV4Address(route.currencyIn), route.route);

    const swap: RouteComponentSwap = {
        type: "SWAP",
        chainId: route.currencyIn.chainId,
        currencyIn: route.currencyIn,
        currencyOut: route.currencyOut,
        route: route.route,
        path,
        amountOut: route.amountOut,
        gasEstimate: route.gasEstimate,
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
        // Add ouput bridge flow
        flows.push({
            type: "BRIDGE",
            currencyIn: swap.currencyOut,
            currencyOut,
        });
    }

    return { flows: flows as [RouteComponent, ...RouteComponent[]], amountOut: route.amountOut };
}
