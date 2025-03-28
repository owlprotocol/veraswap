import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { parseUnits, zeroAddress } from "viem";
import { readContractQueryOptions } from "wagmi/query";
import { getAccount } from "@wagmi/core";

import { Token, getTransactionType, TransactionType } from "@owlprotocol/veraswap-sdk";
import { PERMIT2_ADDRESS, UNISWAP_CONTRACTS, LOCAL_POOLS, LOCAL_TOKENS_MAP } from "@owlprotocol/veraswap-sdk/constants";
import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer";

import { chains, config } from "@/config.js";

/***** Tokens Fetch *****/
//TODO: Hard-coded for now
/**
 * // TODO: move it all in one file?
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

 */

/***** Token In *****/
/** Selected tokenIn */
export const tokenInAtom = atom<Token | null>(null);
/** Selected tokenIn chain */
export const chainInAtom = atom((get) => {
    const tokenIn = get(tokenInAtom);
    return chains.find((c) => c.id === tokenIn?.chainId) ?? null;
});
/** tokenIn amount: string */
export const tokenInAmountInputAtom = atom<string>("");
/** tokenIn amount: bigint (wei) */
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;

    return parseUnits(tokenInAmountInput, tokenIn.decimals!);
});
/** tokenIn.balanceOf(account): QueryResult */
export const tokenInBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn && !!account.address;

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId,
            address: tokenAddress,
            functionName: "balanceOf",
            args: [accountAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** tokenIn.balanceOf(account): bigint */
export const tokenInBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenInBalanceQueryAtom).data ?? null;
});
/** tokenIn.allowance(account, PERMIT2): QueryResult */
export const tokenInPermit2AllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);

    return {
        ...readContractQueryOptions(config, {
            abi: [allowanceAbi],
            chainId,
            address: tokenAddress,
            functionName: "allowance",
            args: [accountAddress, PERMIT2_ADDRESS],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** tokenIn.allowance(account, PERMIT2): bigint */
export const tokenInPermit2AllowanceAtom = atom<bigint | null>((get) => {
    return get(tokenInPermit2AllowanceQueryAtom).data ?? null;
});
/** permit2.allowance(account, tokenIn, UniversalRouter): QueryResult */
export const tokenInRouterAllowanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenIn = get(tokenInAtom);
    const enabled = !!tokenIn || !!account.address;

    // Query args MUST be defined
    const chainId = tokenIn?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenIn?.standard === "HypERC20Collateral" ? tokenIn?.collateralAddress : (tokenIn?.address ?? zeroAddress);
    const universalRouter = tokenIn?.chainId
        ? UNISWAP_CONTRACTS[tokenIn.chainId as keyof typeof UNISWAP_CONTRACTS].universalRouter
        : zeroAddress;

    return {
        ...readContractQueryOptions(config, {
            abi: [allowancePermit2Abi],
            chainId,
            address: PERMIT2_ADDRESS,
            functionName: "allowance",
            args: [accountAddress, tokenAddress, universalRouter],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** permit2.allowance(account, tokenIn, UniversalRouter): bigint */
export const tokenInRouterAllowanceAtom = atom<bigint | null>((get) => {
    const data = get(tokenInRouterAllowanceQueryAtom).data;
    return data ? data[0] : null;
});

/***** Token Out *****/
/** Selected tokenOut */
export const tokenOutAtom = atom<Token | null>(null);
/** Selected tokenOut chain */
export const chainOutAtom = atom((get) => {
    const tokenOut = get(tokenOutAtom);
    return chains.find((c) => c.id === tokenOut?.chainId) ?? null;
});
/** tokenOut.balanceOf(account): QueryResult */
export const tokenOutBalanceQueryAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config);
    const tokenOut = get(tokenOutAtom);
    const enabled = !!tokenOut && !!account.address;

    // Query args MUST be defined
    const chainId = tokenOut?.chainId ?? 0;
    const accountAddress = account.address ?? zeroAddress;
    const tokenAddress =
        tokenOut?.standard === "HypERC20Collateral" ? tokenOut?.collateralAddress : (tokenOut?.address ?? zeroAddress);

    return {
        ...readContractQueryOptions(config, {
            abi: [balanceOfAbi],
            chainId,
            address: tokenAddress,
            functionName: "balanceOf",
            args: [accountAddress],
        }),
        enabled,
        refetchInterval: 2000,
    };
});
/** tokenOut.balanceOf(account): bigint */
export const tokenOutBalanceAtom = atom<bigint | null>((get) => {
    return get(tokenOutBalanceQueryAtom).data ?? null;
});

/** Find transaction type (BRIDGE, SWAP, SWAP_BRIDGE, BRIDGE_SWAP) */
export const transactionTypeAtom = atom<TransactionType | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    if (!tokenIn || !tokenOut) return null;

    //TODO: Add better constants
    return getTransactionType({ tokenIn, tokenOut, poolKeys: LOCAL_POOLS, tokens: LOCAL_TOKENS_MAP });
});

/***** Invert *****/
export const swapInvertAtom = atom(null, (get, set) => {
    const currentTokenIn = get(tokenInAtom);
    const currentTokenOut = get(tokenOutAtom);

    set(tokenInAtom, currentTokenOut);
    set(tokenOutAtom, currentTokenIn);
    set(tokenInAmountInputAtom, "");
});
