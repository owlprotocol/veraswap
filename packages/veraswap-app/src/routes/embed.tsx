import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SwapWidget } from "@/components/SwapWidget.js";
import { useTheme, ThemeProvider } from "@/components/theme-provider.js";
import { hexThemeToHSL } from "@/utils/themeUtils.js";

export const Route = createFileRoute("/embed")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
        pinnedTokens: z.string().optional(),
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

    if (searchParams.mode) {
        setTheme(searchParams.mode);
    }

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
