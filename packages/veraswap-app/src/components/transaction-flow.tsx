import { ArrowRight, ArrowRightLeft, Coins } from "lucide-react";
import * as Chains from "viem/chains";
import type { LucideIcon } from "lucide-react";
import { TransactionType } from "@owlprotocol/veraswap-sdk";
import { Badge } from "@/components/ui/badge.js";

function TokenBadge({ symbol }: { symbol: string }) {
    return (
        <div className="flex items-center space-x-1 border-2 rounded-full px-3 py-1 shadow-sm">
            <Coins aria-hidden="true" className="h-4 w-4" />
            <span className="font-medium">{symbol}</span>
        </div>
    );
}

function ChainBadge({ chainId }: { chainId: number }) {
    const chain = Object.values(Chains).find((chain) => chain.id === chainId);
    return <Badge>{chain?.name ?? `Chain ${chainId}`}</Badge>;
}

function Arrow({ Icon, className }: { Icon: LucideIcon; className?: string }) {
    return <Icon aria-hidden="true" className={className} />;
}

export function TransactionFlow({ transaction }: { transaction: TransactionType }) {
    const renderTransactionFlow = () => {
        switch (transaction.type) {
            case "SWAP":
                return (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="text-center">
                            <ChainBadge chainId={transaction.chainId} />
                        </div>
                        <div className="flex items-center space-x-4">
                            <TokenBadge symbol={transaction.currencyIn.symbol ?? ""} />
                            <ArrowRightLeft className="h-6 w-6" />
                            <TokenBadge symbol={transaction.currencyOut.symbol ?? ""} />
                        </div>
                        <div className="text-sm text-gray-500">Swap tokens on the same chain</div>
                    </div>
                );

            case "BRIDGE":
                return (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.currencyIn.chainId} />
                                <div className="mt-2 inline-flex">
                                    <TokenBadge symbol={transaction.currencyIn.symbol ?? ""} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <ArrowRight className="h-6 w-6 mt-8" />
                            </div>
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.currencyOut.chainId} />
                                <div className="mt-2 inline-flex">
                                    <TokenBadge symbol={transaction.currencyOut.symbol ?? ""} />
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">Bridge the same token across different chains</div>
                    </div>
                );

            case "SWAP_BRIDGE":
                return (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.swap.chainId} />
                                <div className="flex items-center space-x-4 mt-2">
                                    <TokenBadge symbol={transaction.swap.currencyIn.symbol ?? ""} />
                                    <ArrowRightLeft className="h-5 w-5" />
                                    <TokenBadge symbol={transaction.swap.currencyOut.symbol ?? ""} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <ArrowRight className="h-6 w-6 mt-8" />
                            </div>
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.bridge.currencyOut.chainId} />
                                <div className="mt-2 inline-flex">
                                    <TokenBadge symbol={transaction.bridge.currencyOut.symbol ?? ""} />
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            First swap on source chain, then bridge to target chain
                        </div>
                    </div>
                );

            case "BRIDGE_SWAP":
                return (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.bridge.currencyIn.chainId} />
                                <div className="mt-2 inline-flex">
                                    <TokenBadge symbol={transaction.bridge.currencyIn.symbol ?? ""} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <ArrowRight className="h-6 w-6 mt-8" />
                            </div>
                            <div className="flex flex-col items-center">
                                <ChainBadge chainId={transaction.swap.chainId} />
                                <div className="flex items-center space-x-4 mt-2">
                                    <TokenBadge symbol={transaction.swap.currencyIn.symbol ?? ""} />
                                    <ArrowRightLeft className="h-5 w-5" />
                                    <TokenBadge symbol={transaction.swap.currencyOut.symbol ?? ""} />
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            First bridge to target chain, then swap on target chain
                        </div>
                    </div>
                );

            default:
                return <div>Unknown transaction type</div>;
        }
    };

    return <div className="w-full p-4">{renderTransactionFlow()}</div>;
}
