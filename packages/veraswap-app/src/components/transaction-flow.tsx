import { ArrowRight, ArrowDown } from "lucide-react";
import * as Chains from "viem/chains";
import type { LucideIcon } from "lucide-react";
import { TransactionType, Currency } from "@owlprotocol/veraswap-sdk";

function TokenBadge({ currency }: { currency: Currency }) {
    const chain =
        currency.chainId !== undefined ? Object.values(Chains).find((chain) => chain.id === currency.chainId) : null;
    const chainName = chain?.name ?? (currency.chainId !== undefined ? `Chain ${currency.chainId}` : null);

    return (
        <div className="flex flex-col items-center justify-center space-y-1 border-2 rounded-lg px-2 py-2 shadow-sm w-20 md:w-32">
            <div className="flex flex-col items-center space-y-1">
                <img
                    src={currency.logoURI ?? "https://etherscan.io/images/main/empty-token.png"}
                    alt={`${currency.symbol} logo`}
                    className="h-6 w-6 md:h-7 md:w-7 rounded-full object-contain"
                    onError={(e) => (e.currentTarget.src = "https://etherscan.io/images/main/empty-token.png")}
                />
                <span className="font-medium text-xs md:text-sm">{currency.symbol}</span>
            </div>
            {chainName && (
                <span className="text-[10px] md:text-xs text-muted-foreground text-center min-h-[1em]">
                    {chainName}
                </span>
            )}
        </div>
    );
}

function ArrowWithLabel({ Icon, label }: { Icon: LucideIcon; label: string }) {
    return (
        <div className="flex flex-col items-center space-y-0.5 pt-6">
            <Icon aria-hidden="true" className="h-6 w-6" />
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

function VerticalArrowWithLabel({ Icon, label }: { Icon: LucideIcon; label: string }) {
    return (
        <div className="flex flex-col items-center space-y-0 py-1">
            <Icon aria-hidden="true" className="h-3 w-3" />
            <span className="text-[9px] text-muted-foreground">{label}</span>
        </div>
    );
}

export function TransactionFlow({ transaction }: { transaction: TransactionType }) {
    const renderTransactionFlow = () => {
        switch (transaction.type) {
            case "SWAP":
                return (
                    <div className="flex flex-col items-center">
                        <div className="hidden md:flex items-start md:space-x-4">
                            <TokenBadge currency={transaction.currencyIn} />
                            <ArrowWithLabel Icon={ArrowRight} label="Swap" />
                            <TokenBadge currency={transaction.currencyOut} />
                        </div>
                        <div className="flex flex-col items-center space-y-1 md:hidden">
                            <TokenBadge currency={transaction.currencyIn} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Swap" />
                            <TokenBadge currency={transaction.currencyOut} />
                        </div>
                    </div>
                );

            case "BRIDGE":
                return (
                    <div className="flex flex-col items-center">
                        <div className="hidden md:flex items-start md:space-x-4">
                            <TokenBadge currency={transaction.currencyIn} />
                            <ArrowWithLabel Icon={ArrowRight} label="Bridge" />
                            <TokenBadge currency={transaction.currencyOut} />
                        </div>
                        <div className="flex flex-col items-center space-y-1 md:hidden">
                            <TokenBadge currency={transaction.currencyIn} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Bridge" />
                            <TokenBadge currency={transaction.currencyOut} />
                        </div>
                    </div>
                );

            case "SWAP_BRIDGE":
                return (
                    <div className="flex flex-col items-center">
                        <div className="hidden md:flex items-start md:space-x-4">
                            <TokenBadge currency={transaction.swap.currencyIn} />
                            <ArrowWithLabel Icon={ArrowRight} label="Swap" />
                            <TokenBadge currency={transaction.swap.currencyOut} />
                            <ArrowWithLabel Icon={ArrowRight} label="Bridge" />
                            <TokenBadge currency={transaction.bridge.currencyOut} />
                        </div>
                        <div className="flex flex-col items-center space-y-1 md:hidden">
                            <TokenBadge currency={transaction.swap.currencyIn} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Swap" />
                            <TokenBadge currency={transaction.swap.currencyOut} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Bridge" />
                            <TokenBadge currency={transaction.bridge.currencyOut} />
                        </div>
                    </div>
                );

            case "BRIDGE_SWAP":
                return (
                    <div className="flex flex-col items-center">
                        <div className="hidden md:flex items-start md:space-x-4">
                            <TokenBadge currency={transaction.bridge.currencyIn} />
                            <ArrowWithLabel Icon={ArrowRight} label="Bridge" />
                            <TokenBadge currency={transaction.swap.currencyIn} />
                            <ArrowWithLabel Icon={ArrowRight} label="Swap" />
                            <TokenBadge currency={transaction.swap.currencyOut} />
                        </div>
                        <div className="flex flex-col items-center space-y-1 md:hidden">
                            <TokenBadge currency={transaction.bridge.currencyIn} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Bridge" />
                            <TokenBadge currency={transaction.swap.currencyIn} />
                            <VerticalArrowWithLabel Icon={ArrowDown} label="Swap" />
                            <TokenBadge currency={transaction.swap.currencyOut} />
                        </div>
                    </div>
                );

            default:
                return <div>Unknown transaction type</div>;
        }
    };

    return <div className="w-full p-4">{renderTransactionFlow()}</div>;
}
