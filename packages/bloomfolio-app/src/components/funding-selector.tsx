import { useRef } from "react";
import { DollarSign, Wallet, AlertCircle } from "lucide-react";
import { USDC_BASE } from "@owlprotocol/veraswap-sdk";
import { useAccount, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { Input } from "@/components/ui/input.js";
import { Button } from "@/components/ui/button.js";

interface FundingSelectorProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    onAmountValid?: (isValid: boolean) => void;
}

export function FundingSelector({ amount, onAmountChange, onAmountValid }: FundingSelectorProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { address } = useAccount();
    const { openConnectModal } = useConnectModal();

    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        token: USDC_BASE.address,
    });

    const checkAmountValidity = (value: string) => {
        if (!value || !balance) return false;
        try {
            const amountInWei = parseUnits(value, balance.decimals);
            return amountInWei <= balance.value && Number(value) > 0;
        } catch (e) {
            return false;
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string or valid numbers with up to 6 decimal places
        if (value === "" || /^\d+(\.\d{0,6})?$/.test(value)) {
            onAmountChange(value);
            if (onAmountValid) {
                onAmountValid(checkAmountValidity(value));
            }
        }
    };

    const applyAmountPreset = (value: number) => {
        const valueStr = value.toString();
        onAmountChange(valueStr);
        if (onAmountValid) {
            onAmountValid(checkAmountValidity(valueStr));
        }
    };

    const setMaxBalance = () => {
        if (balance) {
            const formattedBalance = formatUnits(balance.value, balance.decimals);
            onAmountChange(formattedBalance);
            if (onAmountValid) {
                onAmountValid(true); // Max balance is always valid
            }
        }
    };

    // Check if current amount exceeds balance
    const isAmountExceedingBalance =
        amount &&
        balance &&
        (() => {
            try {
                const amountInWei = parseUnits(amount, balance.decimals);
                return amountInWei > balance.value;
            } catch (e) {
                return false;
            }
        })();

    return (
        <div className="space-y-4">
            {!address ? (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Wallet className="h-8 w-8 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Connect your wallet to fund your basket
                    </p>
                    <Button
                        onClick={() => openConnectModal?.()}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                    >
                        Connect Wallet
                    </Button>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-slate-400" />
                        </div>
                        <Input
                            ref={inputRef}
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.0"
                            className={`pl-10 pr-32 py-6 text-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${
                                isAmountExceedingBalance ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={setMaxBalance}
                                className="h-6 px-2 text-xs font-medium text-primary hover:text-primary/90"
                            >
                                MAX
                            </Button>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pointer-events-none">
                                <img src={USDC_BASE.logoURI} alt="USDC" className="w-5 h-5 rounded-full" />
                                <span>USDC</span>
                            </div>
                        </div>
                    </div>

                    {isAmountExceedingBalance && (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            <span>
                                Amount exceeds your balance of {formatUnits(balance!.value, balance!.decimals)} USDC
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {isBalanceLoading
                                ? "Loading balance..."
                                : balance
                                  ? `Balance: ${formatUnits(balance.value, balance.decimals)} USDC`
                                  : "No USDC balance"}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyAmountPreset(5)}
                                className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            >
                                $5
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyAmountPreset(10)}
                                className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            >
                                $10
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyAmountPreset(100)}
                                className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            >
                                $100
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applyAmountPreset(1000)}
                                className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            >
                                $1,000
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
