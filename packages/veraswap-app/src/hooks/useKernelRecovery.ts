import { useAccount } from "wagmi";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { Address, Hex, encodeFunctionData } from "viem";
import { getTransactionReceipt, getBalance, switchChain } from "@wagmi/core";
import { LOCAL_KERNEL_CONTRACTS, encodeCallArgsBatch } from "@owlprotocol/veraswap-sdk";
import { OwnableSignatureExecutor } from "@owlprotocol/veraswap-sdk/artifacts/OwnableSignatureExecutor";
import { transfer as transferAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { config } from "@/config.js";
import { useToast } from "@/components/ui/use-toast.js";

// Interface for recovery transaction data
export interface RecoveryTransactionData {
    to: Address;
    data: Hex;
    value: bigint;
    chainId: number;
}

// Recovery transaction creation function
function createRecoveryTransaction(
    kernelAddress: Address,
    recipientAddress: Address,
    chainId: number,
    nativeAmount?: bigint,
    tokenTransfers?: Array<{
        tokenAddress: Address;
        amount: bigint;
    }>,
): RecoveryTransactionData | null {
    const calls: Array<{ to: Address; data: Hex; value?: bigint }> = [];

    // Add native token transfer if specified
    if (nativeAmount && nativeAmount > 0n) {
        calls.push({
            to: recipientAddress,
            data: "0x" as Hex, // Empty data for native transfer
            value: nativeAmount, // Set the value for this specific call
        });
    }

    // Add token transfers if specified
    if (tokenTransfers) {
        for (const tokenTransfer of tokenTransfers) {
            if (tokenTransfer.amount > 0n) {
                calls.push({
                    to: tokenTransfer.tokenAddress,
                    data: encodeFunctionData({
                        abi: [transferAbi],
                        args: [recipientAddress, tokenTransfer.amount],
                    }),
                });
            }
        }
    }

    if (calls.length === 0) {
        return null;
    }

    const callData = encodeCallArgsBatch(calls);

    // Call the kernel account through the executor
    return {
        to: LOCAL_KERNEL_CONTRACTS.ownableSignatureExecutor,
        data: encodeFunctionData({
            abi: OwnableSignatureExecutor.abi,
            functionName: "executeBatchOnOwnedAccount",
            args: [kernelAddress, callData],
        }),
        value: 0n, // Don't send value to executor, the kernel account will use its own balance
        chainId,
    };
}

export interface RecoveryParams {
    chainId: number;
    kernelAddress: Address;
    nativeAmount?: bigint;
    tokenTransfers?: Array<{
        tokenAddress: Address;
        amount: bigint;
    }>;
}

export interface RecoveryAllParams {
    kernelAccounts: Array<{
        chainId: number;
        kernelAddress: Address;
        nativeAmount?: bigint;
        tokenTransfers?: Array<{
            tokenAddress: Address;
            amount: bigint;
        }>;
    }>;
}

export function useKernelRecovery() {
    const { address: walletAddress } = useAccount();
    const { data: hash, sendTransaction, isPending, error } = useSendTransaction();
    const { data: receipt, isSuccess } = useWaitForTransactionReceipt({ hash });
    const { toast } = useToast();

    const recoverFunds = async (params: RecoveryParams) => {
        const { chainId, kernelAddress, nativeAmount, tokenTransfers } = params;

        if (!walletAddress) {
            toast({
                title: "Error",
                description: "Please connect your wallet first.",
                variant: "destructive",
            });
            return;
        }

        try {
            // Switch to the target chain if needed
            const currentChain = await config.getClient({ chainId }).chain;
            if (!currentChain) {
                toast({
                    title: "Error",
                    description: `Chain ${chainId} not supported.`,
                    variant: "destructive",
                });
                return;
            }

            // Check if we need to switch chains
            const currentChainId = await config.getClient().chain?.id;
            if (currentChainId !== chainId) {
                await switchChain(config, { chainId });

                // Wait a bit for the chain switch to complete
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Check kernel account balance
            const kernelBalance = await getBalance(config, {
                chainId,
                address: kernelAddress,
            });

            if (nativeAmount && kernelBalance.value < nativeAmount) {
                toast({
                    title: "Error",
                    description: `Kernel account has insufficient balance. Has: ${kernelBalance.value.toString()}, Needs: ${nativeAmount.toString()}`,
                    variant: "destructive",
                });
                return;
            }

            // Create the recovery transaction
            const recoveryTx = createRecoveryTransaction(
                kernelAddress,
                walletAddress,
                chainId,
                nativeAmount,
                tokenTransfers,
            );

            if (!recoveryTx) {
                toast({
                    title: "Error",
                    description: "Failed to create recovery transaction.",
                    variant: "destructive",
                });
                return;
            }

            sendTransaction({
                to: recoveryTx.to,
                data: recoveryTx.data,
                value: recoveryTx.value,
                chainId: recoveryTx.chainId,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to recover funds: ${error instanceof Error ? error.message : "Unknown error"}`,
                variant: "destructive",
            });
        }
    };

    const recoverAllFunds = async (params: RecoveryAllParams) => {
        const { kernelAccounts } = params;

        if (!walletAddress) {
            toast({
                title: "Error",
                description: "Please connect your wallet first.",
                variant: "destructive",
            });
            return;
        }

        // Filter out accounts with no funds to recover
        const accountsWithFunds = kernelAccounts.filter((account) => {
            const hasNativeFunds = account.nativeAmount && account.nativeAmount > 0n;
            const hasTokenFunds = account.tokenTransfers && account.tokenTransfers.length > 0;
            return hasNativeFunds || hasTokenFunds;
        });

        if (accountsWithFunds.length === 0) {
            toast({
                title: "No Funds to Recover",
                description: "No stuck funds found across all chains.",
                variant: "default",
            });
            return;
        }

        for (let i = 0; i < accountsWithFunds.length; i++) {
            const account = accountsWithFunds[i];

            try {
                toast({
                    title: "Recovering Funds",
                    description: `Processing chain ${account.chainId} (${i + 1}/${accountsWithFunds.length})`,
                    variant: "default",
                });

                await recoverFunds(account);

                if (hash) {
                    await new Promise((resolve) => {
                        const checkReceipt = async () => {
                            try {
                                const receipt = await getTransactionReceipt(config, { hash });
                                if (receipt) {
                                    resolve(receipt);
                                } else {
                                    setTimeout(checkReceipt, 2000); // Check again in 2 seconds
                                }
                            } catch (error) {
                                setTimeout(checkReceipt, 2000); // Check again in 2 seconds
                            }
                        };
                        checkReceipt();
                    });
                }

                if (i < accountsWithFunds.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            } catch (error) {
                toast({
                    title: "Recovery Error",
                    description: `Failed to recover funds from chain ${account.chainId}: ${error instanceof Error ? error.message : "Unknown error"}`,
                    variant: "destructive",
                });
            }
        }

        toast({
            title: "Recovery Complete",
            description: `Processed ${accountsWithFunds.length} chains. Check your wallet for recovered funds.`,
            variant: "default",
        });
    };

    return {
        recoverFunds,
        recoverAllFunds,
        isPending,
        isSuccess,
        error,
        hash,
        receipt,
    };
}
