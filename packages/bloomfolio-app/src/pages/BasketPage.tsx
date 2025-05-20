import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ExternalLink, LucideIcon } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { useState } from "react";
import { useSendTransaction } from "wagmi";
import { zeroAddress, formatUnits, Address } from "viem";
import * as chains from "viem/chains";
import { getBasket } from "@owlprotocol/veraswap-sdk/artifacts/BasketFixedUnits";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    tokenDataQueryOptions,
    USDC_BSC,
    USDC_MAINNET,
    USDC_OPTIMISM,
    USDC_BASE,
    USDC_POLYGON,
    USDC_ARBITRUM,
} from "@owlprotocol/veraswap-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { Separator } from "@/components/ui/separator.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { BasketPercentageAllocation } from "@/constants/baskets.js";
import { TOKENS, Token, TokenCategory, getTokenDetailsForAllocation } from "@/constants/tokens.js";
import { Skeleton } from "@/components/ui/skeleton.js";
import { useTokenPrices } from "@/hooks/useTokenPrices.js";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/constants/categories.js";
import { config } from "@/config.js";
import { SelectedBasketPanel } from "@/components/SelectedBasketPanel.js";
import { useBasketWeights } from "@/hooks/useBasketWeights.js";
import { ShareButton } from "@/components/ShareButton.js";
import { unitsToQuote } from "@/hooks/useGetTokenValues.js";

interface BasketPageProps {
    referrer?: Address;
    chainId: number;
    address: Address;
    details?: {
        title?: string;
        description?: string;
        icon?: LucideIcon;
    };
}
// TODO: fix, temporary
const USDC_ADDRESSES = {
    1: USDC_MAINNET.address,
    56: USDC_BSC.address,
    10: USDC_OPTIMISM.address,
    8453: USDC_BASE.address,
    137: USDC_POLYGON.address,
    42161: USDC_ARBITRUM.address,
} as const;

const getUSDCForChain = (chainId: number): Address | undefined => {
    const address = USDC_ADDRESSES[chainId];
    return address ?? undefined;
};

