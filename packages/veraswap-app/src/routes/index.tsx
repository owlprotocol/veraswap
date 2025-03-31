import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowUpDown, Wallet, Wallet2 } from "lucide-react";
import {
    useAccount,
    useReadContract,
    useSwitchChain,
    useWatchContractEvent,
    useWriteContract,
    useWatchAsset,
} from "wagmi";
import {
    getSwapAndHyperlaneSweepBridgeTransaction,
    getSwapExactInExecuteData,
    getHyperlaneMessageIdFromReceipt,
    getSwapAndSuperchainBridgeTransaction,
    getSuperchainMessageIdFromReceipt,
    getTransaction,
    TransactionParams,
    HypERC20Token,
    HypERC20CollateralToken,
    Token,
} from "@owlprotocol/veraswap-sdk";
import { Address, encodeFunctionData, formatUnits, Hex, zeroAddress } from "viem";
import { IAllowanceTransfer, IERC20 } from "@owlprotocol/veraswap-sdk/artifacts";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { ProcessId } from "@owlprotocol/contracts-hyperlane/artifacts/IMailbox";
import { RelayedMessage } from "@owlprotocol/veraswap-sdk/artifacts/IL2ToL2CrossDomainMessenger";
import {
    MAX_UINT_160,
    MAX_UINT_256,
    MAX_UINT_48,
    PERMIT2_ADDRESS,
    UNISWAP_CONTRACTS,
} from "@owlprotocol/veraswap-sdk/constants";
import {
    hyperlaneGasPaymentAtom,
    quoteInAtom,
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
    transactionModalOpenAtom,
    transactionStepsAtom,
    currentTransactionStepIdAtom,
    transactionHashesAtom,
    updateTransactionStepAtom,
    initializeTransactionStepsAtom,
    waitForReceiptQueryAtom,
    messageIdAtom,
    remoteTransactionHashAtom,
    transactionTypeAtom,
    hyperlaneMailboxChainOut,
    chainsTypeAtom,
    getSwapStepMessage,
} from "../atoms/index.js";
import { Button } from "@/components/ui/button.js";
import { Card, CardContent } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import { cn } from "@/lib/utils.js";
import { useToast } from "@/components/ui/use-toast.js";
import { MainnetTestnetButtons } from "@/components/MainnetTestnetButtons.js";
import { TransactionStatusModal } from "@/components/TransactionStatusModal.js";
import { isUserRegistered as isUserRegisteredAbi } from "@/abis/isUserRegistered.js";
import { registerReferrals } from "@/abis/registerReferrals.js";
import { TokenSelector } from "@/components/token-selector.js";
import { chains } from "@/config.js";

export const Route = createFileRoute("/")({
    validateSearch: z.object({
        type: z.enum(["mainnet", "testnet", "local"]).optional(),
        tokenIn: z.string().optional(),
        chainIdIn: z.coerce.number().optional(),
        tokenOut: z.string().optional(),
        chainIdOut: z.coerce.number().optional(),
    }),
    component: Index,
});

