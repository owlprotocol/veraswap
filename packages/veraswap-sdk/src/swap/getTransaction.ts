import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, Hex, zeroHash } from "viem";

import {
    getBridgeSwapWithKernelCalls,
    GetBridgeSwapWithKernelCallsParams,
} from "../calls/getBridgeSwapWithKernelCalls.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "../calls/getTransferRemoteWithKernelCalls.js";
import { getPermit2PermitSignature, GetPermit2PermitSignatureParams } from "../calls/index.js";
import { MAX_UINT_160 } from "../constants/uint256.js";
import { Currency, getUniswapV4Address, isMultichainToken } from "../currency/index.js";
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
// TODO: check usage
// import { getSuperchainBridgeTransaction } from "../superchain/getSuperchainBridgeTransaction.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { OrbiterParams } from "../types/OrbiterParams.js";
import { TokenStandard } from "../types/Token.js";
import {
    TransactionTypeBridge,
    TransactionTypeBridgeSwap,
    TransactionTypeSwap,
    TransactionTypeSwapBridge,
} from "../utils/getTransactionType.js";

import { getSwapAndHyperlaneSweepBridgeTransaction } from "./getSwapAndHyperlaneSweepBridgeTransaction.js";
import { getSwapAndSuperchainBridgeTransaction } from "./getSwapAndSuperchainBridgeTransaction.js";
import { getSwapExactInExecuteData } from "./getSwapExactInExecuteData.js";
import { getTransferRemoteCall } from "./getTransferRemoteCall.js";

export interface TransactionSwapOptions {
    walletAddress: Address;
    queryClient: QueryClient;
    wagmiConfig: Config;
    amountIn: bigint;
    amountOutMinimum: bigint;
}

export interface TransactionBridgeOptions {
    amountIn: bigint;
    walletAddress: Address;
    bridgePayment: bigint;
    orbiterParams?: OrbiterParams;
    initData?: Hex;
    queryClient?: QueryClient;
    wagmiConfig?: Config;
}

export interface TransactionBridgeHyperlaneCollateralOptions {
    amountIn: bigint;
    walletAddress: Address;
    bridgePayment?: bigint;
    orbiterParams?: OrbiterParams;
    initData: Hex;
    queryClient: QueryClient;
    wagmiConfig: Config;
}

export interface TransactionBridgeOrbiterOptions {
    amountIn: bigint;
    walletAddress: Address;
    orbiterParams?: OrbiterParams;
    // TODO: maybe calculate total amount in to pay and pass it as bridge payment
    // Keeping it for type consistency
    bridgePayment?: bigint;
    initData?: Hex;
    queryClient?: QueryClient;
    wagmiConfig?: Config;
}

export interface TransactionSwapBridgeOptions {
    queryClient: QueryClient;
    wagmiConfig: Config;
    amountIn: bigint;
    amountOutMinimum: bigint;
    bridgePayment: bigint;
    walletAddress: Address;
    orbiterParams?: OrbiterParams;
}

export interface TransactionSwapBridgeOrbiterOptions {
    queryClient: QueryClient;
    wagmiConfig: Config;
    amountIn: bigint;
    amountOutMinimum: bigint;
    walletAddress: Address;
    orbiterParams?: OrbiterParams;
    // TODO: maybe calculate total amount in to pay and pass it as bridge payment
    // Keeping it for type consistency
    bridgePayment?: bigint;
}

export interface TransactionBridgeSwapOptions {
    queryClient: QueryClient;
    wagmiConfig: Config;
    walletAddress: Address;
    amountIn: bigint;
    amountOutMinimum: bigint;
    initData: Hex;
    orbiterParams?: OrbiterParams;
    orbiterAmountOut?: bigint;
}

export type TransactionParams =
    | (TransactionTypeSwap & TransactionSwapOptions)
    | (TransactionTypeBridge & TransactionBridgeOptions)
    | (TransactionTypeBridge & TransactionBridgeOrbiterOptions)
    | (TransactionTypeBridge & TransactionBridgeHyperlaneCollateralOptions)
    | (TransactionTypeSwapBridge & TransactionSwapBridgeOptions)
    | (TransactionTypeSwapBridge & TransactionSwapBridgeOrbiterOptions)
    | (TransactionTypeBridgeSwap & TransactionBridgeSwapOptions);

