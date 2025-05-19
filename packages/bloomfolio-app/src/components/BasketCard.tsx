import { Link } from "@tanstack/react-router";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Separator } from "@radix-ui/react-separator";
import { ChevronDown } from "lucide-react";
import { zeroAddress } from "viem";
import { CardContent, CardHeader, CardDescription, Card, CardTitle } from "./ui/card.js";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { Skeleton } from "./ui/skeleton.js";
import { Token } from "@/constants/tokens.js";
import { BasketAllocation } from "@/constants/baskets.js";
import { getTokenDetailsForAllocation, TokenCategory } from "@/constants/tokens.js";
import { TOKENS } from "@/constants/tokens.js";
import { useGetTokenValues } from "@/hooks/useGetTokenValues.js";

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

export function BasketCard({ basket, isSelected, onSelect }) {
    const { data: tokenValues, isLoading: isTokenValuesLoading } = useGetTokenValues({
        basket,
        quoteCurrency: basket
            ? {
                  address: zeroAddress,
                  chainId: basket.allocations[0].chainId,
              }
            : undefined,
    });

    const totalValue = tokenValues?.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n) ?? 0n;

    const groupAllocationsByCategory = (allocations: BasketAllocation[]) => {
        const grouped = allocations.reduce(
            (acc, allocation, index) => {
                const token = getTokenDetailsForAllocation(allocation, TOKENS);
                if (!token) return acc;

                const category = token.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({ allocation, token, index });
                return acc;
            },
            {} as Record<TokenCategory, { allocation: BasketAllocation; token: Token; index: number }[]>,
        );

        return Object.entries(grouped).sort(([a], [b]) => {
            const order: TokenCategory[] = ["native", "stable", "commodity", "alt"];
            return order.indexOf(a as TokenCategory) - order.indexOf(b as TokenCategory);
        });
    };

    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            }`}
            onClick={(e) => {
                if (!(e.target as HTMLElement).closest(".collapsible")) {
                    onSelect(basket.id);
                }
            }}
        >
            <div className={`bg-gradient-to-r ${basket.gradient} h-2 rounded-t-lg`} />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${basket.gradient} text-white`}>
                            <basket.icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">{basket.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSelected && <Badge className="bg-primary">Selected</Badge>}
                        <Link
                            to="/basket/$basketId"
                            params={{ basketId: basket.id }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button variant="outline" size="sm" className="h-8 w-24">
                                Details
                            </Button>
                        </Link>
                    </div>
                </div>
                <CardDescription className="mt-2">{basket.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Risk Level</div>
                        <div className="font-medium">{basket.riskLevel}</div>
                    </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                    {groupAllocationsByCategory(basket.allocations).map(([category, items]) => (
                        <CategorySection
                            key={`${basket.id}-${category}`}
                            category={category as TokenCategory}
                            items={items}
                            totalValue={totalValue}
                            isLoading={isTokenValuesLoading}
                            tokenValues={tokenValues}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function CategorySection({ category, items, totalValue, isLoading, tokenValues }) {
    const categoryValue = items.reduce((sum, { index }) => {
        const tokenValue = tokenValues?.[index] ?? 0n;
        return sum + tokenValue;
    }, 0n);

    const categoryPercentage = totalValue > 0n ? (Number(categoryValue) / Number(totalValue)) * 100 : 0;

    return (
        <Collapsible className="border rounded-lg overflow-hidden collapsible" onClick={(e) => e.stopPropagation()}>
            <CollapsibleTrigger
                className="w-full px-4 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                    <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                    <Badge variant="secondary" className="ml-2">
                        {isLoading ? <Skeleton className="h-4 w-10" /> : `${categoryPercentage.toFixed(2)}%`}
                    </Badge>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent onClick={(e) => e.stopPropagation()}>
                <div className="p-3 space-y-2 bg-background">
                    {items.map(({ token, index }) => {
                        const tokenValue = tokenValues?.[index] ?? 0n;
                        const tokenPercentage = totalValue > 0n ? (Number(tokenValue) / Number(totalValue)) * 100 : 0;

                        return (
                            <div key={token.address} className="flex justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                                    <span className="text-muted-foreground">{token.symbol}</span>
                                </div>
                                {isLoading ? (
                                    <Skeleton className="h-4 w-12" />
                                ) : (
                                    <span className="font-medium">{tokenPercentage.toFixed(2)}%</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
