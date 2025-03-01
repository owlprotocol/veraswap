import { createLazyFileRoute } from "@tanstack/react-router";
import { ArrowUpDown } from "lucide-react";
import { useAccount, useWatchContractEvent } from "wagmi";
import {
    getSwapAndHyperlaneBridgeTransaction,
    getSwapExactInExecuteData,
    MAX_UINT_160,
    MAX_UINT_256,
    MAX_UINT_48,
    PERMIT2_ADDRESS,
    SwapType,
    UNISWAP_CONTRACTS,
    getHyperlaneMessageIdFromReceipt,
    getSwapAndSuperchainBridgeTransaction,
    getSuperchainMessageIdFromReceipt,
    SUPERCHAIN_TOKEN_BRIDGE,
} from "@owlprotocol/veraswap-sdk";
import { Address, encodeFunctionData, formatUnits, Hex, zeroAddress } from "viem";
import { IAllowanceTransfer, IERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { RelayedMessage } from "@owlprotocol/veraswap-sdk/artifacts/IL2ToL2CrossDomainMessenger";
import {
    hyperlaneGasPaymentAtom,
    chainInAtom,
    chainOutAtom,
    chainsAtom,
    poolKeyInAtom,
    quoteInAtom,
    remoteTokenInfoAtom,
    sendTransactionMutationAtom,
    swapInvertAtom,
    SwapStep,
    swapStepAtom,
    tokenInAmountAtom,
    tokenInAmountInputAtom,
    tokenInAtom,
    tokenInBalanceQueryAtom,
    tokenOutAtom,
    tokenOutBalanceQueryAtom,
    tokensInAtom,
    tokensOutAtom,
    swapTypeAtom,
    transactionModalOpenAtom,
    transactionStepsAtom,
    currentTransactionStepIdAtom,
    transactionHashesAtom,
    updateTransactionStepAtom,
    initializeTransactionStepsAtom,
    waitForReceiptQueryAtom,
    messageIdAtom,
    networkTypeAtom,
    remoteTransactionHashAtom,
    hyperlaneMailboxChainOut,
} from "../atoms/index.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NetworkSelect } from "@/components/NetworkSelect.js";
import { TokenSelect } from "@/components/TokenSelect.js";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { MainnetTestnetButtons } from "@/components/MainnetTestnetButtons.js";
import { TransactionStatusModal } from "@/components/TransactionStatusModal.js";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    const { address: walletAddress } = useAccount();

    const chains = useAtomValue(chainsAtom);
    const swapType = useAtomValue(swapTypeAtom);
    const remoteTokenInfo = useAtomValue(remoteTokenInfoAtom);

    const [chainIn, setChainIn] = useAtom(chainInAtom);
    const [chainOut, setChainOut] = useAtom(chainOutAtom);

    const tokensIn = useAtomValue(tokensInAtom);
    const tokensOut = useAtomValue(tokensOutAtom);

    const [tokenIn, setTokenIn] = useAtom(tokenInAtom);

    const tokenInAmount = useAtomValue(tokenInAmountAtom);
    const { data: tokenInBalance } = useAtomValue(tokenInBalanceQueryAtom);

    const [tokenOut, setTokenOut] = useAtom(tokenOutAtom);
    const { data: tokenOutBalance } = useAtomValue(tokenOutBalanceQueryAtom);

    const [messageId, setMessageId] = useAtom(messageIdAtom);

    const poolKey = useAtomValue(poolKeyInAtom);

    const { data: bridgePayment } = useAtomValue(hyperlaneGasPaymentAtom);

    const { data: quoterData, error: quoterError, isLoading: isQuoterLoading } = useAtomValue(quoteInAtom);

    const [tokenInAmountInput, setTokenInAmountInput] = useAtom(tokenInAmountInputAtom);
    const [, swapInvert] = useAtom(swapInvertAtom);
    const swapStep = useAtomValue(swapStepAtom);

    const [transactionModalOpen, setTransactionModalOpen] = useAtom(transactionModalOpenAtom);
    const [transactionSteps] = useAtom(transactionStepsAtom);
    const [currentTransactionStepId] = useAtom(currentTransactionStepIdAtom);
    const [transactionHashes, setTransactionHashes] = useAtom(transactionHashesAtom);
    const [transactionStep, updateTransactionStep] = useAtom(updateTransactionStepAtom);
    const [, initializeTransactionSteps] = useAtom(initializeTransactionStepsAtom);

    const hyperlaneMailboxAddress = useAtomValue(hyperlaneMailboxChainOut);

    const { toast } = useToast();

    const [{ data: receipt }] = useAtom(waitForReceiptQueryAtom);

    const tokenInBalanceFormatted =
        tokenInBalance != undefined ? `${formatUnits(tokenInBalance, tokenIn!.decimals)} ${tokenIn!.symbol}` : "-";
    const tokenOutBalanceFormatted =
        tokenOutBalance != undefined ? `${formatUnits(tokenOutBalance, tokenOut!.decimals)} ${tokenOut!.symbol}` : "-";

    const [{ mutate: sendTransaction, isPending: transactionIsPending }] = useAtom(sendTransactionMutationAtom);

    const networkType = useAtomValue(networkTypeAtom);

    const [remoteTransactionHash, setRemoteTransactionHash] = useAtom(remoteTransactionHashAtom);

    useWatchContractEvent(
        networkType === "superchain"
            ? {
                  abi: [RelayedMessage],
                  eventName: "RelayedMessage",
                  chainId: chainOut?.id ?? 0,
                  address: SUPERCHAIN_TOKEN_BRIDGE ?? zeroAddress,
                  args: { messageHash: messageId ?? "0x" },
                  enabled: !!chainOut && !!messageId,
                  strict: true,
                  onLogs: (logs) => {
                      setRemoteTransactionHash(logs[0].transactionHash);
                  },
              }
            : {
                  abi: [ProcessId],
                  eventName: "ProcessId",
                  chainId: chainOut?.id ?? 0,
                  address: hyperlaneMailboxAddress ?? zeroAddress,
                  args: { messageId: messageId ?? "0x" },
                  enabled: !!chainOut && !!messageId && !!hyperlaneMailboxAddress,
                  strict: true,
                  onLogs: (logs) => {
                      setRemoteTransactionHash(logs[0].transactionHash);
                  },
              },
    );

    const handleSwapSteps = () => {
        if (!swapStep || transactionIsPending) return;
        if (swapStep === SwapStep.APPROVE_PERMIT2) {
            sendTransaction({
                to: tokenIn!.address,
                chainId: tokenIn!.chainId,
                data: encodeFunctionData({
                    abi: IERC20.abi,
                    functionName: "approve",
                    args: [PERMIT2_ADDRESS, MAX_UINT_256],
                }),
            });
            return;
        }

        if (swapStep === SwapStep.APPROVE_UNISWAP_ROUTER) {
            sendTransaction({
                to: PERMIT2_ADDRESS,
                chainId: tokenIn!.chainId,
                data: encodeFunctionData({
                    abi: IAllowanceTransfer.abi,
                    functionName: "approve",
                    args: [
                        tokenIn!.address,
                        UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
                        MAX_UINT_160,
                        MAX_UINT_48,
                    ],
                }),
            });
            return;
        }
        if (swapStep === SwapStep.EXECUTE_SWAP) {
            initializeTransactionSteps(swapType === SwapType.SwapAndBridge ? "SwapAndBridge" : "Swap");

            let transaction: { to: Address; data: Hex; value: bigint };

            const amountOutMinimum = quoterData![0];
            const zeroForOne = tokenIn!.address === poolKey!.currency0;
            if (swapType === SwapType.Swap) {
                if (!tokenOut) {
                    throw new Error("Token out not selected for swap");
                }
                transaction = getSwapExactInExecuteData({
                    universalRouter: UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
                    poolKey: poolKey!,
                    currencyIn: tokenIn!.address,
                    currencyOut: tokenOut!.address,
                    zeroForOne,
                    amountIn: tokenInAmount!,
                    amountOutMinimum,
                });
            } else if (swapType === SwapType.SwapAndBridge) {
                if (networkType === "superchain") {
                    transaction = getSwapAndSuperchainBridgeTransaction({
                        universalRouter: UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
                        destinationChain: chainOut!.id,
                        receiver: walletAddress!,
                        poolKey: poolKey!,
                        zeroForOne,
                        amountIn: tokenInAmount!,
                        amountOutMinimum,
                    });
                } else {
                    const bridgeAddress = remoteTokenInfo?.remoteBridgeAddress ?? remoteTokenInfo?.remoteTokenAddress;

                    if (!bridgeAddress) {
                        throw new Error("Bridge address not found");
                    }

                    // TODO: check why it can't infer type
                    if (!bridgePayment) {
                        throw new Error("Bridge payment not found");
                    }

                    transaction = getSwapAndHyperlaneBridgeTransaction({
                        universalRouter: UNISWAP_CONTRACTS[tokenIn!.chainId].UNIVERSAL_ROUTER,
                        bridgeAddress,
                        bridgePayment,
                        destinationChain: chainOut!.id,
                        receiver: walletAddress!,
                        poolKey: poolKey!,
                        zeroForOne,
                        amountIn: tokenInAmount!,
                        amountOutMinimum,
                    });
                }
            } else {
                throw new Error("Swap type not supported");
            }

            sendTransaction(
                { chainId: chainIn!.id, ...transaction },
                {
                    onSuccess: (hash) => {
                        setTransactionHashes((prev) => ({ ...prev, swap: hash }));
                        updateTransactionStep({ id: "swap", status: "processing" });
                    },
                    onError: () => {
                        updateTransactionStep({ id: "swap", status: "error" });
                        //TODO: show in UI instead
                        toast({
                            title: "Transaction Failed",
                            description: "Your transaction has failed. Please try again.",
                            variant: "destructive",
                        });
                    },
                },
            );
        }
    };

    useEffect(() => {
        if (!receipt) return;

        if (receipt.status === "reverted") {
            updateTransactionStep({ id: "swap", status: "error" });
            toast({
                title: "Transaction Failed",
                description: "Your transaction has failed. Please try again.",
                variant: "destructive",
            });
            return;
        }

        updateTransactionStep({ id: "swap", status: "success" });

        if (swapType !== SwapType.SwapAndBridge) {
            if (swapStep !== SwapStep.EXECUTE_SWAP) {
                return;
            }

            toast({
                title: "Swap Complete",
                description: "Your swap has been completed successfully",
                variant: "default",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt, swapType]);

    useEffect(() => {
        if (!receipt) return;
        if (receipt.status === "reverted") return;
        if (swapType !== SwapType.SwapAndBridge) return;
        const messageId =
            networkType === "superchain"
                ? getSuperchainMessageIdFromReceipt(receipt)
                : getHyperlaneMessageIdFromReceipt(receipt);

        setMessageId(messageId);
        setTransactionHashes((prev) => ({ ...prev, bridge: messageId }));
        updateTransactionStep({ id: "bridge", status: "processing" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt, swapType, networkType]);

    useEffect(() => {
        if (!remoteTransactionHash) return;
        if (swapType !== SwapType.SwapAndBridge) return;

        updateTransactionStep({ id: "bridge", status: "success" });
        updateTransactionStep({ id: "transfer", status: "success" });
        setTransactionHashes((prev) => ({ ...prev, transfer: remoteTransactionHash }));

        toast({
            title: "Transaction Complete",
            description: "Your swap and bridge has been completed successfully",
            variant: "default",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteTransactionHash, swapType]);

    return (
        <div className="max-w-xl mx-auto px-4">
            <MainnetTestnetButtons />
            <Card className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
                                <NetworkSelect value={chainIn} onChange={setChainIn} networks={chains} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tokenInAmountInput}
                                    onChange={(e) => setTokenInAmountInput(e.target.value)}
                                    type="number"
                                    className={cn(
                                        "border-0 bg-transparent text-3xl font-semibold p-0",
                                        "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                        "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
                                    )}
                                    placeholder="0.0"
                                    disabled={!tokenIn}
                                />
                                <TokenSelect value={tokenIn} onChange={setTokenIn} tokens={tokensIn} />
                            </div>
                            <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                                <div className="space-x-2">
                                    <span>Balance: {tokenInBalanceFormatted}</span>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-sm"
                                        onClick={() =>
                                            tokenInBalance &&
                                            setTokenInAmountInput(formatUnits(tokenInBalance, tokenIn!.decimals))
                                        }
                                    >
                                        Max
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-2 relative z-10">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-12 w-12 bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition-all"
                                onClick={swapInvert}
                                disabled={!tokenIn || !tokenOut}
                            >
                                <ArrowUpDown className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">To</span>
                                <NetworkSelect value={chainOut} onChange={setChainOut} networks={chains} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={quoterData ? formatUnits(quoterData[0], tokenOut?.decimals ?? 18) : ""}
                                    type="number"
                                    className={cn(
                                        "border-0 bg-transparent text-3xl font-semibold p-0",
                                        "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                        "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
                                    )}
                                    placeholder={
                                        !!quoterError
                                            ? "Insufficient Liquidity"
                                            : isQuoterLoading
                                              ? "Fetching quote..."
                                              : "0.0"
                                    }
                                    disabled={true}
                                />

                                <TokenSelect value={tokenOut} onChange={setTokenOut} tokens={tokensOut} />
                            </div>
                            <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                                <div className="space-x-2 align-right">
                                    <span>Balance: {tokenOutBalanceFormatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        disabled={
                            !(
                                swapStep === SwapStep.APPROVE_PERMIT2 ||
                                swapStep === SwapStep.APPROVE_UNISWAP_ROUTER ||
                                swapStep === SwapStep.EXECUTE_SWAP ||
                                swapStep === SwapStep.BRIDGING_NOT_SUPPORTED
                            )
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl shadow-lg transition-all"
                        onClick={() => handleSwapSteps()}
                    >
                        {swapStep}
                    </Button>
                </CardContent>
            </Card>
            <TransactionStatusModal
                isOpen={transactionModalOpen}
                onOpenChange={setTransactionModalOpen}
                steps={transactionSteps}
                currentStepId={currentTransactionStepId}
                hashes={transactionHashes}
                chains={{ source: chainIn ?? undefined, destination: chainOut ?? undefined }}
                networkType={networkType}
            />
        </div>
    );
}
