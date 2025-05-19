import { getBasketSwaps, UNISWAP_CONTRACTS, USDC_BASE } from "@owlprotocol/veraswap-sdk";
import { AlertCircle, ShoppingCart } from "lucide-react";
import { formatEther, parseUnits, zeroAddress, formatUnits } from "viem";
import { bsc } from "viem/chains";
import { useAccount, useChainId, useBalance, useSwitchChain } from "wagmi";
import { Card } from "./ui/card.js";
import { Input } from "./ui/input.js";
import { Separator } from "./ui/separator.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { queryClient } from "@/queryClient.js";
import { useGetTokenValues } from "@/hooks/useGetTokenValues.js";
import { getTokenDetailsForAllocation, TOKENS } from "@/constants/tokens.js";
import { BASKETS, BasketAllocation } from "@/constants/baskets.js";
import { config } from "@/config.js";

export function SelectedBasketPanel({ selectedBasket, amount, setAmount, sendTransaction }) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });
    const { switchChain } = useSwitchChain();

    const selectedBasketData = BASKETS.find((b) => b.id === selectedBasket)!;
    const balanceFormatted = formatEther(balance?.value ?? 0n);
    const amountParsed = parseUnits(amount, 18);

    const hasInsufficientBalance = isConnected && !isBalanceLoading && balance && balance.value < amountParsed;
    const isAmountValid = amountParsed > 0;

    const { data: tokenValues } = useGetTokenValues({
        basket: selectedBasketData,
        quoteCurrency: selectedBasketData
            ? {
                  address: zeroAddress,
                  chainId: selectedBasketData.allocations[0].chainId,
              }
            : undefined,
    });

    const totalValue = tokenValues?.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n) ?? 0n;
    // const weights = tokenValues ?? [];

    const shares = totalValue > 0n ? (amountParsed * 10n ** 18n) / totalValue : 0n;
    const sharesFormatted = totalValue > 0n && amountParsed > 0n ? formatUnits(shares, 18) : "";

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setAmount(value);
    };

    const handlePurchase = async () => {
        if (
            !isConnected ||
            chainId !== bsc.id ||
            !balance ||
            !tokenValues ||
            tokenValues.some((value) => value === undefined)
        )
            return;

        const userBalance = balance?.value;
        if (userBalance < amountParsed) return;

        // if (usdcAllowance < amountParsed) {
        //     const allowHash = await sendTransactionPermitAsync({
        //         to: USDC_BASE.address,
        //         chainId: bsc.id,
        //         data: encodeFunctionData({
        //             abi: IERC20.abi,
        //             functionName: "approve",
        //             args: [PERMIT2_ADDRESS, MAX_UINT_256],
        //         }),
        //     });
        //
        //     await waitForTransactionReceipt(config, { hash: allowHash });
        // }
        //
        // const permit2Signature = await getPermit2PermitSignature(queryClient, {});
        //
        // const allocationsAmountOut = tokenValues?.map((value) => (amountParsed * value!) / totalValue);

        const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const swapData = await getBasketSwaps(queryClient, config, {
            chainId: bsc.id,
            contracts: UNISWAP_CONTRACTS[bsc.id]!,
            currencyIn: zeroAddress,
            deadline: routerDeadline,
            exactAmount: amountParsed,

            currencyHops: [USDC_BASE.address],
            basketTokens: selectedBasketData.allocations,
        });
        sendTransaction({ chainId: bsc.id, ...swapData });
    };

    const renderAllocationDetails = (allocation: BasketAllocation, idx) => {
        const token = getTokenDetailsForAllocation(allocation, TOKENS);
        if (!token) return null;

        const tokenValue = tokenValues?.[idx] ?? 0n;

        // Assume it's ETH TODO: change decimals
        const value =
            totalValue > 0n && tokenValue > 0n ? formatUnits((tokenValue * amountParsed) / totalValue, 18) : "";

        return (
            <div key={token.address} className="flex justify-between text-sm">
                <div className="flex items-center space-x-2">
                    <img src={token.logoURI} alt={token.symbol} className="w-4 h-4 rounded-full" />
                    <span className="text-muted-foreground">{token.symbol}</span>
                </div>
                {value ? (
                    <span className="font-medium">{value}</span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </div>
        );
    };

    return (
        <Card className="border-none shadow-lg overflow-hidden mb-8 animate-in fade-in-50 duration-300">
            <div className={`bg-gradient-to-r ${selectedBasketData.gradient} h-2`} />
            <div className="p-6 grid grid-cols-1 lg:grid-cols-9 gap-6">
                <div className="lg:col-span-3">
                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${selectedBasketData.gradient} text-white`}>
                            <selectedBasketData.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{selectedBasketData.title}</h3>
                            <p className="text-sm text-muted-foreground">{selectedBasketData.description}</p>
                            <Badge variant="outline" className="mt-2">
                                {selectedBasketData.riskLevel} Risk
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {/* TODO: change BNB to input symbol */}
                    <h3 className="font-medium mb-2">Amount (BNB)</h3>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*\.?[0-9]*"
                                value={amount}
                                onChange={handleAmountChange}
                                className="text-base"
                                disabled={!isConnected}
                            />
                            {/* TODO: change BNB to input symbol */}
                            <span className="text-base font-medium">BNB</span>
                        </div>
                        {isConnected && (
                            <div className="text-sm text-muted-foreground">
                                {isBalanceLoading ? (
                                    "Loading balance..."
                                ) : (
                                    <>
                                        {/* TODO: change BNB to input symbol */}
                                        Balance: {balanceFormatted} BNB
                                        {hasInsufficientBalance && (
                                            <div className="text-red-500 mt-1">Insufficient balance</div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {/* {isConnected && (
                            <div className="mt-2">
                                <VeraFundButton />
                            </div>
                        )} */}
                        {!isConnected && (
                            <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Please connect your wallet to proceed</span>
                            </div>
                        )}
                        {isConnected && chainId !== bsc.id && (
                            <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Please switch to BSC</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => switchChain({ chainId: bsc.id })}
                                    className="ml-2"
                                >
                                    Switch Network
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="space-y-3">
                        <h2 className="font-medium text-xl">Order Summary</h2>
                        <div className="flex justify-between font-medium">
                            <span>Basket Shares</span>
                            {sharesFormatted !== "" ? (
                                <span>{sharesFormatted}</span>
                            ) : (
                                <span className="text-muted-foreground">-</span>
                            )}
                        </div>

                        <Separator />
                        <h3 className="font-medium">Breakdown</h3>
                        <div className="space-y-1 text-sm">
                            {selectedBasketData.allocations.map((all: BasketAllocation, idx) =>
                                renderAllocationDetails(all, idx),
                            )}
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2">
                            <Button
                                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                size="sm"
                                onClick={chainId !== bsc.id ? () => switchChain?.({ chainId: bsc.id }) : handlePurchase}
                                disabled={!isConnected || hasInsufficientBalance || isBalanceLoading || !isAmountValid}
                            >
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                {!isConnected
                                    ? "Connect Wallet"
                                    : chainId !== bsc.id
                                      ? "Switch Network"
                                      : !isAmountValid
                                        ? "Enter Amount"
                                        : hasInsufficientBalance
                                          ? "Insufficient Balance"
                                          : "Buy Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
