import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { formatUnits, zeroAddress } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.js";
import { BUCKETS } from "@/constants/buckets.js";
import { BASE_TOKENS, getTokenDetailsForAllocation, Token } from "@/constants/tokens.js";

export const Route = createFileRoute("/portfolio")({
    component: PortfolioPage,
});

const COLORS = {
    stable: "#26A17B",
    native: "#627EEA",
    commodity: "#F7931A",
    alt: "#8A92B2",
    background: {
        primary: "from-violet-500 to-purple-500",
        secondary: "from-blue-500 to-cyan-400",
        tertiary: "from-emerald-500 to-teal-400",
        quaternary: "from-amber-500 to-orange-400",
    },
};

interface Assets {
    name: string;
    value: number;
    color: string;
    token: Token;
    balance: bigint;
    balanceUsd: number;
    change?: number;
}

function useNativeBalance() {
    const { address } = useAccount();
    const { data: ethBalance } = useBalance({ address });
    return ethBalance?.value ?? 0n;
}

function useTokenBalances(tokens: Token[]): Assets[] {
    const { address } = useAccount();
    const ethBalance = useNativeBalance();

    const prices = {
        USDC: 1,
        ETH: 3000,
        cbBTC: 60000,
        LINK: 15,
    } as const;

    const erc20Tokens = tokens.filter((token) => token.address !== zeroAddress);
    const { data: erc20Balances } = useReadContracts({
        contracts: erc20Tokens.map((token) => ({
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
        })),
    });

    return tokens.map((token) => {
        const balance: bigint =
            token.address === zeroAddress
                ? ethBalance
                : ((erc20Balances?.[erc20Tokens.findIndex((t) => t.address === token.address)]?.result as bigint) ??
                  0n);

        const balanceUsd =
            balance === 0n
                ? 0
                : Number(formatUnits(balance, token.decimals ?? 18)) *
                  (prices[token.symbol as keyof typeof prices] ?? 0);

        return {
            name: token.symbol,
            value: balanceUsd,
            color: COLORS[token.category],
            token,
            balance,
            balanceUsd,
        };
    });
}

function usePortfolioValue(assets: Assets[]) {
    return assets.reduce((sum, asset) => sum + asset.balanceUsd, 0);
}

// const CustomTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//         return (
//             <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
//                 <p className="font-medium text-lg">{payload[0].name}</p>
//                 <p className="text-primary font-bold">{payload[0].value}%</p>
//             </div>
//         );
//     }
//     return null;
// };

