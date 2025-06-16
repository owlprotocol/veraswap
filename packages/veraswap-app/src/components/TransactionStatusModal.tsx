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
    isEmbedded?: boolean;
};

export function TransactionStatusModal({
    isOpen,
    onOpenChange,
    steps,
    currentStepId,
    hashes,
    chains,
    networkType,
    isEmbedded = false,
}: TransactionStatusModalProps) {
    const transactionType = useAtomValue(transactionTypeAtom);
    const stargateQuote = useAtomValue(stargateQuoteAtom);
    const orbiterQuote = useAtomValue(orbiterQuoteAtom);

    const getExplorerUrl = (stepId: "swap" | "bridge" | "sendOrigin" | "transferRemote") => {
        if (networkType === "local") return undefined;
        switch (stepId) {
            case "swap":
                if (!hashes?.swap) return undefined;

                if (transactionType?.withSuperchain) {
                    // We have to search by transaction hash
                    return `https://sid.testnet.routescan.io/crosstransactions?txhash=${hashes.swap}`;
                }

                if (transactionType?.type === "BRIDGE_SWAP") {
                    return `https://explorer.hyperlane.xyz/message/${hashes.swap}`;
                }

                return hashes.swap && chains?.source
                    ? `${chains.source.blockExplorers?.default?.url}/tx/${hashes.swap}`
                    : undefined;
            case "bridge":
                if (!hashes?.bridge) return undefined;

                if (transactionType?.withSuperchain) {
                    // We have to search by transaction hash
                    return `https://sid.testnet.routescan.io/crosstransactions?txhash=${hashes.sendOrigin}`;
                }

                if (stargateQuote.data) return `https://testnet.layerzeroscan.com/tx/${hashes.bridge}`;

                // TODO: change once orbiter has a URL
                if (orbiterQuote.data) return undefined;

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
            <DialogContent
                className={cn(
                    "aria-describedby={undefined} overflow-hidden",
                    isEmbedded ? "max-w-full max-h-[90vh] w-[95vw]" : "sm:max-w-md max-h-[90vh]",
                )}
            >
                <DialogHeader className={cn(isEmbedded ? "pb-1 px-4" : "pb-4")}>
                    <DialogTitle className={cn(isEmbedded ? "text-base" : "text-lg")}>
                        {allComplete ? "Transaction Complete" : "Transaction in Progress"}
                    </DialogTitle>
                </DialogHeader>
                <div
                    className={cn(
                        "overflow-y-auto",
                        isEmbedded
                            ? "py-2 px-4 space-y-2 max-h-[calc(90vh-80px)]"
                            : "py-4 space-y-4 max-h-[calc(90vh-100px)]",
                    )}
                >
                    {steps.map((step) => {
                        const url = getExplorerUrl(step.id);
                        return <StepCard key={step.id} step={step} url={url} isEmbedded={isEmbedded} />;
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StepCard({ step, url, isEmbedded }: { step: TransactionStep; url?: string; isEmbedded: boolean }) {
    const content = (
        <Card
            className={cn(
                "border-2 transition-all duration-200 group",
                isEmbedded ? "p-1" : "p-0",
                step.status === "processing" && "border-blue-500 shadow-md",
                step.status === "success" && "border-green-500",
                step.status === "error" && "border-red-500",
                url && "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
            )}
        >
            <CardHeader className={cn(isEmbedded ? "pb-1 px-2" : "pb-2")}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className={cn(isEmbedded ? "text-sm" : "text-lg")}>{step.title}</CardTitle>
                        {url && (
                            <ArrowUpRight
                                className={cn(
                                    "opacity-70 group-hover:opacity-100 transition-opacity",
                                    isEmbedded ? "w-3 h-3" : "w-4 h-4",
                                )}
                            />
                        )}
                    </div>
                    <StatusIcon status={step.status} isEmbedded={isEmbedded} />
                </div>
                <CardDescription className={cn(isEmbedded && "text-xs mt-0")}>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className={isEmbedded ? "pt-0 px-2 pb-1" : "pt-0"}>
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

function StatusIcon({ status, isEmbedded }: { status: TransactionStep["status"]; isEmbedded: boolean }) {
    const iconSize = isEmbedded ? "w-4 h-4" : "w-5 h-5";

    switch (status) {
        case "pending":
            return <div className={cn("rounded-full bg-gray-300 dark:bg-gray-600", iconSize)} />;
        case "processing":
            return <Loader2 className={cn("text-blue-500 animate-spin", iconSize)} />;
        case "success":
            return <CheckCircle className={cn("text-green-500", iconSize)} />;
        case "error":
            return <XCircle className={cn("text-red-500", iconSize)} />;
    }
}
