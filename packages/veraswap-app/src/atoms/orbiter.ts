import { atom } from "jotai";
import {
    chainIdToOrbiterChainId,
    isNativeCurrency,
    OrbiterParams,
    orbiterRoutersQueryOptions,
} from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress, Address, parseUnits } from "viem";
import {
    chainInAtom,
    chainOutAtom,
    tokenInAmountAtom,
    currencyInAtom,
    currencyOutAtom,
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
    const currencyOut = get(currencyOutAtom);

    if (!currencyOut) return undefined;
    return chainIdToOrbiterChainId[currencyOut.chainId] as number | undefined;
});

// TODO: Handle USDC
export const orbiterRouterAtom = atom((get) => {
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    const currencyIn = get(currencyInAtom);
    const chainIn = get(chainInAtom);
    const currencyOut = get(currencyOutAtom);
    const chainOut = get(chainOutAtom);

    const transactionType = get(transactionTypeAtom);

    if (!currencyIn || !currencyOut || !chainIn || !chainOut || !transactionType) return undefined;

    if (transactionType.type === "SWAP") return undefined;

    const chainOutSymbol = chainOut.nativeCurrency.symbol;
    const chainInSymbol = chainIn.nativeCurrency.symbol;

    if (transactionType.type === "SWAP_BRIDGE") {
        if (isNativeCurrency(currencyOut) && (currencyOut.symbol !== "ETH" || chainInSymbol !== "ETH")) {
            // If bridging on output a native token, must be ETH on both chains
            return undefined;
        }
        // Type is either "BRIDGE" or "BRIDGE_SWAP"
    } else if (!isNativeCurrency(currencyIn) || currencyIn.symbol !== "ETH" || chainOutSymbol !== "ETH") {
        // If bridging on input a native token, must be ETH on both chains
        return undefined;
    }

    const line = `${currencyIn.chainId}/${chainOut.id}-${currencyIn.symbol}/${chainOutSymbol}`;

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
    const currencyIn = get(currencyInAtom);
    const amountIn = get(tokenInAmountAtom);
    const currencyOut = get(currencyOutAtom);
    const router = get(orbiterRouterAtom);

    const orbiterChainIdOut = get(orbiterChainIdOutAtom);

    if (!router || !currencyIn || !currencyOut || !amountIn || !orbiterChainIdOut) return undefined;

    const { withholdingFee, tradeFee, minAmt, maxAmt } = router;

    const withholdingFeeParsed = parseUnits(withholdingFee, currencyIn.decimals);
    const minAmtParsed = parseUnits(minAmt, currencyIn.decimals);
    const maxAmtParsed = parseUnits(maxAmt, currencyIn.decimals);

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
