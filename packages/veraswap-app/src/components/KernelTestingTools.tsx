import { useState } from "react";
import { useAtomValue } from "jotai";
import { useAccount } from "wagmi";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits, encodeFunctionData } from "viem";
import { transfer as transferAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { getUniswapV4Address, LOCAL_CURRENCIES } from "@owlprotocol/veraswap-sdk";
import { TestTube, ChevronDown, ChevronRight, Send } from "lucide-react";
import { Currency } from "@owlprotocol/veraswap-sdk";
import { allKernelAccountsAtom } from "@/atoms/kernelRecovery.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { useToast } from "@/components/ui/use-toast.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js";

// Type guard to check if currency has an address (is a token)
function isTokenCurrency(currency: Currency): currency is Currency & { address: string } {
    return !currency.isNative && "address" in currency;
}

export function KernelTestingTools() {
    const { address: walletAddress } = useAccount();
    const kernelAccounts = useAtomValue(allKernelAccountsAtom);
    const [showTesting, setShowTesting] = useState(false);
    const [testAmount, setTestAmount] = useState("0.001");
    const [testTokenAmount, setTestTokenAmount] = useState("1");
    const [selectedToken, setSelectedToken] = useState<string>("");
    const { toast } = useToast();

    const { data: testHash, sendTransaction, isPending: isTestPending } = useSendTransaction();
    const { isLoading: isTestConfirming, isSuccess: isTestSuccess } = useWaitForTransactionReceipt({ hash: testHash });

    const deployedKernelAccounts = kernelAccounts.filter((account) => account.isDeployed);

    // Use LOCAL_CURRENCIES directly for testing
    const testTokens = LOCAL_CURRENCIES.filter((currency) => isTokenCurrency(currency) && currency.symbol);

    const handleSendToKernel = (chainId: number, kernelAddress: string) => {
        if (!walletAddress || !testAmount) return;

        try {
            const amount = parseEther(testAmount);

            sendTransaction({
                to: kernelAddress as `0x${string}`,
                value: amount,
                chainId,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send transaction",
                variant: "destructive",
            });
        }
    };

    const handleSendTokenToKernel = (chainId: number, kernelAddress: string, tokenAddress: string) => {
        if (!walletAddress || !testTokenAmount || !selectedToken) return;

        try {
            const selectedCurrency = testTokens.find(
                (c) => isTokenCurrency(c) && getUniswapV4Address(c) === selectedToken,
            );
            if (!selectedCurrency || !isTokenCurrency(selectedCurrency)) return;

            const amount = parseUnits(testTokenAmount, selectedCurrency.decimals || 18);

            sendTransaction({
                to: selectedToken as `0x${string}`,
                data: encodeFunctionData({
                    abi: [transferAbi],
                    args: [kernelAddress as `0x${string}`, amount],
                }),
                chainId,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send token transaction",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setShowTesting(!showTesting)}
                >
                    <TestTube className="h-5 w-5" />
                    Testing Tools
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                        {showTesting ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                </CardTitle>
                <CardDescription>Tools for testing kernel account recovery</CardDescription>
            </CardHeader>
            {showTesting && (
                <CardContent className="space-y-6">
                    {/* Native Token Testing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Send Native Tokens</h3>
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="test-amount">Amount to Send (ETH)</Label>
                                <Input
                                    id="test-amount"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={testAmount}
                                    onChange={(e) => setTestAmount(e.target.value)}
                                    placeholder="0.001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Send to Kernel Address on Chain:</Label>
                                <div className="grid gap-2">
                                    {deployedKernelAccounts.map((account) => (
                                        <div
                                            key={account.chainId}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{account.chain.name}</span>
                                                <Badge variant="outline">{account.chainId}</Badge>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSendToKernel(account.chainId, account.kernelAddress)
                                                }
                                                disabled={isTestPending || isTestConfirming}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Send {testAmount} {account.chain.nativeCurrency.symbol}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Token Testing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Send ERC20 Tokens</h3>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="token-select">Select Token</Label>
                                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a token" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {testTokens.map((token) => (
                                                <SelectItem
                                                    key={getUniswapV4Address(token)}
                                                    value={getUniswapV4Address(token)}
                                                >
                                                    {token.symbol} ({token.chainId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="test-token-amount">Amount to Send</Label>
                                    <Input
                                        id="test-token-amount"
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={testTokenAmount}
                                        onChange={(e) => setTestTokenAmount(e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            {selectedToken && (
                                <div className="space-y-2">
                                    <Label>Send to Kernel Address on Chain:</Label>
                                    <div className="grid gap-2">
                                        {deployedKernelAccounts.map((account) => {
                                            const selectedCurrency = testTokens.find(
                                                (c) => isTokenCurrency(c) && getUniswapV4Address(c) === selectedToken,
                                            );
                                            const isTokenOnChain = selectedCurrency?.chainId === account.chainId;

                                            return (
                                                <div
                                                    key={account.chainId}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{account.chain.name}</span>
                                                        <Badge variant="outline">{account.chainId}</Badge>
                                                        {!isTokenOnChain && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Token not on this chain
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleSendTokenToKernel(
                                                                account.chainId,
                                                                account.kernelAddress,
                                                                selectedToken,
                                                            )
                                                        }
                                                        disabled={isTestPending || isTestConfirming || !isTokenOnChain}
                                                    >
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send {testTokenAmount} {selectedCurrency?.symbol}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Status */}
                    {(isTestPending || isTestConfirming) && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                                {isTestPending ? "Sending transaction..." : "Confirming transaction..."}
                            </p>
                            {testHash && (
                                <p className="text-xs text-muted-foreground mt-1">Hash: {testHash.slice(0, 10)}...</p>
                            )}
                        </div>
                    )}

                    {isTestSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                                Transaction successful! Check your kernel account balance.
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