export default function PortfolioPage() {
    const currentPortfolio = useTokenBalances(BASE_TOKENS);
    const totalValue = usePortfolioValue(currentPortfolio);
    const [previewPortfolio, setPreviewPortfolio] = useState<Assets[] | null>(null);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

    const updatePreview = (bucketId: string) => {
        setSelectedBucket(bucketId);
        const bucket = BUCKETS.find((b) => b.id === bucketId);
        if (!bucket) return;

        const preview = bucket.allocations
            .map((allocation) => {
                const token = getTokenDetailsForAllocation(allocation, BASE_TOKENS);
                if (!token) return null;

                const currentAsset = currentPortfolio.find((a) => a.token.address === token.address);
                if (!currentAsset) return null;

                const targetValue = (Number(allocation.weight) / 100) * totalValue;
                const currentValue = currentAsset.balanceUsd;
                const change = targetValue - currentValue;

                return {
                    ...currentAsset,
                    value: targetValue,
                    balanceUsd: targetValue,
                    change,
                };
            })
            .filter((asset): asset is Assets & { change: number } => asset !== null);

        setPreviewPortfolio(preview);
    };

    const handleRebalance = () => {
        if (!selectedBucket || !previewPortfolio) return;
        setPreviewPortfolio(null);
        setSelectedBucket(null);
    };

    const selectedBucketData = selectedBucket ? BUCKETS.find((b) => b.id === selectedBucket) : null;

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
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="overflow-hidden border-none shadow-lg">
                            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
                                <h2 className="text-2xl font-bold">Portfolio Balances</h2>
                                <p className="text-muted-foreground">View and manage your token balances</p>
                            </div>

                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Asset</TableHead>
                                                    <TableHead className="text-right">Balance</TableHead>
                                                    <TableHead className="text-right">USD Value</TableHead>
                                                    <TableHead className="text-right">Allocation</TableHead>
                                                    <TableHead className="text-right">Change</TableHead>
                                                    {/* Portfolio Distribution Column - Temporarily disabled
                                                    <TableHead className="w-[100px]"></TableHead>
                                                    */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentPortfolio.map((asset) => {
                                                    const previewAsset = previewPortfolio?.find(
                                                        (a) => a.token.address === asset.token.address,
                                                    );
                                                    const allocation = (asset.balanceUsd / totalValue) * 100;
                                                    const change = previewAsset ? previewAsset.change : 0;

                                                    return (
                                                        <TableRow key={asset.name}>
                                                            <TableCell>
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full mr-2"
                                                                        style={{ backgroundColor: asset.color }}
                                                                    />
                                                                    <span className="font-medium">{asset.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {formatUnits(asset.balance, asset.token.decimals ?? 18)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                $
                                                                {asset.balanceUsd.toLocaleString(undefined, {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {allocation.toFixed(2)}%
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {previewAsset?.change !== undefined && (
                                                                    <span
                                                                        className={`font-medium ${
                                                                            previewAsset.change > 0
                                                                                ? "text-green-500"
                                                                                : "text-red-500"
                                                                        }`}
                                                                    >
                                                                        {previewAsset.change > 0 ? "+" : ""}$
                                                                        {Math.abs(previewAsset.change).toLocaleString(
                                                                            undefined,
                                                                            {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2,
                                                                            },
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            {/* Portfolio Distribution Dialog - Temporarily disabled
                                                            <TableCell className="text-right">
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <BarChart3 className="h-4 w-4" />
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-3xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>
                                                                                Portfolio Distribution
                                                                            </DialogTitle>
                                                                        </DialogHeader>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                                            <div className="flex flex-col">
                                                                                <h3 className="text-lg font-medium mb-2 text-center">
                                                                                    Current Allocation
                                                                                </h3>
                                                                                <div className="h-[300px] w-full">
                                                                                    <ResponsiveContainer
                                                                                        width="100%"
                                                                                        height="100%"
                                                                                    >
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
                                                                                            >
                                                                                                {currentPortfolio.map(
                                                                                                    (entry) => (
                                                                                                        <Cell
                                                                                                            key={`cell-${entry.name}`}
                                                                                                            fill={
                                                                                                                entry.color
                                                                                                            }
                                                                                                            stroke="none"
                                                                                                        />
                                                                                                    ),
                                                                                                )}
                                                                                            </Pie>
                                                                                            <Tooltip
                                                                                                content={
                                                                                                    <CustomTooltip />
                                                                                                }
                                                                                            />
                                                                                        </PieChart>
                                                                                    </ResponsiveContainer>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </TableCell>
                                                            */}
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strategy selection */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Suggested Strategies</h2>
                                {selectedBucket && (
                                    <Badge variant="outline" className="px-3 py-1">
                                        {selectedBucketData?.title} Selected
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {BUCKETS.map((bucket) => (
                                    <Card
                                        key={bucket.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg ${
                                            selectedBucket === bucket.id
                                                ? "ring-2 ring-primary border-primary"
                                                : "hover:border-primary/50"
                                        }`}
                                        onClick={() => updatePreview(bucket.id)}
                                    >
                                        <div className={`bg-gradient-to-r ${bucket.gradient} h-2 rounded-t-lg`} />
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
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
                                                {bucket.allocations.map((allocation) => {
                                                    const token = getTokenDetailsForAllocation(allocation, BASE_TOKENS);
                                                    if (!token) return null;
                                                    return (
                                                        <div
                                                            key={token.address}
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <span className="text-muted-foreground">
                                                                {token.symbol}
                                                            </span>
                                                            <span className="font-medium">
                                                                {Number(allocation.weight)}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        {/* Portfolio Summary Card - Temporarily disabled
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
                        */}

                        <Card className="border-none shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-6">
                                <div className="flex items-center space-x-2">
                                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                                    <h3 className="text-xl font-bold">Rebalance Portfolio</h3>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                {selectedBucket ? (
                                    <div className="space-y-4">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`p-2 rounded-full bg-gradient-to-r ${selectedBucketData?.gradient} text-white`}
                                                >
                                                    {selectedBucketData?.icon && (
                                                        <selectedBucketData.icon className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {selectedBucketData?.title} Strategy
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {selectedBucketData?.description}
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
                                                    setSelectedBucket(null);
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
