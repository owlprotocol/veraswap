import { useState } from "react";
import { PlusCircle, BarChart3, Search, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BasketTokens } from "./basket-tokens.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { BASE_TOKENS, Token } from "@/constants/tokens.js";

export type SelectedToken = Token & {
    allocation: number;
};

export function BasketCreator() {
    const [selectedTokens, setSelectedTokens] = useState<SelectedToken[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTokens = BASE_TOKENS.filter(
        (token) =>
            token.name.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
            token.symbol.toLowerCase().includes((searchQuery || "").toLowerCase()),
    );

    const totalAllocation = selectedTokens.reduce((sum, token) => sum + token.allocation, 0);

    // Check if allocation is valid (equals 100%)
    const isAllocationValid = Math.abs(totalAllocation - 100) < 0.01;

    const handleTokenSelect = (token: Token) => {
        if (selectedTokens.some((t) => t.address === token.address)) return;

        let newAllocation = 0;

        if (selectedTokens.length === 0) {
            newAllocation = 100;
        } else {
            newAllocation = 0;
        }

        setSelectedTokens((prev) => [...prev, { ...token, allocation: newAllocation }]);
    };

    const handleTokenRemove = (tokenAddress: string) => {
        setSelectedTokens((prev) => prev.filter((token) => token.address !== tokenAddress));
    };

    const handleAllocationChange = (tokenAddress: string, newAllocation: number) => {
        setSelectedTokens((prev) =>
            prev.map((token) => (token.address === tokenAddress ? { ...token, allocation: newAllocation } : token)),
        );
    };

    const handleCreateBasket = () => {
        if (!isAllocationValid) return;

        // Here you would typically save the basket to your backend
        console.log("Creating basket with:", {
            selectedTokens,
        });
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-xl font-semibold">
                        <PlusCircle className="mr-2 h-5 w-5 text-violet-500" />
                        Select Tokens
                    </CardTitle>
                    <CardDescription>Choose the tokens you want to include in your basket</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {selectedTokens.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                    Selected Tokens
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTokens.map((token) => (
                                        <div
                                            key={token.address}
                                            className="flex items-center bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-full pl-2 pr-1 py-1"
                                        >
                                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-white dark:bg-slate-600 p-0.5">
                                                {token.logoURI ? (
                                                    <img
                                                        src={token.logoURI || "/placeholder.svg"}
                                                        alt={token.symbol}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                                        {token.symbol.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-violet-800 dark:text-violet-300 mr-1">
                                                {token.symbol}
                                            </span>
                                            <button
                                                onClick={() => handleTokenRemove(token.address)}
                                                className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-violet-200 dark:hover:bg-violet-800"
                                            >
                                                <X className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Available Tokens
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tokens"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="py-1 pl-7 pr-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {filteredTokens.map((token: Token) => {
                                    const isSelected = selectedTokens.some((t) => t.address === token.address);
                                    return (
                                        <button
                                            key={token.address}
                                            onClick={() => handleTokenSelect(token)}
                                            className={`flex items-center p-2 rounded-lg transition-all relative ${
                                                isSelected
                                                    ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
                                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
                                            }`}
                                        >
                                            <div className="flex-shrink-0 h-8 w-8 mr-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 p-0.5">
                                                {token.logoURI ? (
                                                    <img
                                                        src={token.logoURI || "/placeholder.svg"}
                                                        alt={token.symbol}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        {token.symbol}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-full">
                                                    {token.symbol}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full">
                                                    {token.name}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute top-1 right-1 rounded-full bg-violet-100 dark:bg-violet-900/50 p-0.5">
                                                    <X className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedTokens.length > 0 && (
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl font-semibold">
                                <BarChart3 className="mr-2 h-5 w-5 text-violet-500" />
                                Set Allocations
                            </CardTitle>
                            {!isAllocationValid && (
                                <div className="text-sm text-red-500">Total allocation must equal 100%</div>
                            )}
                        </div>
                        <CardDescription>
                            Adjust the percentage allocation for each token in your basket
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BasketTokens
                            selectedTokens={selectedTokens}
                            onTokenRemove={handleTokenRemove}
                            onAllocationChange={handleAllocationChange}
                        />
                        <div className="mt-6">
                            <Link
                                to="/buckets"
                                onClick={handleCreateBasket}
                                disabled={!isAllocationValid}
                                className={`block w-full ${!isAllocationValid ? "pointer-events-none opacity-50" : ""}`}
                            >
                                <Button
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                    size="lg"
                                    disabled={!isAllocationValid}
                                >
                                    Create Basket
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
