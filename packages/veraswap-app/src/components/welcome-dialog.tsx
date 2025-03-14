import { useState, useEffect } from "react";
import { ArrowRight, Coins, Globe, Lightbulb, Shield, Wallet } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px] h-[90vh] max-h-[90vh] p-0 flex flex-col">
                <div className="overflow-y-auto flex-grow p-6">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to VeraSwap
                        </DialogTitle>
                        <DialogDescription className="text-lg">
                            Swap any token across any chain effortlessly
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="new" className="mt-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="new">New to Crypto</TabsTrigger>
                            <TabsTrigger value="experienced">Experienced</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="new"
                            className="space-y-4 mt-4 h-[45vh] overflow-y-auto focus-visible:outline-none focus-visible:ring-0"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Wallet className="h-5 w-5 text-blue-500" />
                                        Get Started
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <ol className="list-decimal pl-5 space-y-2">
                                        <li>Connect your wallet (top-right)</li>
                                        <li>
                                            <a
                                                href="https://www.coinbase.com/developer-platform/products/onramp"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Fund your wallet
                                            </a>{" "}
                                            with{" "}
                                            <span className="bg-purple-600 border border-purple-700 hover:bg-purple-900 px-1 py-0.5 rounded-md">
                                                + Fund
                                            </span>{" "}
                                            button once connected
                                        </li>

                                        <li>Choose tokens and networks</li>
                                        <li>Enter amount and swap</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Lightbulb className="h-5 w-5 text-amber-500" />
                                        Why VeraSwap?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <Shield className="h-5 w-5 shrink-0 text-green-500 mt-1" />
                                        <p>
                                            <span className="font-medium">No Hassle, Just Swap:</span> Skip the
                                            complicated steps. Trade between different networks in one click—no
                                            bridging, no delays.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Globe className="h-5 w-5 shrink-0 text-blue-500 mt-1" />
                                        <p>
                                            <span className="font-medium">More Tokens, Better Prices:</span> Get the
                                            best deals by accessing liquidity across multiple networks automatically.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Coins className="h-5 w-5 shrink-0 text-purple-500 mt-1" />
                                        <p>
                                            <span className="font-medium">Simple & Secure:</span> You stay in control of
                                            your assets—no middlemen, just fast and safe swaps.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="experienced" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Features</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="architecture">
                                            <AccordionTrigger>Cross-Chain Architecture</AccordionTrigger>
                                            <AccordionContent>
                                                VeraSwap uses Hyperlane for secure cross-chain messaging and Uniswap v4
                                                for efficient swaps, handling bridging and swapping in a single
                                                transaction without third-party relayers.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="liquidity">
                                            <AccordionTrigger>Liquidity Sources</AccordionTrigger>
                                            <AccordionContent>
                                                Automatically taps into liquidity pools across multiple networks,
                                                finding the best price without manual bridging or interacting with
                                                multiple DEXs.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="security">
                                            <AccordionTrigger>Security Model</AccordionTrigger>
                                            <AccordionContent>
                                                Non-custodial approach where you execute every trade yourself,
                                                maintaining control of your assets throughout the entire process with no
                                                third-party risk.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="networks">
                                            <AccordionTrigger>Supported Networks</AccordionTrigger>
                                            <AccordionContent>
                                                Supports all major EVM-compatible networks including Ethereum, Arbitrum,
                                                Optimism, Base, and more, allowing seamless trading between any
                                                supported networks.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="p-6 bg-background/80 backdrop-blur-sm border-t">
                    <Button
                        onClick={() => setIsOpen(false)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        Start Swapping <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