function Index() {
    const { address: walletAddress } = useAccount();

    const { watchAsset } = useWatchAsset();

    const tokenIn = useAtomValue(tokenInAtom);
    const tokenOut = useAtomValue(tokenOutAtom);

    const chainIn = chains.find((c) => c.id === tokenIn?.chainId);
    const chainOut = chains.find((c) => c.id === tokenOut?.chainId);

    const tokenInAmount = useAtomValue(tokenInAmountAtom);
    const { data: tokenInBalance } = useAtomValue(tokenInBalanceQueryAtom);

    const { data: tokenOutBalance } = useAtomValue(tokenOutBalanceQueryAtom);

    const [messageId, setMessageId] = useAtom(messageIdAtom);

    const { data: bridgePayment } = useAtomValue(hyperlaneGasPaymentAtom);

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

    const hyperlaneMailboxAddress = useAtomValue(hyperlaneMailboxChainOut);

    const { toast } = useToast();

    const [{ data: receipt }] = useAtom(waitForReceiptQueryAtom);

    const tokenInBalanceFormatted =
        tokenInBalance != undefined ? `${formatUnits(tokenInBalance, tokenIn!.decimals)} ${tokenIn!.symbol}` : "-";
    const tokenOutBalanceFormatted =
        tokenOutBalance != undefined ? `${formatUnits(tokenOutBalance, tokenOut!.decimals)} ${tokenOut!.symbol}` : "-";

    const [{ mutate: sendTransaction, isPending: transactionIsPending }] = useAtom(sendTransactionMutationAtom);

    const { writeContract: writeContractRegisterUser, data: registerUserHash } = useWriteContract();
    if (registerUserHash) console.log(`Successfully registered user with hash: ${registerUserHash}`);

    const networkType = useAtomValue(chainsTypeAtom);

    const [remoteTransactionHash, setRemoteTransactionHash] = useAtom(remoteTransactionHashAtom);

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

    /*
    const { switchChain } = useSwitchChain();
    useEffect(() => {
        if (!chainIn) return;
        switchChain({ chainId: chainIn.id });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chainIn]);

    useEffect(() => {
        if (!walletAddress) return;
        if (!chainIn) return;

        if (import.meta.env.MODE === "development") {
            console.log(
                "would be dusting: ",
                `https://veraswap-test-duster.vercel.app/api/${chainIn.id}/${walletAddress}`,
            );
            return;
        }

        fetch(`https://veraswap-test-duster.vercel.app/api/${chainIn.id}/${walletAddress}`, { method: "POST" });
    }, [walletAddress, chainIn?.id, chainIn]);
    */

    useWatchContractEvent({
        abi: [ProcessId],
        eventName: "ProcessId",
        chainId: tokenOut?.chainId ?? 0,
        address: hyperlaneMailboxAddress ?? zeroAddress,
        args: { messageId: messageId ?? "0x" },
        enabled: !!tokenOut && !!messageId && !!hyperlaneMailboxAddress,
        strict: true,
        onLogs: (logs) => {
            setRemoteTransactionHash(logs[0].transactionHash);
        },
    });

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

        if (swapStep === SwapStep.APPROVE_PERMIT2_UNISWAP_ROUTER) {
            sendTransaction({
                to: PERMIT2_ADDRESS,
                chainId: tokenIn!.chainId,
                data: encodeFunctionData({
                    abi: IAllowanceTransfer.abi,
                    functionName: "approve",
                    args: [
                        tokenIn!.address,
                        UNISWAP_CONTRACTS[tokenIn!.chainId].universalRouter,
                        MAX_UINT_160,
                        MAX_UINT_48,
                    ],
                }),
            });
            return;
        }

        if (swapStep === SwapStep.APPROVE_BRIDGE) {
            sendTransaction({
                to: (tokenIn as HypERC20CollateralToken)!.collateralAddress,
                chainId: tokenIn!.chainId,
                data: encodeFunctionData({
                    abi: IERC20.abi,
                    functionName: "approve",
                    args: [tokenIn!.address, MAX_UINT_256],
                }),
            });
            return;
        }

        if (swapStep === SwapStep.EXECUTE_SWAP) {
            if (!transactionType) return;

            const amountOutMinimum = transactionType.type === "BRIDGE" ? null : quoterData![0];

            initializeTransactionSteps(transactionType);

            const transaction = getTransaction({
                ...transactionType,
                amountIn: tokenInAmount,
                amountOutMinimum,
                walletAddress,
                bridgePayment,
            } as TransactionParams);

            if (!transaction) {
                toast({
                    title: "Transaction Failed",
                    description: "Your transaction has failed. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            sendTransaction(
                { chainId: tokenIn!.chainId, ...transaction },
                {
                    onSuccess: (hash) => {
                        if (transactionType!.type === "BRIDGE" || transactionType!.type === "BRIDGE_SWAP") {
                            setTransactionHashes((prev) => ({ ...prev, bridge: hash }));
                            updateTransactionStep({ id: "bridge", status: "processing" });
                            return;
                        }

                        setTransactionHashes((prev) => ({ ...prev, swap: hash }));
                        updateTransactionStep({ id: "swap", status: "processing" });
                    },
                    onError: () => {
                        if (transactionType!.type === "BRIDGE" || transactionType!.type === "BRIDGE_SWAP") {
                            updateTransactionStep({ id: "bridge", status: "error" });
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
        if (!receipt) return;

        if (receipt.status === "reverted") {
            if (transactionType?.type === "BRIDGE" || transactionType?.type === "BRIDGE_SWAP") {
                updateTransactionStep({ id: "bridge", status: "error" });
            } else {
                updateTransactionStep({ id: "swap", status: "error" });
            }
            toast({
                title: "Transaction Failed",
                description: "Your transaction has failed. Please try again.",
                variant: "destructive",
            });
            return;
        }

        if (transactionType?.type === "BRIDGE") return;

        updateTransactionStep({ id: "swap", status: "success" });

        if (transactionType?.type !== "SWAP_BRIDGE") {
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
    }, [receipt]);

    useEffect(() => {
        if (!receipt) return;
        if (receipt.status === "reverted") return;
        if (!(transactionType?.type === "SWAP_BRIDGE" || transactionType?.type === "BRIDGE")) return;
        const messageId = getHyperlaneMessageIdFromReceipt(receipt);

        setMessageId(messageId);
        setTransactionHashes((prev) => ({ ...prev, bridge: messageId }));
        updateTransactionStep({ id: "bridge", status: "processing" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receipt, networkType]);

    useEffect(() => {
        if (!remoteTransactionHash) return;
        if (!(transactionType?.type === "SWAP_BRIDGE" || transactionType?.type === "BRIDGE")) return;

        updateTransactionStep({ id: "bridge", status: "success" });
        updateTransactionStep({ id: "transfer", status: "success" });
        setTransactionHashes((prev) => ({ ...prev, transfer: remoteTransactionHash }));

        if (transactionType.type === "BRIDGE") {
            toast({
                title: "Bridge Complete",
                description: "Your bridge has been completed successfully",
                variant: "default",
            });
            return;
        }

        toast({
            title: "Transaction Complete",
            description: "Your swap and bridge has been completed successfully",
            variant: "default",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteTransactionHash]);

    const importToken = (token: Token) => {
        watchAsset({
            type: "ERC20",
            options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
            },
        });
    };

    return (
        <div className="max-w-xl mx-auto px-4">
            <MainnetTestnetButtons />
            <Card className="w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
                <CardContent className="p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                            <div className="mb-2 flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
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
                                {tokenIn && (
                                    <button
                                        onClick={() => importToken(tokenIn)}
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
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={
                                        transactionType?.type === "BRIDGE"
                                            ? formatUnits(tokenInAmount ?? 0n, tokenIn?.decimals ?? 18)
                                            : quoterData
                                              ? formatUnits(quoterData[0], tokenOut?.decimals ?? 18)
                                              : ""
                                    }
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
                                {tokenOut && (
                                    <button
                                        onClick={() => importToken(tokenOut)}
                                        className="flex items-center gap-1 text-sm"
                                        type="button"
                                    >
                                        <Wallet size={20} /> +
                                    </button>
                                )}
                                <TokenSelector />
                            </div>
                            <div className="mt-2 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                                {" "}
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
                                swapStep === SwapStep.APPROVE_PERMIT2_UNISWAP_ROUTER ||
                                swapStep === SwapStep.APPROVE_BRIDGE ||
                                swapStep === SwapStep.EXECUTE_SWAP ||
                                swapStep === SwapStep.NOT_SUPPORTED
                            )
                        }
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
