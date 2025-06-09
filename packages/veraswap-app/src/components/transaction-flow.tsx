import { ArrowRight, ArrowDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Currency, RouteStep, isRouteStepSwap, isRouteStepBridge } from "@owlprotocol/veraswap-sdk";
import { TokenBadge } from "./TokenBadge.js";
import { chains } from "@/config.js";
function TokenDisplay({ currency }: { currency: Currency }) {
    const chain = chains.find((chain) => chain.id === currency.chainId);
    const chainName = chain?.name ?? `Chain ${currency.chainId}`;

    return (
        <div className="flex flex-col items-center justify-center space-y-1 border-2 rounded-lg px-2 py-2 shadow-sm w-20 md:w-32">
            <div className="flex flex-col items-center space-y-1">
                <TokenBadge currency={currency} />
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

export function TransactionFlow({ steps }: { steps: RouteStep[] }) {
    return (
        <div className="w-full p-4">
            <div className="flex flex-col items-center">
                <div className="hidden md:flex items-start md:space-x-4">
                    <TokenDisplay currency={steps[0].currencyIn} />
                    {steps.map((step, index) => {
                        if (isRouteStepSwap(step)) {
                            return (
                                <>
                                    <ArrowWithLabel key={`${index}-swap`} Icon={ArrowRight} label="Swap" />
                                    <TokenDisplay key={index} currency={step.currencyOut} />
                                </>
                            );
                        } else if (isRouteStepBridge(step)) {
                            return (
                                <>
                                    <ArrowWithLabel key={`${index}-bridge`} Icon={ArrowRight} label="Bridge" />
                                    <TokenDisplay key={index} currency={step.currencyOut} />
                                </>
                            );
                        } else {
                            return <div key={index}>Unknown transaction type</div>;
                        }
                    })}
                </div>
                <div className="flex flex-col items-center space-y-1 md:hidden">
                    <TokenDisplay currency={steps[0].currencyIn} />
                    {steps.map((step, index) => {
                        if (isRouteStepSwap(step)) {
                            return (
                                <>
                                    <VerticalArrowWithLabel key={`${index}-swap`} Icon={ArrowDown} label="Swap" />
                                    <TokenDisplay key={index} currency={step.currencyOut} />
                                </>
                            );
                        } else if (isRouteStepBridge(step)) {
                            return (
                                <>
                                    <VerticalArrowWithLabel key={`${index}-bridge`} Icon={ArrowDown} label="Bridge" />
                                    <TokenDisplay key={index} currency={step.currencyOut} />
                                </>
                            );
                        } else {
                            return <div key={index}>Unknown transaction type</div>;
                        }
                    })}
                </div>
            </div>
        </div>
    );
}
