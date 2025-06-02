import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowUpDown, Wallet } from "lucide-react";
import { useAccount, useSwitchChain, useWatchContractEvent, useWatchAsset, useWatchBlocks } from "wagmi";
import { getBlock } from "@wagmi/core";
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
    getSuperchainMessageIdFromReceipt,
} from "@owlprotocol/veraswap-sdk";
import { encodeFunctionData, formatUnits, zeroAddress } from "viem";
import { IERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import {
    HYPERLANE_CONTRACTS,
    LOCAL_HYPERLANE_CONTRACTS,
    LOCAL_KERNEL_CONTRACTS,
    MAX_UINT_256,
    PERMIT2_ADDRESS,
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
    orbiterRoutersEndpointContractsAtom,
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
    orbiterRoutersEndpointsAtom,
    slippageToleranceAtom,
    tokenInUsdValueAtom,
    tokenOutUsdValueAtom,
} from "../atoms/index.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import { useToast } from "@/components/ui/use-toast.js";
import { MainnetTestnetButtons } from "@/components/MainnetTestnetButtons.js";
import { TransactionStatusModal } from "@/components/TransactionStatusModal.js";
import { TokenSelector } from "@/components/token-selector.js";
import { config } from "@/config.js";
import { Transfer } from "@/abis/events.js";
import { useDustAccount, useWatchHyperlaneMessageProcessed } from "@/hooks/index.js";
import { useWatchSuperchainMessageProcessed } from "@/hooks/useWatchSuperchainMessageProcessed.js";
import { TransactionFlow } from "@/components/transaction-flow.js";
import { SettingsDialog } from "@/components/settings-dialog.js";

export const Route = createFileRoute("/")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        currencyIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        currencyOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
    }),
    component: Index,
});

