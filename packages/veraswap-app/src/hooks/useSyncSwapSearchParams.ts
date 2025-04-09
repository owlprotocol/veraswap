import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { Token } from "@owlprotocol/veraswap-sdk";
import { useAtom } from "jotai";
import { tokenInAtom, tokenOutAtom, chainsTypeWriteAtom, chainsAtom } from "@/atoms/index.js";
import { Route } from "@/routes/index.js";

export function useSyncSwapSearchParams(allTokens: Token[]) {
    const navigate = Route.useNavigate();
    const search = useSearch({ from: "/" });

    const [tokenIn, setTokenIn] = useAtom(tokenInAtom);
    const [tokenOut, setTokenOut] = useAtom(tokenOutAtom);
    const [, setNetworkType] = useAtom(chainsTypeWriteAtom);
    const [enabledChains] = useAtom(chainsAtom);

    useEffect(() => {
        const { tokenIn: tokenInSymbol, chainIdIn, tokenOut: tokenOutSymbol, chainIdOut, type } = search;

        const chainsType = type ?? "mainnet";
        setNetworkType(chainsType);

        const enabledChainIds = enabledChains.map((c) => c.id);
        const tokensInNetwork = allTokens.filter((t) => enabledChainIds.includes(t.chainId));

        if (tokenInSymbol && chainIdIn) {
            const foundTokenIn = tokensInNetwork.find((t) => t.symbol === tokenInSymbol && t.chainId === chainIdIn);
            if (foundTokenIn) setTokenIn(foundTokenIn);
        }

        if (tokenOutSymbol && chainIdOut) {
            const foundTokenOut = tokensInNetwork.find((t) => t.symbol === tokenOutSymbol && t.chainId === chainIdOut);
            if (foundTokenOut) setTokenOut(foundTokenOut);
        }

        if (!type) {
            navigate({
                search: {
                    ...search,
                    type: chainsType,
                },
                replace: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allTokens, search]);

    useEffect(() => {
        if (!tokenIn || !tokenOut) return;

        navigate({
            search: (prev) => ({
                ...prev,
                tokenIn: tokenIn.symbol,
                chainIdIn: tokenIn.chainId,
                tokenOut: tokenOut.symbol,
                chainIdOut: tokenOut.chainId,
            }),
            replace: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenIn, tokenOut]);
}
