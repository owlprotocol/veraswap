import { useState, useEffect } from "react";
import { Trash2, MinusCircle, PlusCircle, RotateCcw, AlertTriangle } from "lucide-react";
import type { SelectedToken } from "./basket-creator";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.js";
import { Progress } from "@/components/ui/progress.js";
import { cn } from "@/lib/utils.js";

interface BasketTokensProps {
    selectedTokens: SelectedToken[];
    onTokenRemove: (tokenAddress: string) => void;
    onAllocationChange: (tokenAddress: string, allocation: number) => void;
}

export function BasketTokens({ selectedTokens, onTokenRemove, onAllocationChange }: BasketTokensProps) {
    const [localAllocations, setLocalAllocations] = useState<Record<string, number>>({});
    const [totalAllocation, setTotalAllocation] = useState(0);
    const [showNormalizePrompt, setShowNormalizePrompt] = useState(false);

    useEffect(() => {
        const allocations: Record<string, number> = {};
        let total = 0;

        selectedTokens.forEach((token) => {
            allocations[token.address] = token.allocation;
            total += token.allocation;
        });

        setLocalAllocations(allocations);
        setTotalAllocation(total);
        setShowNormalizePrompt(Math.abs(total - 100) > 0.01 && total > 0);
    }, [selectedTokens]);

    // Handle direct input change
    const handleInputChange = (tokenAddress: string, value: string) => {
        // Allow empty string or valid numbers with up to 2 decimal places
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            const numValue = value === "" ? 0 : Number.parseFloat(value);

            if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

            // Update local state without affecting other tokens
            const newAllocations = { ...localAllocations, [tokenAddress]: numValue };
            const newTotal = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);

            setLocalAllocations(newAllocations);
            setTotalAllocation(newTotal);
            setShowNormalizePrompt(Math.abs(newTotal - 100) > 0.01 && newTotal > 0);

            // Update parent component
            onAllocationChange(tokenAddress, numValue);
        }
    };

    // Increment/decrement allocation
    const adjustAllocation = (tokenAddress: string, delta: number) => {
        const currentValue = localAllocations[tokenAddress] || 0;
        const newValue = Math.max(0, Math.min(100, currentValue + delta));

        if (newValue !== currentValue) {
            handleInputChange(tokenAddress, newValue.toString());
        }
    };

    // Normalize allocations to sum to 100%
    const normalizeAllocations = () => {
        if (selectedTokens.length === 0 || totalAllocation === 0) return;

        const factor = 100 / totalAllocation;
        const newAllocations: Record<string, number> = {};

        selectedTokens.forEach((token) => {
            const normalizedValue = Number.parseFloat((localAllocations[token.address] * factor).toFixed(2));
            newAllocations[token.address] = normalizedValue;
            onAllocationChange(token.address, normalizedValue);
        });

        setLocalAllocations(newAllocations);
        setTotalAllocation(100);
        setShowNormalizePrompt(false);
    };

    // Reset all allocations to equal distribution
    const resetToEqualDistribution = () => {
        if (selectedTokens.length === 0) return;

        const equalValue = Number.parseFloat((100 / selectedTokens.length).toFixed(2));
        const newAllocations: Record<string, number> = {};

        selectedTokens.forEach((token) => {
            newAllocations[token.address] = equalValue;
            onAllocationChange(token.address, equalValue);
        });

        setLocalAllocations(newAllocations);
        setTotalAllocation(equalValue * selectedTokens.length);
        setShowNormalizePrompt(false);
    };

    // Get status color based on total allocation
    const getAllocationStatus = () => {
        if (Math.abs(totalAllocation - 100) < 0.01) return "success";
        if (totalAllocation > 100) return "error";
        if (totalAllocation > 90) return "warning";
        return "default";
    };

    const status = getAllocationStatus();

    return (
        <div className="space-y-6">
            {/* Allocation Progress Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Total Allocation</div>
                    <div
                        className={cn(
                            "text-sm font-medium",
                            status === "success" && "text-green-600 dark:text-green-400",
                            status === "error" && "text-red-600 dark:text-red-400",
                            status === "warning" && "text-amber-600 dark:text-amber-400",
                        )}
                    >
                        {totalAllocation.toFixed(2)}%
                    </div>
                </div>

                <div className="relative">
                    <Progress
                        value={Math.min(totalAllocation, 100)}
                        max={100}
                        className={cn(
                            "h-2",
                            status === "success" && "bg-green-100 dark:bg-green-950",
                            status === "error" && "bg-red-100 dark:bg-red-950",
                            status === "warning" && "bg-amber-100 dark:bg-amber-950",
                            status === "default" && "bg-slate-100 dark:bg-slate-800",
                        )}
                    />
                    <div
                        className={cn(
                            "absolute top-0 h-2 w-0.5 bg-slate-400 dark:bg-slate-500",
                            totalAllocation > 100 && "bg-red-400 dark:bg-red-500",
                        )}
                        style={{ left: "100%" }}
                    />
                </div>

                {/* Normalize Prompt */}
                {showNormalizePrompt && (
                    <div
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md text-sm",
                            totalAllocation > 100
                                ? "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300",
                        )}
                    >
                        <div className="flex items-center">
                            {totalAllocation > 100 ? (
                                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                            )}
                            <span>
                                {totalAllocation > 100
                                    ? "Total allocation exceeds 100%"
                                    : "Total allocation is less than 100%"}
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={normalizeAllocations}
                                className="h-7 px-2 text-xs border-slate-300 dark:border-slate-700"
                            >
                                Normalize
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetToEqualDistribution}
                                className="h-7 px-2 text-xs border-slate-300 dark:border-slate-700"
                            >
                                Equal Split
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Token Allocation Inputs */}
            <div className="space-y-3">
                {selectedTokens.map((token) => (
                    <div
                        key={token.address}
                        className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Token Info */}
                            <div className="flex items-center flex-shrink-0">
                                <div className="flex-shrink-0 h-10 w-10 mr-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 p-0.5">
                                    {token.logoURI ? (
                                        <img
                                            src={token.logoURI || "/placeholder.svg"}
                                            alt={token.symbol}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {token.symbol.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-medium text-slate-900 dark:text-white truncate">
                                        {token.symbol}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {token.name}
                                    </div>
                                </div>
                            </div>

                            {/* Allocation Controls */}
                            <div className="flex-1 flex items-center justify-end">
                                <div className="flex items-center space-x-2">
                                    {/* Decrement Button */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => adjustAllocation(token.address, -1)}
                                                    className="h-8 w-8 rounded-full"
                                                >
                                                    <MinusCircle className="h-4 w-4" />
                                                    <span className="sr-only">Decrease</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Decrease by 1%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    {/* Allocation Input */}
                                    <div className="relative w-[100px]">
                                        <Input
                                            type="text"
                                            value={localAllocations[token.address]?.toString() || "0"}
                                            onChange={(e) => handleInputChange(token.address, e.target.value)}
                                            className={cn(
                                                "pr-8 text-right",
                                                localAllocations[token.address] > 0 && "font-medium",
                                                totalAllocation > 100 && "border-red-300 dark:border-red-700",
                                            )}
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                                            %
                                        </div>
                                    </div>

                                    {/* Increment Button */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => adjustAllocation(token.address, 1)}
                                                    className="h-8 w-8 rounded-full"
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span className="sr-only">Increase</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Increase by 1%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* Quick Presets */}
                                <div className="ml-2 hidden sm:flex space-x-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleInputChange(token.address, "25")}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300"
                                                >
                                                    25%
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Set to 25%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleInputChange(token.address, "50")}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300"
                                                >
                                                    50%
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Set to 50%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => handleInputChange(token.address, "100")}
                                                    className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300"
                                                >
                                                    100%
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Set to 100%</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            {/* Remove Button */}
                            <div className="flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onTokenRemove(token.address)}
                                    className="h-8 w-8 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove {token.symbol}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Allocation Bar */}
                        <div className="mt-3">
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full",
                                        status === "success"
                                            ? "bg-green-500 dark:bg-green-600"
                                            : status === "error"
                                              ? "bg-red-500 dark:bg-red-600"
                                              : status === "warning"
                                                ? "bg-amber-500 dark:bg-amber-600"
                                                : "bg-violet-500 dark:bg-violet-600",
                                    )}
                                    style={{ width: `${Math.min(localAllocations[token.address] || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <Button variant="outline" size="sm" onClick={resetToEqualDistribution} className="flex items-center">
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Equal Split
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={normalizeAllocations}
                    disabled={Math.abs(totalAllocation - 100) < 0.01 || totalAllocation === 0}
                    className={cn(
                        "flex items-center",
                        Math.abs(totalAllocation - 100) >= 0.01 &&
                            totalAllocation > 0 &&
                            "border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30",
                    )}
                >
                    Normalize to 100%
                </Button>
            </div>
        </div>
    );
}
