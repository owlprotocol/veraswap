import { CheckCircle, Loader2, XCircle, ArrowUpRight } from "lucide-react";
import { Chain } from "viem";
import { useAtomValue } from "jotai";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { cn } from "@/lib/utils.js";
import { TransactionStepId } from "@/atoms/atoms.js";
import { transactionTypeAtom } from "@/atoms/uniswap.js";
import { orbiterQuoteAtom } from "@/atoms/orbiter.js";
import { stargateQuoteAtom } from "@/atoms/stargate.js";

export type TransactionStep = {
    id: TransactionStepId;
    title: string;
    description: string;
    status: "pending" | "processing" | "success" | "error";
};

type TransactionStatusModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    steps: TransactionStep[];
    currentStepId?: string;
    hashes?: { swap?: string; bridge?: string; transferRemote?: string; sendOrigin?: string };
    chains?: { source?: Chain; destination?: Chain };
    networkType: "local" | "testnet" | "mainnet";
};

export function TransactionStatusModal({
    isOpen,
    onOpenChange,
    steps,
    currentStepId,
    hashes,
    chains,
    networkType,
}: TransactionStatusModalProps) {
    const transactionType = useAtomValue(transactionTypeAtom);
    const stargateQuote = useAtomValue(stargateQuoteAtom);
    const orbiterQuote = useAtomValue(orbiterQuoteAtom);

    const getExplorerUrl = (stepId: "swap" | "bridge" | "sendOrigin" | "transferRemote") => {
        if (networkType === "local") return undefined;
        switch (stepId) {
            case "swap":
                if (transactionType?.type === "BRIDGE_SWAP" && hashes?.swap) {
                    return `https://explorer.hyperlane.xyz/message/${hashes.swap}`;
                }

                return hashes?.swap && chains?.source
                    ? `${chains.source.blockExplorers?.default?.url}/tx/${hashes.swap}`
                    : undefined;
            case "bridge":
                if (!hashes?.bridge) return undefined;

                if (transactionType?.withSuperchain) {
                    // We have to search by transaction hash
                    return `https://sid.testnet.routescan.io/crosstransactions?txhash=${hashes.sendOrigin}`;
                }

                if (stargateQuote) return `https://testnet.layerzeroscan.com/tx/${hashes.bridge}`;

                // TODO: change once orbiter has a URL
                if (orbiterQuote) return undefined;

                return `https://explorer.hyperlane.xyz/message/${hashes.bridge}`;
            case "sendOrigin":
                return hashes?.sendOrigin && chains?.source
                    ? `${chains.source.blockExplorers?.default?.url}/tx/${hashes.sendOrigin}`
                    : undefined;
            case "transferRemote":
                return hashes?.transferRemote && chains?.destination
                    ? `${chains.destination.blockExplorers?.default?.url}/tx/${hashes.transferRemote}`
                    : undefined;
            default:
                return undefined;
        }
    };

    const allComplete = steps.every((step) => step.status === "success");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{allComplete ? "Transaction Complete" : "Transaction in Progress"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {steps.map((step) => {
                        const url = getExplorerUrl(step.id);
                        return <StepCard key={step.id} step={step} isActive={step.id === currentStepId} url={url} />;
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StepCard({ step, isActive, url }: { step: TransactionStep; isActive: boolean; url?: string }) {
    const content = (
        <Card
            className={cn(
                "border-2 transition-all duration-200 group",
                step.status === "processing" && "border-blue-500 shadow-md",
                step.status === "success" && "border-green-500",
                step.status === "error" && "border-red-500",
                url && "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        {url && (
                            <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                    <StatusIcon status={step.status} />
                </div>
                <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {step.status === "processing" && (
                    <div className="w-full rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full animate-pulse w-full"></div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block no-underline">
            {content}
        </a>
    ) : (
        content
    );
}

function StatusIcon({ status }: { status: TransactionStep["status"] }) {
    switch (status) {
        case "pending":
            return <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />;
        case "processing":
            return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
        case "success":
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "error":
            return <XCircle className="w-5 h-5 text-red-500" />;
    }
}
