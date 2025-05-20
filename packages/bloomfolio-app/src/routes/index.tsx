import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSendTransaction, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { Address } from "viem";
import { BASKETS } from "@/constants/baskets.js";
import { BasketCard } from "@/components/BasketCard.js";
import { BasketPurchaseConfirmation } from "@/components/BasketPurchaseConfirmation.js";
import { ShareButton } from "@/components/ShareButton.js";
import { SelectedBasketPanel } from "@/components/SelectedBasketPanel.js";

export const Route = createFileRoute("/")({
    validateSearch: z.object({
        referrer: z.string().optional(),
    }),
    component: SimplifiedPortfolioPage,
});

export default function SimplifiedPortfolioPage() {
    const [selectedBasket, setSelectedBasket] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { address } = useAccount();
    const { referrer } = Route.useSearch();

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

    if (isSuccess && !showConfirmation) {
        setShowConfirmation(true);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                            Quick Invest
                        </h1>
                        <p className="text-muted-foreground mt-2">Select a basket and start investing in minutes</p>
                    </div>
                    <ShareButton />
                </header>

                {showConfirmation ? (
                    <BasketPurchaseConfirmation selectedBasket={selectedBasket} amount={amount} hash={hash} />
                ) : (
                    <div className="space-y-8">
                        {selectedBasket && (
                            <SelectedBasketPanel
                                address={BASKETS.find((b) => b.id === selectedBasket)?.address as `0x${string}`}
                                chainId={BASKETS.find((b) => b.id === selectedBasket)?.allocations[0].chainId as number}
                                amount={amount}
                                setAmount={setAmount}
                                sendTransaction={sendTransaction}
                                referrer={referrer as Address | undefined}
                            />
                        )}

                        <BasketSelection selectedBasket={selectedBasket} handleSelectBasket={handleSelectBasket} />
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

function BasketSelection({ selectedBasket, handleSelectBasket }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Choose a Basket</h2>
                {selectedBasket && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span>Selected: {BASKETS.find((b) => b.id === selectedBasket)?.title}</span>
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {BASKETS.map((basket) => (
                    <BasketCard
                        key={basket.id}
                        basket={basket}
                        isSelected={selectedBasket === basket.id}
                        onSelect={handleSelectBasket}
                    />
                ))}
            </div>
        </div>
    );
}
