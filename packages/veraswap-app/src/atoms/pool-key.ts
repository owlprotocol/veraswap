//TODO: Implement later

import { atom } from "jotai";
import { SwapType, getPoolKey } from "@owlprotocol/veraswap-sdk";
import { tokenInAtom, tokenOutAtom } from "./tokens.js";
import { swapTypeAtom } from "./transaction.js";
import { remoteTokenInfoAtom } from "./index.js";

export const poolKeyInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const swapType = get(swapTypeAtom);
    const remoteInfo = get(remoteTokenInfoAtom);

    if (!tokenIn || !tokenOut) return null;
    if (tokenIn.address === tokenOut.address) return null;

    const currencyOut =
        swapType === SwapType.SwapAndBridge && remoteInfo ? remoteInfo.remoteTokenAddress : tokenOut.address;

    return getPoolKey(tokenIn.chainId, tokenIn.address, currencyOut);
});
// TODO: handle
export const poolKeyOutAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);

    if (!tokenIn || !tokenOut) return null; // Tokens not selected
    if (tokenIn.address === tokenOut.address) return null; // Invalid same token

    return getPoolKey(tokenOut.chainId, tokenIn.address, tokenOut.address);
});
