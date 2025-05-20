import { getChainById, UNISWAP_CONTRACTS, getBasketMint } from "@owlprotocol/veraswap-sdk";
import { AlertCircle, LucideIcon, ShoppingCart } from "lucide-react";
import { formatEther, parseUnits, zeroAddress, formatUnits, encodeFunctionData, Address } from "viem";
import { useAccount, useChainId, useBalance, useSwitchChain, useReadContract } from "wagmi";
import { useMemo } from "react";
import { getBasket } from "@owlprotocol/veraswap-sdk/artifacts/BasketFixedUnits";
import { useSuspenseQuery } from "@tanstack/react-query";
import { tokenDataQueryOptions } from "@owlprotocol/veraswap-sdk";
import React from "react";
import { Card } from "./ui/card.js";
import { Input } from "./ui/input.js";
import { Separator } from "./ui/separator.js";
import { Button } from "./ui/button.js";
import { queryClient } from "@/queryClient.js";
import { useBasketWeights } from "@/hooks/useBasketWeights.js";
import { getCurrencyHops, getTokenDetailsForAllocation, TOKENS } from "@/constants/tokens.js";
import { BasketAllocation } from "@/constants/baskets.js";
import { config } from "@/config.js";

interface SelectedBasketPanel2Props {
    address: Address;
    chainId: number;
    referrer?: Address;
    amount: string;
    setAmount: (value: string) => void;
    sendTransaction: any;
    icon?: LucideIcon;
}

