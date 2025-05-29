import { Check, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { getChainById } from "@owlprotocol/veraswap-sdk";
import { getBasket } from "@owlprotocol/veraswap-sdk/artifacts/BasketFixedUnits";
import { useReadContract } from "wagmi";
import { zeroAddress } from "viem";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card.js";
import { Button } from "./ui/button.js";
import { getTokenDetailsForAllocation, TOKENS } from "@/constants/tokens.js";
import { BASKETS, BasketPercentageAllocation } from "@/constants/baskets.js";
import { useBasketWeights } from "@/hooks/useBasketWeights.js";

export function BasketPurchaseConfirmation({ selectedBasket, amount, hash }) {
    const selectedBasketData = useMemo(
        () => (selectedBasket ? BASKETS.find((b) => b.id === selectedBasket) : null),
        [selectedBasket],
    );

    const basketChain = useMemo(
        () => (selectedBasketData ? getChainById(selectedBasketData.allocations[0].chainId)! : null),
        [selectedBasketData],
    );

    // TODO: refactor to have it only in one place, and pass it into this component
    const { data: basketDetails } = useReadContract({
        chainId: basketChain?.id ?? 0,
        address: selectedBasketData?.address ?? zeroAddress,
        abi: [getBasket],
        functionName: "getBasket",
        query: {
            enabled: !!selectedBasketData && !!basketChain,
        },
    });

    const { basketPercentageAllocations, isLoading: isBasketLoading } = useBasketWeights({
        chainId: basketChain?.id,
        basketDetails: basketDetails ? basketDetails.map(({ addr, units }) => ({ addr, units })) : [],
    });

    // TODO: change native currency to input symbol
    const inputSymbol = selectedBasketData && basketChain ? basketChain.nativeCurrency.symbol : "";

    const renderAllocationDetails = (allocation: BasketPercentageAllocation) => {
        const token = getTokenDetailsForAllocation(allocation, TOKENS);
        if (!token) return null;

        return (
            <div key={token.address} className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-muted-foreground">{token.symbol}</span>
                </div>
                <span className="font-medium">{allocation.weight.toFixed(2)}%</span>
            </div>
        );
    };

    return (
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
                        You've successfully invested {amount} {inputSymbol} in the {selectedBasketData?.title} basket
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
                                <span className="font-medium">{inputSymbol}</span>
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
                        {/* TODO: Add spinner if basket is loading */}
                        {!isBasketLoading && basketPercentageAllocations && (
                            <div className="space-y-2">
                                {basketPercentageAllocations.map((all) => renderAllocationDetails(all))}
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
    );
}
