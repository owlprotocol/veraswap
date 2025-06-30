import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SwapWidget } from "@/components/SwapWidget.js";
import { useTheme } from "@/components/theme-provider.js";

export const Route = createFileRoute("/embed")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
        bgColor: z.string().optional(),
        pinnedTokens: z.string().optional(),
        mode: z.enum(["dark", "light"]).optional(),
    }),
    component: Widget,
});

function Widget() {
    const { bgColor, mode } = Route.useSearch();
    const { setTheme } = useTheme();

    if (mode) {
        setTheme(mode);
    }

    return (
        <div
            style={{
                background: bgColor || "transparent",
                minHeight: "100vh",
                width: "100%",
            }}
        >
            <SwapWidget isEmbedded={true} />
        </div>
    );
}
