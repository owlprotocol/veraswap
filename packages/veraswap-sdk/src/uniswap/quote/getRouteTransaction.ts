/* eslint-disable */
//@ts-nocheck WIP new transaction builder
import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { Address, encodeFunctionData, Hex, zeroHash } from "viem";

import { IUniversalRouter } from "../../artifacts/IUniversalRouter.js";
import {
    getBridgeSwapWithKernelCalls,
    GetBridgeSwapWithKernelCallsParams,
} from "../../calls/getBridgeSwapWithKernelCalls.js";
import {
    getTransferRemoteWithKernelCalls,
    GetTransferRemoteWithKernelCallsParams,
} from "../../calls/getTransferRemoteWithKernelCalls.js";
import {
    getPermit2PermitSignature,
    GetPermit2PermitSignatureParams,
} from "../../calls/Permit2/getPermit2PermitSignature.js";
import { MAX_UINT_160 } from "../../constants/uint256.js";
import { Currency, getUniswapV4Address, isMultichainToken } from "../../currency/currency.js";
import { getSuperchainBridgeTransaction } from "../../superchain/getSuperchainBridgeTransaction.js";
import { getTransferRemoteCall } from "../../swap/getTransferRemoteCall.js";
import { PermitSingle } from "../../types/AllowanceTransfer.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { TokenStandard } from "../../types/Token.js";
import { getHyperlaneTransferRemoteCommand } from "../commands/getHyperlaneTransferRemoteCommand.js";
import { getOrbiterBridgeAllETHCommand } from "../commands/getOrbiterBridgeAllEthCommand.js";
import { getSuperchainSendAllERC20Command } from "../commands/getSuperchainSendAllERC20Command.js";
import { CommandType, createCommand, RoutePlanner } from "../routerCommands.js";

import { getRouteSteps } from "./getRouteSteps.js";
import { getRouterCommandsForQuote } from "./getUniswapRoute.js";

//TODO: Add slippage?
export interface GetRouteTransactionParams {
    account: Address;
    smartAccount: {
        initData: Hex;
    };
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    recipient?: Address;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<
        number,
        | {
              execute: Address;
              kernelFactory: Address;
              ownableSignatureExecutor: Address;
              erc7579Router: Address;
              universalRouter: Address;
              metaQuoter: Address;
              weth9: Address;
              interchainGasPaymaster: Address;
          }
        | undefined
    >;
    poolKeyOptions?: PoolKeyOptions[];
}

