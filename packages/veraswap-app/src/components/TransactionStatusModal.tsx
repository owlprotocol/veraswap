import { CheckCircle, Loader2, XCircle, ArrowUpRight } from "lucide-react";
import { Chain } from "viem";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TransactionStep = {
    id: "swap" | "bridge" | "transfer";
    title: string;
    description: string;
    status: "pending" | "processing" | "success" | "error";
};

type TransactionStatusModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    steps: TransactionStep[];
    currentStepId?: string;
    hashes?: { swap?: string; bridge?: string; transfer?: string };
    chains?: { source?: Chain; destination?: Chain };
};

export function TransactionStatusModal({
    isOpen,
    onOpenChange,
    steps,
    currentStepId,
    hashes,
    chains,
}: TransactionStatusModalProps) {
    const getExplorerUrl = (stepId: "swap" | "bridge" | "transfer") => {
        switch (stepId) {
            case "swap":
                return hashes?.swap && chains?.source
                    ? `${chains.source.blockExplorers?.default?.url}/tx/${hashes.swap}`
                    : undefined;
            case "bridge":
                return hashes?.bridge ? `https://explorer.hyperlane.xyz/message/${hashes.bridge}` : undefined;
            case "transfer":
                return hashes?.transfer && chains?.destination
                    ? `${chains.destination.blockExplorers?.default?.url}/tx/${hashes.transfer}`
                    : undefined;
            default:
                return undefined;
        }
    };

    const allComplete = steps.every((step) => step.status === "success");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
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
                isActive && step.status === "processing" && "border-blue-500 shadow-md",
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
                <CardDescription className="text-gray-200">{step.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {step.status === "processing" && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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
