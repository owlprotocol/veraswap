import { createFileRoute, Link } from "@tanstack/react-router";
import { formatUnits, zeroAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { Card } from "@/components/ui/card.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.js";
import { BASKETS } from "@/constants/baskets.js";
import { Token } from "@/constants/tokens.js";
import { Button } from "@/components/ui/button.js";

export const Route = createFileRoute("/portfolio")({
    component: PortfolioPage,
});

interface Asset {
    name: string;
    token: Token;
    balance: bigint;
}

function useTokenBalances(tokens: Token[]): Asset[] {
    const { address } = useAccount();

    const { data: erc20Balances } = useReadContracts({
        contracts: tokens.map((token) => ({
            address: token.address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
            chainId: token.chainId,
        })),
    });

    return tokens
        .map((token, index) => ({
            name: token.symbol,
            token,
            balance: (erc20Balances?.[index]?.result as bigint) ?? 0n,
        }))
        .filter((asset) => asset.balance > 0n);
}

export default function PortfolioPage() {
    const portfolioTokens = BASKETS.map(
        (b) =>
            ({
                address: b.address,
                symbol: b.symbol,
                chainId: b.allocations[0].chainId,
                category: "basket",
            }) as Token,
    ).filter((t) => t.address !== zeroAddress);

    const currentPortfolio = useTokenBalances(portfolioTokens);
    const hasTokens = currentPortfolio.length > 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-12">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight">Basket Portfolio</h1>
                        <p className="text-muted-foreground text-sm">View your basket token balances</p>
                    </div>

                    <Card className="border-none shadow-sm">
                        <div className="p-6">
                            {hasTokens ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-medium">Balances</h2>
                                            <p className="text-sm text-muted-foreground">
                                                {currentPortfolio.length} basket tokens
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[180px] font-medium text-muted-foreground">
                                                        Asset
                                                    </TableHead>
                                                    <TableHead className="text-right font-medium text-muted-foreground">
                                                        Balance
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentPortfolio.map((asset) => (
                                                    <TableRow key={asset.name} className="hover:bg-muted/50">
                                                        <TableCell className="py-4">
                                                            <span className="font-medium">{asset.name}</span>
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right tabular-nums">
                                                            {formatUnits(asset.balance, asset.token.decimals ?? 18)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">No Basket Tokens Found</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                            You don't have any basket tokens in your wallet yet. Get started by
                                            exploring available baskets.
                                        </p>
                                    </div>
                                    <Link to="/">
                                        <Button className="mt-4" variant="default">
                                            Explore Baskets
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