export const BasketPage = ({ chainId, address, details, referrer }: BasketPageProps) => {
    const [showPurchasePanel, setShowPurchasePanel] = useState(false);
    const [amount, setAmount] = useState("");
    const { sendTransaction } = useSendTransaction();
    const { address: userAddress } = useAccount();
    const { data: balance } = useBalance({
        address: userAddress,
        token: address,
        chainId,
    });

    const { data: basketDetails } = useReadContract({
        chainId,
        address,
        abi: [getBasket],
        functionName: "getBasket",
    });

    const {
        data: tokenPrices,
        isLoading,
        isError,
    } = useTokenPrices(basketDetails?.map(({ addr }) => ({ address: addr, chainId })) ?? []);

    const { data: tokenMetadata } = useSuspenseQuery(tokenDataQueryOptions(config, { chainId, address }));

    console.log({ tokenMetadata, basketDetails });

    const performanceData = tokenPrices
        ? tokenPrices?.map(({ timestamp, prices }) => {
              const value =
                  basketDetails?.reduce(
                      (sum, token, idx) => sum + Number(token.units) * (prices[idx]?.price ?? 0),
                      0,
                  ) ?? 0;
              return {
                  date: new Date(timestamp * 1000).toLocaleString(),
                  timestamp: timestamp * 1000,
                  value,
              };
          })
        : [];

    const { percentages, weights, totalValue } = useBasketWeights({
        chainId,
        basketDetails: basketDetails ?? [],
        quoteCurrency: getUSDCForChain(chainId),
    });

    const totalDollarValue = balance && totalValue ? (balance.value * totalValue) / unitsToQuote : 0n;

    const formattedDollarValue = formatUnits(totalDollarValue, 18);

    const handleSellAll = () => {
        // TODO: implement
        console.log("sell all");
    };

    if (!basketDetails || !percentages) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Loading Basket</CardTitle>
                        <CardDescription>Fetching basket details...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const basketAllocations = basketDetails.map((token, idx) => ({
        address: token.addr,
        units: token.units,
        percentage: percentages[idx],
        weight: weights[idx],
        chainId,
    }));

    const groupAllocationsByCategory = (allocations: BasketPercentageAllocation[]) => {
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
            {} as Record<TokenCategory, { allocation: BasketPercentageAllocation; token: Token }[]>,
        );

        return Object.entries(grouped).sort(([a], [b]) => {
            const order: TokenCategory[] = ["native", "stable", "commodity", "alt", "basket"];
            return order.indexOf(a as TokenCategory) - order.indexOf(b as TokenCategory);
        });
    };

    const renderCategorySection = (
        category: TokenCategory,
        items: { allocation: BasketPercentageAllocation; token: Token }[],
    ) => {
        const categoryPercentage = items.reduce((sum, { allocation }) => sum + allocation.weight, 0);

        return (
            <Collapsible className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                        <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                        <Badge variant="secondary" className="ml-2">
                            {categoryPercentage.toFixed(3)}%
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
                                    <div className="font-medium">{allocation.percentage}%</div>
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

        return {
            current: lastValue,
            start: firstValue,
        };
    };

    const stats = calculateStats(performanceData);

    const chain = chainId ? Object.values(chains).find((c) => c.id === chainId) : undefined;
    const explorerUrl = chain?.blockExplorers?.default?.url;

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
                    {showPurchasePanel ? (
                        <SelectedBasketPanel
                            address={address}
                            chainId={chainId}
                            amount={amount}
                            setAmount={setAmount}
                            sendTransaction={sendTransaction}
                            referrer={referrer}
                        />
                    ) : null}
                    <div className="flex items-start justify-between space-x-4">
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white`}>
                                {details?.icon ? (
                                    <details.icon className="h-8 w-8" />
                                ) : (
                                    <span className="text-xl">🧺</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-bold">{tokenMetadata?.name || details?.title}</h1>
                                <p className="text-muted-foreground text-lg">{details?.description}</p>
                                {address !== zeroAddress && explorerUrl && (
                                    <div className="pt-1">
                                        <span className="text-xs text-muted-foreground/70">Contract Address:</span>
                                        <a
                                            href={`${explorerUrl}/address/${address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-sm font-mono bg-muted/50 px-2 py-0.5 rounded hover:bg-muted/70 transition-colors inline-flex items-center gap-2"
                                        >
                                            {address}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                        <ShareButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div>
                                    <CardTitle>7-Day Performance</CardTitle>
                                    <CardDescription>
                                        Historical performance of the {tokenMetadata?.name || details?.title} basket
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
                                {groupAllocationsByCategory(basketAllocations).map(([category, items]) => (
                                    <div key={category}>{renderCategorySection(category as TokenCategory, items)}</div>
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
                                {userAddress && address !== zeroAddress && (
                                    <>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">Your Balance</div>
                                                {balance && balance.value > 0n && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleSellAll}
                                                        size="sm"
                                                        className="h-7"
                                                    >
                                                        Sell All
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {balance
                                                    ? `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`
                                                    : "0"}
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Total Assets</div>
                                        <div className="text-2xl font-bold">{basketAllocations.length}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Total Value</div>
                                        <div className="text-2xl font-bold">
                                            ${Number(formattedDollarValue).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Top Holdings</div>
                                    {basketAllocations
                                        .sort((a, b) => b.weight - a.weight)
                                        .slice(0, 3)
                                        .map((allocation: BasketPercentageAllocation) => {
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
                                                    <Badge variant="outline">{allocation.percentage}%</Badge>
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => {
                                    setShowPurchasePanel(true);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="w-full"
                            >
                                Buy this Basket
                            </Button>
                            <Link to="/" className="w-full">
                                <Button variant="outline" className="w-full">
                                    View all baskets
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
