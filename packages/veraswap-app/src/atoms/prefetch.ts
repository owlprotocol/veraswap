import { atom } from "jotai";

import {
    kernelAddressChainInQueryAtom,
    kernelAddressChainOutQueryAtom,
    kernelBytecodeChainInQueryAtom,
    kernelBytecodeChainOutQueryAtom,
    kernelInitDataAtom,
} from "./kernelSmartAccount.js";
import {
    tokenInAccountBalanceQueryAtom,
    tokenInKernelBalanceQueryAtom,
    tokenOutAccountBalanceQueryAtom,
    tokenOutKernelBalanceQueryAtom,
    tokenInAllowanceAccountToKernelQueryAtom,
    tokenInAllowanceAccountToPermit2QueryAtom,
    tokenInAllowanceKernelToPermit2QueryAtom,
    tokenInAllowanceKernelToHypERC20CollateralQueryAtom,
    tokenOutAllowanceKernelToPermit2QueryAtom,
    tokenInPermit2AllowanceAccountToKernelQueryAtom,
    tokenInPermit2AllowanceAccountToUniswapRouterQueryAtom,
    tokenInPermit2AllowanceKernelToUniswapRouterQueryAtom,
    tokenOutPermit2AllowanceKernelToUniswapRouterQueryAtom,
} from "./token-balance.js";
import {
    executorGetNonceChainInQueryAtom,
    executorGetNonceChainOutQueryAtom,
    executorGetOwnersChainInQueryAtom,
    executorGetOwnersChainOutQueryAtom,
    executorIsInitializedChainInQueryAtom,
    executorIsInitializedChainOutQueryAtom,
} from "./kernelExecutor.js";
import {
    erc7579RouterAccountIsOwnerChainInQueryAtom,
    erc7579RouterAccountIsOwnerChainOutQueryAtom,
    erc7579RouterKernelIsOwnerChainInQueryAtom,
    erc7579RouterKernelIsOwnerChainOutQueryAtom,
} from "./kernelERC7579Router.js";
import {
    hypERC20CollateralWrappedTokenQueryAtom,
    igpQuotePaymentQueryAtom,
    tokenRouterQuoteGasPaymentQueryAtom,
} from "./hyperlane.js";

export const prefetchQueriesAtom = atom((get) => [
    // Kernel
    get(kernelInitDataAtom),
    get(kernelAddressChainInQueryAtom),
    get(kernelAddressChainOutQueryAtom),
    get(kernelBytecodeChainInQueryAtom),
    get(kernelBytecodeChainOutQueryAtom),
    // Executor
    get(executorIsInitializedChainInQueryAtom),
    get(executorIsInitializedChainOutQueryAtom),
    get(executorGetOwnersChainInQueryAtom),
    get(executorGetOwnersChainOutQueryAtom),
    get(executorGetNonceChainInQueryAtom),
    get(executorGetNonceChainOutQueryAtom),
    // ERC7579 Router
    get(erc7579RouterAccountIsOwnerChainInQueryAtom),
    get(erc7579RouterAccountIsOwnerChainOutQueryAtom),
    get(erc7579RouterKernelIsOwnerChainInQueryAtom),
    get(erc7579RouterKernelIsOwnerChainOutQueryAtom),
    // Token Balance
    get(tokenInAccountBalanceQueryAtom),
    get(tokenInKernelBalanceQueryAtom),
    get(tokenOutAccountBalanceQueryAtom),
    get(tokenOutKernelBalanceQueryAtom),
    // Token Allowance
    get(tokenInAllowanceAccountToKernelQueryAtom),
    get(tokenInAllowanceAccountToPermit2QueryAtom),
    get(tokenInAllowanceKernelToPermit2QueryAtom),
    get(tokenInAllowanceKernelToHypERC20CollateralQueryAtom),
    get(tokenOutAllowanceKernelToPermit2QueryAtom),
    // Token Permit2 Allowance
    get(tokenInPermit2AllowanceAccountToKernelQueryAtom),
    get(tokenInPermit2AllowanceAccountToUniswapRouterQueryAtom),
    get(tokenInPermit2AllowanceKernelToUniswapRouterQueryAtom),
    get(tokenOutPermit2AllowanceKernelToUniswapRouterQueryAtom),
    // Hyperlane
    get(hypERC20CollateralWrappedTokenQueryAtom),
    get(tokenRouterQuoteGasPaymentQueryAtom),
    get(igpQuotePaymentQueryAtom),
]);
