import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
    ArrowRightLeft,
    Coins,
    TrendingUp,
    Landmark,
    BarChart3,
    ChevronRight,
    Wallet,
    TrendingDown,
    Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

export const Route = createFileRoute("/portfolio")({
    component: PortfolioPage,
});

const COLORS = {
    bitcoin: "#F7931A",
    ethereum: "#627EEA",
    stablecoins: "#26A17B",
    altcoins: "#8A92B2",
    background: {
        primary: "from-violet-500 to-purple-500",
        secondary: "from-blue-500 to-cyan-400",
        tertiary: "from-emerald-500 to-teal-400",
        quaternary: "from-amber-500 to-orange-400",
    },
};

const initialPortfolio = [
    { name: "Bitcoin", value: 45, color: COLORS.bitcoin },
    { name: "Ethereum", value: 30, color: COLORS.ethereum },
    { name: "Stablecoins", value: 15, color: COLORS.stablecoins },
    { name: "Other Altcoins", value: 10, color: COLORS.altcoins },
];

const suggestions = [
    {
        id: "stablecoins",
        title: "Stablecoins",
        description: "Lower volatility, steady returns",
        icon: Coins,
        allocation: { Bitcoin: 20, Ethereum: 20, "USDC/USDT": 50, "Other Altcoins": 10 },
        gradient: COLORS.background.tertiary,
        riskLevel: "Low",
    },
    {
        id: "growth",
        title: "Growth",
        description: "Higher risk, higher potential returns",
        icon: TrendingUp,
        allocation: { Bitcoin: 40, Ethereum: 40, "USDC/USDT": 5, "Other Altcoins": 15 },
        gradient: COLORS.background.secondary,
        riskLevel: "High",
    },
    {
        id: "balanced",
        title: "Balanced",
        description: "Moderate risk and returns",
        icon: BarChart3,
        allocation: { Bitcoin: 30, Ethereum: 30, "USDC/USDT": 30, "Other Altcoins": 10 },
        gradient: COLORS.background.primary,
        riskLevel: "Medium",
    },
    {
        id: "conservative",
        title: "Conservative",
        description: "Focus on established assets",
        icon: Landmark,
        allocation: { Bitcoin: 25, Ethereum: 15, "USDC/USDT": 55, "Other Altcoins": 5 },
        gradient: COLORS.background.quaternary,
        riskLevel: "Low-Medium",
    },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                <p className="font-medium text-lg">{payload[0].name}</p>
                <p className="text-primary font-bold">{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};
export default function PortfolioPage() {
    const [currentPortfolio, setCurrentPortfolio] = useState(initialPortfolio);
    const [previewPortfolio, setPreviewPortfolio] = useState<typeof initialPortfolio | null>(null);
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

    const updatePreview = (strategyId: string) => {
        setSelectedStrategy(strategyId);

        const strategy = suggestions.find((s) => s.id === strategyId);
        if (!strategy) return;

        const newPortfolio = [
            { name: "Bitcoin", value: strategy.allocation.Bitcoin, color: COLORS.bitcoin },
            { name: "Ethereum", value: strategy.allocation.Ethereum, color: COLORS.ethereum },
            { name: "Stablecoins", value: strategy.allocation["USDC/USDT"], color: COLORS.stablecoins },
            { name: "Other Altcoins", value: strategy.allocation["Other Altcoins"], color: COLORS.altcoins },
        ];

        setPreviewPortfolio(newPortfolio);
    };
    const handleRebalance = () => {
        if (!selectedStrategy) return;

        if (previewPortfolio) {
            setCurrentPortfolio(previewPortfolio);
            setPreviewPortfolio(null);
            setSelectedStrategy(null);
        }
    };

    // Calculate the change for each asset
    const getAssetChange = (assetName: string) => {
        if (!previewPortfolio) return { value: 0, isPositive: false };

        const currentAsset = currentPortfolio.find((a) => a.name === assetName);
        const previewAsset = previewPortfolio.find((a) => a.name === assetName);

        if (!currentAsset || !previewAsset) return { value: 0, isPositive: false };

        const change = previewAsset.value - currentAsset.value;
        return {
            value: Math.abs(change),
            isPositive: change > 0,
        };
    };

    const selectedStrategyData = selectedStrategy ? suggestions.find((s) => s.id === selectedStrategy) : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                        Crypto Portfolio
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage and optimize your crypto asset allocation</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main content area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Portfolio visualization */}
                        <Card className="overflow-hidden border-none shadow-lg">
                            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
                                <h2 className="text-2xl font-bold">Asset Distribution</h2>
                                <p className="text-muted-foreground">
                                    Visualize and compare your portfolio allocations
                                </p>
                            </div>

                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Current Allocation Chart */}
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-medium mb-2 text-center">Current Allocation</h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={currentPortfolio}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        outerRadius={110}
                                                        innerRadius={60}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        paddingAngle={2}
                                                        isAnimationActive={true}
                                                        activeIndex={[]}
                                                        activeShape={(props) => {
                                                            const RADIAN = Math.PI / 180;
                                                            const {
                                                                cx,
                                                                cy,
                                                                midAngle,
                                                                outerRadius,
                                                                startAngle,
                                                                endAngle,
                                                                fill,
                                                            } = props;
                                                            return (
                                                                <g>
                                                                    <path
                                                                        d={`M${cx},${cy}L${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
                                                                            cy +
                                                                            outerRadius * Math.sin(-midAngle * RADIAN)
                                                                        }A${outerRadius},${outerRadius},0,${endAngle - startAngle >= 180 ? 1 : 0},0,${
                                                                            cx +
                                                                            outerRadius * Math.cos(-startAngle * RADIAN)
                                                                        },${cy + outerRadius * Math.sin(-startAngle * RADIAN)}Z`}
                                                                        fill={fill}
                                                                        stroke={fill}
                                                                        strokeWidth={2}
                                                                        opacity={0.9}
                                                                    />
                                                                </g>
                                                            );
                                                        }}
                                                    >
                                                        {currentPortfolio.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.color}
                                                                stroke="none"
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={<CustomTooltip />}
                                                        cursor={false}
                                                        wrapperStyle={{ outline: "none" }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-medium mb-2 text-center">
                                            {selectedStrategy
                                                ? `${selectedStrategyData?.title} Preview`
                                                : "Strategy Preview"}
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            {selectedStrategy ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={previewPortfolio || currentPortfolio}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={110}
                                                            innerRadius={60}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            paddingAngle={2}
                                                            isAnimationActive={true}
                                                            activeIndex={[]}
                                                            activeShape={(props) => {
                                                                const RADIAN = Math.PI / 180;
                                                                const {
                                                                    cx,
                                                                    cy,
                                                                    midAngle,
                                                                    outerRadius,
                                                                    startAngle,
                                                                    endAngle,
                                                                    fill,
                                                                } = props;
                                                                return (
                                                                    <g>
                                                                        <path
                                                                            d={`M${cx},${cy}L${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
                                                                                cy +
                                                                                outerRadius *
                                                                                    Math.sin(-midAngle * RADIAN)
                                                                            }A${outerRadius},${outerRadius},0,${endAngle - startAngle >= 180 ? 1 : 0},0,${
                                                                                cx +
                                                                                outerRadius *
                                                                                    Math.cos(-startAngle * RADIAN)
                                                                            },${cy + outerRadius * Math.sin(-startAngle * RADIAN)}Z`}
                                                                            fill={fill}
                                                                            stroke={fill}
                                                                            strokeWidth={2}
                                                                            opacity={0.9}
                                                                        />
                                                                    </g>
                                                                );
                                                            }}
                                                        >
                                                            {(previewPortfolio || currentPortfolio).map(
                                                                (entry, index) => (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={entry.color}
                                                                        stroke="none"
                                                                    />
                                                                ),
                                                            )}
                                                        </Pie>
                                                        <Tooltip
                                                            content={<CustomTooltip />}
                                                            cursor={false}
                                                            wrapperStyle={{ outline: "none" }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full w-full flex flex-col items-center justify-center">
                                                    <div className="w-[220px] h-[220px] rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center">
                                                        <p className="text-muted-foreground text-center px-6">
                                                            Select a strategy below to preview allocation changes
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
                                    {currentPortfolio.map((asset, index) => {
                                        const previewAsset = previewPortfolio?.find((a) => a.name === asset.name);
                                        const showPreview = selectedStrategy && previewAsset;
                                        const change = getAssetChange(asset.name);

                                        return (
                                            <div key={index} className="flex flex-col">
                                                <div className="flex items-center mb-2">
                                                    <div
                                                        className="w-4 h-4 rounded-full mr-2"
                                                        style={{ backgroundColor: asset.color }}
                                                    ></div>
                                                    <div className="text-base font-medium">{asset.name}</div>
                                                </div>

                                                <div className="text-2xl font-bold">{asset.value}%</div>

                                                {showPreview ? (
                                                    <div className="flex items-center mt-1">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <span
                                                            className={`text-sm font-medium ${change.isPositive ? "text-green-500" : "text-red-500"}`}
                                                        >
                                                            {previewAsset?.value}%
                                                            {change.value > 0 && (
                                                                <span className="ml-1">
                                                                    ({change.isPositive ? "+" : "-"}
                                                                    {change.value}%)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center mt-1">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            --
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strategy selection */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Suggested Strategies</h2>
                                {selectedStrategy && (
                                    <Badge variant="outline" className="px-3 py-1">
                                        {selectedStrategyData?.title} Selected
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {suggestions.map((suggestion) => (
                                    <Card
                                        key={suggestion.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg ${
                                            selectedStrategy === suggestion.id
                                                ? "ring-2 ring-primary border-primary"
                                                : "hover:border-primary/50"
                                        }`}
                                        onClick={() => updatePreview(suggestion.id)}
                                    >
                                        <div className={`bg-gradient-to-r ${suggestion.gradient} h-2 rounded-t-lg`} />
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`p-2 rounded-full bg-gradient-to-r ${suggestion.gradient} text-white`}
                                                    >
                                                        <suggestion.icon className="h-5 w-5" />
                                                    </div>
                                                    <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                                                </div>
                                                {selectedStrategy === suggestion.id && (
                                                    <Badge className="bg-primary">Selected</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="mt-2">{suggestion.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4">
                                                <div className="bg-muted/50 p-3 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Risk Level</div>
                                                    <div className="font-medium">{suggestion.riskLevel}</div>
                                                </div>
                                            </div>

                                            <Separator className="my-3" />

                                            <div className="space-y-2">
                                                {Object.entries(suggestion.allocation).map(([asset, percentage]) => (
                                                    <div key={asset} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{asset}</span>
                                                        <span className="font-medium">{percentage}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-400/10 p-6">
                                <div className="flex items-center space-x-2">
                                    <Wallet className="h-5 w-5 text-primary" />
                                    <h3 className="text-xl font-bold">Portfolio Summary</h3>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Total Assets</span>
                                        <span className="text-2xl font-bold">$10,245.32</span>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="text-muted-foreground">24h Change</span>
                                                <Info className="h-4 w-4 text-muted-foreground ml-1" />
                                            </div>
                                            <div className="flex items-center text-green-500">
                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                <span className="font-medium">+2.4%</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="text-muted-foreground">7d Change</span>
                                                <Info className="h-4 w-4 text-muted-foreground ml-1" />
                                            </div>
                                            <div className="flex items-center text-red-500">
                                                <TrendingDown className="h-4 w-4 mr-1" />
                                                <span className="font-medium">-1.2%</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Last Updated</span>
                                            <span className="font-medium">Just now</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
                                <div className="flex items-center space-x-2">
                                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                                    <h3 className="text-xl font-bold">Rebalance Portfolio</h3>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                {selectedStrategy ? (
                                    <div className="space-y-4">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`p-2 rounded-full bg-gradient-to-r ${selectedStrategyData?.gradient} text-white`}
                                                >
                                                    {selectedStrategyData?.icon && (
                                                        <selectedStrategyData.icon className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {selectedStrategyData?.title} Strategy
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {selectedStrategyData?.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">
                                                Rebalancing will adjust your portfolio according to the selected
                                                strategy.
                                            </div>

                                            <Button
                                                onClick={handleRebalance}
                                                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                            >
                                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                Confirm Rebalance
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="w-full mt-2"
                                                onClick={() => {
                                                    setSelectedStrategy(null);
                                                    setPreviewPortfolio(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center py-6">
                                            <div className="bg-muted/50 inline-flex p-3 rounded-full mb-3">
                                                <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h4 className="text-lg font-medium">No Strategy Selected</h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Choose a strategy from the suggestions to rebalance your portfolio
                                            </p>
                                        </div>

                                        <Button disabled className="w-full">
                                            Select a Strategy First
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
