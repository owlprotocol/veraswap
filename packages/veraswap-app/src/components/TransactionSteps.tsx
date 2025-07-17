import { Chain } from "viem";
import { TransactionType } from "@owlprotocol/veraswap-sdk";
import { Currency } from "@owlprotocol/veraswap-sdk";

interface TransactionStepsProps {
    transactionType: TransactionType;
    currencyIn: Currency;
    chainIn: Chain;
    chainOut: Chain;
}

function Step({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
            <div>{text}</div>
        </div>
    );
}

export function TransactionSteps({ transactionType, currencyIn, chainIn, chainOut }: TransactionStepsProps) {
    const APPROVE_STEP = "Approve token spending (one-time)";

    const TRANSACTION_STEPS = {
        SWAP: [`Confirm swap transaction on ${chainIn.name}`],
        BRIDGE: [`Confirm bridge transaction from ${chainIn.name} to ${chainOut.name}`],
        BRIDGE_SWAP: [
            `Sign to initialize smart wallet on ${chainIn.name} and ${chainOut.name} (one-time)`,
            `Confirm transaction to bridge and swap tokens`,
        ],
        SWAP_BRIDGE: [`Confirm transaction to swap and bridge from ${chainIn.name} to ${chainOut.name}`],
    };

    const steps = !currencyIn.isNative
        ? [APPROVE_STEP, ...TRANSACTION_STEPS[transactionType.type]]
        : TRANSACTION_STEPS[transactionType.type];

    return (
        <div className="rounded-lg bg-muted/50 p-3 space-y-2 text-sm">
            <div className="font-medium mb-1">Transaction Steps:</div>
            <div className="space-y-2">
                {steps.map((step, index) => (
                    <Step key={index} text={step} />
                ))}
            </div>
        </div>
    );
}
