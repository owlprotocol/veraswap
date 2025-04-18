import { atom } from "jotai";
import { parseUnits } from "viem";
import { Token, getTransactionType, TransactionType, Currency } from "@owlprotocol/veraswap-sdk";
import { POOLS, TOKENS_MAP, LOCAL_CURRENCIES } from "@owlprotocol/veraswap-sdk/constants";
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
export const tokenInAtom = atom<Token | null>(null);
export const currencyInAtom = atom<Currency | null>(null);
// export const currencyInAtom = atom((get) => {
//     const tokenIn = get(tokenInAtom);
//     if (!tokenIn) return null;
//     return (
//         LOCAL_CURRENCIES.find((token) => {
//             if (tokenIn.standard === "NativeToken") {
//                 return token.isNative && token.chainId === tokenIn.chainId;
//             }

//             const tokenAddress =
//                 tokenIn.standard === "HypERC20Collateral" ? tokenIn.collateralAddress : tokenIn.address;
//             return token.chainId === tokenIn.chainId && token.wrapped.address === tokenAddress;
//         }) ?? null
//     );
// });
/** Selected tokenIn chain */
export const chainInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    return chains.find((c) => c.id === tokenIn?.chainId) ?? null;
});
/** tokenIn amount: string */
export const tokenInAmountInputAtom = atom<string>("");
/** tokenIn amount: bigint (wei) */
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;

    return parseUnits(tokenInAmountInput, tokenIn.decimals!);
});

/***** Token Out *****/
/** Selected tokenOut */
export const tokenOutAtom = atom<Token | null>(null);
export const currencyOutAtom = atom<Currency | null>(null);
// export const currencyOutAtom = atom((get) => {
//     const tokenOut = get(tokenOutAtom);
//     if (!tokenOut) return null;
//     return (
//         LOCAL_CURRENCIES.find((token) => {
//             if (tokenOut.standard === "NativeToken") {
//                 return token.isNative && token.chainId === tokenOut.chainId;
//             }

//             const tokenAddress =
//                 tokenOut.standard === "HypERC20Collateral" ? tokenOut.collateralAddress : tokenOut.address;
//             return token.chainId === tokenOut.chainId && token.wrapped.address === tokenAddress;
//         }) ?? null
//     );
// });
/** Selected tokenOut chain */
export const chainOutAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return chains.find((c) => c.id === tokenOut?.chainId) ?? null;
});

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<TransactionType | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    if (!tokenIn || !tokenOut) return null;

    //TODO: Add better constants
    return getTransactionType({ tokenIn, tokenOut, poolKeys: POOLS, tokens: TOKENS_MAP });
});

/***** Invert *****/
export const swapInvertAtom = atom(null, (get, set) => {
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);
    set(tokenInAmountInputAtom, "");
});
