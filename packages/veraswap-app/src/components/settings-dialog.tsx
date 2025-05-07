import { Settings2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { slippageAtom } from "@/atoms/atoms.js";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { Button } from "@/components/ui/button.js";
import { cn } from "@/lib/utils.js";

const SLIPPAGE_OPTIONS = ["auto", 0.1, 0.5, 1] as const;

function SlippageSettings() {
    const [slippage, setSlippage] = useAtom(slippageAtom);
    const [customValue, setCustomValue] = useState<number | null>(null);

    useEffect(() => {
        if (typeof slippage === "number" && !SLIPPAGE_OPTIONS.includes(slippage as any)) {
            setCustomValue(slippage);
        }
    }, [slippage]);

    const handleSlippageChange = (value: (typeof SLIPPAGE_OPTIONS)[number]) => {
        setCustomValue(null);
        if (value === "auto") {
            setSlippage("auto");
            return;
        }
        setSlippage(value);
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = Math.min(Number(value), 100);
        setCustomValue(numValue);
        setSlippage(numValue);
    };

    const isCustomSelected = typeof slippage === "number" && !SLIPPAGE_OPTIONS.includes(slippage as any);
    const hasHighSlippage = customValue !== null && customValue > 5;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-medium">Slippage Tolerance</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.
                    </p>
                </div>
                <div className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {slippage === "auto" ? "Auto" : `${slippage}%`}
                </div>
            </div>

            <div className="bg-muted/40 rounded-lg p-4 border border-border/40">
                <div className="grid grid-cols-4 gap-2">
                    {SLIPPAGE_OPTIONS.map((option) => (
                        <Button
                            key={option}
                            type="button"
                            variant={slippage === option ? "default" : "outline"}
                            className={cn(
                                "h-9 w-full transition-all duration-200",
                                slippage === option && "ring-2 ring-primary ring-offset-1",
                            )}
                            onClick={() => handleSlippageChange(option)}
                        >
                            {option === "auto" ? "Auto" : `${option}%`}
                        </Button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="custom-slippage" className="text-xs font-medium">
                            Custom slippage
                        </Label>
                        {isCustomSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                Active
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Input
                                id="custom-slippage"
                                type="number"
                                value={customValue ?? ""}
                                onChange={handleCustomChange}
                                className={cn("pr-8")}
                                placeholder="0.0"
                                min={0}
                                max={100}
                                step={0.1}
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <span className="text-sm text-muted-foreground">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hasHighSlippage && (
                <div className="flex items-start gap-2.5 p-3 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-900/50">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">High slippage warning</p>
                        <p className="mt-0.5">
                            Setting a high slippage tolerance may result in a less favorable price for your trade and
                            could lead to significant losses due to price impact.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [, setSlippage] = useAtom(slippageAtom);
    const [activeTab, setActiveTab] = useState("slippage");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
                <div className="flex flex-col h-full">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            {activeTab !== "slippage" && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 mr-1"
                                    onClick={() => setActiveTab("slippage")}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Back</span>
                                </Button>
                            )}
                            <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Configure your trading preferences</p>
                    </DialogHeader>

                    <div className="flex-1 px-6 py-4 overflow-y-auto max-h-[60vh]">
                        <SlippageSettings />
                    </div>

                    <DialogFooter className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSlippage("auto");
                            }}
                            className="text-xs h-8"
                        >
                            Reset to Default
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
