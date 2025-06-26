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
    }),
    component: Index,
});

function Index() {
    return (
        <div className="max-w-md mx-auto px-2">
            <MainnetTestnetButtons />

            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground hover:scale-105 transition-transform duration-300">
                    Buy Any Token. Any Chain.
                </h1>
            </div>

            <SwapWidget showTransactionFlow={true} />
        </div>
    );
}
