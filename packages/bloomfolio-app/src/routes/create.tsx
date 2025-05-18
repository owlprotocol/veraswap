import { createFileRoute } from "@tanstack/react-router";
import { BasketCreator } from "@/components/basket-creator.js";

export const Route = createFileRoute("/create")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Crypto Basket Creator
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Create custom token baskets with precise allocations in a few simple steps
                </p>
            </div>
            <BasketCreator />
        </div>
    );
}
