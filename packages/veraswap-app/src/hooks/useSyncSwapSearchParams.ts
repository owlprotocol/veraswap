import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { useAtom } from "jotai";
import { useDomainType } from "./useDomainType.js";
import { currencyInAtom, currencyOutAtom, chainsTypeWriteAtom, chainsAtom, pinnedTokensAtom } from "@/atoms/index.js";
import { Route } from "@/routes/index.js";

export function useSyncSwapSearchParams(allCurrencies: Currency[]) {
    const navigate = Route.useNavigate();
    const search = useSearch({ strict: false });
    const domainType = useDomainType();

    const [currencyIn, setCurrencyIn] = useAtom(currencyInAtom);
    const [currencyOut, setCurrencyOut] = useAtom(currencyOutAtom);
    const [, setNetworkType] = useAtom(chainsTypeWriteAtom);
    const [enabledChains] = useAtom(chainsAtom);
    const [, setPinnedTokens] = useAtom(pinnedTokensAtom);

    useEffect(() => {
        const {
            currencyIn: currencyInSymbol,
            chainIdIn,
            currencyOut: currencyOutSymbol,
            chainIdOut,
            type,
            pinnedTokens,
        } = search;

        const chainsType = domainType || type || "mainnet";
        setNetworkType(chainsType);

        if (pinnedTokens) {
            const parsedPinnedTokens = pinnedTokens.split(",").map((token) => token.trim());
            setPinnedTokens(parsedPinnedTokens);
        }

        if (domainType === null && !type) {
            navigate({
                search: {
                    ...search,
                    type: chainsType,
                },
                replace: true,
            });
        }

        const enabledChainIds = enabledChains.map((c) => c.id);
        const tokensInNetwork = allCurrencies.filter((t) => enabledChainIds.includes(t.chainId));

        if (currencyInSymbol && chainIdIn) {
            const foundCurrencyIn = tokensInNetwork.find(
                (t) => t.symbol === currencyInSymbol && t.chainId === chainIdIn,
            );
            if (foundCurrencyIn) setCurrencyIn(foundCurrencyIn);
        }

        if (currencyOutSymbol && chainIdOut) {
            const foundCurrencyOut = tokensInNetwork.find(
                (t) => t.symbol === currencyOutSymbol && t.chainId === chainIdOut,
            );
            if (foundCurrencyOut) setCurrencyOut(foundCurrencyOut);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allCurrencies, domainType]);

    useEffect(() => {
        if (domainType !== null) return;
        if (!currencyIn && !currencyOut) return;

        navigate({
            search: (prev) => ({
                ...prev,
                ...(currencyIn && {
                    currencyIn: currencyIn.symbol,
                    chainIdIn: currencyIn.chainId,
                }),
                ...(currencyOut && {
                    currencyOut: currencyOut.symbol,
                    chainIdOut: currencyOut.chainId,
                }),
            }),
            replace: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currencyIn, currencyOut, domainType]);
}
