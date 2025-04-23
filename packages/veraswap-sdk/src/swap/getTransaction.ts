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
import { getOrbiterETHTransferTransaction } from "../orbiter/getOrbiterETHTransferTransaction.js";
import { getSuperchainBridgeTransaction } from "../superchain/getSuperchainBridgeTransaction.js";
import { PermitSingle } from "../types/AllowanceTransfer.js";
import { OrbiterParams } from "../types/OrbiterParams.js";
import { getTokenAddress } from "../utils/getTokenAddress.js";
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
                tokenIn,
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
            if (tokenIn.standard !== "NativeToken") {
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: tokenIn.chainId,
                    minAmount: amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts[tokenIn.chainId].universalRouter,
                    token: getTokenAddress(tokenIn),
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
                universalRouter: contracts[tokenIn.chainId].universalRouter,
                poolKey,
                zeroForOne,
                amountIn,
                amountOutMinimum,
                permit2PermitParams,
            });
        }

        case "BRIDGE": {
            const { tokenIn, tokenOut, amountIn, walletAddress, orbiterParams } = params;

            if (tokenIn.standard === "NativeToken" && tokenOut.standard === "NativeToken") {
                if (!orbiterParams) {
                    throw new Error("Orbiter params are required for Orbiter bridging");
                }

                return getOrbiterETHTransferTransaction({
                    ...orbiterParams,
                    amount: amountIn,
                });
            }

            if (
                (tokenIn.standard === "SuperchainERC20" || tokenIn.standard === "HypSuperchainERC20Collateral") &&
                (tokenOut.standard === "SuperchainERC20" || tokenOut.standard === "HypSuperchainERC20Collateral")
            ) {
                return getSuperchainBridgeTransaction({
                    token: getTokenAddress(tokenIn),
                    recipient: walletAddress,
                    amount: amountIn,
                    destination: tokenOut.chainId,
                });
            }

            if (tokenIn.standard === "HypERC20Collateral" || tokenIn.standard === "HypSuperchainERC20Collateral") {
                const { queryClient, wagmiConfig, initData } = params;

                if (!queryClient || !wagmiConfig || !initData || !walletAddress) {
                    throw new Error(
                        "Query client, wagmi config, init data and wallet address are required for bridging",
                    );
                }

                const bridgeParams: GetTransferRemoteWithKernelCallsParams = {
                    chainId: tokenIn.chainId,
                    token: tokenIn.address,
                    tokenStandard: tokenIn.standard,
                    account: walletAddress,
                    destination: tokenOut.chainId,
                    recipient: walletAddress,
                    amount: amountIn,
                    //TODO: LOCAL CONTRACTS
                    createAccount: {
                        initData,
                        salt: zeroHash,
                        factoryAddress: contracts[tokenIn.chainId].kernelFactory,
                    },
                    contracts: {
                        execute: contracts[tokenIn.chainId].execute,
                        ownableSignatureExecutor: contracts[tokenIn.chainId].ownableSignatureExecutor,
                        erc7579Router: contracts[tokenIn.chainId].erc7579Router,
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
                address: tokenIn.address,
                destination: tokenOut.chainId,
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
            const { tokenIn: swapTokenIn, poolKey, zeroForOne } = swap;
            const { tokenIn: bridgeTokenIn, tokenOut: bridgeTokenOut } = bridge;

            const bridgeAddress = bridgeTokenIn.address;

            // TODO: add orbiter bridging
            if (bridgeTokenIn.standard === "NativeToken" && bridgeTokenOut.standard === "NativeToken") {
                if (!orbiterParams) {
                    throw new Error("Orbiter params are required for Orbiter bridging");
                }

                throw new Error("Must implement getSwapAndOrbiterBridgeTransaction");
            }

            let permit2PermitParams: [PermitSingle, Hex] | undefined = undefined;

            // Permit2 is not needed when swapping a native token
            if (swapTokenIn.standard !== "NativeToken") {
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: swapTokenIn.chainId,
                    minAmount: amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts[swapTokenIn.chainId].universalRouter,
                    token: getTokenAddress(swapTokenIn),
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
            if (
                (bridgeTokenIn.standard === "SuperchainERC20" ||
                    bridgeTokenIn.standard === "HypSuperchainERC20Collateral" ||
                    bridgeTokenIn.standard === "MockSuperchainERC20") &&
                (bridgeTokenOut.standard === "SuperchainERC20" ||
                    bridgeTokenOut.standard === "HypSuperchainERC20Collateral" ||
                    bridgeTokenOut.standard === "MockSuperchainERC20")
            ) {
                return getSwapAndSuperchainBridgeTransaction({
                    amountIn,
                    amountOutMinimum,
                    destinationChain: bridgeTokenOut.chainId,
                    poolKey,
                    receiver: walletAddress,
                    universalRouter: contracts[swapTokenIn.chainId].universalRouter,
                    zeroForOne,
                    permit2PermitParams,
                });
            }

            return getSwapAndHyperlaneSweepBridgeTransaction({
                universalRouter: contracts[swapTokenIn.chainId].universalRouter,
                bridgeAddress,
                // Default for local env
                bridgePayment: bridgePayment ?? 1n,
                destinationChain: bridgeTokenOut.chainId,
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

            const { tokenIn, tokenOut, withSuperchain } = bridge;
            const { poolKey, zeroForOne } = swap;

            if (tokenIn.standard === "NativeToken" && !withSuperchain && (!orbiterParams || !orbiterAmountOut)) {
                throw new Error("Orbiter params and amount out are required for Orbiter bridging");
            }

            // TODO: fix this for non local env
            const originERC7579ExecutorRouter = contracts[tokenIn.chainId].erc7579Router;
            const remoteERC7579ExecutorRouter = contracts[tokenOut.chainId].erc7579Router;

            if (!originERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${tokenIn.chainId}`);
            }

            if (!remoteERC7579ExecutorRouter) {
                throw new Error(`ERC7579ExecutorRouter address not defined for chain id: ${tokenOut.chainId}`);
            }

            const bridgeSwapParams: GetBridgeSwapWithKernelCallsParams = {
                chainId: tokenIn.chainId,
                token: tokenIn.address,
                tokenStandard: tokenIn.standard,
                tokenOutStandard: tokenOut.standard,
                account: walletAddress,
                destination: tokenOut.chainId,
                recipient: walletAddress,
                amount: amountIn,
                //TODO: LOCAL CONTRACTS
                contracts: {
                    // static
                    execute: contracts[tokenIn.chainId].execute,
                    ownableSignatureExecutor: contracts[tokenIn.chainId].ownableSignatureExecutor,
                    // mailbox
                    erc7579Router: contracts[tokenIn.chainId].erc7579Router,
                    interchainGasPaymaster: contracts[tokenIn.chainId].interchainGasPaymaster,
                },
                contractsRemote: {
                    execute: contracts[tokenOut.chainId].execute,
                    ownableSignatureExecutor: contracts[tokenOut.chainId].ownableSignatureExecutor,
                    // mailbox
                    erc7579Router: contracts[tokenOut.chainId].erc7579Router,
                },
                createAccount: {
                    initData,
                    salt: zeroHash,
                    // static
                    factoryAddress: contracts[tokenIn.chainId].kernelFactory,
                },
                createAccountRemote: {
                    initData,
                    salt: zeroHash,
                    // static
                    factoryAddress: contracts[tokenOut.chainId].kernelFactory,
                },
                // erc7579RouterOwners: [],
                // erc7579RouterOwnersRemote: [],
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: orbiterAmountOut ?? amountIn,
                    amountOutMinimum,
                    poolKey,
                    receiver: walletAddress,
                    universalRouter: contracts[tokenOut.chainId].universalRouter,
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
