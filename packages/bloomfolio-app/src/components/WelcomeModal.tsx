import { useState, useEffect } from "react";
import { ChevronRight, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog.js";

export function WelcomeModal() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedVerabloomBefore");
        if (!hasVisited) {
            setOpen(true);
            localStorage.setItem("hasVisitedVerabloomBefore", "true");
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    const steps = [
        {
            title: "Welcome to Verabloom",
            description: "The onchain crypto basket platform",
            content: (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                        <span className="text-white text-3xl font-bold">V</span>
                    </div>
                    <p className="text-center max-w-md text-muted-foreground">
                        Simplify your crypto investments with curated baskets for specific ecosystems and sectors.
                    </p>
                </div>
            ),
        },
        {
            title: "Why Verabloom?",
            description: "Benefits of using our platform",
            content: (
                <div className="space-y-6 py-4">
                    <div className="flex items-start space-x-4 border-l-4 border-emerald-500 pl-4">
                        <div>
                            <h3 className="font-medium flex items-center">
                                <BarChart3 className="h-5 w-5 text-emerald-600 mr-2" />
                                No stress investment
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Cut the noise of trading and focus on getting exposure to specific ecosystems (Base,
                                Optimism) or sectors (Bluechip, DeFi, Memes).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4 border-l-4 border-emerald-500 pl-4">
                        <div>
                            <h3 className="font-medium flex items-center">
                                <ChevronRight className="h-5 w-5 text-emerald-600 mr-2" />
                                Easy Portfolio Management
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                No need to execute 15 trades to get a balanced portfolio.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4 border-l-4 border-emerald-500 pl-4">
                        <div>
                            <h3 className="font-medium flex items-center">
                                <Users className="h-5 w-5 text-emerald-600 mr-2" />
                                Social Investing
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Don't know what to buy? Follow your favorite ecosystem or creator's basket.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "How it works?",
            description: "Getting started with Verabloom",
            content: (
                <div className="py-4">
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-200" />

                        <div className="relative pl-12 pb-8">
                            <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                1
                            </div>
                            <h3 className="font-medium">Explore</h3>
                            <p className="text-sm text-muted-foreground">
                                Find the basket that fits your risk tolerance or investment thesis and purchase shares.
                            </p>
                        </div>

                        <div className="relative pl-12 pb-8">
                            <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                2
                            </div>
                            <h3 className="font-medium">Manage</h3>
                            <p className="text-sm text-muted-foreground">
                                Balance your portfolio in a single trade to buy a basket of many tokens.
                            </p>
                        </div>

                        <div className="relative pl-12">
                            <div className="absolute left-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                3
                            </div>
                            <h3 className="font-medium">Earn rewards</h3>
                            <p className="text-sm text-muted-foreground">
                                Create your own basket or share your referral link to earn.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const currentStep = steps[step];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{currentStep.title}</DialogTitle>
                    <p className="text-muted-foreground">{currentStep.description}</p>
                </DialogHeader>

                {currentStep.content}

                <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-1">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-10 rounded-full ${index === step ? "bg-emerald-600" : "bg-slate-200"}`}
                            />
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        {step > 0 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)}>
                                Back
                            </Button>
                        )}

                        {step < steps.length - 1 ? (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep(step + 1)}>
                                Next
                            </Button>
                        ) : (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleClose}>
                                Get started
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
