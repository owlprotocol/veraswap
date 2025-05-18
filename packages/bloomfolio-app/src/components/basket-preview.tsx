import { ArrowRight } from "lucide-react";
import { USDC_BASE } from "@owlprotocol/veraswap-sdk";
import type { SelectedToken } from "./basket-creator";

interface BasketPreviewProps {
    selectedTokens: SelectedToken[];
    fundingAmount: number;
}

export function BasketPreview({ selectedTokens, fundingAmount }: BasketPreviewProps) {
    const tokenAmounts = selectedTokens.map((token) => {
        const amount = (fundingAmount * token.allocation) / 100;
        return {
            ...token,
            amount,
        };
    });

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Funding with</div>
                        <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full overflow-hidden mr-2 bg-white dark:bg-slate-700">
                                {USDC_BASE.logoURI ? (
                                    <img
                                        src={USDC_BASE.logoURI || "/placeholder.svg"}
                                        alt={USDC_BASE.symbol}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                        {USDC_BASE.symbol!}
                                    </div>
                                )}
                            </div>
                            <span className="font-medium">
                                {fundingAmount} {USDC_BASE.symbol}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {tokenAmounts.map((token) => (
                        <div key={token.address} className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-slate-100 dark:bg-slate-700 p-0.5">
                                    {token.logoURI ? (
                                        <img
                                            src={token.logoURI || "/placeholder.svg"}
                                            alt={token.symbol}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                                            {token.symbol.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">{token.symbol}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {token.allocation}% of basket
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <ArrowRight className="h-4 w-4 text-slate-400 mx-2" />
                                <div className="text-right">
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {token.amount.toFixed(6)}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {USDC_BASE.symbol} value
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20">
                <div className="flex items-center text-violet-800 dark:text-violet-300">
                    <svg
                        className="h-5 w-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                    <span className="font-medium">Note:</span>
                </div>
                <p className="mt-2 text-sm text-violet-700 dark:text-violet-300">
                    This is a preview of how your funds will be distributed. In a real implementation, you would see
                    estimated output amounts after swaps, including fees and slippage.
                </p>
            </div>
        </div>
    );
}