export async function getRouteTransaction(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetRouteTransactionParams,
): Promise<{ to: Address; data?: Hex; value?: bigint } | null> {
    const { account, smartAccount, contractsByChain } = params;

    const steps = await getRouteSteps(queryClient, wagmiConfig, params);
    if (!steps) return null;

    if (steps.length === 1) {
        // Single step swap or bridge
        const [step] = steps;
        if (step.type === "uniswap") {
            // Swap
            const { currencyIn, currencyOut, amountIn, recipient } = step;
            const { bestQuoteSingle, bestQuoteMultihop, bestQuoteType } = step;
            const contracts = contractsByChain[step.currencyIn.chainId];
            if (!contracts) return null; // No contracts available for this chain

            const weth9 = contracts.weth9;
            // Get swap commands
            const commands = getRouterCommandsForQuote({
                currencyIn: getUniswapV4Address(currencyIn),
                currencyOut: getUniswapV4Address(currencyOut),
                amountIn,
                recipient,
                bestQuoteSingle,
                bestQuoteMultihop,
                bestQuoteType,
                contracts: {
                    weth9,
                },
            });

            if (!currencyIn.isNative) {
                // Check if Permit2 approval is needed (for ERC20 input only)
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: currencyIn.chainId,
                    minAmount: amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts.universalRouter,
                    token: getUniswapV4Address(currencyIn),
                    account,
                };
                // Request signature if needed
                const { permitSingle, signature } = await getPermit2PermitSignature(
                    queryClient,
                    wagmiConfig,
                    getPermit2Params,
                );
                const permit2PermitParams: [PermitSingle, Hex] | undefined =
                    permitSingle && signature ? [permitSingle, signature] : undefined;

                if (permit2PermitParams) {
                    // Insert permit2 command at start
                    commands.splice(0, 0, createCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams));
                }
            }

            const routePlanner = RoutePlanner.create(commands);
            const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 600);

            return {
                to: contracts.universalRouter,
                data: encodeFunctionData({
                    abi: IUniversalRouter.abi,
                    functionName: "execute",
                    args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
                }),
                value: currencyIn.isNative ? amountIn : 0n,
            };
        } else if (step.type === "orbiter") {
            const { quote } = step;
            const { to, value, data } = quote.steps[0].tx;
            return { to, value: BigInt(value), data };
        } else if (step.type === "stargate") {
            // TODO: Implement Stargate bridge transaction
            return null;
        } else if (step.type === "superchain") {
            const { currencyIn, currencyOut, amountIn, recipient } = step;
            return getSuperchainBridgeTransaction({
                token: currencyIn.address,
                recipient: recipient ?? account,
                amount: amountIn,
                destination: currencyOut.chainId,
            });
        } else if (step.type === "hyperlane") {
            const { currencyIn, currencyOut, amountIn, recipient, bridgePayment } = step;

            if (currencyIn.hyperlaneAddress != currencyIn.address) {
                const contracts = contractsByChain[step.currencyIn.chainId];
                if (!contracts) return null; // No contracts available for this chain
                // HypERC20Collateral (collateral has different address)
                // TODO: Implement transfer via smart account?
                const bridgeParams: GetTransferRemoteWithKernelCallsParams = {
                    chainId: currencyIn.chainId,
                    token: currencyIn.hyperlaneAddress!,
                    tokenStandard: "HypERC20Collateral",
                    account,
                    destination: currencyOut.chainId,
                    recipient: recipient ?? account,
                    amount: amountIn,
                    //TODO: LOCAL CONTRACTS
                    createAccount: {
                        initData: smartAccount.initData,
                        salt: zeroHash,
                        factoryAddress: contracts.kernelFactory,
                    },
                    contracts,
                };

                const result = await getTransferRemoteWithKernelCalls(queryClient, wagmiConfig, bridgeParams);
                return result.calls[0];
            } else {
                // HypERC20 (same address)
                // TODO: Need to quote gas
                return getTransferRemoteCall({
                    address: currencyIn.hyperlaneAddress,
                    destination: currencyOut.chainId,
                    recipient: recipient ?? account,
                    amount: amountIn,
                    bridgePayment,
                });
            }
        } else {
            // Unsupported step type
            return null;
        }
    } else if (steps.length === 2) {
        if (steps[0].type === "uniswap" && steps[1].type != "uniswap") {
            // Swap & Bridge
            const [swap, bridge] = steps;

            // Swap
            const { bestQuoteSingle, bestQuoteMultihop, bestQuoteType } = swap;
            const contracts = contractsByChain[swap.currencyIn.chainId];
            if (!contracts) return null; // No contracts available for this chain

            const weth9 = contracts.weth9;
            // Get swap commands
            const commands = getRouterCommandsForQuote({
                currencyIn: getUniswapV4Address(swap.currencyIn),
                currencyOut: getUniswapV4Address(swap.currencyOut),
                amountIn: swap.amountIn,
                recipient: swap.recipient,
                bestQuoteSingle,
                bestQuoteMultihop,
                bestQuoteType,
                contracts: {
                    weth9,
                },
            });

            if (!swap.currencyIn.isNative) {
                // Check if Permit2 approval is needed (for ERC20 input only)
                const getPermit2Params: GetPermit2PermitSignatureParams = {
                    chainId: swap.currencyIn.chainId,
                    minAmount: swap.amountIn,
                    approveAmount: MAX_UINT_160,
                    approveExpiration: "MAX_UINT_48",
                    spender: contracts.universalRouter,
                    token: getUniswapV4Address(swap.currencyIn),
                    account,
                };
                // Request signature if needed
                const { permitSingle, signature } = await getPermit2PermitSignature(
                    queryClient,
                    wagmiConfig,
                    getPermit2Params,
                );
                const permit2PermitParams: [PermitSingle, Hex] | undefined =
                    permitSingle && signature ? [permitSingle, signature] : undefined;

                if (permit2PermitParams) {
                    // Insert permit2 command at start
                    commands.splice(0, 0, createCommand(CommandType.PERMIT2_PERMIT, permit2PermitParams));
                }
            }

            // Add bridge command
            if (bridge.type === "orbiter") {
                // Orbiter bridge
                const { quote } = bridge;
                const bridgeCommand = getOrbiterBridgeAllETHCommand(quote);
                commands.push(bridgeCommand);
            } else if (bridge.type === "superchain") {
                // Superchain bridge
                const bridgeCommand = getSuperchainSendAllERC20Command({
                    token: getUniswapV4Address(bridge.currencyIn),
                    to: bridge.recipient ?? account,
                    chainId: bridge.currencyOut.chainId,
                });
                commands.push(bridgeCommand);
            } else if (bridge.type === "hyperlane") {
                // Hyperlane bridge
                const bridgeCommand = getHyperlaneTransferRemoteCommand({
                    bridgePayment: bridge.bridgePayment,
                    router: bridge.currencyIn.hyperlaneAddress!,
                    destination: bridge.currencyOut.chainId,
                    recipient: bridge.recipient ?? account,
                });
                commands.push(bridgeCommand);
            }

            const routePlanner = RoutePlanner.create(commands);
            const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 600);
            return {
                to: contracts.universalRouter,
                data: encodeFunctionData({
                    abi: IUniversalRouter.abi,
                    functionName: "execute",
                    args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
                }),
                value: swap.currencyIn.isNative ? swap.amountIn : 0n,
            };
        } else if (steps[0].type != "uniswap" && steps[1].type === "uniswap") {
            // Bridge & Swap
            const [bridge] = steps;
            const contracts = contractsByChain[bridge.currencyIn.chainId];
            if (!contracts) return null; // No contracts available for this chain
            const contractsRemote = contractsByChain[bridge.currencyOut.chainId];
            if (!contractsRemote) return null; // No contracts available for this chain

            const bridgeSwapParams: GetBridgeSwapWithKernelCallsParams = {
                chainId: bridge.currencyIn.chainId,
                token: isMultichainToken(bridge.currencyIn)
                    ? (bridge.currencyIn.hyperlaneAddress ?? bridge.currencyIn.address)
                    : getUniswapV4Address(bridge.currencyIn),
                tokenStandard: getTokenStandard(bridge.currencyIn),
                tokenSymbol: bridge.currencyIn.symbol,
                // tokenOutStandard: getTokenStandard(bridge.currencyOut),
                account: account,
                destination: bridge.currencyOut.chainId,
                recipient: account ?? bridge.recipient,
                amount: bridge.amountIn,
                //TODO: LOCAL CONTRACTS
                contracts,
                contractsRemote,
                createAccount: {
                    initData: smartAccount.initData,
                    salt: zeroHash,
                    factoryAddress: contracts.kernelFactory,
                },
                createAccountRemote: {
                    initData: smartAccount.initData,
                    salt: zeroHash,
                    factoryAddress: contracts.kernelFactory,
                },
                // erc7579RouterOwners: [],
                // erc7579RouterOwnersRemote: [],
                remoteSwapParams: {
                    // Adjust amount in if using orbiter to account for fees
                    amountIn: remoteSwapAmountIn,
                    amountOutMinimum,
                    path,
                    currencyIn: getUniswapV4Address(swapCurrencyIn),
                    currencyOut: getUniswapV4Address(swapCurrencyOut),
                    receiver: walletAddress,
                    universalRouter: contracts[currencyOut.chainId].universalRouter,
                },
                orbiterQuote,
            };

            const result = await getBridgeSwapWithKernelCalls(queryClient, wagmiConfig, bridgeSwapParams);

            return result.calls[0] as {
                to: Address;
                data: Hex;
                value: bigint;
            };
        } else {
            return null; // Invalid route, must have one swap and one bridge
        }
    } else {
        // Unsupported 3 steps route
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
