import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ArrowRight } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { BASKETS } from "@/constants/baskets.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { Separator } from "@/components/ui/separator.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { BasketAllocation } from "@/constants/baskets.js";
import { TOKENS, Token, TokenCategory, getTokenDetailsForAllocation } from "@/constants/tokens.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { useTokenPrices } from "@/hooks/useTokenPrices.js";

export const Route = createFileRoute("/basket/$basketId")({
    component: BasketDetailsPage,
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

function BasketDetailsPage() {
    const { basketId } = useParams({ from: "/basket/$basketId" });
    const basket = BASKETS.find((b) => b.id === basketId);
    const totaWeight = basket?.allocations.reduce((sum, all) => sum + all.weight, 0);

    const { data: tokenPrices, isLoading, isError } = useTokenPrices(basket?.allocations ?? []);

    const performanceData = tokenPrices
        ? tokenPrices?.map(({ timestamp, prices }) => {
              const value = basket!.allocations.reduce(
                  // TODO:: fix units conversion, possible overflow
                  (sum, all, idx) => sum + (Number(all.units) * (prices[idx].price ?? 0))!,
                  0,
              );
              return {
                  date: new Date(timestamp * 1000).toLocaleString(),
                  timestamp: timestamp * 1000,
                  value,
              };
          })
        : [];

    if (!basket) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Basket Not Found</CardTitle>
                        <CardDescription>The basket you're looking for doesn't exist.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Baskets
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalWeight = basket.allocations.reduce((sum, all) => sum + all.weight, 0);

    const groupAllocationsByCategory = (allocations: BasketAllocation[]) => {
        const grouped = allocations.reduce(
            (acc, allocation) => {
                const token = getTokenDetailsForAllocation(allocation, TOKENS);
                if (!token) return acc;

                const category = token.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({ allocation, token });
                return acc;
            },
            {} as Record<TokenCategory, { allocation: BasketAllocation; token: Token }[]>,
        );

        return Object.entries(grouped).sort(([a], [b]) => {
            const order: TokenCategory[] = ["native", "stable", "commodity", "alt"];
            return order.indexOf(a as TokenCategory) - order.indexOf(b as TokenCategory);
        });
    };

    const renderCategorySection = (
        category: TokenCategory,
        items: { allocation: BasketAllocation; token: Token }[],
        totalWeight: number,
    ) => {
        const categoryWeight = items.reduce((sum, { allocation }) => sum + allocation.weight, 0);
        const categoryPercentage = (categoryWeight / totalWeight) * 100;

        return (
            <Collapsible className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                        <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                        <Badge variant="secondary" className="ml-2">
                            {categoryPercentage.toFixed(2)}%
                        </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-4 space-y-3 bg-background">
                        {items.map(({ allocation, token }) => (
                            <div key={token.address} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <div className="font-medium">{token.symbol}</div>
                                        <div className="text-sm text-muted-foreground">{token.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {((allocation.weight / totalWeight) * 100).toFixed(2)}%
                                    </div>
                                    {/* TODO: show nominal unit <div className="text-sm text-muted-foreground">Weight: {allocation.weight}%</div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    };

    const calculateStats = (data: typeof performanceData) => {
        if (!data.length) return { change: 0, high: 0, low: 0, current: 0, start: 0 };

        const firstValue = data[0].value;
        const lastValue = data[data.length - 1].value;

        if (!firstValue || !lastValue) return { change: 0, high: 0, low: 0, current: 0, start: 0 };
        // const change = ((lastValue - firstValue) / firstValue) * 100;
        // const high = Math.max(...data.map((d) => d.value).filter((v) => !!v));
        // const low = Math.min(...data.map((d) => d.value).filter((v) => !!v));

        return {
            // change,
            // high,
            // low,
            current: lastValue,
            start: firstValue,
        };
    };

    const stats = calculateStats(performanceData);

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link to="/">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Baskets
                        </Button>
                    </Link>
                    <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${basket.gradient} text-white`}>
                            <basket.icon className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">{basket.title}</h1>
                            <p className="text-muted-foreground mt-2 text-lg">{basket.description}</p>
                            <div className="flex items-center space-x-2 mt-3">
                                <Badge
                                    variant="secondary"
                                    className={`${
                                        basket.riskLevel === "Low"
                                            ? "bg-green-500/20 text-green-500"
                                            : basket.riskLevel === "Medium"
                                              ? "bg-yellow-500/20 text-yellow-500"
                                              : "bg-red-500/20 text-red-500"
                                    }`}
                                >
                                    {basket.riskLevel} Risk
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div>
                                    <CardTitle>7-Day Performance</CardTitle>
                                    <CardDescription>
                                        Historical performance of the {basket?.title} basket over the last week
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="h-[300px] w-full flex items-center justify-center">
                                        <Skeleton className="h-full w-full" />
                                    </div>
                                ) : isError && !!performanceData && performanceData.length === 0 ? (
                                    <div className="h-[300px] w-full flex items-center justify-center text-destructive">
                                        Failed to load market data
                                    </div>
                                ) : (
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={performanceData}
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    left: 10,
                                                    bottom: 10,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop
                                                            offset="5%"
                                                            stopColor="hsl(var(--muted-foreground))"
                                                            stopOpacity={0.2}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="hsl(var(--muted-foreground))"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                                <XAxis
                                                    dataKey="date"
                                                    className="text-xs text-muted-foreground/70"
                                                    tick={{ fill: "currentColor" }}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return date.toLocaleDateString("en-US", { weekday: "short" });
                                                    }}
                                                />
                                                <YAxis
                                                    className="text-xs text-muted-foreground/70"
                                                    tick={{ fill: "currentColor" }}
                                                    tickFormatter={(value) => `$${value}`}
                                                    domain={["auto", "auto"]}
                                                />
                                                <Tooltip
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            const value = payload[0].value as number;
                                                            // const change =
                                                            //     ((value - performanceData[0]!.value!) /
                                                            //         performanceData[0].value!) *
                                                            //     100;

                                                            return (
                                                                <div className="bg-card border rounded-lg shadow-lg p-3 space-y-2">
                                                                    <div className="text-sm font-medium">{label}</div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <span className="text-muted-foreground">
                                                                                Value:
                                                                            </span>
                                                                            <span className="font-medium">
                                                                                ${value.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        {/* <div className="flex items-center justify-between gap-4">
                                                                            <span className="text-muted-foreground">
                                                                                Change:
                                                                            </span>
                                                                            <span
                                                                                className={`font-medium ${change >= 0 ? "text-green-500" : "text-red-500"}`}
                                                                            >
                                                                                {change >= 0 ? "+" : ""}
                                                                                {change.toFixed(2)}%
                                                                            </span>
                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="hsl(var(--muted-foreground))"
                                                    fillOpacity={0.3}
                                                    fill="url(#colorValue)"
                                                    strokeWidth={1.5}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {/* <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">7d Change</div>
                                        {isLoading ? (
                                            <Skeleton className="h-6 w-24" />
                                        ) : (
                                            <div className="flex items-center space-x-1">
                                                {stats.change >= 0 ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                <span
                                                    className={`text-lg font-semibold ${stats.change >= 0 ? "text-green-500" : "text-red-500"}`}
                                                >
                                                    {stats.change >= 0 ? "+" : ""}
                                                    {stats.change.toFixed(2)}%
                                                </span>
                                            </div>
                                        )}
                                    </div> */}
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Current Value</div>
                                        {isLoading ? (
                                            <Skeleton className="h-6 w-24" />
                                        ) : (
                                            <div className="text-lg font-semibold">${stats.current.toFixed(2)}</div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Past 7 Days</div>
                                        {isLoading ? (
                                            <Skeleton className="h-6 w-24" />
                                        ) : (
                                            <div className="text-lg font-semibold">${stats.start.toFixed(2)}</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Basket Composition</CardTitle>
                                <CardDescription>Detailed breakdown of assets in this basket</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {groupAllocationsByCategory(basket.allocations).map(([category, items]) => (
                                    <div key={category}>
                                        {renderCategorySection(category as TokenCategory, items, totalWeight)}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Total Assets</div>
                                        <div className="text-2xl font-bold">{basket.allocations.length}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Categories</div>
                                        <div className="text-2xl font-bold">
                                            {groupAllocationsByCategory(basket.allocations).length}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Top Holdings</div>
                                    {basket.allocations
                                        .sort((a: { weight: number }, b: { weight: number }) => b.weight - a.weight)
                                        .slice(0, 3)
                                        .map((allocation: BasketAllocation) => {
                                            const token = getTokenDetailsForAllocation(allocation, TOKENS);
                                            if (!token) return null;
                                            return (
                                                <div key={token.address} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <img
                                                            src={token.logoURI}
                                                            alt={token.symbol}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                        <span className="font-medium">{token.symbol}</span>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {((allocation.weight / totalWeight) * 100).toFixed(1)}%
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        <Link to="/">
                            <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                                Invest in this Basket
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
