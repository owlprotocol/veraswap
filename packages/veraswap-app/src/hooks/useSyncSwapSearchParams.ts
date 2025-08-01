import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { useAtom } from "jotai";
import { isAddress } from "viem";
import { useDomainType } from "./useDomainType.js";
import {
    currencyInAtom,
    currencyOutAtom,
    chainsTypeWriteAtom,
    chainsAtom,
    updatePinnedTokensAtom,
    referrerAddressAtom,
} from "@/atoms/index.js";
import { Route } from "@/routes/index.js";

export function useSyncSwapSearchParams(allCurrencies: Currency[]) {
    const navigate = Route.useNavigate();
    const search = useSearch({ strict: false });
    const domainType = useDomainType();

    const [currencyIn, setCurrencyIn] = useAtom(currencyInAtom);
    const [currencyOut, setCurrencyOut] = useAtom(currencyOutAtom);
    const [, setNetworkType] = useAtom(chainsTypeWriteAtom);
    const [enabledChains] = useAtom(chainsAtom);
    const [, updatePinnedTokens] = useAtom(updatePinnedTokensAtom);
    const [, setReferrerAddress] = useAtom(referrerAddressAtom);

    const setCurrenciesFromUrl = (
        currencyInSymbol?: string,
        chainIdIn?: number,
        currencyOutSymbol?: string,
        chainIdOut?: number,
    ) => {
        const enabledChainIds = enabledChains.map((c) => c.id);
        const availableCurrencies = allCurrencies.filter((t) => enabledChainIds.includes(t.chainId));

        if (currencyInSymbol && chainIdIn) {
            const currencyIn = availableCurrencies.find(
                (t) => t.symbol === currencyInSymbol && t.chainId === chainIdIn,
            );
            if (currencyIn) setCurrencyIn(currencyIn);
        }

        if (currencyOutSymbol && chainIdOut) {
            const currencyOut = availableCurrencies.find(
                (t) => t.symbol === currencyOutSymbol && t.chainId === chainIdOut,
            );
            if (currencyOut) setCurrencyOut(currencyOut);
        }
    };

    useEffect(() => {
        const {
            currencyIn: currencyInSymbol,
            chainIdIn,
            currencyOut: currencyOutSymbol,
            chainIdOut,
            type,
            pinnedTokens,
            referrer,
        } = search;

        const chainsType = domainType || type || "mainnet";
        setNetworkType(chainsType);

        if (pinnedTokens) {
            const parsedPinnedTokens = pinnedTokens.split(",").map((token) => token.trim());
            updatePinnedTokens(parsedPinnedTokens);
        }

        if (referrer && isAddress(referrer)) {
            setReferrerAddress(referrer);
        }

        // Wait for currencies to be loaded before setting from URL
        if (allCurrencies.length === 0) return;

        if (domainType !== null) {
            const { type, ...currencyParams } = search;
            navigate({ search: currencyParams, replace: true });
        } else if (!type) {
            navigate({
                search: { ...search, type: chainsType },
                replace: true,
            });
        }

        setCurrenciesFromUrl(currencyInSymbol, chainIdIn, currencyOutSymbol, chainIdOut);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allCurrencies, domainType]);

    useEffect(() => {
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
    }, [currencyIn, currencyOut]);
}
