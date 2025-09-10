import { atom } from "jotai";
import { parseUnits } from "viem";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { Address } from "viem";
import { chains } from "@/config.js";
import { VERASWAP_FEE_BIPS, VERASWAP_FEE_RECIPIENT, REFERRER_FEE_BIPS } from "@/config.js";

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

export const referrerAddressAtom = atom<Address | null>(null);

export const feeRecipientsAtom = atom<{
    veraswapFeeRecipient: { address: Address; bips: bigint };
    referralFeeRecipient: { address?: Address; bips: bigint };
}>((get) => {
    const referrerAddress = get(referrerAddressAtom);

    return {
        veraswapFeeRecipient: {
            address: VERASWAP_FEE_RECIPIENT,
            bips: VERASWAP_FEE_BIPS,
        },
        referralFeeRecipient: {
            address: referrerAddress ?? undefined,
            bips: REFERRER_FEE_BIPS,
        },
    };
});

export const tokenInAmountWithoutFeesAtom = atom<bigint | null>((get) => {
    const amountIn = get(tokenInAmountAtom);
    const feeRecipients = get(feeRecipientsAtom);

    if (!amountIn) return null;

    const totalFeeBips = feeRecipients.veraswapFeeRecipient.bips + feeRecipients.referralFeeRecipient.bips;

    const bipsDenominator = 10000n;
    return amountIn - (amountIn * totalFeeBips) / bipsDenominator;
});

/***** Token Out *****/
/** Selected tokenOut */
export const currencyOutAtom = atom<Currency | null>(null);

/** Selected tokenOut chain */
export const chainOutAtom = atom((get) => {
    const currencyOut = get(currencyOutAtom);
    return chains.find((c) => c.id === currencyOut?.chainId) ?? null;
});

/***** Invert *****/
export const swapInvertAtom = atom(null, (get, set) => {
    const currentCurrencyIn = get(currencyInAtom);
    const currentCurrencyOut = get(currencyOutAtom);

    set(currencyInAtom, currentCurrencyOut);
    set(currencyOutAtom, currentCurrencyIn);
    set(tokenInAmountInputAtom, "");
});
