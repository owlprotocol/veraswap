import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { Address, zeroAddress } from "viem";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";

export const AVAILABLE_BASKETS: { id: string; name: string; description: string; address: Address }[] = [
    {
        id: "defi-basket",
        name: "DeFi Basket",
        description: "A balanced basket of top DeFi tokens",
        address: zeroAddress,
    },
    {
        id: "stable-basket",
        name: "Stablecoin Basket",
        description: "A safe basket of stablecoins",
        address: "0x0000000000000000000000000000000000000001",
    },
];

export const Route = createFileRoute("/buckets/")({
    component: BucketsPage,
});

function BucketsPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        Available Baskets
                    </h1>
                    <p className="mt-3 text-slate-600 dark:text-slate-400">
                        Choose a basket and invest in a diversified portfolio of tokens
                    </p>
                </div>
                <Link to="/create">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Basket
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AVAILABLE_BASKETS.map((basket) => (
                    <Link key={basket.id} to="/buckets/$id" params={{ id: basket.id }}>
                        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-shadow h-full">
                            <CardHeader>
                                <CardTitle>{basket.name}</CardTitle>
                                <CardDescription>{basket.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* <div className="space-y-2">
                                    {basket.tokens.map((token) => (
                                        <div key={token.address} className="flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {token.logoURI && (
                                                    <img
                                                        src={token.logoURI}
                                                        alt={token.symbol}
                                                        className="w-5 h-5 rounded-full"
                                                    />
                                                )}
                                                <span>{token.symbol}</span>
                                            </div>
                                            <span className="text-slate-500">{token.allocation}%</span>
                                        </div>
                                    ))}
                                </div> */}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
