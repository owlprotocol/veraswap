import { atom, WritableAtom } from "jotai";
import { atomWithQuery, AtomWithQueryResult } from 'jotai-tanstack-query'
import { Chain, localhost } from "viem/chains"
import { MOCK_A, MOCK_B, PERMIT2_ADDRESS, PoolKey, quoteQueryOptions, UNISWAP_CONTRACTS } from "@owlprotocol/veraswap-sdk"
import { Address, parseUnits, zeroAddress } from "viem";
import { config } from "@/config";
import { CurrencyAmount, Ether, Token } from "@uniswap/sdk-core";
import { readContractQueryOptions } from "wagmi/query"
import { getAccount } from "@wagmi/core"
import { balanceOf as balanceOfAbi, allowance as allowanceAbi } from "@owlprotocol/veraswap-sdk/artifacts/IERC20";
import { allowance as allowancePermit2Abi } from "@owlprotocol/veraswap-sdk/artifacts/IAllowanceTransfer"

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
/***** Chains *****/
// List of supported networks
//TODO: Use wagmi config instead?
export const chainsAtom = atom<Chain[]>([
    localhost
])
// Selected chain in
export const chainInAtom = atom<null | Chain>(null);
// Selected chain out
export const chainOutAtom = atom<null | Chain>(null);

//Temporary
export interface TokenAtomData {chainId: number, address: Address, name: string, symbol: string, decimals: number, logo?: string}
export interface TokenAmountAtomData extends TokenAtomData { amount: bigint }

/***** Tokens *****/
// List of supported tokens
//TODO: Add intermediate atom to fetch metadata, for now hardcode
export const tokensAtom = atom<TokenAtomData[]>([
    { chainId: localhost.id, address: MOCK_A, name: "Mock A", symbol: "A", decimals: 18 },
    { chainId: localhost.id, address: MOCK_B, name: "Mock B", symbol: "B", decimals: 18 }
])

// List of supported tokens on networkIn
export const tokensInAtom = atom((get) => {
    const chainIn = get(chainInAtom)
    if (!chainIn) return [];

    const tokens = get(tokensAtom)
    return tokens.filter((token) => token.chainId === chainIn.id)
})
// List of supported tokens on networkOut
//TODO: Use pool info in addition to network
export const tokensOutAtom = atom((get) => {
    const chainOut = get(chainOutAtom)
    if (!chainOut) return [];

    const tokens = get(tokensAtom)
    return tokens.filter((token) => token.chainId === chainOut.id)
})
// Selected tokenIn
export const tokenInAtom = atom<TokenAtomData | null>(null)
// Selected tokenOut
export const tokenOutAtom = atom<TokenAtomData | null>(null)

// Selected tokenIn balance
export const tokenInBalanceAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config)
    const tokenIn = get(tokenInAtom)
    const enabled = !!tokenIn || !!account.address;

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
    }
})
// Selected tokenIn Permit2 allowance
export const tokenInPermit2AllowanceAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config)
    const tokenIn = get(tokenInAtom)
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
    }
})
// Selected tokenIn UniversalRouter allowance (via Permit2)
export const tokenInRouterAllowanceAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config)
    const tokenIn = get(tokenInAtom)
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
                tokenIn?.chainId ? UNISWAP_CONTRACTS[tokenIn.chainId] : zeroAddress 
            ],
        }),
        enabled,
        refetchInterval: 2000,
    }
})

// Selected tokenOut balance
export const tokenOutBalanceAtom = atomWithQuery((get) => {
    // TODO: Could cause issues on account change
    const account = getAccount(config)
    const tokenOut = get(tokenOutAtom)
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
    }
})

// Selected tokenInAmount
export const tokenInAmountInputAtom = atom<string>("");
export const tokenInAmountAtom = atom<bigint | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenInAmountInput = get(tokenInAmountInputAtom);
    if (!tokenIn || tokenInAmountInput === "") return null;
    return parseUnits(tokenInAmountInput, tokenIn.decimals)
})



