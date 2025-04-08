import { atom } from "jotai";
import { chainIdToOrbiterChainId, OrbiterParams, orbiterRoutersQueryOptions } from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress, Address, parseUnits } from "viem";
import {
    chainInAtom,
    chainOutAtom,
    tokenInAmountAtom,
    tokenInAtom,
    tokenOutAtom,
    transactionTypeAtom,
} from "./tokens.js";

const orbiterRoutersMainnet = atomWithQuery(() => orbiterRoutersQueryOptions(true));
const orbiterRoutersTestnet = atomWithQuery(() => orbiterRoutersQueryOptions(false));

export const orbiterRoutersAllAtom = atom((get) => {
    return [...(get(orbiterRoutersMainnet).data ?? []), ...(get(orbiterRoutersTestnet).data ?? [])];
});

export const orbiterRoutersEndpointContractsAtom = atom((get) => {
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    return orbiterRoutersAll
        .filter((router) => router.srcToken === zeroAddress && !!router.endpointContract)
        .reduce(
            (acc, curr) => {
                return { ...acc, [Number(curr.srcChain)]: curr.endpointContract as Address };
            },
            {} as Record<number, Address>,
        );
});

export const orbiterChainIdOutAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);

    if (!tokenOut) return undefined;
    return chainIdToOrbiterChainId[tokenOut.chainId] as number | undefined;
});

// TODO: Handle USDC
export const orbiterRouterAtom = atom((get) => {
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    const tokenIn = get(tokenInAtom);
    const chainIn = get(chainInAtom);
    const tokenOut = get(tokenOutAtom);
    const chainOut = get(chainOutAtom);

    const transactionType = get(transactionTypeAtom);

    if (!tokenIn || !tokenOut || !chainIn || !chainOut || !transactionType) return undefined;

    if (transactionType.type === "SWAP") return undefined;

    const chainOutSymbol = chainOut.nativeCurrency.symbol;
    const chainInSymbol = chainIn.nativeCurrency.symbol;

    if (transactionType.type === "SWAP_BRIDGE") {
        if (tokenOut.standard === "NativeToken" && (tokenOut.symbol !== "ETH" || chainInSymbol !== "ETH")) {
            // If bridging on output a native token, must be ETH on both chains
            return undefined;
        }
        // Type is either "BRIDGE" or "BRIDGE_SWAP"
    } else if (tokenIn.standard !== "NativeToken" || tokenIn.symbol !== "ETH" || chainOutSymbol !== "ETH") {
        // If bridging on input a native token, must be ETH on both chains
        return undefined;
    }

    const line = `${tokenIn.chainId}/${chainOut.id}-${tokenIn.symbol}/${chainOutSymbol}`;

    return orbiterRoutersAll.find((router) => router.line === line);
});

export const orbiterParamsAtom = atom((get) => {
    const orbiterChainId = get(orbiterChainIdOutAtom);
    const router = get(orbiterRouterAtom);

    if (!router) return undefined;

    const { endpoint, endpointContract } = router;

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

    const tradeFeeComplement = 100 - Number(tradeFee);

    // Assume tradeFee has at most 3 decimals and add 100 to make it a percentage
    const scale = 1000n;
    const tradeFeeComplementScaled = BigInt(tradeFeeComplement) * scale;

    // 100%, same scale as tradeFeeComplementScaled
    const percentScaled = 100n * scale;

    return ((amountIn - withholdingFeeParsed) * tradeFeeComplementScaled) / percentScaled;
});
