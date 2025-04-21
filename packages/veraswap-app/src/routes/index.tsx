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
    isMultichainToken,
    getUniswapV4Address,
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
import {
    quoteInAtom,
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
    orbiterParamsAtom,
    orbiterAmountOutAtom,
    orbiterRouterAtom,
    orbiterRoutersEndpointContractsAtom,
    kernelInitDataAtom,
    isDisabledStep,
    prefetchQueriesAtom,
    tokenRouterQuoteGasPaymentQueryAtom,
    currencyInAtom,
    currencyOutAtom,
} from "../atoms/index.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import { useToast } from "@/components/ui/use-toast.js";
import { MainnetTestnetButtons } from "@/components/MainnetTestnetButtons.js";
import { TransactionStatusModal } from "@/components/TransactionStatusModal.js";
import { TokenSelector } from "@/components/token-selector.js";
import { chains, config } from "@/config.js";
import { Transfer } from "@/abis/events.js";
import { useDustAccount, useWatchMessageProcessed } from "@/hooks/index.js";

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

    const { watchAsset } = useWatchAsset();

    useAtomValue(prefetchQueriesAtom);

    const currencyIn = useAtomValue(currencyInAtom);
    const currencyOut = useAtomValue(currencyOutAtom);

    const chainIn = chains.find((c) => c.id === currencyIn?.chainId);
    const chainOut = chains.find((c) => c.id === currencyOut?.chainId);

    const orbiterRoutersEndpointContracts = useAtomValue(orbiterRoutersEndpointContractsAtom);

    const tokenInAmount = useAtomValue(tokenInAmountAtom);
    const { data: tokenInBalance } = useAtomValue(tokenInAccountBalanceQueryAtom);

    const { data: tokenOutBalance } = useAtomValue(tokenOutAccountBalanceQueryAtom);

    const [swapMessageId, setSwapMessageId] = useAtom(swapMessageIdAtom);
    const [bridgeMessageId, setBridgeMessageId] = useAtom(bridgeMessageIdAtom);

    const { data: bridgePayment } = useAtomValue(tokenRouterQuoteGasPaymentQueryAtom);

    const { data: kernelSmartAccountInitData } = useAtomValue(kernelInitDataAtom);
    const { data: quoterData, error: quoterError, isLoading: isQuoterLoading } = useAtomValue(quoteInAtom);

    const [tokenInAmountInput, setTokenInAmountInput] = useAtom(tokenInAmountInputAtom);
    const [, swapInvert] = useAtom(swapInvertAtom);
    const swapStep = useAtomValue(swapStepAtom);

    const transactionType = useAtomValue(transactionTypeAtom);

    const [transactionModalOpen, setTransactionModalOpen] = useAtom(transactionModalOpenAtom);
    const [transactionSteps] = useAtom(transactionStepsAtom);
    const [currentTransactionStepId] = useAtom(currentTransactionStepIdAtom);
    const [transactionHashes, setTransactionHashes] = useAtom(transactionHashesAtom);
    // const [transactionStep, updateTransactionStep] = useAtom(updateTransactionStepAtom);
    const [_, updateTransactionStep] = useAtom(updateTransactionStepAtom);
    const [, initializeTransactionSteps] = useAtom(initializeTransactionStepsAtom);

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

    const orbiterParams = useAtomValue(orbiterParamsAtom);
    const orbiterRouter = useAtomValue(orbiterRouterAtom);
    const orbiterAmountOut = useAtomValue(orbiterAmountOutAtom);

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

    const amountOut =
        transactionType?.type === "BRIDGE"
            ? orbiterRouter
                ? formatUnits(orbiterAmountOut ?? 0n, currencyOut?.decimals ?? 18)
                : formatUnits(tokenInAmount ?? 0n, currencyOut?.decimals ?? 18)
            : quoterData
              ? formatUnits(quoterData[0], currencyOut?.decimals ?? 18)
              : "";

    useDustAccount(walletAddress);

    useWatchMessageProcessed(bridgeMessageId, currencyOut, hyperlaneMailboxAddress, setBridgeRemoteTransactionHash);
    useWatchMessageProcessed(swapMessageId, currencyOut, hyperlaneMailboxAddress, setSwapRemoteTransactionHash);

    useWatchContractEvent({
        abi: [Transfer],
        eventName: "Transfer",
        chainId: currencyOut?.chainId ?? 0,
        address: orbiterRoutersEndpointContracts[currencyOut?.chainId ?? 0] ?? zeroAddress,
        args: { to: walletAddress ?? zeroAddress },
        enabled:
            !!currencyOut && !!orbiterParams && !!orbiterRoutersEndpointContracts[currencyOut?.chainId ?? 0] && !!hash,
        strict: true,
        onLogs: (logs) => {
            setBridgeRemoteTransactionHash(logs[0].transactionHash);
        },
    });

    useWatchBlocks({
        chainId: currencyOut?.chainId ?? 0,
        enabled: !!currencyOut && !!orbiterParams && !!hash,
        onBlock(block) {
            const from = orbiterParams?.endpoint.toLowerCase() ?? zeroAddress;
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

        if (swapStep === SwapStep.APPROVE_PERMIT2) {
            // TODO: use a different sendTransaction call for this to track a different receipt
            sendTransaction({
                to:
                    isMultichainToken(currencyIn) && currencyIn.hyperlaneAddress
                        ? currencyIn.hyperlaneAddress
                        : getUniswapV4Address(currencyIn),
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

            // const amountOutMinimum = transactionType.type === "BRIDGE" ? null : quoterData![0];
            const amountOutMinimum = quoterData?.[0] ?? null;
            if (transactionType.type !== "BRIDGE" && !amountOutMinimum) {
                throw new Error("amountOutMinimum is required for this transaction type");
            }

            initializeTransactionSteps(transactionType);

            // We split the params into two to keep the types clean
            const transactionParams =
                transactionType.type === "BRIDGE"
                    ? ({
                          ...transactionType,
                          amountIn: tokenInAmount!,
                          walletAddress,
                          bridgePayment: bridgePayment,
                          orbiterParams,
                          queryClient: queryClient,
                          wagmiConfig: config,
                          initData: kernelSmartAccountInitData,
                      } as TransactionParams & TransactionTypeBridge)
                    : transactionType.type === "BRIDGE_SWAP"
                      ? ({
                            ...transactionType,
                            amountIn: tokenInAmount!,
                            amountOutMinimum,
                            walletAddress,
                            orbiterAmountOut,
                            orbiterParams,
                            queryClient: queryClient,
                            wagmiConfig: config,
                            initData: kernelSmartAccountInitData,
                        } as TransactionParams & TransactionTypeBridgeSwap)
                      : ({
                            ...transactionType,
                            amountIn: tokenInAmount!,
                            amountOutMinimum: amountOutMinimum!,
                            walletAddress,
                            bridgePayment: bridgePayment,
                            queryClient: queryClient,
                            wagmiConfig: config,
                        } as TransactionParams & (TransactionTypeSwap | TransactionTypeSwapBridge));

            const inChainId = currencyIn!.chainId;
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
            const erc7579RouterIn = HYPERLANE_CONTRACTS[inChainId].erc7579Router;
            const erc7579RouterOut = HYPERLANE_CONTRACTS[outChainId].erc7579Router;

            const transaction = await getTransaction(transactionParams, {
                [inChainId]: {
                    universalRouter: UNISWAP_CONTRACTS[inChainId]?.universalRouter,
                    execute: LOCAL_KERNEL_CONTRACTS.execute,
                    kernelFactory: LOCAL_KERNEL_CONTRACTS.kernelFactory,
                    ownableSignatureExecutor: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
                    erc7579Router: erc7579RouterIn,
                    interchainGasPaymaster: interchainGasPaymasterIn,
                },
                [outChainId]: {
                    universalRouter: UNISWAP_CONTRACTS[outChainId]?.universalRouter,
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

            sendTransaction(
                { chainId: currencyIn.chainId, ...transaction },
                {
                    onSuccess: (hash) => {
                        if (transactionType!.type === "BRIDGE" || transactionType!.type === "BRIDGE_SWAP") {
                            setTransactionHashes((prev) => ({ ...prev, sendOrigin: hash }));
                            updateTransactionStep({ id: "sendOrigin", status: "processing" });
                            return;
                        }

                        setTransactionHashes((prev) => ({ ...prev, swap: hash }));
                        updateTransactionStep({ id: "swap", status: "processing" });
                    },
                    onError: (error) => {
                        console.log(error);
                        if (transactionType!.type === "BRIDGE" || transactionType!.type === "BRIDGE_SWAP") {
                            updateTransactionStep({ id: "sendOrigin", status: "error" });
                        } else {
                            updateTransactionStep({ id: "swap", status: "error" });
                        }
                        //TODO: show in UI instead
                        toast({
                            title: "Transaction Failed",
                            description: "Your transaction has failed. Please try again.",
                            variant: "destructive",
                        });
                    },
                },
            );
            setTokenInAmountInput("");
        }
    };

    useEffect(() => {
        if (!receipt || !transactionType) return;

        if (receipt.status === "reverted") {
            const failedStep =
                transactionType.type === "BRIDGE" || transactionType.type === "BRIDGE_SWAP" ? "sendOrigin" : "swap";
            updateTransactionStep({ id: failedStep, status: "error" });
            toast({
                title: "Transaction Failed",
                description: "Your transaction has failed. Please try again.",
                variant: "destructive",
            });
            return;
        }

        const [bridge, swap] = getHyperlaneMessageIdsFromReceipt(receipt);

        if (transactionType.type === "BRIDGE" || transactionType.type === "BRIDGE_SWAP") {
            updateTransactionStep({ id: "sendOrigin", status: "success" });

            if (bridge) {
                setBridgeMessageId(bridge);
                setTransactionHashes((prev) => ({ ...prev, bridge }));
                updateTransactionStep({ id: "bridge", status: "processing" });

                if (transactionType.type === "BRIDGE_SWAP" && swap) {
                    setSwapMessageId(swap);
                    setTransactionHashes((prev) => ({ ...prev, swap }));
                    updateTransactionStep({ id: "swap", status: "processing" });
                }
            }
        } else {
            updateTransactionStep({ id: "swap", status: "success" });

            if (bridge) {
                if (transactionType.type === "SWAP_BRIDGE") {
                    setBridgeMessageId(bridge);
                    setTransactionHashes((prev) => ({ ...prev, bridge }));
                    updateTransactionStep({ id: "bridge", status: "processing" });
                }
            } else if (transactionType.type === "SWAP") {
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
        if (!transactionType) return;

        if (
            (transactionType.type === "BRIDGE" || transactionType.type === "SWAP_BRIDGE") &&
            bridgeRemoteTransactionHash
        ) {
            updateTransactionStep({ id: "bridge", status: "success" });
            setTransactionHashes((prev) => ({ ...prev, transferRemote: bridgeRemoteTransactionHash }));
            updateTransactionStep({ id: "transferRemote", status: "success" });

            toast({
                title: transactionType.type === "BRIDGE" ? "Bridge Complete" : "Transaction Complete",
                description:
                    transactionType.type === "BRIDGE"
                        ? "Your bridge has been completed successfully"
                        : "Your transaction has been completed successfully",
                variant: "default",
            });
        }

        if (transactionType.type === "BRIDGE_SWAP") {
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
        <div className="max-w-xl mx-auto px-4">
            <MainnetTestnetButtons />
            <Card className="w-full backdrop-blur-sm shadow-xl">
                <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="mb-2 flex justify-between items-center">
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
                                        "border-0 bg-transparent text-3xl font-semibold p-0",
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
                            <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                                <div className="space-x-2">
                                    <span>Balance: {tokenInBalanceFormatted}</span>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-sm"
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

                        <div className="flex justify-center -my-2 relative z-10">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full h-12 w-12 bg-white dark:bg-gray-700 shadow-lg hover:scale-105 transform transition-all"
                                onClick={swapInvert}
                                disabled={!currencyIn || !currencyOut}
                            >
                                <ArrowUpDown className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="mb-2 flex justify-between items-center">
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
                                        className="flex items-center gap-1 text-sm"
                                        type="button"
                                    >
                                        <Wallet size={20} /> +
                                    </button>
                                )}
                                <TokenSelector />
                            </div>
                            <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                                <div className="space-x-2 align-right">
                                    <span>Balance: {tokenOutBalanceFormatted}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        disabled={isDisabledStep(swapStep)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg rounded-xl shadow-lg transition-all"
                        onClick={() => handleSwapSteps()}
                    >
                        {getSwapStepMessage(swapStep, transactionType)}
                    </Button>
                </CardContent>
            </Card>
            <TransactionStatusModal
                isOpen={transactionModalOpen}
                onOpenChange={setTransactionModalOpen}
                steps={transactionSteps}
                currentStepId={currentTransactionStepId}
                hashes={transactionHashes}
                chains={{
                    source: chainIn,
                    destination: chainOut,
                }}
                networkType={networkType}
            />
        </div>
    );
}
