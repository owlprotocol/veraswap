import { atom } from "jotai";
import { chainIdToOrbiterChainId, OrbiterParams, orbiterRoutersQueryOptions } from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress, Address, parseUnits } from "viem";
import { tokenInAmountAtom, tokenInAtom, tokenOutAtom } from "./tokens.js";

const orbiterRoutersMainnet = atomWithQuery(() => orbiterRoutersQueryOptions(true));
const orbiterRoutersTestnet = atomWithQuery(() => orbiterRoutersQueryOptions(false));

export const orbiterRoutersAllAtom = atom((get) => {
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

export const orbiterChainIdOutAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);

    if (!tokenOut) return undefined;
    return chainIdToOrbiterChainId[tokenOut.chainId] as number | undefined;
});

export const orbiterRouterAtom = atom((get) => {
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

    return orbiterRoutersAll.find((router) => router.line === line);
});

export const orbiterParamsAtom = atom((get) => {
    const orbiterChainId = get(orbiterChainIdOutAtom);
    const router = get(orbiterRouterAtom);

    if (!router) return undefined;

    const { endpoint, endpointContract, withholdingFee } = router;

    return {
        endpoint,
        endpointContract,
        orbiterChainId,
    } as OrbiterParams;
});

export const orbiterAmountOutAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const amountIn = get(tokenInAmountAtom);
    const tokenOut = get(tokenOutAtom);
    const router = get(orbiterRouterAtom);

    const orbiterChainIdOut = get(orbiterChainIdOutAtom);

    if (!router || !tokenIn || !tokenOut || !amountIn || !orbiterChainIdOut) return undefined;

    const { withholdingFee, tradeFee, minAmt, maxAmt } = router;

    const withholdingFeeParsed = parseUnits(withholdingFee, tokenIn.decimals);
    const minAmtParsed = parseUnits(minAmt, tokenIn.decimals);
    const maxAmtParsed = parseUnits(maxAmt, tokenIn.decimals);

    // minAmt already includes withholdingFee
    if (amountIn < minAmtParsed) return undefined;
    if (amountIn > maxAmtParsed + withholdingFeeParsed) return undefined;

    console.debug({ tradeFee, withholdingFee });

    // Assuming tokenIn and tokenOut have the same decimals

    const tradeFeeInverted = 100 - Number(tradeFee);

    // Assume tradeFee has at most 3 decimals and add 100 to make it a percentage
    const scale = 1000n;
    const tradeFeeInvertedScaled = BigInt(tradeFeeInverted) * scale;

    // 100%, same scale as tradeFeeInvertedScaled
    const percentScaled = 100n * scale;

    return ((amountIn - withholdingFeeParsed) * tradeFeeInvertedScaled) / percentScaled;
});