function Index() {
    const queryClient = useQueryClient();
    const { address: walletAddress, chainId } = useAccount();
    const { openConnectModal } = useConnectModal();

    const { watchAsset } = useWatchAsset();

    useAtomValue(prefetchQueriesAtom);

    const currencyIn = useAtomValue(currencyInAtom);
    const currencyOut = useAtomValue(currencyOutAtom);

    const chainIn = useAtomValue(chainInAtom);
    const chainOut = useAtomValue(chainOutAtom);

    const orbiterRoutersEndpointContracts = useAtomValue(orbiterRoutersEndpointContractsAtom);
    const orbiterRoutersEndpoints = useAtomValue(orbiterRoutersEndpointsAtom);

    const tokenInAmount = useAtomValue(tokenInAmountAtom);
    const { data: tokenInBalance } = useAtomValue(tokenInAccountBalanceQueryAtom);

    const { data: tokenOutBalance } = useAtomValue(tokenOutAccountBalanceQueryAtom);
    const amountOut = useAtomValue(amountOutAtom);

    const [swapMessageId, setSwapMessageId] = useAtom(swapMessageIdAtom);
    const [bridgeMessageId, setBridgeMessageId] = useAtom(bridgeMessageIdAtom);
    const [superchainBridgeMessageId, setSuperchainBridgeMessageId] = useAtom(superchainBridgeMessageIdAtom);

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
    // const [transactionStep, updateTransactionStep] = useAtom(updateTransactionStepAtom);
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

    // const { writeContract: writeContractRegisterUser, data: registerUserHash } = useWriteContract();
    // if (registerUserHash) console.log(`Successfully registered user with hash: ${registerUserHash}`);

    const networkType = useAtomValue(chainsTypeAtom);

    const [bridgeRemoteTransactionHash, setBridgeRemoteTransactionHash] = useAtom(bridgeRemoteTransactionHashAtom);
    const [swapRemoteTransactionHash, setSwapRemoteTransactionHash] = useAtom(swapRemoteTransactionHashAtom);

    const { switchChain } = useSwitchChain();

    const { data: orbiterQuote } = useAtomValue(orbiterQuoteAtom);

    const slippageTolerance = useAtomValue(slippageToleranceAtom);

    const tokenInUsdValue = useAtomValue(tokenInUsdValueAtom);
    const tokenOutUsdValue = useAtomValue(tokenOutUsdValueAtom);

    /*
    //DISABLE DIVVY
    const { data: isUserRegisteredArr } = useReadContract({
        abi: [isUserRegisteredAbi],
        chainId: chainIn?.id ?? 0,
        address: DIVVI_BASE_REGISTRY,
        functionName: "isUserRegistered",
        args: [walletAddress ?? zeroAddress, [stringToHex("beefy", { size: 32 })]],
        query: { enabled: chainIn?.id === base.id && !!walletAddress && swapType === SwapType.Swap },
    });
    */

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

    useWatchContractEvent({
        abi: [Transfer],
        eventName: "Transfer",
        chainId: chainOut?.id ?? 0,
        address: orbiterRoutersEndpointContracts[currencyOut?.chainId ?? 0] ?? zeroAddress,
        args: { to: (transactionType?.type === "BRIDGE_SWAP" ? kernelAddressChainOut : walletAddress) ?? zeroAddress },
        enabled:
            !!chainOut &&
            !!orbiterQuote &&
            !!orbiterRoutersEndpointContracts[chainOut?.id ?? 0] &&
            !!hash &&
            !submittedTransactionType?.withSuperchain,
        strict: true,
        onLogs: (logs) => {
            setBridgeRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    useWatchBlocks({
        chainId: chainOut?.id ?? 0,
        enabled:
            !!chainOut &&
            !!orbiterQuote &&
            !!hash &&
            !bridgeRemoteTransactionHash &&
            !!orbiterRoutersEndpoints[chainOut?.id ?? 0],
        onBlock(block) {
            const from = orbiterRoutersEndpoints[chainOut?.id ?? 0] ?? zeroAddress;
            // Assume bridging only to same address
            const to = walletAddress?.toLowerCase() ?? zeroAddress;

            // TODO: Keep track of estimated value out and check that transaction value approximately matches to avoid issue if the address is receiving two bridging transactions from orbiter somewhat simultaneously
            // TODO: use includeTransactions in useWatchBlocks when we figure out why block.transactions is undefined
            // NOTE: This is a workaround for the issue with useWatchBlocks not returning transactions, even without includeTransactions
            getBlock(config, {
                blockNumber: block.number,
                includeTransactions: true,
                chainId: currencyOut!.chainId,
            }).then((block) => {
                const tx = block.transactions.find((tx) => tx.from === from && tx.to === to);
                if (tx) {
                    setBridgeRemoteTransactionHash(tx.hash);
                }
            });
        },
    });

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
            // TODO: use a different sendTransaction call for this to track a different receipt
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
            // NOTE: should be inferred from the top level check of handleSwapSteps
            if (!transactionType) return;

            // const amountOutMinimum = transactionType.type === "BRIDGE" ? null : quoterData?.amountOut;
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
                            queryClient,
                            wagmiConfig: config,
                            initData: kernelSmartAccountInitData,
                        } as TransactionParams & TransactionTypeBridgeSwap)
                      : ({
                            ...transactionType,
                            amountIn: tokenInAmount!,
                            orbiterQuote,
                            amountOutMinimum: adjustedAmountOutMinimum!,
                            walletAddress,
                            bridgePayment,
                            queryClient,
                            wagmiConfig: config,
                        } as TransactionParams & (TransactionTypeSwap | TransactionTypeSwapBridge));

            const inChainId = currencyIn.chainId;
            const outChainId = currencyOut!.chainId;

            //TODO: Add additional checks if registry not loaded yet

            // Use IGP from registry or from local contracts
            const interchainGasPaymasterIn =
                hyperlaneRegistry!.addresses[inChainId]?.interchainGasPaymaster ??
                LOCAL_HYPERLANE_CONTRACTS[inChainId]?.mockInterchainGasPaymaster;

            const interchainGasPaymasterOut =
                hyperlaneRegistry!.addresses[outChainId]?.interchainGasPaymaster ??
                LOCAL_HYPERLANE_CONTRACTS[outChainId]?.mockInterchainGasPaymaster;

            // Use custom constant that stores non-registry hyperlane related contracts
            // TODO: remove fallback
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
                },
                [outChainId]: {
                    universalRouter: UNISWAP_CONTRACTS[outChainId]?.universalRouter ?? zeroAddress,
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: erc7579RouterOut,
                    interchainGasPaymaster: interchainGasPaymasterOut,
                },
            });
            // Switch back to chainIn (in case chain was changed when requesting signature)
            if (currencyIn) {
                // Kinda weird to check this here
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

            // Make a copy the next to awaitable function call from racing
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
                        // TODO: Do smarter invalidation, this currently invalidates ALL queries
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
                        // TODO: Do smarter invalidation, this currently invalidates ALL queries
                        queryClient.invalidateQueries();
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
        const superchainBridgeMessageId = getSuperchainMessageIdFromReceipt(receipt, chainIn!.id);

        if (
            (submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "BRIDGE_SWAP") &&
            superchainBridgeMessageId
        ) {
            updateTransactionStep({ id: "sendOrigin", status: "success" });

            setSuperchainBridgeMessageId(superchainBridgeMessageId);
            setTransactionHashes((prev) => ({ ...prev, bridge: superchainBridgeMessageId }));
            updateTransactionStep({ id: "bridge", status: "processing" });

            const hyperlaneSwapMessageId = hyperlaneMessageIds[0];

            // TODO: change this to handle either hyperlane or superchain remote chain execution
            if (submittedTransactionType.type === "BRIDGE_SWAP" && hyperlaneSwapMessageId) {
                setSwapMessageId(hyperlaneSwapMessageId);
                setTransactionHashes((prev) => ({ ...prev, swap: hyperlaneSwapMessageId }));
                updateTransactionStep({ id: "swap", status: "processing" });
            }
        }

        const hyperlaneBridgeMessageId = hyperlaneMessageIds[0];
        const hyperlaneSwapMessageId = !orbiterQuote ? hyperlaneMessageIds[1] : hyperlaneMessageIds[0];

        if (submittedTransactionType.type === "BRIDGE" || submittedTransactionType.type === "BRIDGE_SWAP") {
            updateTransactionStep({ id: "sendOrigin", status: "success" });

            if (hyperlaneBridgeMessageId && !orbiterQuote) {
                setBridgeMessageId(hyperlaneBridgeMessageId);
                setTransactionHashes((prev) => ({ ...prev, bridge: hyperlaneBridgeMessageId }));
                updateTransactionStep({ id: "bridge", status: "processing" });
            } else if (orbiterQuote) {
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

                if (swapRemoteTransactionHash) {
                    updateTransactionStep({ id: "swap", status: "success" });
                    setTransactionHashes((prev) => ({ ...prev, transferRemote: swapRemoteTransactionHash }));
                    updateTransactionStep({ id: "transferRemote", status: "success" });
                }
            }
            toast({
                title: "Transaction Complete",
                description: "Your transaction has been completed successfully",
                variant: "default",
            });
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

    // TODO: clean this up more, but not urgent. Should we wait until token out is specified to handle max?
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
            !(transactionTypeType === "BRIDGE" || transactionTypeType === "BRIDGE_SWAP")
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
        <div className="max-w-md mx-auto px-2">
            <MainnetTestnetButtons />
            <div className="flex items-center justify-end">
                <SettingsDialog />
            </div>
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
                                <TokenSelector selectingTokenIn={true} />
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
                                <TokenSelector />
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
            {transactionType && <TransactionFlow transaction={transactionType} />}
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
            />
        </div>
    );
}
