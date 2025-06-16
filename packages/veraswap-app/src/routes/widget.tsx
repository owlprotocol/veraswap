import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SwapWidget } from "@/components/SwapWidget.js";

export const Route = createFileRoute("/widget")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
        bgColor: z.string().optional(),
    }),
    component: Widget,
});

function Widget() {
    const { bgColor } = Route.useSearch();

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
