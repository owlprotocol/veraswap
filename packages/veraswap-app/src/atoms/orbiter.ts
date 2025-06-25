import { Atom, atom } from "jotai";
import { chainIdToOrbiterChainId, OrbiterParams, orbiterRoutersQueryOptions } from "@owlprotocol/veraswap-sdk";
import { atomWithQuery } from "jotai-tanstack-query";
import { zeroAddress, Address, parseUnits } from "viem";
import { chainInAtom, chainOutAtom, tokenInAmountAtom, currencyInAtom, currencyOutAtom } from "./tokens.js";
import { transactionTypeAtom } from "./uniswap.js";

const orbiterRoutersMainnet = atomWithQuery(() => orbiterRoutersQueryOptions(true));
const orbiterRoutersTestnet = atomWithQuery(() => orbiterRoutersQueryOptions(false));

export const orbiterRoutersAllAtom = atom((get) => {
    return [...(get(orbiterRoutersMainnet).data ?? []), ...(get(orbiterRoutersTestnet).data ?? [])];
});

// NOTE: This is still needed for the new quoting
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

export const orbiterRoutersEndpointsAtom = atom((get) => {
    const orbiterRoutersAll = get(orbiterRoutersAllAtom);

    return orbiterRoutersAll
        .filter((router) => router.srcToken === zeroAddress)
        .reduce(
            (acc, curr) => {
                return { ...acc, [Number(curr.srcChain)]: curr.endpoint as Address };
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

    if (transactionType === "SWAP") return undefined;

    const chainInSymbol = chainIn.nativeCurrency.symbol;
    const chainOutSymbol = chainOut.nativeCurrency.symbol;

    if (transactionType === "SWAP_BRIDGE") {
        // TODO: Handle USDC
        if (currencyOut.isNative && (currencyOut.symbol !== "ETH" || chainInSymbol !== "ETH")) {
            // If bridging on output a native token, must be ETH on both chains
            return undefined;
        }

        // Type is either "BRIDGE" or "BRIDGE_SWAP"
        // TODO: Handle USDC
    } else if (!currencyIn.isNative || currencyIn.symbol !== "ETH" || chainOutSymbol !== "ETH") {
        // If bridging on input a native token, must be ETH on both chains
        return undefined;
    }

    // For swap and bridge, tokenOut is what we bridge, else tokenIn
    const bridgeSymbol = transactionType === "SWAP_BRIDGE" ? currencyOut.symbol : currencyIn.symbol;

    const line = `${chainIn.id}/${chainOut.id}-${bridgeSymbol}/${bridgeSymbol}`;

    return orbiterRoutersAll.find((router) => router.line === line);
});

export const orbiterQuoteAtom = atomWithQuery((get) => {
    const account = get(accountAtom);

    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);

    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);

    const tokenInAmount = get(tokenInAmountAtom);

    const transactionType = get(transactionTypeAtom);
    const routeMultichain = get(routeMultichainAtom);

    if (!currencyIn || !currencyOut || !chainIn || !chainOut || !transactionType || !tokenInAmount)
        return disabledQueryOptions;

    const kernelAddressChainOut = get(kernelAddressChainOutQueryAtom).data;

    // Kernel address is only used when bridging and then swapping
    const targetRecipient =
        transactionType.type === "BRIDGE_SWAP"
            ? kernelAddressChainOut
            : (account.address ?? "0x0000000000000000000000000000000000000001");

    if (!targetRecipient) return disabledQueryOptions as any;

    // Only supports mainnet for now
    if (chainIn.testnet) return disabledQueryOptions as any;

    if (transactionType.type === "SWAP") return disabledQueryOptions as any;

    const chainInSymbol = chainIn.nativeCurrency.symbol;
    const chainOutSymbol = chainOut.nativeCurrency.symbol;

    let amount: bigint;

    if (transactionType.type === "SWAP_BRIDGE") {
        // TODO: Handle USDC
        if (currencyOut.isNative && (currencyOut.symbol !== "ETH" || chainInSymbol !== "ETH")) {
            // If bridging on output a native token, must be ETH on both chains
            return disabledQueryOptions as any;
        }

        // Need to have an estimate of the amout out
        if (!routeMultichain.data) return disabledQueryOptions as any;

        amount = routeMultichain.data?.amountOut;

        // Type is either "BRIDGE" or "BRIDGE_SWAP"
    } else {
        // TODO: Handle USDC
        if (!currencyIn.isNative || currencyIn.symbol !== "ETH" || chainOutSymbol !== "ETH") {
            // If bridging on input a native token, must be ETH on both chains
            return disabledQueryOptions as any;
        }

        amount = tokenInAmount;
    }

    const bridgeTransactionType = transactionType.type === "BRIDGE" ? transactionType : transactionType.bridge;
    const sourceToken = getUniswapV4Address(bridgeTransactionType.currencyIn);
    const destToken = getUniswapV4Address(bridgeTransactionType.currencyOut);

    const params: OrbiterQuoteParams = {
        sourceChainId: chainIn.id,
        destChainId: chainOut.id,
        sourceToken,
        destToken,
        amount,
        userAddress: ORBITER_BRIDGE_SWEEP_ADDRESS,
        targetRecipient,
    };

    const isMainnet = true;

    return orbiterQuoteQueryOptions(params, isMainnet);
}) as unknown as Atom<AtomWithQueryResult<OrbiterQuote>>;

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

    // Assuming tokenIn and tokenOut have the same decimals

    const tradeFeeComplement = 100 - Number(tradeFee);

    // Assume tradeFee has at most 3 decimals and add 100 to make it a percentage
    const scale = 1000;
    const scaleBigInt = 1000n;
    const tradeFeeComplementScaled = BigInt(tradeFeeComplement * scale);

    // 100%, same scale as tradeFeeComplementScaled
    const percentScaled = 100n * scaleBigInt;

    return ((amountIn - withholdingFeeParsed) * tradeFeeComplementScaled) / percentScaled;
});
