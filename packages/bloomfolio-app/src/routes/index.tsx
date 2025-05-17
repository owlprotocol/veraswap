import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShoppingCart, X, ArrowRight, ChevronDown, AlertCircle } from "lucide-react";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { Address } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Input } from "@/components/ui/input.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { BucketAllocation, BUCKETS } from "@/constants/buckets.js";
import { MAINNET_TOKENS, Token, TokenCategory, getTokenDetailsForAllocation } from "@/constants/tokens.js";

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

export const Route = createFileRoute("/")({
    component: SimplifiedPortfolioPage,
});

const CATEGORY_LABELS: Record<TokenCategory, string> = {
    native: "Native Tokens",
    stable: "Stablecoins",
    alt: "Alt Tokens",
    commodity: "Commodities",
};

const CATEGORY_ICONS: Record<TokenCategory, string> = {
    native: "🌐",
    stable: "💵",
    alt: "🚀",
    commodity: "🪙",
};

export default function SimplifiedPortfolioPage() {
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("10");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        token: USDC_ADDRESS,
    });
    const { switchChain } = useSwitchChain();

    const handleSelectBucket = (bucketId: string) => {
        setSelectedBucket(bucketId);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePurchase = () => {
        if (!isConnected || chainId !== 1) return;

        const requiredAmount = Number.parseFloat(amount);
        const userBalance = Number(balance?.value || 0) / 1e6;
        if (userBalance < requiredAmount) return;

        setShowConfirmation(true);
    };

    const handleReset = () => {
        setSelectedBucket(null);
        setAmount("100");
        setShowConfirmation(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setAmount(value);
    };

    const selectedBucketData = selectedBucket ? BUCKETS.find((b) => b.id === selectedBucket) : null;
    const selectedBucketTotalWeight = selectedBucketData?.allocations.reduce((acc, all) => acc + all.weight, 0n);
    const userBalance = Number(balance?.value || 0) / 1e6;
    const requiredAmount = Number(amount);
    const hasInsufficientBalance = isConnected && !isBalanceLoading && userBalance < requiredAmount;
    const isAmountValid = requiredAmount > 0;

    const renderAllocationDetails = (
        allocation: { address: Address; chainId: number; weight: bigint },
        totalWeight: bigint,
    ) => {
        const token = getTokenDetailsForAllocation(allocation, MAINNET_TOKENS);
        if (!token) return null;

        const value =
            !isNaN(Number(amount)) && Number(amount) > 0
                ? ((Number(amount) * Number(allocation.weight)) / Number(totalWeight)).toFixed(2)
                : null;

        return (
            <div key={token.address} className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-muted-foreground">{token.symbol}</span>
                </div>
                {value ? (
                    <span className="font-medium">${value}</span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </div>
        );
    };

    const groupAllocationsByCategory = (allocations: { address: Address; chainId: number; weight: bigint }[]) => {
        const grouped = allocations.reduce(
            (acc, allocation) => {
                const token = getTokenDetailsForAllocation(allocation, MAINNET_TOKENS);
                if (!token) return acc;

                const category = token.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({ allocation, token });
                return acc;
            },
            {} as Record<
                TokenCategory,
                { allocation: { address: Address; chainId: number; weight: bigint }; token: Token }[]
            >,
        );

        return Object.entries(grouped).sort(([a], [b]) => {
            const order: TokenCategory[] = ["native", "stable", "commodity", "alt"];
            return order.indexOf(a as TokenCategory) - order.indexOf(b as TokenCategory);
        });
    };

    const renderCategorySection = (
        category: TokenCategory,
        items: { allocation: BucketAllocation; token: Token }[],
        totalWeight: bigint,
    ) => {
        const categoryWeight = items.reduce((sum, { allocation }) => sum + allocation.weight, 0n);
        const categoryPercentage = Number(categoryWeight) / Number(totalWeight);

        return (
            <Collapsible className="border rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <CollapsibleTrigger
                    className="w-full px-4 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                        <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                        <Badge variant="secondary" className="ml-2">
                            {categoryPercentage}%
                        </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 space-y-2 bg-background">
                        {items.map(({ allocation, token }) => (
                            <div key={token.address} className="flex justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                                    <span className="text-muted-foreground">{token.symbol}</span>
                                </div>
                                <span className="font-medium">{Number(allocation.weight) / Number(totalWeight)}%</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                        Quick Invest
                    </h1>
                    <p className="text-muted-foreground mt-2">Select a strategy and start investing in minutes</p>
                </header>

                {showConfirmation ? (
                    <div className="max-w-md mx-auto">
                        <Card className="border-none shadow-lg text-center">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
                                <CardDescription>
                                    You've successfully invested {amount} USDC in the {selectedBucketData?.title}{" "}
                                    strategy
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="text-sm font-medium mb-2">Transaction Details</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Date</span>
                                            <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Payment Method</span>
                                            <span className="font-medium">USDC</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Transaction ID</span>
                                            <span className="font-medium">
                                                {Math.random().toString(36).substring(2, 10).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium mb-2">Assets Purchased</div>
                                    {selectedBucketData && (
                                        <div className="space-y-2">
                                            {selectedBucketData.allocations.map((all: BucketAllocation) =>
                                                renderAllocationDetails(all, selectedBucketTotalWeight!),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button onClick={handleReset} className="w-full">
                                    Make Another Investment
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {selectedBucket && selectedBucketData && (
                            <Card className="border-none shadow-lg overflow-hidden mb-8 animate-in fade-in-50 duration-300">
                                <div className={`bg-gradient-to-r ${selectedBucketData.gradient} h-2`} />
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-9 gap-6">
                                    <div className="lg:col-span-3">
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`p-2 rounded-full bg-gradient-to-r ${selectedBucketData.gradient} text-white`}
                                            >
                                                <selectedBucketData.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{selectedBucketData.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedBucketData.description}
                                                </p>
                                                <Badge variant="outline" className="mt-2">
                                                    {selectedBucketData.riskLevel} Risk
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        <h3 className="font-medium mb-2">Amount (USDC)</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    pattern="[0-9]*\.?[0-9]*"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    className="text-base"
                                                    disabled={!isConnected}
                                                />
                                                <span className="text-base font-medium">USDC</span>
                                            </div>
                                            {isConnected && (
                                                <div className="text-sm text-muted-foreground">
                                                    {isBalanceLoading ? (
                                                        "Loading balance..."
                                                    ) : (
                                                        <>
                                                            Balance: {userBalance.toFixed(2)} USDC
                                                            {hasInsufficientBalance && (
                                                                <div className="text-red-500 mt-1">
                                                                    Insufficient balance
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {!isConnected && (
                                                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        Please connect your wallet to proceed
                                                    </span>
                                                </div>
                                            )}
                                            {isConnected && chainId !== 1 && (
                                                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            Please switch to Ethereum mainnet
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => switchChain?.({ chainId: 1 })}
                                                        className="ml-2"
                                                    >
                                                        Switch Network
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        <div className="space-y-3">
                                            <h3 className="font-medium">Order Summary</h3>
                                            {selectedBucketData && (
                                                <div className="space-y-1 text-sm">
                                                    {selectedBucketData.allocations.map((all: BucketAllocation) =>
                                                        renderAllocationDetails(all, selectedBucketTotalWeight!),
                                                    )}
                                                </div>
                                            )}

                                            <Separator />

                                            <div className="flex justify-between font-medium">
                                                <span>Total</span>
                                                <span>
                                                    {!isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0
                                                        ? `${amount} USDC`
                                                        : "-"}
                                                </span>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => setSelectedBucket(null)}
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                                    size="sm"
                                                    onClick={
                                                        chainId !== 1
                                                            ? () => switchChain?.({ chainId: 1 })
                                                            : handlePurchase
                                                    }
                                                    disabled={
                                                        !isConnected ||
                                                        hasInsufficientBalance ||
                                                        isBalanceLoading ||
                                                        !isAmountValid
                                                    }
                                                >
                                                    <ShoppingCart className="mr-1 h-4 w-4" />
                                                    {!isConnected
                                                        ? "Connect Wallet"
                                                        : chainId !== 1
                                                          ? "Switch Network"
                                                          : !isAmountValid
                                                            ? "Enter Amount"
                                                            : hasInsufficientBalance
                                                              ? "Insufficient Balance"
                                                              : "Buy Now"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Choose an Investment Strategy</h2>
                                {selectedBucket && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <span>Selected: {BUCKETS.find((b) => b.id === selectedBucket)?.title}</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {BUCKETS.map((bucket) => (
                                    <Card
                                        key={bucket.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg ${
                                            selectedBucket === bucket.id
                                                ? "ring-2 ring-primary border-primary"
                                                : "hover:border-primary/50"
                                        }`}
                                        onClick={(e) => {
                                            if (!(e.target as HTMLElement).closest(".collapsible")) {
                                                handleSelectBucket(bucket.id);
                                            }
                                        }}
                                    >
                                        <div className={`bg-gradient-to-r ${bucket.gradient} h-2 rounded-t-lg`} />
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`p-2 rounded-full bg-gradient-to-r ${bucket.gradient} text-white`}
                                                    >
                                                        <bucket.icon className="h-5 w-5" />
                                                    </div>
                                                    <CardTitle className="text-xl">{bucket.title}</CardTitle>
                                                </div>
                                                {selectedBucket === bucket.id && (
                                                    <Badge className="bg-primary">Selected</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="mt-2">{bucket.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4">
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Risk Level</div>
                                                    <div className="font-medium">{bucket.riskLevel}</div>
                                                </div>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="space-y-2">
                                                {groupAllocationsByCategory(bucket.allocations).map(
                                                    ([category, items]) =>
                                                        renderCategorySection(category as TokenCategory, items),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
