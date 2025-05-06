import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";

export function WelcomeDialog() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasVisitedBefore = localStorage.getItem("veraswap_visited");
        if (!hasVisitedBefore) {
            setIsOpen(true);
            localStorage.setItem("veraswap_visited", "true");
        }
    }, []);

    return (
        <Dialog open={isOpen}>
            <DialogContent
                className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-xl rounded-2xl"
                showCloseIcon={false}
            >
                <div className="flex flex-col p-8 space-y-8">
                    <h1 className="text-center text-4xl font-bold tracking-tight">Welcome to Veraswap</h1>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full">
                                <Info className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-base">Veraswap is currently in beta. Please use at your own risk.</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => setIsOpen(false)} className="w-full py-6 text-lg font-medium rounded-xl">
                        Agree & continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
