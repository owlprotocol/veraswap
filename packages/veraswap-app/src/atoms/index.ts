import { atom, WritableAtom } from "jotai";
import { atomWithMutation, atomWithQuery, AtomWithQueryResult } from "jotai-tanstack-query";
import { Chain } from "viem/chains";
import {
    PERMIT2_ADDRESS,
    quoteQueryOptions,
    TOKEN_LIST,
    UNISWAP_CONTRACTS,
    getPoolKey,
    SwapType,
    isSyntheticToken,
    getRemoteTokenAddressAndBridge,
    getChainNameAndMailbox,
} from "@owlprotocol/veraswap-sdk";
import { Hash, parseUnits, zeroAddress } from "viem";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import {
    readContractQueryOptions,
    sendTransactionMutationOptions,
    waitForTransactionReceiptQueryOptions,
} from "wagmi/query";
import { getAccount } from "@wagmi/core";
import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";
import { interopDevnet0, interopDevnet1 } from "@owlprotocol/veraswap-sdk";
import { chains, config } from "@/config.js";
import { hyperlaneRegistryOptions } from "@/hooks/hyperlaneRegistry.js";
import { quoteGasPayment } from "@/abis/quoteGasPayment.js";
import { TransactionStep } from "@/components/TransactionStatusModal.js";
import { TokenWithChainId } from "@/types";

/**
 * - networks
 * - networkIn
 * - networkOut
 * - tokens
 * - tokenIn
 * - tokenOut
 * - tokenInAmount
 * - tokenOut
 * - quote
 *
 *
 */

//TODO: Add additional atom write logic to clear values when certain atoms are written (eg. when network is changed, tokenIn should be cleared), for now this can be done manually
export const networkTypeAtom = atom<"mainnet" | "testnet" | "superchain">("mainnet");

export const hyperlaneRegistryQueryAtom = atomWithQuery(hyperlaneRegistryOptions);

export const swapTypeAtom = atom<SwapType | null>((get) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const isSynthetic = get(isTokenOutSyntheticAtom);

    if (chainIn && chainOut) {
        return chainIn.id === chainOut.id && !isSynthetic ? SwapType.Swap : SwapType.SwapAndBridge;
    }
    return null;
});

const filterChainsByNetworkType = (networkType: "mainnet" | "testnet" | "superchain") => {
    return chains.filter((chain) => {
        const isInteropDevnet = chain.id === interopDevnet0.id || chain.id === interopDevnet1.id;
        if (networkType === "testnet") return chain.testnet === true && !isInteropDevnet;
        if (networkType === "superchain") return isInteropDevnet;
        return !chain.testnet;
    });
};

export const chainsAtom = atom((get) => filterChainsByNetworkType(get(networkTypeAtom)));

export const networkTypeWithResetAtom = atom(
    (get) => get(networkTypeAtom),
    (_, set, newNetworkType: "mainnet" | "testnet" | "superchain") => {
        set(networkTypeAtom, newNetworkType);
        resetNetworkDependentAtoms(set);
    },
);

const resetNetworkDependentAtoms = (set: any) => {
    set(tokenInAtom, null);
    set(tokenOutAtom, null);
    set(tokenInAmountInputAtom, "");
};

// TODO: move it all in one file?
const fetchTokens = async () => {
    const [tokensResponse, bridgedTokensResponse] = await Promise.all([
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/tokens-list.json"),
        fetch("https://raw.githubusercontent.com/owlprotocol/veraswap-tokens/main/bridged-tokens.json"),
    ]);

    if (!tokensResponse.ok || !bridgedTokensResponse.ok) {
        throw new Error("Failed to fetch tokens");
    }

    const standardTokens = await tokensResponse.json();
    const bridgedTokens = await bridgedTokensResponse.json();

    return [...standardTokens, ...bridgedTokens];
};

export const fetchedTokensAtom = atomWithQuery(() => ({
    queryKey: ["tokens"],
    queryFn: fetchTokens,
}));

export const tokensAtom = atom((get) => {
    const fetchedTokensState = get(fetchedTokensAtom);

    const fetchedTokens = fetchedTokensState.data ?? [];
    const localTokens = Object.values(TOKEN_LIST);

    const combinedTokens = Array.from(
        new Map(
            [...localTokens, ...fetchedTokens].map((token) =>
                // ensures no duplicate tokens on same chain
                [`${token.chainId}-${token.address.toLowerCase()}`, token],
            ),
        ).values(),
    );

    return combinedTokens;
});

