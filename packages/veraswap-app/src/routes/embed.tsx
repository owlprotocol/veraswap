import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useSetAtom } from "jotai";
import { Token, customLists } from "@owlprotocol/veraswap-sdk";
import { Address, isAddress } from "viem";
import { useEffect } from "react";
import { SwapWidget } from "@/components/SwapWidget.js";
import { useTheme, ThemeProvider } from "@/components/theme-provider.js";
import { hexThemeToHSL } from "@/utils/themeUtils.js";
import { customCurrenciesAtom, customListAtom } from "@/atoms/chains.js";
import { referrerAddressAtom } from "@/atoms/tokens.js";

const CustomTokenSchema = z.object({
    address: z.string().refine((val) => isAddress(val), {
        message: "Invalid address",
    }),
    chainId: z.number(),
    symbol: z.string(),
    name: z.string(),
    decimals: z.number(),
    logoURI: z.string().optional(),
});

export const Route = createFileRoute("/embed")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
        pinnedTokens: z.string().optional(),
        customList: z.enum(customLists).optional(),
        referrer: z.string().optional(),
        customTokens: z
            .union([z.string(), z.array(CustomTokenSchema)])
            .transform((val) => {
                if (typeof val === "string") {
                    try {
                        return z.array(CustomTokenSchema).parse(JSON.parse(val));
                    } catch {
                        return [];
                    }
                } else {
                    return val;
                }
            })
            .optional(),
        mode: z.enum(["dark", "light"]).optional(),
        primary: z.string().optional(),
        "primary-foreground": z.string().optional(),
        secondary: z.string().optional(),
        "secondary-foreground": z.string().optional(),
        card: z.string().optional(),
        "card-foreground": z.string().optional(),
        modal: z.string().optional(),
        "modal-foreground": z.string().optional(),
        background: z.string().optional(),
        muted: z.string().optional(),
        "muted-foreground": z.string().optional(),
        border: z.string().optional(),
    }),
    component: Widget,
});

function Widget() {
    const searchParams = Route.useSearch();
    const { setTheme } = useTheme();
    const setCustomTokens = useSetAtom(customCurrenciesAtom);
    const setCustomList = useSetAtom(customListAtom);
    const setReferrer = useSetAtom(referrerAddressAtom);

    useEffect(() => {
        if (searchParams.mode) {
            setTheme(searchParams.mode);
        }
        if (searchParams.customTokens) {
            const tokens = searchParams.customTokens.map(
                (token) =>
                    new Token({
                        address: token.address as Address,
                        chainId: token.chainId,
                        symbol: token.symbol,
                        name: token.name,
                        decimals: token.decimals,
                        logoURI: token.logoURI,
                    }),
            );
            setCustomTokens(tokens);
        } else {
            setCustomTokens([]);
        }
        if (searchParams.customList) {
            setCustomList(searchParams.customList);
        } else {
            setCustomList(undefined);
        }
        if (searchParams.referrer && isAddress(searchParams.referrer)) {
            setReferrer(searchParams.referrer);
        } else {
            setReferrer(null);
        }
    }, [searchParams, setTheme, setCustomTokens, setCustomList, setReferrer]);

    const hexThemeRaw = {
        primary: searchParams.primary,
        "primary-foreground": searchParams["primary-foreground"],
        secondary: searchParams.secondary,
        "secondary-foreground": searchParams["secondary-foreground"],
        card: searchParams.card,
        "card-foreground": searchParams["card-foreground"],
        modal: searchParams.modal,
        "modal-foreground": searchParams["modal-foreground"],
        background: searchParams.background,
        muted: searchParams.muted,
        "muted-foreground": searchParams["muted-foreground"],
        border: searchParams.border,
    };
    const hexTheme = Object.fromEntries(
        Object.entries(hexThemeRaw).filter(([, value]) => value !== undefined && value !== ""),
    ) as Record<string, string>;

    const themeOverrides = hexThemeToHSL(hexTheme);

    return (
        <ThemeProvider themeOverrides={themeOverrides}>
            <div className="bg-background min-h-screen">
                <SwapWidget isEmbedded={true} />
            </div>
        </ThemeProvider>
    );
}
