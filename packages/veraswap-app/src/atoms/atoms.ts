import { atom, WritableAtom } from "jotai";
import { atomWithMutation, atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { SwapType, getChainNameAndMailbox, VeraSwapToken } from "@owlprotocol/veraswap-sdk";
import { Address, Hash, zeroAddress } from "viem";
import {
    readContractQueryOptions,
    sendTransactionMutationOptions,
    waitForTransactionReceiptQueryOptions,
} from "wagmi/query";
import { getAccount } from "@wagmi/core";
import {
    chainInAtom,
    chainOutAtom,
    tokenInAmountAtom,
    tokenInAtom,
    tokenInBalanceAtom,
    tokenInPermit2AllowanceAtom,
    tokenInUniswapRouterAllowanceAtom,
    tokenOutAtom,
    transactionTypeAtom,
} from "./tokens.js";
import { chainsTypeAtom } from "./chains";
import { config } from "@/config.js";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry.js";
import { quoteGasPayment } from "@/abis/quoteGasPayment.js";
import { TransactionStep } from "@/components/TransactionStatusModal.js";

export const hyperlaneRegistryQueryAtom = atomWithQuery(hyperlaneRegistryOptions);

export enum SwapStep {
    CONNECT_WALLET = "Connect Wallet",
    SELECT_TOKEN = "Select a token",
    SELECT_TOKEN_AMOUNT = "Enter an amount",
    INSUFFICIENT_BALANCE = "Insufficient Balance",
    INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
    APPROVE_PERMIT2 = "Approve Permit2",
    APPROVE_PERMIT2_UNISWAP_ROUTER = "Approve Uniswap Router",
    EXECUTE_SWAP = "Execute Swap",
    PENDING_SIGNATURE = "Waiting for wallet signature...",
    PENDING_TRANSACTION = "Waiting for transaction confirmation...",
    BRIDGING_NOT_SUPPORTED = "Bridging not supported",
}

export const swapStepAtom = atom((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const tokenInBalance = get(tokenInBalanceAtom);
    const tokenInPermit2Allowance = get(tokenInPermit2AllowanceAtom);
    const tokenInUniswapRouterAllowance = get(tokenInUniswapRouterAllowanceAtom);

    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    const receipt = get(waitForReceiptQueryAtom);

    if (account.address === undefined) {
        return SwapStep.CONNECT_WALLET;
    } else if (mutation.isPending) {
        return SwapStep.PENDING_SIGNATURE;
    } else if (hash && hash != receipt.data?.transactionHash) {
        return SwapStep.PENDING_TRANSACTION;
    } else if (tokenIn === null || tokenOut === null) {
        return SwapStep.SELECT_TOKEN;
    } else if (tokenInAmount === null) {
        return SwapStep.SELECT_TOKEN_AMOUNT;
    } else if (tokenInBalance === null || tokenInBalance < tokenInAmount) {
        return SwapStep.INSUFFICIENT_BALANCE;
    } else if (tokenInPermit2Allowance === null || tokenInPermit2Allowance < tokenInAmount) {
        return SwapStep.APPROVE_PERMIT2;
    } else if (tokenInUniswapRouterAllowance === null || tokenInUniswapRouterAllowance < tokenInAmount)
        return SwapStep.APPROVE_PERMIT2_UNISWAP_ROUTER;

    return SwapStep.EXECUTE_SWAP;
});

// Set this atom after sending transaction
export const sendTransactionMutationAtom = atomWithMutation(() => {
    // Compute mutation based on swap step
    return sendTransactionMutationOptions(config);
});
export const waitForReceiptQueryAtom = atomWithQuery((get) => {
    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    return waitForTransactionReceiptQueryOptions(config, { hash });
});

export const hyperlaneGasPaymentAtom = atomWithQuery((get) => {
    const transactionType = get(transactionTypeAtom);

    let chainId: number = 0;
    let address: Address = zeroAddress;
    let chainIdOut: number = 0;

    if (transactionType?.type === "BRIDGE") {
        chainId = transactionType.tokenIn.chainId;
        address = transactionType.tokenIn.address;
        chainIdOut = transactionType.tokenOut.chainId;
    } else if (transactionType?.type === "SWAP_BRIDGE" || transactionType?.type === "BRIDGE_SWAP") {
        chainId = transactionType.bridge.tokenIn.chainId;
        address = transactionType.bridge.tokenIn.address;
        chainIdOut = transactionType.bridge.tokenOut.chainId;
    }

    const enabled = chainId !== 0 && address !== zeroAddress && chainIdOut !== 0;

    return {
        ...readContractQueryOptions(config, {
            chainId,
            address,
            abi: [quoteGasPayment],
            functionName: "quoteGasPayment",
            args: [chainIdOut],
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<bigint, Error>, [], void>;

export const transactionModalOpenAtom = atom<boolean>(false);
export const transactionStepsAtom = atom<TransactionStep[]>([]);
export const currentTransactionStepIdAtom = atom<string | undefined>(undefined);
export const transactionHashesAtom = atom<{ swap?: string; bridge?: string; transfer?: string }>({});
export const updateTransactionStepAtom = atom(
    null,
    (get, set, update: { id: "swap" | "bridge" | "transfer"; status: TransactionStep["status"] }) => {
        const steps = get(transactionStepsAtom);
        const updatedSteps = steps.map((step) => (step.id === update.id ? { ...step, status: update.status } : step));
        set(transactionStepsAtom, updatedSteps);

        if (update.status === "processing") {
            set(currentTransactionStepIdAtom, update.id);
        }
    },
);

export const initializeTransactionStepsAtom = atom(null, (_, set, swapType: "Swap" | "SwapAndBridge") => {
    const steps: TransactionStep[] = [
        {
            id: "swap",
            title: "🤝 Swap",
            description: "Trading with your local Walmart 💵💵💵💵💵💵",
            status: "pending",
        },
    ];

    if (swapType === "SwapAndBridge") {
        steps.push(
            {
                id: "bridge",
                title: "🚀 Bridge",
                description: "Your token is traveling...",
                status: "pending",
            },
            {
                id: "transfer",
                title: "🕊️ Transfer Token",
                description: "We're freeing your token. Don't be impatient!",
                status: "pending",
            },
        );
    }

    set(transactionStepsAtom, steps);
    set(transactionModalOpenAtom, true);
});

export const messageIdAtom = atom<Hash | undefined>(undefined);

export const remoteTransactionHashAtom = atom<Hash | null>(null);

/*
export const hyperlaneMailboxChainOut = atom((get) => {
    const chainOut = get(chainOutAtom);
    const networkType = get(networkTypeAtom);
    if (!chainOut || networkType == "superchain") return null;

    const { data: hyperlaneRegistry } = get(hyperlaneRegistryQueryAtom);
    if (!hyperlaneRegistry) return null;
    const { mailbox } = getChainNameAndMailbox({ chainId: chainOut.id, hyperlaneRegistry });
    return mailbox;
});
*/
