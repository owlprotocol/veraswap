import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShoppingCart, X, ArrowRight, ChevronDown, AlertCircle, Loader2, Globe } from "lucide-react";
import {
    useAccount,
    useBalance,
    useChainId,
    useSendTransaction,
    useSwitchChain,
    useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, formatUnits, parseUnits, zeroAddress } from "viem";
import { bsc } from "viem/chains";
import { UNISWAP_CONTRACTS, USDC_BASE, getBasketSwaps } from "@owlprotocol/veraswap-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import { Input } from "@/components/ui/input.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.js";
import { BasketAllocation, BASKETS } from "@/constants/baskets.js";
import { TOKENS, Token, TokenCategory, getTokenDetailsForAllocation } from "@/constants/tokens.js";
import { config } from "@/config.js";
import { queryClient } from "@/queryClient.js";
import { useGetTokenValues } from "@/hooks/useGetTokenValues.js";

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
    const [selectedBasket, setSelectedBasket] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        // token: USDC_BASE.address,
    });
    const { switchChain } = useSwitchChain();

    const handleSelectBasket = (basketId: string) => {
        setSelectedBasket(basketId);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // const usdcAllowance = useReadContract({
    //     abi: erc20Abi,
    //     functionName: "allowance",
    //     args: [address ?? zeroAddress, PERMIT2_ADDRESS],
    // });

    const { sendTransaction, data: hash, isPending: isTransactionPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const basket = BASKETS.find((b) => b.id === selectedBasket)!;

    const { data: tokenValues } = useGetTokenValues({
        basket,
        quoteCurrency: basket
            ? {
                  address: zeroAddress,
                  chainId: basket.allocations[0].chainId,
              }
            : undefined,
    });

    const totalValue = tokenValues?.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n) ?? 0n;
    // const weights = tokenValues ?? [];

    if (isSuccess && !showConfirmation) {
        setShowConfirmation(true);
    }
    // TODO: change to use input currency
    const amountParsed = parseUnits(amount, 18);

    const shares = (amountParsed * 10n ** 18n) / totalValue;
    const sharesFormatted = totalValue > 0n && amountParsed > 0n ? formatUnits(shares, 18) : "";

    const balanceFormatted = formatEther(balance?.value ?? 0n);
    const handlePurchase = async () => {
        if (
            !isConnected ||
            chainId !== bsc.id ||
            !balance ||
            !tokenValues ||
            tokenValues.some((value) => value === undefined)
        )
            return;

        const userBalance = balance?.value;
        if (userBalance < amountParsed) return;

        // if (usdcAllowance < amountParsed) {
        //     const allowHash = await sendTransactionPermitAsync({
        //         to: USDC_BASE.address,
        //         chainId: bsc.id,
        //         data: encodeFunctionData({
        //             abi: IERC20.abi,
        //             functionName: "approve",
        //             args: [PERMIT2_ADDRESS, MAX_UINT_256],
        //         }),
        //     });
        //
        //     await waitForTransactionReceipt(config, { hash: allowHash });
        // }
        //
        // const permit2Signature = await getPermit2PermitSignature(queryClient, {});
        //
        // const allocationsAmountOut = tokenValues?.map((value) => (amountParsed * value!) / totalValue);

        const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const swapData = await getBasketSwaps(queryClient, config, {
            chainId: bsc.id,
            contracts: UNISWAP_CONTRACTS[bsc.id]!,
            currencyIn: zeroAddress,
            deadline: routerDeadline,
            exactAmount: amountParsed,

            currencyHops: [USDC_BASE.address],
            basketTokens: basket.allocations,
        });
        sendTransaction({ chainId: bsc.id, ...swapData });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setAmount(value);
    };

    const selectedBasketData = selectedBasket ? BASKETS.find((b) => b.id === selectedBasket) : null;
    const selectedBasketTotalWeight = selectedBasketData?.allocations.reduce((acc, all) => acc + all.weight, 0);
    const hasInsufficientBalance = isConnected && !isBalanceLoading && balance && balance.value < amountParsed;
    const isAmountValid = amountParsed > 0;

    const renderAllocationDetails = (allocation: BasketAllocation, idx) => {
        const token = getTokenDetailsForAllocation(allocation, TOKENS);
        if (!token) return null;

        const tokenValue = tokenValues?.[idx] ?? 0n;

        // Assume it's ETH TODO: change decimals

        const value =
            totalValue > 0n && tokenValue > 0n ? formatUnits((tokenValue * amountParsed) / totalValue, 18) : "";

        return (
            <div key={token.address} className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-muted-foreground">{token.symbol}</span>
                </div>
                {value ? (
                    <span className="font-medium">{value}</span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </div>
        );
    };

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
            <Collapsible className="border rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <CollapsibleTrigger
                    className="w-full px-4 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                        <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                        <Badge variant="secondary" className="ml-2">
                            {categoryPercentage.toFixed(2)}%
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
                                <span className="font-medium">
                                    {((Number(allocation.weight) / Number(totalWeight)) * 100).toFixed(2)}%
                                </span>
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
                                    {/* TODO: change BNB to input symbol */}
                                    You've successfully invested {amount} BNB in the {selectedBasketData?.title}{" "}
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
                                            {/* TODO: change BNB to input symbol */}
                                            <span className="font-medium">BNB</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Transaction ID</span>
                                            <a
                                                href={`https://bscscan.com/tx/${hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                {hash?.slice(0, 6)}...{hash?.slice(-4)}
                                                <ArrowRight className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium mb-2">Assets Purchased</div>
                                    {selectedBasketData && (
                                        <div className="space-y-2">
                                            {selectedBasketData.allocations.map((all: BasketAllocation) =>
                                                renderAllocationDetails(all, selectedBasketTotalWeight!),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Link to="/portfolio">
                                    <Button className="w-full">See Portfolio</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {selectedBasket && selectedBasketData && (
                            <Card className="border-none shadow-lg overflow-hidden mb-8 animate-in fade-in-50 duration-300">
                                <div className={`bg-gradient-to-r ${selectedBasketData.gradient} h-2`} />
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-9 gap-6">
                                    <div className="lg:col-span-3">
                                        <div className="flex items-start space-x-3">
                                            <div
                                                className={`p-2 rounded-full bg-gradient-to-r ${selectedBasketData.gradient} text-white`}
                                            >
                                                <selectedBasketData.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{selectedBasketData.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedBasketData.description}
                                                </p>
                                                <Badge variant="outline" className="mt-2">
                                                    {selectedBasketData.riskLevel} Risk
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3">
                                        {/* TODO: change BNB to input symbol */}
                                        <h3 className="font-medium mb-2">Amount (BNB)</h3>
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
                                                {/* TODO: change BNB to input symbol */}
                                                <span className="text-base font-medium">BNB</span>
                                            </div>
                                            {isConnected && (
                                                <div className="text-sm text-muted-foreground">
                                                    {isBalanceLoading ? (
                                                        "Loading balance..."
                                                    ) : (
                                                        <>
                                                            {/* TODO: change BNB to input symbol */}
                                                            Balance: {balanceFormatted} BNB
                                                            {hasInsufficientBalance && (
                                                                <div className="text-red-500 mt-1">
                                                                    Insufficient balance
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {/* {isConnected && (
                                                <div className="mt-2">
                                                    <VeraFundButton />
                                                </div>
                                            )} */}
                                            {!isConnected && (
                                                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center space-x-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        Please connect your wallet to proceed
                                                    </span>
                                                </div>
                                            )}
                                            {isConnected && chainId !== bsc.id && (
                                                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-sm">Please switch to BSC</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => switchChain({ chainId: bsc.id })}
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
                                            <h2 className="font-medium text-xl">Order Summary</h2>
                                            <div className="flex justify-between font-medium">
                                                <span>Basket Shares</span>
                                                {sharesFormatted !== "" ? (
                                                    <span>{sharesFormatted}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>

                                            <Separator />
                                            <h3 className="font-medium">Breakdown</h3>
                                            {selectedBasketData && (
                                                <div className="space-y-1 text-sm">
                                                    {selectedBasketData.allocations.map((all: BasketAllocation, idx) =>
                                                        renderAllocationDetails(all, idx),
                                                    )}
                                                </div>
                                            )}

                                            <div className="pt-2 flex items-center justify-between gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => setSelectedBasket(null)}
                                                >
                                                    <X className="mr-1 h-4 w-4" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                                    size="sm"
                                                    onClick={
                                                        chainId !== bsc.id
                                                            ? () => switchChain?.({ chainId: bsc.id })
                                                            : handlePurchase
                                                    }
                                                    disabled={
                                                        !isConnected ||
                                                        hasInsufficientBalance ||
                                                        isBalanceLoading ||
                                                        !isAmountValid ||
                                                        isTransactionPending
                                                    }
                                                >
                                                    {isTransactionPending || isConfirming ? (
                                                        <>
                                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                                            {isConfirming ? "Confirming..." : "Processing..."}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart className="mr-1 h-4 w-4" />
                                                            {!isConnected
                                                                ? "Connect Wallet"
                                                                : chainId !== bsc.id
                                                                  ? "Switch Network"
                                                                  : !isAmountValid
                                                                    ? "Enter Amount"
                                                                    : hasInsufficientBalance
                                                                      ? "Insufficient Balance"
                                                                      : "Buy Now"}
                                                        </>
                                                    )}
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
                                {selectedBasket && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <span>Selected: {BASKETS.find((b) => b.id === selectedBasket)?.title}</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {BASKETS.map((basket) => {
                                    //TODO: Use totalWeight from useGetTokenValues
                                    const totalWeight = basket.allocations.reduce((sum, all) => all.weight + sum, 0);
                                    return (
                                        <Card
                                            key={basket.id}
                                            className={`cursor-pointer transition-all hover:shadow-lg ${
                                                selectedBasket === basket.id
                                                    ? "ring-2 ring-primary border-primary"
                                                    : "hover:border-primary/50"
                                            }`}
                                            onClick={(e) => {
                                                if (!(e.target as HTMLElement).closest(".collapsible")) {
                                                    handleSelectBasket(basket.id);
                                                }
                                            }}
                                        >
                                            <div className={`bg-gradient-to-r ${basket.gradient} h-2 rounded-t-lg`} />
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`p-2 rounded-full bg-gradient-to-r ${basket.gradient} text-white`}
                                                        >
                                                            <basket.icon className="h-5 w-5" />
                                                        </div>
                                                        <CardTitle className="text-xl">{basket.title}</CardTitle>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {selectedBasket === basket.id && (
                                                            <Badge className="bg-primary">Selected</Badge>
                                                        )}
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
                                                    {groupAllocationsByCategory(basket.allocations).map(
                                                        ([category, items]) => (
                                                            <div key={`${basket.id}-${category}`}>
                                                                {renderCategorySection(
                                                                    category as TokenCategory,
                                                                    items,
                                                                    totalWeight,
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {(isTransactionPending || isConfirming) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <div className="space-y-2">
                            <h3 className="font-medium text-lg">Processing Transaction</h3>
                            <p className="text-sm text-muted-foreground">
                                {isConfirming ? "Confirming transaction..." : "Waiting for confirmation..."}
                            </p>
                            {hash && <p className="text-xs text-muted-foreground break-all">Transaction: {hash}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