export function SelectedBasketPanel({
    address: basketAddress,
    chainId: basketChainId,
    referrer,
    amount,
    setAmount,
    sendTransaction,
    icon,
}: SelectedBasketPanel2Props) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance, isLoading: isBalanceLoading } = useBalance({ address });
    const { switchChain } = useSwitchChain();

    const { data: basketDetails } = useReadContract({
        chainId: basketChainId,
        address: basketAddress,
        abi: [getBasket],
        functionName: "getBasket",
    });

    const { data: tokenMetadata } = useSuspenseQuery(
        tokenDataQueryOptions(config, { chainId: basketChainId, address: basketAddress }),
    );

    const selectedBasketData = useMemo(() => {
        if (!basketDetails) return null;

        const totalUnits = basketDetails.reduce((sum, token) => sum + token.units, 0n);

        const allocations = basketDetails.map((token) => ({
            address: token.addr,
            chainId: basketChainId,
            weight: Number((token.units * 100n) / totalUnits),
            units: token.units,
        }));

        return {
            id: "on-chain",
            title: tokenMetadata?.name || "Custom Basket",
            description: tokenMetadata?.symbol || "Custom Basket",
            gradient: "from-blue-500 to-purple-500",
            icon: ShoppingCart,
            address: basketAddress,
            allocations,
            symbol: tokenMetadata?.symbol || "BSKT",
        };
    }, [basketDetails, basketAddress, basketChainId, tokenMetadata]);

    const basketChain = useMemo(() => {
        if (selectedBasketData && selectedBasketData.allocations.length > 0) {
            return getChainById(selectedBasketData.allocations[0].chainId);
        }
        return getChainById(basketChainId);
    }, [basketChainId, selectedBasketData]);

    const balanceFormatted = formatEther(balance?.value ?? 0n);
    const amountParsed = parseUnits(amount, 18);

    const hasInsufficientBalance = isConnected && !isBalanceLoading && balance && balance.value < amountParsed;
    const isAmountValid = amountParsed > 0;

    // TODO: fix
    const { totalValue, tokenValues, isLoading: isTokenValuesLoading } = useBasketWeights(selectedBasketData!);

    // TODO: fix
    // const { data: tokenValues, pending: isTokenValuesLoading } = useGetTokenValues({
    //     basket: selectedBasketData,
    //     quoteCurrency: {
    //         address: inputCurrency,
    //         chainId: basketChain.id,
    //     },
    // });
    // const totalValue = tokenValues.reduce((sum: bigint, curr) => sum + (curr ?? 0n), 0n) ?? 0n;

    // const shares = totalValue > 0n ? (amountParsed * unitsToQuote) / totalValue : 0n;
    // const sharesFormatted =
    //     totalValue > 0n && amountParsed > 0n && mintFeeCentiBips
    //         ? formatUnits((shares * (maxFeeCentiBips - mintFeeCentiBips)) / maxFeeCentiBips, 18)
    //         : "";

    const shares = totalValue > 0n ? (amountParsed * 10n ** 16n) / totalValue : 0n;
    const sharesFormatted = totalValue > 0n && amountParsed > 0n ? formatUnits(shares, 18) : "";

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "");
        setAmount(value);
    };

    // TODO: change native currency to input symbol
    const inputSymbol = basketChain ? basketChain.nativeCurrency.symbol : "";

    const handlePurchase = async () => {
        if (
            !isConnected ||
            chainId !== basketChain?.id ||
            !address ||
            !balance ||
            !tokenValues ||
            tokenValues.some((value) => value === undefined) ||
            !selectedBasketData
        )
            return;

        const userBalance = balance?.value;
        if (userBalance < amountParsed) return;

        const receiver = address;

        const uniswapContract = UNISWAP_CONTRACTS[basketChain.id]!;

        const basketMintWrite = await getBasketMint(queryClient, config, {
            basket: selectedBasketData.address,
            chainId: basketChain.id,
            contracts: {
                universalRouter: uniswapContract.universalRouter,
                v4MetaQuoter: uniswapContract.v4MetaQuoter!,
            },
            currencyHops: getCurrencyHops(basketChain.id),
            // TODO: use input currency
            currencyIn: zeroAddress,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 60),
            receiver,
            mintAmount: shares,
            referrer,
        });

        sendTransaction({
            chainId: basketChain.id,
            to: basketMintWrite.address,
            value: basketMintWrite.value,
            data: encodeFunctionData(basketMintWrite),
        });
    };

    const renderAllocationDetails = (allocation: BasketAllocation) => {
        const token = getTokenDetailsForAllocation(allocation, TOKENS);
        if (!token) return null;

        // Assume it's ETH TODO: change decimals
        const value = formatUnits(shares * allocation.units, token.decimals ?? 18);

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

    if (!basketDetails || !selectedBasketData) {
        return (
            <Card className="border-none shadow-lg overflow-hidden mb-8 animate-in fade-in-50 duration-300">
                <div className="p-6">
                    <div className="text-center">Loading basket details...</div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg overflow-hidden mb-8 animate-in fade-in-50 duration-300">
            <div className={`bg-gradient-to-r ${selectedBasketData.gradient} h-2`} />
            <div className="p-6 grid grid-cols-1 lg:grid-cols-9 gap-6">
                <div className="lg:col-span-3">
                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${selectedBasketData.gradient} text-white`}>
                            {/* <selectedBasketData.icon className="h-5 w-5" /> */}
                            {/* TODO: add icon */}
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{selectedBasketData.title}</h3>
                            <p className="text-sm text-muted-foreground">{selectedBasketData.description}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <h3 className="font-medium mb-2">Amount ({inputSymbol})</h3>
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
                            <span className="text-base font-medium">{inputSymbol}</span>
                        </div>
                        {isConnected && (
                            <div className="text-sm text-muted-foreground">
                                {isBalanceLoading ? (
                                    "Loading balance..."
                                ) : (
                                    <>
                                        Balance: {balanceFormatted} {inputSymbol}
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
                        {isConnected && basketChain && chainId !== basketChain.id && (
                            <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Please switch to {basketChain.name}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => switchChain({ chainId: basketChain.id })}
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
                            {selectedBasketData.allocations.map((all: BasketAllocation) =>
                                renderAllocationDetails(all),
                            )}
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2">
                            <Button
                                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                size="sm"
                                onClick={
                                    !basketChain || chainId !== basketChain.id
                                        ? () => basketChain && switchChain?.({ chainId: basketChain.id })
                                        : handlePurchase
                                }
                                disabled={
                                    !isConnected ||
                                    hasInsufficientBalance ||
                                    isBalanceLoading ||
                                    !isAmountValid ||
                                    isTokenValuesLoading ||
                                    !selectedBasketData
                                }
                            >
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                {!isConnected
                                    ? "Connect Wallet"
                                    : !basketChain || chainId !== basketChain.id
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
