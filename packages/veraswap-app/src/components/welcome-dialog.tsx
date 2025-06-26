import { Info, AlertTriangle, Zap, Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";

interface WelcomeDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function WelcomeDialog({ open = false, onOpenChange }: WelcomeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-xl rounded-2xl"
                showCloseIcon={false}
            >
                <div className="flex flex-col p-8 space-y-8">
                    <h1 className="text-center text-4xl font-bold tracking-tight">Welcome to Veraswap</h1>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10 text-warning flex-shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-medium">Beta Status</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Veraswap is currently in beta and pending an audit.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/10 text-info flex-shrink-0">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-medium">Cross-Chain Trading</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Swap any token on any chain. Bridge and trade seamlessly across 8+ chains.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success flex-shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base font-medium">Secure & Simple</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Veraswap combines Uniswap AMM pools with secure bridging protocols, abstracting all
                                    the complexity behind a simple interface.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => onOpenChange?.(false)}
                        className="w-full py-6 text-lg font-medium rounded-xl"
                    >
                        Agree & continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
