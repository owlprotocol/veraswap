import { ArrowUpDown, Wallet } from "lucide-react";
import { useAccount, useSwitchChain, useWatchAsset } from "wagmi";
import {
    getHyperlaneMessageIdsFromReceipt,
    getTransaction,
    TransactionParams,
    chainIdToOrbiterChainId,
    TransactionType,
    TransactionTypeBridge,
    TransactionTypeBridgeSwap,
    TransactionTypeSwap,
    TransactionTypeSwapBridge,
    Currency,
    getUniswapV4Address,
    getStargateMessageIdFromReceipt,
    STARGATE_POOL_NATIVE,
    getSuperchainMessageIdsFromReceipt,
    PERMIT2_ADDRESS,
    MAX_UINT_256,
} from "@owlprotocol/veraswap-sdk";
import { IERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import { encodeFunctionData, formatUnits, zeroAddress } from "viem";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import {
    HYPERLANE_CONTRACTS,
    LOCAL_HYPERLANE_CONTRACTS,
    LOCAL_KERNEL_CONTRACTS,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
    sendTransactionMutationAtom,
    swapInvertAtom,
    SwapStep,
    swapStepAtom,
    tokenInAmountAtom,
    tokenInAmountInputAtom,
    tokenInAccountBalanceQueryAtom,
    tokenOutAccountBalanceQueryAtom,
    transactionModalOpenAtom,
    transactionStepsAtom,
    currentTransactionStepIdAtom,
    transactionHashesAtom,
    updateTransactionStepAtom,
    initializeTransactionStepsAtom,
    waitForReceiptQueryAtom,
    bridgeMessageIdAtom,
    swapMessageIdAtom,
    bridgeRemoteTransactionHashAtom,
    swapRemoteTransactionHashAtom,
    transactionTypeAtom,
    hyperlaneMailboxChainOut,
    hyperlaneRegistryAtom,
    chainsTypeAtom,
    getSwapStepMessage,
    kernelInitDataAtom,
    kernelAddressChainOutQueryAtom,
    isDisabledStep,
    prefetchQueriesAtom,
    tokenRouterQuoteGasPaymentQueryAtom,
    currencyInAtom,
    currencyOutAtom,
    chainInAtom,
    chainOutAtom,
    superchainBridgeMessageIdAtom,
    resetTransactionStateAtom,
    routeMultichainAtom,
    submittedTransactionTypeAtom,
    amountOutAtom,
    orbiterQuoteAtom,
    slippageToleranceAtom,
    stargateQuoteAtom,
    stargateBridgeMessageIdAtom,
    tokenInUsdValueAtom,
    tokenOutUsdValueAtom,
    superchainSwapMessageIdAtom,
} from "../atoms/index.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import { useToast } from "@/components/ui/use-toast.js";
import { TransactionStatusModal } from "@/components/TransactionStatusModal.js";
import { TokenSelector } from "@/components/token-selector.js";
import { config } from "@/config.js";
import { useDustAccount, useWatchHyperlaneMessageProcessed, useWatchStargateMessageProcessed } from "@/hooks/index.js";
import { useWatchSuperchainMessageProcessed } from "@/hooks/useWatchSuperchainMessageProcessed.js";
import { TransactionFlow } from "@/components/transaction-flow.js";
import { SettingsDialog } from "@/components/settings-dialog.js";
import { useWatchOrbiterMessageProcessed } from "@/hooks/useWatchOrbiterMessageProcessed.js";

interface SwapWidgetProps {
    showSettings?: boolean;
    showTransactionFlow?: boolean;
    className?: string;
    isEmbedded?: boolean;
}

export function SwapWidget({
    showSettings = true,
    showTransactionFlow = false,
    className = "",
    isEmbedded = false,
}: SwapWidgetProps) {
    const queryClient = useQueryClient();
    const { address: walletAddress, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();

    const { watchAsset } = useWatchAsset();

    useAtomValue(prefetchQueriesAtom);

    const currencyIn = useAtomValue(currencyInAtom);
    const currencyOut = useAtomValue(currencyOutAtom);

    const chainIn = useAtomValue(chainInAtom);
    const chainOut = useAtomValue(chainOutAtom);

    const tokenInAmount = useAtomValue(tokenInAmountAtom);
    const { data: tokenInBalance } = useAtomValue(tokenInAccountBalanceQueryAtom);

    const { data: tokenOutBalance } = useAtomValue(tokenOutAccountBalanceQueryAtom);
    const amountOut = useAtomValue(amountOutAtom);

    const [swapMessageId, setSwapMessageId] = useAtom(swapMessageIdAtom);
    const [bridgeMessageId, setBridgeMessageId] = useAtom(bridgeMessageIdAtom);
    const [superchainBridgeMessageId, setSuperchainBridgeMessageId] = useAtom(superchainBridgeMessageIdAtom);
    const [superchainSwapMessageId, setSuperchainSwapMessageId] = useAtom(superchainSwapMessageIdAtom);
    const [stargateBridgeMessageId, setStargateBridgeMessageId] = useAtom(stargateBridgeMessageIdAtom);

    const { data: bridgePayment } = useAtomValue(tokenRouterQuoteGasPaymentQueryAtom);

    const { data: kernelSmartAccountInitData } = useAtomValue(kernelInitDataAtom);
    const { data: kernelAddressChainOut } = useAtomValue(kernelAddressChainOutQueryAtom);
    const { data: quoterData, error: quoterError, isLoading: isQuoterLoading } = useAtomValue(routeMultichainAtom);

    const [tokenInAmountInput, setTokenInAmountInput] = useAtom(tokenInAmountInputAtom);
    const [, swapInvert] = useAtom(swapInvertAtom);
    const swapStep = useAtomValue(swapStepAtom);

    const transactionType = useAtomValue(transactionTypeAtom);
    const [submittedTransactionType, setSubmittedTransactionType] = useAtom(submittedTransactionTypeAtom);

    const [transactionModalOpen, setTransactionModalOpen] = useAtom(transactionModalOpenAtom);
    const [transactionSteps] = useAtom(transactionStepsAtom);
    const [currentTransactionStepId] = useAtom(currentTransactionStepIdAtom);
    const [transactionHashes, setTransactionHashes] = useAtom(transactionHashesAtom);
    const [_, updateTransactionStep] = useAtom(updateTransactionStepAtom);
    const [, initializeTransactionSteps] = useAtom(initializeTransactionStepsAtom);
    const [, resetTransactionState] = useAtom(resetTransactionStateAtom);

    const hyperlaneRegistry = useAtomValue(hyperlaneRegistryAtom);
    const hyperlaneMailboxAddress = useAtomValue(hyperlaneMailboxChainOut);

    const { toast } = useToast();

    const [{ data: receipt }] = useAtom(waitForReceiptQueryAtom);

    const tokenInBalanceFormatted =
        tokenInBalance != undefined
            ? `${formatUnits(tokenInBalance, currencyIn!.decimals)} ${currencyIn!.symbol}`
            : "-";
    const tokenOutBalanceFormatted =
        tokenOutBalance != undefined
            ? `${formatUnits(tokenOutBalance, currencyOut!.decimals)} ${currencyOut!.symbol}`
            : "-";

    const [{ mutate: sendTransaction, isPending: transactionIsPending, data: hash }] =
        useAtom(sendTransactionMutationAtom);

    const networkType = useAtomValue(chainsTypeAtom);

    const [bridgeRemoteTransactionHash, setBridgeRemoteTransactionHash] = useAtom(bridgeRemoteTransactionHashAtom);
    const [swapRemoteTransactionHash, setSwapRemoteTransactionHash] = useAtom(swapRemoteTransactionHashAtom);

    const { switchChain } = useSwitchChain();

    const { data: orbiterQuote } = useAtomValue(orbiterQuoteAtom);
    const { data: stargateQuote } = useAtomValue(stargateQuoteAtom);

    const slippageTolerance = useAtomValue(slippageToleranceAtom);

    const tokenInUsdValue = useAtomValue(tokenInUsdValueAtom);
    const tokenOutUsdValue = useAtomValue(tokenOutUsdValueAtom);

    const { switchChainAsync } = useSwitchChain();

    useDustAccount(walletAddress);

    useWatchHyperlaneMessageProcessed(
        bridgeMessageId,
        chainOut,
        hyperlaneMailboxAddress,
        setBridgeRemoteTransactionHash,
        bridgeRemoteTransactionHash,
    );
    useWatchHyperlaneMessageProcessed(
        swapMessageId,
        chainOut,
        hyperlaneMailboxAddress,
        setSwapRemoteTransactionHash,
        swapRemoteTransactionHash,
    );

    useWatchSuperchainMessageProcessed(
        superchainBridgeMessageId,
        chainOut,
        setBridgeRemoteTransactionHash,
        bridgeRemoteTransactionHash,
    );

    useWatchSuperchainMessageProcessed(
        superchainSwapMessageId,
        chainOut,
        setSwapRemoteTransactionHash,
        swapRemoteTransactionHash,
    );

    const bridgeToAddress =
        (transactionType?.type === "BRIDGE_SWAP" ? kernelAddressChainOut : walletAddress) ?? zeroAddress;

    useWatchStargateMessageProcessed(
        stargateQuote,
        stargateBridgeMessageId,
        chainOut,
        setBridgeRemoteTransactionHash,
        bridgeRemoteTransactionHash,
        bridgeToAddress,
    );

    useWatchOrbiterMessageProcessed(
        chainOut,
        hash,
        bridgeToAddress,
        orbiterQuote,
        stargateQuote,
        transactionType?.withSuperchain,
        setBridgeRemoteTransactionHash,
        bridgeRemoteTransactionHash,
    );

    const handleSwapSteps = async () => {
        if (!walletAddress) {
            openConnectModal?.();
            return;
        }
        // Check transaction type here for swaps to avoid changing chains if not needed
        if (
            !swapStep ||
            transactionIsPending ||
            !walletAddress ||
            !currencyIn ||
            (swapStep === SwapStep.EXECUTE_SWAP && !transactionType)
        )
            return;

        if (chainIn!.id !== chainId) {
            await switchChainAsync({ chainId: chainIn!.id });
        }

        resetTransactionState();

        if (swapStep === SwapStep.APPROVE_PERMIT2) {
            sendTransaction({
                to: getUniswapV4Address(currencyIn),
                chainId: currencyIn.chainId,
                data: encodeFunctionData({
                    abi: IERC20.abi,
                    functionName: "approve",
                    args: [PERMIT2_ADDRESS, MAX_UINT_256],
                }),
            });

            return;
        }

        if (swapStep === SwapStep.EXECUTE_SWAP) {
            if (!transactionType) return;

            const quoteAmountOut = quoterData?.amountOut ?? null;
            if (transactionType.type !== "BRIDGE" && !quoteAmountOut) {
                throw new Error("amountOutMinimum is required for this transaction type");
            }

            const slippageBps = BigInt(slippageTolerance * 100);
            const adjustedAmountOutMinimum = quoteAmountOut ? (quoteAmountOut * (10000n - slippageBps)) / 10000n : null;
            initializeTransactionSteps(transactionType);

            // We split the params into two to keep the types clean
            const transactionParams =
                transactionType.type === "BRIDGE"
                    ? ({
                          ...transactionType,
                          amountIn: tokenInAmount!,
                          walletAddress,
                          bridgePayment,
                          orbiterQuote,
                          stargateQuote,
                          queryClient,
                          wagmiConfig: config,
                          initData: kernelSmartAccountInitData,
                      } as TransactionParams & TransactionTypeBridge)
                    : transactionType.type === "BRIDGE_SWAP"
                      ? ({
                            ...transactionType,
                            amountIn: tokenInAmount!,
                            amountOutMinimum: adjustedAmountOutMinimum,
                            walletAddress,
                            orbiterQuote,
                            stargateQuote,
                            queryClient,
                            wagmiConfig: config,
                            initData: kernelSmartAccountInitData,
                        } as TransactionParams & TransactionTypeBridgeSwap)
                      : ({
                            ...transactionType,
                            amountIn: tokenInAmount!,
                            orbiterQuote,
                            stargateQuote,
                            amountOutMinimum: adjustedAmountOutMinimum,
                            walletAddress,
                            bridgePayment,
                            queryClient,
                            wagmiConfig: config,
                        } as TransactionParams & (TransactionTypeSwap | TransactionTypeSwapBridge));

            const inChainId = currencyIn.chainId;
            const outChainId = currencyOut!.chainId;

            const interchainGasPaymasterIn =
                hyperlaneRegistry!.addresses[inChainId]?.interchainGasPaymaster ??
                LOCAL_HYPERLANE_CONTRACTS[inChainId]?.mockInterchainGasPaymaster;

            const interchainGasPaymasterOut =
                hyperlaneRegistry!.addresses[outChainId]?.interchainGasPaymaster ??
                LOCAL_HYPERLANE_CONTRACTS[outChainId]?.mockInterchainGasPaymaster;

            const erc7579RouterIn = HYPERLANE_CONTRACTS[inChainId]?.erc7579Router ?? zeroAddress;
            const erc7579RouterOut = HYPERLANE_CONTRACTS[outChainId]?.erc7579Router ?? zeroAddress;

            const transaction = await getTransaction(transactionParams, {
                [inChainId]: {
                    universalRouter: UNISWAP_CONTRACTS[inChainId]?.universalRouter ?? zeroAddress,
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: erc7579RouterIn,
                    interchainGasPaymaster: interchainGasPaymasterIn,
                    weth9: UNISWAP_CONTRACTS[inChainId]?.weth9 ?? zeroAddress,
                },
                [outChainId]: {
                    universalRouter: UNISWAP_CONTRACTS[outChainId]?.universalRouter ?? zeroAddress,
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: erc7579RouterOut,
                    interchainGasPaymaster: interchainGasPaymasterOut,
                    weth9: UNISWAP_CONTRACTS[outChainId]?.weth9 ?? zeroAddress,
                },
            });

            if (currencyIn) {
                await switchChainAsync({ chainId: currencyIn.chainId });
            }

            if (!transaction) {
                toast({
                    title: "Transaction Failed",
                    description: "Your transaction has failed. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            const submittedTransactionType = { ...transactionType };

            setSubmittedTransactionType(submittedTransactionType);

            sendTransaction(
                { chainId: currencyIn.chainId, ...transaction },
                {
                    onSuccess: (hash) => {
                        if (
                            submittedTransactionType!.type === "BRIDGE" ||
                            submittedTransactionType!.type === "BRIDGE_SWAP"
                        ) {
                            setTransactionHashes((prev) => ({ ...prev, sendOrigin: hash }));
                            updateTransactionStep({ id: "sendOrigin", status: "processing" });
                            return;
                        }

                        setTransactionHashes((prev) => ({ ...prev, swap: hash }));
                        updateTransactionStep({ id: "swap", status: "processing" });
                        queryClient.invalidateQueries();
                    },
                    onError: (error) => {
                        console.log(error);
                        if (
                            submittedTransactionType!.type === "BRIDGE" ||
                            submittedTransactionType!.type === "BRIDGE_SWAP"
                        ) {
                            updateTransactionStep({ id: "sendOrigin", status: "error" });
                        } else {
                            updateTransactionStep({ id: "swap", status: "error" });
                        }
                        queryClient.invalidateQueries();
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
        if (!receipt || !submittedTransactionType) return;

        if (receipt.status === "reverted") {
            const failedStep =
                submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "BRIDGE_SWAP"
                    ? "sendOrigin"
                    : "swap";
            updateTransactionStep({ id: failedStep, status: "error" });
            toast({
                title: "Transaction Failed",
                description: "Your transaction has failed. Please try again.",
                variant: "destructive",
            });
            return;
        }
        if (swapStep === SwapStep.APPROVE_PERMIT2) {
            queryClient.invalidateQueries({
                queryKey: ["waitForTransactionReceipt", { hash }],
            });
            return;
        }

        const hyperlaneMessageIds = getHyperlaneMessageIdsFromReceipt(receipt);
        const superchainMessageIds = getSuperchainMessageIdsFromReceipt(receipt, chainIn!.id);
        const stargateBridgeMessageId = getStargateMessageIdFromReceipt(receipt);

        if (
            (submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "BRIDGE_SWAP") &&
            superchainMessageIds[0]
        ) {
            updateTransactionStep({ id: "sendOrigin", status: "success" });

            const superchainBridgeMessageId = superchainMessageIds[0];

            setSuperchainBridgeMessageId(superchainBridgeMessageId);
            setTransactionHashes((prev) => ({ ...prev, bridge: superchainBridgeMessageId }));
            updateTransactionStep({ id: "bridge", status: "processing" });

            if (submittedTransactionType.type === "BRIDGE_SWAP") {
                const superchainSwapMessageId = superchainMessageIds[1];
                const hyperlaneSwapMessageId = hyperlaneMessageIds[0];

                const swapMessageId = superchainSwapMessageId ?? hyperlaneSwapMessageId;

                if (swapMessageId) {
                    setSwapMessageId(swapMessageId);
                    setTransactionHashes((prev) => ({ ...prev, swap: swapMessageId }));
                    updateTransactionStep({ id: "swap", status: "processing" });
                }

                if (superchainSwapMessageId) {
                    setSuperchainSwapMessageId(superchainSwapMessageId);
                }
            }
        }

        const hyperlaneBridgeMessageId = hyperlaneMessageIds[0];
        const hyperlaneSwapMessageId =
            !stargateQuote && !orbiterQuote ? hyperlaneMessageIds[1] : hyperlaneMessageIds[0];

        const superchainBridgeMessageId = superchainMessageIds[0];

        if (submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "BRIDGE_SWAP") {
            updateTransactionStep({ id: "sendOrigin", status: "success" });

            if (hyperlaneBridgeMessageId && !stargateQuote && !orbiterQuote) {
                setBridgeMessageId(hyperlaneBridgeMessageId);
                setTransactionHashes((prev) => ({ ...prev, bridge: hyperlaneBridgeMessageId }));
                updateTransactionStep({ id: "bridge", status: "processing" });
            } else if (stargateQuote || orbiterQuote) {
                if (stargateBridgeMessageId) {
                    setStargateBridgeMessageId(stargateBridgeMessageId);
                }

                setTransactionHashes((prev) => ({ ...prev, bridge: receipt.transactionHash }));
                updateTransactionStep({ id: "bridge", status: "processing" });
            }

            if (submittedTransactionType.type === "BRIDGE_SWAP" && hyperlaneSwapMessageId) {
                setSwapMessageId(hyperlaneSwapMessageId);
                setTransactionHashes((prev) => ({ ...prev, swap: hyperlaneSwapMessageId }));
                updateTransactionStep({ id: "swap", status: "processing" });
            }
        } else {
            updateTransactionStep({ id: "swap", status: "success" });

            if (submittedTransactionType.type === "SWAP_BRIDGE") {
                if (hyperlaneBridgeMessageId) {
                    setBridgeMessageId(hyperlaneBridgeMessageId);
                    setTransactionHashes((prev) => ({ ...prev, bridge: hyperlaneBridgeMessageId }));
                } else if (superchainBridgeMessageId) {
                    setSuperchainBridgeMessageId(superchainBridgeMessageId);
                    setTransactionHashes((prev) => ({ ...prev, bridge: superchainBridgeMessageId }));
                } else if (stargateQuote) {
                    setStargateBridgeMessageId(stargateBridgeMessageId);
                    setTransactionHashes((prev) => ({ ...prev, bridge: receipt.transactionHash }));
                } else if (orbiterQuote) {
                    setTransactionHashes((prev) => ({ ...prev, bridge: receipt.transactionHash }));
                }
                updateTransactionStep({ id: "bridge", status: "processing" });
            } else if (submittedTransactionType.type === "SWAP") {
                toast({
                    title: "Swap Complete",
                    description: "Your swap has been completed successfully",
                    variant: "default",
                });
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt]);

    useEffect(() => {
        if (!submittedTransactionType || !bridgeRemoteTransactionHash) return;

        if (
            (submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "SWAP_BRIDGE") &&
            bridgeRemoteTransactionHash
        ) {
            updateTransactionStep({ id: "bridge", status: "success" });
            setTransactionHashes((prev) => ({ ...prev, transferRemote: bridgeRemoteTransactionHash }));
            updateTransactionStep({ id: "transferRemote", status: "success" });

            toast({
                title: submittedTransactionType.type === "BRIDGE" ? "Bridge Complete" : "Transaction Complete",
                description:
                    submittedTransactionType.type === "BRIDGE"
                        ? "Your bridge has been completed successfully"
                        : "Your transaction has been completed successfully",
                variant: "default",
            });
        }

        if (submittedTransactionType.type === "BRIDGE_SWAP") {
            if (bridgeRemoteTransactionHash) {
                updateTransactionStep({ id: "bridge", status: "success" });
            }

            if (swapRemoteTransactionHash) {
                updateTransactionStep({ id: "swap", status: "success" });
                setTransactionHashes((prev) => ({ ...prev, transferRemote: swapRemoteTransactionHash }));
                updateTransactionStep({ id: "transferRemote", status: "success" });
            }
            if (bridgeRemoteTransactionHash && swapRemoteTransactionHash) {
                toast({
                    title: "Transaction Complete",
                    description: "Your transaction has been completed successfully",
                    variant: "default",
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bridgeRemoteTransactionHash, swapRemoteTransactionHash]);

    const importToken = (currency: Currency) => {
        if (!chainId || !currency.chainId) return;

        const asset = {
            type: "ERC20" as const,
            options: {
                address: getUniswapV4Address(currency),
                symbol: currency.symbol ?? "",
                decimals: currency.decimals,
                image: currency.logoURI ?? "",
            },
        };

        if (chainId !== currency.chainId) {
            switchChain(
                { chainId: currency.chainId },
                {
                    onSuccess: () => {
                        watchAsset(asset);
                    },
                    onError: (err) => {
                        console.error("Failed to switch chain", err);
                    },
                },
            );
        } else {
            watchAsset(asset);
        }
    };

    const setMaxToken = (
        currency: Currency,
        tokenBalance: bigint,
        transactionTypeType: TransactionType["type"] | null,
    ) => {
        const decimals = currency.decimals;

        let max = tokenBalance;
        if (
            !currency.isNative ||
            !transactionTypeType ||
            !(
                transactionTypeType === "BRIDGE" ||
                transactionTypeType === "BRIDGE_SWAP" ||
                (currencyIn &&
                    currencyOut &&
                    currencyIn.chainId in STARGATE_POOL_NATIVE &&
                    currencyOut.chainId in STARGATE_POOL_NATIVE)
            )
        ) {
            setTokenInAmountInput(formatUnits(max, decimals));
            return;
        }

        const unit = 10_000n;
        const mod = max % unit;

        const maxOrbiterChainId = 999;
        const orbiterChainId: number = chainIdToOrbiterChainId[currencyOut?.chainId ?? 0] ?? maxOrbiterChainId;
        const code = 9000n + BigInt(orbiterChainId);

        max = mod > code ? (max / unit) * unit : (max / unit - 1n) * unit;

        setTokenInAmountInput(formatUnits(max, decimals));
    };

    return (
        <div className={cn("max-w-md px-2", className)}>
            {showSettings && (
                <div className="flex items-center justify-end mb-4">
                    <SettingsDialog isEmbedded={isEmbedded} />
                </div>
            )}
            <Card className="w-full backdrop-blur-sm shadow-xl">
                <CardContent className="p-2 space-y-2">
                    <div className="space-y-2">
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tokenInAmountInput}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (Number(value) >= 0) {
                                            setTokenInAmountInput(value);
                                        }
                                    }}
                                    type="number"
                                    className={cn(
                                        "border-0 bg-transparent text-3xl font-semibold",
                                        "ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                        "hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors",
                                    )}
                                    placeholder="0"
                                    disabled={!currencyIn}
                                />
                                {currencyIn && chainId && !currencyIn.isNative && (
                                    <button
                                        onClick={() => importToken(currencyIn)}
                                        className="flex items-center gap-1 text-sm"
                                        type="button"
                                    >
                                        <Wallet size={20} /> +
                                    </button>
                                )}
                                <TokenSelector selectingTokenIn={true} isEmbedded={isEmbedded} />
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div>{!!tokenInUsdValue && <span>≈ ${tokenInUsdValue.toFixed(2)}</span>}</div>
                                <div className="space-x-2">
                                    <span>Balance: {tokenInBalanceFormatted}</span>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-xs"
                                        disabled={!tokenInBalance}
                                        onClick={() =>
                                            setMaxToken(currencyIn!, tokenInBalance!, transactionType?.type ?? null)
                                        }
                                    >
                                        Max
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center relative z-10">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-8 w-8 border-2 shadow-lg hover:scale-105"
                                onClick={swapInvert}
                                disabled={!currencyIn || !currencyOut}
                            >
                                <ArrowUpDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">To</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={amountOut}
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
                                              : "0"
                                    }
                                    disabled={true}
                                />
                                {currencyOut && chainId && !currencyOut.isNative && (
                                    <button
                                        onClick={() => importToken(currencyOut)}
                                        className="flex items-center gap-1 text-xs"
                                        type="button"
                                    >
                                        <Wallet size={20} /> +
                                    </button>
                                )}
                                <TokenSelector isEmbedded={isEmbedded} />
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div>{!!tokenOutUsdValue && <span>≈ ${tokenOutUsdValue.toFixed(2)}</span>}</div>
                                <div className="space-x-1 align-right">
                                    <span>Balance: {tokenOutBalanceFormatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        disabled={isDisabledStep(swapStep)}
                        className="w-full h-10 text-base rounded-lg shadow-lg transition-all"
                        onClick={() => handleSwapSteps()}
                    >
                        {getSwapStepMessage(swapStep, transactionType)}
                    </Button>
                </CardContent>
            </Card>
            {showTransactionFlow && transactionType && <TransactionFlow transaction={transactionType} />}
            <TransactionStatusModal
                isOpen={transactionModalOpen}
                onOpenChange={setTransactionModalOpen}
                steps={transactionSteps}
                currentStepId={currentTransactionStepId}
                hashes={transactionHashes}
                chains={{
                    source: chainIn ?? undefined,
                    destination: chainOut ?? undefined,
                }}
                networkType={networkType}
                isEmbedded={isEmbedded}
            />
        </div>
    );
}