export async function getTransaction(
    params: TransactionParams,
    contracts: Record<
        number,
        {
            universalRouter: Address;
            execute: Address;
            kernelFactory: Address;
            ownableSignatureExecutor: Address;
            erc7579Router: Address;
            interchainGasPaymaster: Address;
        }
    >,
): Promise<{ to: Address; data: Hex; value: bigint } | null> {
    switch (params.type) {
        case "SWAP": {
            const {
                currencyIn,
                poolKey,
                zeroForOne,
                amountIn,
                walletAddress,
                amountOutMinimum,
                queryClient,
                wagmiConfig,
            } = params;

            let permit2PermitParams: [PermitSingle, Hex] | undefined = undefined;

            // Permit2 is not needed when swapping a native token
            if (!currencyIn.isNative) {
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: currencyIn.chainId,
                    minAmount: amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts[currencyIn.chainId].universalRouter,
                    token: getUniswapV4Address(currencyIn),
                    account: walletAddress,
                };
                const { permitSingle, signature } = await getPermit2PermitSignature(
                    queryClient,
                    wagmiConfig,
                    getPermit2Params,
                );
                permit2PermitParams = permitSingle && signature ? [permitSingle, signature] : undefined;
            }

            return getSwapExactInExecuteData({
                universalRouter: contracts[currencyIn.chainId].universalRouter,
                poolKey,
                zeroForOne,
                amountIn,
                amountOutMinimum,
                permit2PermitParams,
            });
        }

        case "BRIDGE": {
            const { currencyIn, currencyOut, amountIn, walletAddress, orbiterParams } = params;

            if (currencyIn.isNative && currencyOut.isNative) {
                if (!orbiterParams) {
                    throw new Error("Orbiter params are required for Orbiter bridging");
                }

                return getOrbiterETHTransferTransaction({
                    ...orbiterParams,
                    amount: amountIn,
                });
            }

            // TODO: check
            if (
                isMultichainToken(currencyIn) &&
                !currencyIn.isHypERC20() &&
                currencyIn.hyperlaneAddress &&
                isMultichainToken(currencyOut) &&
                !currencyOut.isHypERC20() &&
                currencyOut.hyperlaneAddress
            ) {
                const { queryClient, wagmiConfig, initData } = params;

                if (!queryClient || !wagmiConfig || !initData || !walletAddress) {
                    throw new Error(
                        "Query client, wagmi config, init data and wallet address are required for bridging",
                    );
                }

                const bridgeParams: GetTransferRemoteWithKernelCallsParams = {
                    chainId: currencyIn.chainId,
                    token: currencyIn.hyperlaneAddress,
                    tokenStandard: getTokenStandard(currencyIn),
                    account: walletAddress,
                    destination: currencyOut.chainId,
                    recipient: walletAddress,
                    amount: amountIn,
                    //TODO: LOCAL CONTRACTS
                    createAccount: {
                        initData,
                        salt: zeroHash,
                        factoryAddress: contracts[currencyIn.chainId].kernelFactory,
                    },
                    contracts: {
                        execute: contracts[currencyIn.chainId].execute,
                        ownableSignatureExecutor: contracts[currencyIn.chainId].ownableSignatureExecutor,
                        erc7579Router: contracts[currencyIn.chainId].erc7579Router,
                    },
                };

                const result = await getTransferRemoteWithKernelCalls(queryClient, wagmiConfig, bridgeParams);
                //TODO: data and value are optional
                return result.calls[0] as {
                    to: Address;
                    data: Hex;
                    value: bigint;
                };
            }

            return getTransferRemoteCall({
                address: getUniswapV4Address(currencyIn),
                destination: currencyOut.chainId,
                recipient: walletAddress,
                amount: amountIn,
                bridgePayment: params.bridgePayment!,
            });
        }

        case "SWAP_BRIDGE": {
            const {
                swap,
                bridge,
                bridgePayment,
                amountIn,
                amountOutMinimum,
                walletAddress,
                orbiterParams,
                queryClient,
                wagmiConfig,
            } = params;
            const { currencyIn: swapCurrencyIn, poolKey, zeroForOne } = swap;
            const { currencyIn: bridgeCurrencyIn, currencyOut: bridgeCurrencyOut } = bridge;

            const bridgeAddress = isMultichainToken(bridgeCurrencyIn)
                ? (bridgeCurrencyIn.hyperlaneAddress ?? bridgeCurrencyIn.address)
                : getUniswapV4Address(bridgeCurrencyIn);

            // TODO: add orbiter bridging
            if (bridgeCurrencyIn.isNative && bridgeCurrencyOut.isNative) {
                if (!orbiterParams) {
                    throw new Error("Orbiter params are required for Orbiter bridging");
                }

                throw new Error("Must implement getSwapAndOrbiterBridgeTransaction");
            }

            let permit2PermitParams: [PermitSingle, Hex] | undefined = undefined;

            // Permit2 is not needed when swapping a native token
            if (!swapCurrencyIn.isNative) {
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: swapCurrencyIn.chainId,
                    minAmount: amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts[swapCurrencyIn.chainId].universalRouter,
                    token: getUniswapV4Address(swapCurrencyIn),
                    account: walletAddress,
                };
                const { permitSingle, signature } = await getPermit2PermitSignature(
                    queryClient,
                    wagmiConfig,
                    getPermit2Params,
                );
                permit2PermitParams = permitSingle && signature ? [permitSingle, signature] : undefined;
            }

            // TODO: figure out why we have MockSuperchainERC20 here
            // TODO: find better way to check for superchain collateral
            if (
                ((isMultichainToken(bridgeCurrencyIn) && bridgeCurrencyIn.isSuperERC20()) ||
                    (isMultichainToken(bridgeCurrencyIn) &&
                        !bridgeCurrencyIn.isHypERC20() &&
                        bridgeCurrencyIn.hyperlaneAddress)) &&
                ((isMultichainToken(bridgeCurrencyOut) && bridgeCurrencyOut.isSuperERC20()) ||
                    (isMultichainToken(bridgeCurrencyOut) &&
                        !bridgeCurrencyOut.isHypERC20() &&
                        bridgeCurrencyOut.hyperlaneAddress))
            ) {
                return getSwapAndSuperchainBridgeTransaction({
                    amountIn,
                    amountOutMinimum,
                    destinationChain: bridgeCurrencyOut.chainId,
                    poolKey,
                    receiver: walletAddress,
                    universalRouter: contracts[swapCurrencyIn.chainId].universalRouter,
                    zeroForOne,
                    permit2PermitParams,
                });
            }

            return getSwapAndHyperlaneSweepBridgeTransaction({
                universalRouter: contracts[swapCurrencyIn.chainId].universalRouter,
                bridgeAddress,
                // Default for local env
                bridgePayment: bridgePayment ?? 1n,
                destinationChain: bridgeCurrencyOut.chainId,
                receiver: walletAddress,
                poolKey,
                zeroForOne,
                permit2PermitParams,
                amountIn,
                amountOutMinimum,
            });
        }

        case "BRIDGE_SWAP": {
            const {
                bridge,
                swap,
                queryClient,
                wagmiConfig,
                walletAddress,
                amountIn,
                amountOutMinimum,
                initData,
                orbiterParams,
                orbiterAmountOut,
            } = params;
            // TODO: check if withSuperchain is needed
            const { currencyIn, currencyOut } = bridge;
            const { poolKey, zeroForOne } = swap;

            if (currencyIn.isNative && (!orbiterParams || !orbiterAmountOut)) {
                throw new Error("Orbiter params and amount out are required for Orbiter bridging");
            }

            // TODO: fix this for non local env
            const originERC7579ExecutorRouter = contracts[currencyIn.chainId].erc7579Router;
            const remoteERC7579ExecutorRouter = contracts[currencyOut.chainId].erc7579Router;

            if (!originERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${currencyIn.chainId}`);
            }

            if (!remoteERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${currencyOut.chainId}`);
            }

            const bridgeSwapParams: GetBridgeSwapWithKernelCallsParams = {
                chainId: currencyIn.chainId,
                token: isMultichainToken(currencyIn)
                    ? (currencyIn.hyperlaneAddress ?? currencyIn.address)
                    : getUniswapV4Address(currencyIn),
                tokenStandard: getTokenStandard(currencyIn),
                tokenOutStandard: getTokenStandard(currencyOut),
                account: walletAddress,
                destination: currencyOut.chainId,
                recipient: walletAddress,
                amount: amountIn,
                //TODO: LOCAL CONTRACTS
                contracts: {
                    // static
                    execute: contracts[currencyIn.chainId].execute,
                    ownableSignatureExecutor: contracts[currencyIn.chainId].ownableSignatureExecutor,
                    // mailbox
                    erc7579Router: contracts[currencyIn.chainId].erc7579Router,
                    interchainGasPaymaster: contracts[currencyIn.chainId].interchainGasPaymaster,
                },
                contractsRemote: {
                    execute: contracts[currencyOut.chainId].execute,
                    ownableSignatureExecutor: contracts[currencyOut.chainId].ownableSignatureExecutor,
                    // mailbox
                    erc7579Router: contracts[currencyOut.chainId].erc7579Router,
                },
                createAccount: {
                    initData,
                    salt: zeroHash,
                    // static
                    factoryAddress: contracts[currencyIn.chainId].kernelFactory,
                },
                createAccountRemote: {
                    initData,
                    salt: zeroHash,
                    // static
                    factoryAddress: contracts[currencyOut.chainId].kernelFactory,
                },
                // erc7579RouterOwners: [],
                // erc7579RouterOwnersRemote: [],
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: orbiterAmountOut ?? amountIn,
                    amountOutMinimum,
                    poolKey,
                    receiver: walletAddress,
                    universalRouter: contracts[currencyOut.chainId].universalRouter,
                    zeroForOne,
                },
                orbiterParams,
            };

            const result = await getBridgeSwapWithKernelCalls(queryClient, wagmiConfig, bridgeSwapParams);

            return result.calls[0] as {
                to: Address;
                data: Hex;
                value: bigint;
            };
        }

        default:
            return null;
    }
}

// TODO: Temp function to match old TokenStandard
function getTokenStandard(currency: Currency): TokenStandard {
    if (currency.isNative) return "NativeToken";
    if (isMultichainToken(currency)) {
        if (currency.isSuperERC20()) return "SuperchainERC20";
        if (currency.isHypERC20()) return "HypERC20";
        if (currency.hyperlaneAddress) return "HypERC20Collateral";
    }
    return "ERC20";
}