export const chainInAtom = atom<Chain | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const availableChains = get(chainsAtom);
    return tokenIn ? availableChains.find((chain) => chain.id === tokenIn.chainId) || null : null;
});

export const chainOutAtom = atom<Chain | null>((get) => {
    const tokenOut = get(tokenOutAtom);
    const availableChains = get(chainsAtom);
    return tokenOut ? availableChains.find((chain) => chain.id === tokenOut.chainId) || null : null;
});

export const tokensInAtom = atom((get) => {
    const networkChains = get(chainsAtom);
    const combinedTokens = get(tokensAtom);

    if (!combinedTokens) return [];

    return networkChains.flatMap((chain) =>
        combinedTokens
            .filter((token) => token.chainId === chain.id)
            .map((token) => ({
                key: `${token.chainId}-${token.address}`,
                ...token,
            })),
    );
});

export const tokensOutAtom = atom((get) => {
    const networkChains = get(chainsAtom);
    const combinedTokens = get(tokensAtom);
    if (!combinedTokens) return [];

    return networkChains.flatMap((chain) =>
        combinedTokens
            .filter((token) => token.chainId === chain.id)
            .map((token) => ({
                key: `${token.chainId}-${token.address}`,
                ...token,
            })),
    );
});
// Selected tokenIn
export const tokenInAtom = atom<TokenWithChainId | null>(null);
// Selected tokenOut
export const tokenOutAtom = atom<TokenWithChainId | null>(null);

export const remoteTokenInfoAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    const chainIn = get(chainInAtom);

    if (!tokenOut || !chainIn) return null;

    return getRemoteTokenAddressAndBridge(tokenOut.chainId, tokenOut.address, chainIn.id);
});

export const isTokenOutSyntheticAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return tokenOut ? isSyntheticToken(tokenOut.chainId, tokenOut.address) : false;
});

// Selected tokenIn balance
export const tokenInBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBalanceQueryAtom).data ?? null;
});

// Selected tokenIn Permit2 allowance
export const tokenInPermit2AllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenIn?.address ?? zeroAddress,
            functionName: "allowance",
            args: [account.address ?? zeroAddress, PERMIT2_ADDRESS],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInPermit2AllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInPermit2AllowanceQueryAtom).data ?? null;
});
// Selected tokenIn UniversalRouter allowance (via Permit2)
export const tokenInRouterAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowancePermit2Abi],
            chainId: (tokenIn?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: PERMIT2_ADDRESS,
            functionName: "allowance",
            args: [
                account.address ?? zeroAddress,
                tokenIn?.address ?? zeroAddress,
                tokenIn?.chainId ? UNISWAP_CONTRACTS[tokenIn.chainId].UNIVERSAL_ROUTER : zeroAddress,
            ],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenInRouterAllowanceAtom = atom<bigint | null>((get) => {
    const data = get(tokenInRouterAllowanceQueryAtom).data;
    return data ? data[0] : null;
});

// Selected tokenOut balance
export const tokenOutBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenOut = get(tokenOutAtom);
    const enabled = !!tokenOut || !!account.address;

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId: (tokenOut?.chainId ?? 0) as any, // wagmi typechecks the supported chainIds
            address: tokenOut?.address ?? zeroAddress,
            functionName: "balanceOf",
            args: [account.address ?? zeroAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
export const tokenOutBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenOutBalanceQueryAtom).data ?? null;
});

// Selected tokenInAmount
export const tokenInAmountInputAtom = atom<string>("");
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;
    return parseUnits(tokenInAmountInput, tokenIn.decimals!);
});

// Selected tokenOutAmount
//TODO: Implement later
// const tokenInAmountAtom = atom<bigint | null>(null)
export const poolKeyInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    const swapType = get(swapTypeAtom);
    const remoteInfo = get(remoteTokenInfoAtom);

    if (!tokenIn || !tokenOut) return null;
    if (tokenIn.address === tokenOut.address) return null;

    const currencyOut =
        swapType === SwapType.SwapAndBridge && remoteInfo ? remoteInfo.remoteTokenAddress : tokenOut.address;

    return getPoolKey(tokenIn.chainId, tokenIn.address, currencyOut);
});
// TODO: handle
export const poolKeyOutAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);

    if (!tokenIn || !tokenOut) return null; // Tokens not selected
    if (tokenIn.address === tokenOut.address) return null; // Invalid same token

    return getPoolKey(tokenOut.chainId, tokenIn.address, tokenOut.address);
});

