import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SwapWidget } from "@/components/SwapWidget.js";

import { MainnetTestnetButtons } from "@/components/MainnetTestnetButtons.js";

export const Route = createFileRoute("/")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
        pinnedTokens: z.string().optional(),
        referrer: z.string().optional(),
    }),
    component: Index,
});

function Index() {
    return (
        <div className="max-w-md mx-auto px-2 mb-8">
            <MainnetTestnetButtons />
            <SwapWidget showTransactionFlow={true} />
        </div>
    );
}
