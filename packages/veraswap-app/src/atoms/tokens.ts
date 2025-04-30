import { atom } from "jotai";
import { parseUnits } from "viem";
import { getTransactionType, TransactionType, Currency } from "@owlprotocol/veraswap-sdk";
import { POOLS } from "@owlprotocol/veraswap-sdk/constants";
import { routeMultichainAtom } from "./uniswap.js";
import { chains } from "@/config.js";

/***** Tokens Fetch *****/
//TODO: Hard-coded for now
/**
 * // TODO: move it all in one file?
const fetchTokens = async () => {
    const [tokensResponse, bridgedTokensResponse] = await Promise.all([
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens-list.json"),
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/bridged-tokens.json"),
    ]);

    if (!tokensResponse.ok || !bridgedTokensResponse.ok) {
        throw new Error("Failed to fetch tokens");
    }

    const standardTokens = await tokensResponse.json();
    const bridgedTokens = await bridgedTokensResponse.json();

    return [...standardTokens, ...bridgedTokens];
};

export const fetchedTokensAtom = atomWithQuery(() => ({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
}));

 */

/***** Token In *****/
/** Selected tokenIn */
export const currencyInAtom = atom<Currency | null>(null);

/** Selected tokenIn chain */
export const chainInAtom = atom((get) => {
    const currencyIn = get(currencyInAtom);
    return chains.find((c) => c.id === currencyIn?.chainId) ?? null;
});
/** tokenIn amount: string */
export const tokenInAmountInputAtom = atom<string>("");
/** tokenIn amount: bigint (wei) */
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const currencyIn = get(currencyInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!currencyIn || tokenInAmountInput === "") return null;

    return parseUnits(tokenInAmountInput, currencyIn.decimals);
});

/***** Token Out *****/
/** Selected tokenOut */
export const currencyOutAtom = atom<Currency | null>(null);

/** Selected tokenOut chain */
export const chainOutAtom = atom((get) => {
    const currencyOut = get(currencyOutAtom);
    return chains.find((c) => c.id === currencyOut?.chainId) ?? null;
});

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<TransactionType | null>((get) => {
    const currencyIn = get(currencyInAtom);
    const currencyOut = get(currencyOutAtom);

    const routeMultichain = get(routeMultichainAtom).data;
    if (!currencyIn || !currencyOut || !routeMultichain) return null;

    //TODO: Add better constants
    return getTransactionType({ currencyIn, currencyOut, routeComponents: routeMultichain });
});

/***** Invert *****/
export const swapInvertAtom = atom(null, (get, set) => {
    const currentCurrencyIn = get(currencyInAtom);
    const currentCurrencyOut = get(currencyOutAtom);

    set(currencyInAtom, currentCurrencyOut);
    set(currencyOutAtom, currentCurrencyIn);
    set(tokenInAmountInputAtom, "");
});
