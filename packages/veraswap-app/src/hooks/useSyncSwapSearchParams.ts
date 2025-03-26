import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { Token } from "@owlprotocol/veraswap-sdk";
import { useAtom } from "jotai";
import { tokenInAtom, tokenOutAtom, chainsTypeAtom } from "@/atoms/index.js";

export function useSyncSwapSearchParams(allTokens: Token[]) {
    const search = useSearch({ from: "/" });
    const [, setTokenIn] = useAtom(tokenInAtom);
    const [, setTokenOut] = useAtom(tokenOutAtom);
    const [, setNetworkType] = useAtom(chainsTypeAtom);

    useEffect(() => {
        const { tokenIn: tokenInSymbol, chainIdIn, tokenOut: tokenOutSymbol, chainIdOut, type } = search;

        if (type) {
            setNetworkType(type);
        }

        if (tokenInSymbol && chainIdIn) {
            const foundTokenIn = allTokens.find((t) => t.symbol === tokenInSymbol && t.chainId === chainIdIn);
            if (foundTokenIn) {
                setTokenIn(foundTokenIn);
            }
        }

        if (tokenOutSymbol && chainIdOut) {
            const foundTokenOut = allTokens.find((t) => t.symbol === tokenOutSymbol && t.chainId === chainIdOut);
            if (foundTokenOut) {
                setTokenOut(foundTokenOut);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTokens, search]);
}
