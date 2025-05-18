import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, CheckCircle, ArrowLeft } from "lucide-react";

import { AVAILABLE_BASKETS } from ".";
import { FundingSelector } from "@/components/funding-selector.js";
import { BasketPreview } from "@/components/basket-preview.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.js";

export const Route = createFileRoute("/buckets/$address")({
    component: BasketDetailPage,
});

function BasketDetailPage() {
    const { address } = Route.useParams();
    const [fundingAmount, setFundingAmount] = useState<string>("");
    const [isAmountValid, setIsAmountValid] = useState(false);
    const [isBasketCreated, setIsBasketCreated] = useState(false);

    const basket = AVAILABLE_BASKETS.find((b) => b.address === address);

    if (!basket) {
        return (
            <div className="max-w-5xl mx-auto text-center py-12">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Basket Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    The basket you're looking for doesn't exist or has been removed.
                </p>
                <Link to="/buckets">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Baskets
                    </Button>
                </Link>
            </div>
        );
    }

    const handleFundingAmountChange = (amount: string) => {
        setFundingAmount(amount);
    };

    const handleAmountValid = (isValid: boolean) => {
        setIsAmountValid(isValid);
    };

    const handleCreateBasket = () => {
        if (!isAmountValid) return;

        console.log("Creating basket with:", {
            basket,
            fundingAmount,
        });

        setIsBasketCreated(true);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <Link to="/buckets" className="inline-block mb-4">
                    <Button variant="ghost" size="sm" className="text-slate-500">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Baskets
                    </Button>
                </Link>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {basket.name}
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400">{basket.description}</p>
            </div>

            <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl font-semibold">
                            <Wallet className="mr-2 h-5 w-5 text-violet-500" />
                            Fund Your Basket
                        </CardTitle>
                        <CardDescription>Enter the amount of USDC you want to invest</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FundingSelector
                            amount={fundingAmount}
                            onAmountChange={handleFundingAmountChange}
                            onAmountValid={handleAmountValid}
                        />
                    </CardContent>
                </Card>

                {isAmountValid && (
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-xl font-semibold">
                                <CheckCircle className="mr-2 h-5 w-5 text-violet-500" />
                                Basket Preview
                            </CardTitle>
                            <CardDescription>Review your basket before confirming</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BasketPreview selectedTokens={basket.tokens} fundingAmount={Number(fundingAmount)} />
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button
                                onClick={handleCreateBasket}
                                disabled={!isAmountValid || isBasketCreated}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                size="lg"
                            >
                                {isBasketCreated ? "Basket Created!" : "Create Basket"}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
