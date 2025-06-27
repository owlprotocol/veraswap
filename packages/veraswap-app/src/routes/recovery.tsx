import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatEther, formatUnits } from "viem";
import {
    AlertCircle,
    Wallet,
    ArrowRight,
    Copy,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { allKernelAccountsAtom, hasStuckFundsAtom, totalStuckFundsAtom } from "@/atoms/kernelRecovery.js";
import { useKernelRecovery } from "@/hooks/useKernelRecovery.js";
import { KernelTestingTools } from "@/components/KernelTestingTools.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.js";

export const Route = createFileRoute("/recovery")({
    component: RecoveryPage,
});

function RecoveryPage() {
    const { address: walletAddress } = useAccount();
    const { openConnectModal } = useConnectModal();
    const kernelAccounts = useAtomValue(allKernelAccountsAtom);
    const hasStuckFunds = useAtomValue(hasStuckFundsAtom);
    const totalStuckFunds = useAtomValue(totalStuckFundsAtom);
    const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set());
    const { recoverFunds, recoverAllFunds, isPending, isSuccess, error, hash, receipt } = useKernelRecovery();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const toggleChainExpansion = (chainId: number) => {
        const newExpanded = new Set(expandedChains);
        if (newExpanded.has(chainId)) {
            newExpanded.delete(chainId);
        } else {
            newExpanded.add(chainId);
        }
        setExpandedChains(newExpanded);
    };

    const deployedKernelAccounts = kernelAccounts.filter((account) => account.isDeployed);

    const handleRecoverFunds = async (account: any) => {
        const tokenTransfers = account.tokenBalances.map((token: any) => ({
            tokenAddress: token.tokenAddress,
            amount: token.balance,
        }));

        await recoverFunds({
            chainId: account.chainId,
            kernelAddress: account.kernelAddress,
            nativeAmount: account.balance > 0n ? account.balance : undefined,
            tokenTransfers: tokenTransfers.length > 0 ? tokenTransfers : undefined,
        });
    };

    const handleRecoverAll = async () => {
        // Prepare the kernel accounts data for recovery
        const kernelAccountsForRecovery = deployedKernelAccounts.map((account) => ({
            chainId: account.chainId,
            kernelAddress: account.kernelAddress,
            nativeAmount: account.balance > 0n ? account.balance : undefined,
            tokenTransfers: account.tokenBalances.map((token) => ({
                tokenAddress: token.tokenAddress,
                amount: token.balance,
            })),
        }));

        // Call the recoverAllFunds function
        await recoverAllFunds({
            kernelAccounts: kernelAccountsForRecovery,
        });
    };

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Kernel Account Recovery</h1>
                    <p className="text-muted-foreground">Recover funds that may be stuck in your kernel accounts.</p>
                </div>

                <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                        <p>Please connect your wallet to view your kernel accounts and check for stuck funds.</p>
                        <button
                            onClick={openConnectModal}
                            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const kernelAddress = kernelAccounts[0]?.kernelAddress;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Kernel Account Recovery</h1>
                <p className="text-muted-foreground">
                    Recover funds that may be stuck in your kernel accounts across different chains.
                </p>
            </div>

            <div className="space-y-6">
                {/* Testing Section */}
                <KernelTestingTools />

                {!hasStuckFunds && deployedKernelAccounts.length > 0 && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-800">No Stuck Funds Found</h3>
                                    <p className="text-sm text-green-700">
                                        All your kernel accounts are empty. No recovery needed!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasStuckFunds && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Total Stuck Funds
                            </CardTitle>
                            <CardDescription>Total value across all chains</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="text-2xl font-bold">{formatEther(totalStuckFunds.native)} ETH</div>
                                    <div className="text-sm text-muted-foreground">
                                        <div>Total native balance across all chains</div>
                                        {totalStuckFunds.tokenCount > 0 && (
                                            <div>
                                                {totalStuckFunds.tokenCount} token
                                                {totalStuckFunds.tokenCount !== 1 ? "s" : ""} with balances
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="default" onClick={handleRecoverAll} disabled={isPending}>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Recover All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {kernelAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Smart Wallet Address
                            </CardTitle>
                            <CardDescription>Your kernel account address (same across all chains)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <code className="text-sm font-mono flex-1 break-all">{kernelAddress}</code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(kernelAddress)}
                                    className="shrink-0"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Chain Balances</h2>

                    {deployedKernelAccounts.length === 0 ? (
                        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                                <p>No kernel accounts found. This could mean:</p>
                                <ul className="list-disc list-inside mt-2 ml-4">
                                    <li>You haven't performed any cross-chain transactions</li>
                                    <li>Your kernel accounts are empty</li>
                                    <li>There was an issue loading the accounts</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Network</TableHead>
                                            <TableHead>Chain ID</TableHead>
                                            <TableHead>Native Balance</TableHead>
                                            <TableHead>Token Balances</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deployedKernelAccounts.map((account) => {
                                            const hasTokens = account.tokenBalances.length > 0;
                                            const isExpanded = expandedChains.has(account.chainId);

                                            return (
                                                <>
                                                    <TableRow key={account.chainId}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span>{account.chain.name}</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {account.chain.nativeCurrency.symbol}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                                {account.chainId}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-mono">
                                                                {formatEther(account.balance)}{" "}
                                                                {account.chain.nativeCurrency.symbol}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {hasTokens ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {account.tokenBalances.length} tokens
                                                                    </Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            toggleChainExpansion(account.chainId)
                                                                        }
                                                                        className="h-6 w-6 p-0"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        ) : (
                                                                            <ChevronRight className="h-3 w-3" />
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground text-sm">
                                                                    None
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="default">Deployed</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRecoverFunds(account)}
                                                                    disabled={isPending}
                                                                    className={
                                                                        account.balance > 0n || hasTokens
                                                                            ? ""
                                                                            : "invisible"
                                                                    }
                                                                >
                                                                    <ArrowRight className="h-3 w-3 mr-1" />
                                                                    Recover
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const explorerUrl =
                                                                            account.chain.blockExplorers?.default?.url;
                                                                        if (explorerUrl) {
                                                                            window.open(
                                                                                `${explorerUrl}/address/${account.kernelAddress}`,
                                                                                "_blank",
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && hasTokens && (
                                                        <TableRow key={`${account.chainId}-tokens`}>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="bg-muted/30 p-4">
                                                                    <div className="space-y-3">
                                                                        <div className="text-sm font-medium text-muted-foreground mb-2">
                                                                            Token Balances on {account.chain.name}
                                                                        </div>
                                                                        {account.tokenBalances.map((token, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                                                        <img
                                                                                            src={
                                                                                                token.currency
                                                                                                    .logoURI ||
                                                                                                "/placeholder.svg"
                                                                                            }
                                                                                            alt={token.symbol}
                                                                                            className="w-full h-full object-cover"
                                                                                            onError={(e) =>
                                                                                                (e.currentTarget.src =
                                                                                                    "https://etherscan.io/images/main/empty-token.png")
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-medium text-sm">
                                                                                            {token.symbol}
                                                                                        </span>
                                                                                        <code className="text-xs text-muted-foreground font-mono">
                                                                                            {token.tokenAddress}
                                                                                        </code>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="font-mono text-sm font-medium">
                                                                                        {formatUnits(
                                                                                            token.balance,
                                                                                            token.decimals,
                                                                                        )}{" "}
                                                                                        {token.symbol}
                                                                                    </span>
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {token.decimals} decimals
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Recovery Status */}
                {isPending && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <p className="text-sm">Sending recovery transaction...</p>
                            </div>
                            {hash && <p className="text-xs text-muted-foreground mt-1">Hash: {hash.slice(0, 10)}...</p>}
                        </CardContent>
                    </Card>
                )}

                {isSuccess && (
                    <Card>
                        <CardContent className="p-4 bg-green-50 border border-green-200">
                            <p className="text-sm text-green-800">
                                Recovery successful! Your funds have been transferred back to your wallet.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>How Recovery Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            When you perform cross-chain operations like bridge-and-swap, funds may get stuck in kernel
                            accounts if:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                            <li>The bridge succeeds but the swap fails</li>
                            <li>There are insufficient funds for gas on the destination chain</li>
                            <li>The transaction reverts due to slippage or other conditions</li>
                        </ul>
                        <p className="text-sm text-muted-foreground">
                            This recovery tool helps you identify and recover these stuck funds by providing a direct
                            interface to your kernel accounts.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
