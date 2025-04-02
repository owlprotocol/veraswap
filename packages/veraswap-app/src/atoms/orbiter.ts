import { atom } from "jotai";
import { chainIdToOrbiterChainId, OrbiterParams, orbiterRoutersQueryOptions } from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress, Address } from "viem";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";

export const orbiterRoutersAllAtom = atom((get) => {
    const orbiterRoutersMainnet = atomWithQuery(() => orbiterRoutersQueryOptions(true));
    const orbiterRoutersTestnet = atomWithQuery(() => orbiterRoutersQueryOptions(false));

    return [...(get(orbiterRoutersMainnet).data ?? []), ...(get(orbiterRoutersTestnet).data ?? [])];
});

export const orbiterRoutersEndpointContractsAtom = atom((get) => {
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    return orbiterRoutersAll
        .filter((router) => router.srcToken === zeroAddress && !!router.endpointContract)
        .reduce((acc, curr) => {
            return acc.set(Number(curr.srcChain), curr.endpointContract as Address);
        }, new Map<number, Address>());
});

export const orbiterParamsAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    // Only fetch params for native ETH token bridging
    if (
        !(
            tokenIn?.standard == "NativeToken" &&
            tokenOut?.standard == "NativeToken" &&
            tokenIn.symbol === "ETH" &&
            tokenOut.symbol === "ETH"
        )
    )
        return undefined;

    const line = `${tokenIn.chainId}/${tokenOut.chainId}-${tokenIn.symbol}/${tokenOut.symbol}`;
    const router = orbiterRoutersAll.find((router) => router.line === line);

    if (!router) return undefined;

    const { endpoint, endpointContract, withholdingFee } = router;
    const orbiterChainId = chainIdToOrbiterChainId[tokenOut.chainId];

    return {
        endpoint,
        endpointContract,
        withholdingFee,
        orbiterChainId,
    } as OrbiterParams;
});