const emptyToken = new Token(1, zeroAddress, 1);
const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emptyPoolKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress,
};

// Uniswap Quote
// type inference fails?
export const quoteInAtom = atomWithQuery((get) => {
    const poolKey = get(poolKeyInAtom);
    const chainIn = get(chainInAtom);
    const tokenIn = get(tokenInAtom);
    const tokenInAmount = get(tokenInAmountAtom);
    const enabled = !!poolKey && !!chainIn && !!tokenInAmount;
    //TODO: Should we create these classes in the atoms? => Might pose challenge if we add custom fields
    const chainId = chainIn?.id ?? 0;
    const currencyIn = tokenIn ? new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals) : emptyToken;
    const exactCurrencyAmount =
        tokenIn && tokenInAmount
            ? CurrencyAmount.fromRawAmount(currencyIn, tokenInAmount.toString())
            : emptyCurrencyAmount;
    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId].QUOTER : zeroAddress;

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey: poolKey ?? emptyPoolKey,
            exactCurrencyAmount: exactCurrencyAmount,
            quoteType: "quoteExactInputSingle",
            quoterAddress,
        }),
        enabled,
    };
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>;

export const swapInvertAtom = atom(null, (get, set) => {
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);

    set(tokenInAmountInputAtom, "");
});

export enum SwapStep {
    CONNECT_WALLET = "Connect Wallet",
    SELECT_TOKEN = "Select a token",
    SELECT_TOKEN_AMOUNT = "Enter an amount",
    INSUFFICIENT_BALANCE = "Insufficient Balance",
    INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
    APPROVE_PERMIT2 = "Approve Permit2",
    APPROVE_UNISWAP_ROUTER = "Approve Uniswap Router",
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
    const tokenInRouterAllowance = get(tokenInRouterAllowanceAtom);

    const mutation = get(sendTransactionMutationAtom);
    const hash = mutation.data;
    const receipt = get(waitForReceiptQueryAtom);

    const swapType = get(swapTypeAtom);
    const networkType = get(networkTypeAtom);

    const remoteTokenInfo = get(remoteTokenInfoAtom);

    const bridgeAddress = remoteTokenInfo?.remoteBridgeAddress ?? remoteTokenInfo?.remoteTokenAddress;

    if (account.address === undefined) return SwapStep.CONNECT_WALLET;
    if (mutation.isPending) return SwapStep.PENDING_SIGNATURE;
    if (hash && hash != receipt.data?.transactionHash) return SwapStep.PENDING_TRANSACTION;
    if (tokenIn === null || tokenOut === null) return SwapStep.SELECT_TOKEN;
    if (tokenInAmount === null) return SwapStep.SELECT_TOKEN_AMOUNT;
    if (swapType === SwapType.SwapAndBridge && networkType !== "superchain" && !bridgeAddress)
        return SwapStep.BRIDGING_NOT_SUPPORTED;
    if (tokenInBalance === null || tokenInBalance < tokenInAmount) return SwapStep.INSUFFICIENT_BALANCE;
    if (tokenInPermit2Allowance === null || tokenInPermit2Allowance < tokenInAmount) return SwapStep.APPROVE_PERMIT2;
    if (tokenInRouterAllowance === null || tokenInRouterAllowance < tokenInAmount)
        return SwapStep.APPROVE_UNISWAP_ROUTER;

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
    const chainOut = get(chainOutAtom);
    const chainIn = get(chainInAtom);
    const remoteInfo = get(remoteTokenInfoAtom);
    const networkType = get(networkTypeAtom);

    return {
        ...readContractQueryOptions(config, {
            chainId: chainIn?.id ?? 0,
            address: remoteInfo?.remoteBridgeAddress ?? zeroAddress,
            abi: [quoteGasPayment],
            functionName: "quoteGasPayment",
            args: [chainOut?.id ?? 0],
        }),
        enabled: networkType != "superchain" && !!remoteInfo?.remoteBridgeAddress && !!chainOut && !!chainIn,
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

export const hyperlaneMailboxChainOut = atom((get) => {
    const chainOut = get(chainOutAtom);
    const networkType = get(networkTypeAtom);
    if (!chainOut || networkType == "superchain") return null;

    const { data: hyperlaneRegistry } = get(hyperlaneRegistryQueryAtom);
    if (!hyperlaneRegistry) return null;
    const { mailbox } = getChainNameAndMailbox({ chainId: chainOut.id, hyperlaneRegistry });
    return mailbox;
});