// Selected tokenOutAmount
//TODO: Implement later
// const tokenInAmountAtom = atom<bigint | null>(null) 
export const poolKeyAtom = atom<PoolKey | null>((get) => {
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);
    if (!tokenIn || !tokenOut) return null; // Tokens not selected
    if (tokenIn.address === tokenOut.address) return null; // Invalid same token

    return {
        currency0: tokenIn.address < tokenOut.address ? tokenIn.address : tokenOut.address,
        currency1: tokenIn.address < tokenOut.address ? tokenOut.address : tokenOut.address,
        fee: 3_000,
        tickSpacing: 60,
        hooks: zeroAddress
    }
})

const emptyToken = new Token(1, zeroAddress, 1);
const emptyCurrencyAmount = CurrencyAmount.fromRawAmount(emptyToken, 1);
const emtpyPooKey = {
    currency0: zeroAddress,
    currency1: zeroAddress,
    fee: 3_000,
    tickSpacing: 60,
    hooks: zeroAddress
}

// Uniswap Quote
// type inference fails?
export const quoteAtom = atomWithQuery((get) => {
    const poolKey = get(poolKeyAtom);
    const chainIn = get(chainInAtom);
    const tokenIn = get(tokenInAtom);
    const tokenInAmount = get(tokenInAmountAtom)
    const enabled = !!poolKey && !!chainIn && !!tokenInAmount;
    //TODO: Should we create these classes in the atoms? => Might pose challenge if we add custom fields
    const chainId = chainIn?.id ?? 0;
    const currencyIn = tokenIn ? new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals) : emptyToken; 
    const exactCurrencyAmount = tokenIn && tokenInAmount ? CurrencyAmount.fromRawAmount(currencyIn, tokenInAmount.toString()) : emptyCurrencyAmount;
    const quoterAddress = chainId ? UNISWAP_CONTRACTS[chainId].QUOTER : zeroAddress;

    return {
        ...quoteQueryOptions(config, {
            chainId,
            poolKey: poolKey ?? emtpyPooKey,
            exactCurrencyAmount: exactCurrencyAmount!,
            quoteType: "quoteExactInputSingle",
            quoterAddress
        }),
        enabled
    }
}) as unknown as WritableAtom<AtomWithQueryResult<[bigint, bigint], Error>, [], void>

export const swapInvertAtom = atom(null, (get, set) => {
    const chainIn = get(chainInAtom);
    const chainOut = get(chainOutAtom);
    const tokenIn = get(tokenInAtom);
    const tokenOut = get(tokenOutAtom);

    set(chainInAtom, chainOut);
    set(chainOutAtom, chainIn);
    set(tokenInAtom, tokenIn);
    set(tokenOutAtom, tokenOut);

    //TODO: Invert amounts later
});

export enum SwapStep {
  CONNECT_WALLET = "Connect Wallet",
  SELECT_NETWORK = "Select A Network",
  SELECT_TOKEN_IN = "Select Input Token",
  SELECT_TOKEN_IN_AMOUNT = "Enter Amount", 
  INSUFFICIENT_BALANCE = "Insufficient Balance",
  INSUFFICIENT_LIQUIDITY = "Insufficient Liquidity",
  APPROVE_PERMIT2 = "Approve Permit2",
  APPROVE_UNISWAP_ROUTER = "Approve Uniswap Router",
  EXECUTE = "Execute Swap",
}

export const swapStepAtom = atom(null, (get) => {
    const chainIn = get(chainInAtom);
    const tokenIn = get(tokenInAtom)
    const tokenInAmount = get(tokenInAmountAtom);
    const { data: tokenInBalance } = get(tokenInBalanceAtom);
    const { data: tokenInPermit2Allowance } = get(tokenInPermit2AllowanceAtom);
    const { data: tokenInRouterAllowance } = get(tokenInRouterAllowanceAtom)

    if (chainIn === null) return SwapStep.SELECT_NETWORK;
    if (tokenIn === null) return SwapStep.SELECT_TOKEN_IN
    if (tokenInAmount === null) return SwapStep.SELECT_TOKEN_IN_AMOUNT;
    if (tokenInBalance === undefined || tokenInBalance < tokenInAmount) return SwapStep.INSUFFICIENT_BALANCE;
    if (tokenInPermit2Allowance === undefined || tokenInPermit2Allowance < tokenInAmount) return SwapStep.APPROVE_PERMIT2
    if (tokenInRouterAllowance === undefined || tokenInRouterAllowance[0] < tokenInAmount) return SwapStep.APPROVE_UNISWAP_ROUTER
   
    return SwapStep.EXECUTE
})