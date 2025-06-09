import { QueryClient } from "@tanstack/react-query";
import { Config } from "@wagmi/core";
import { readContractQueryOptions } from "@wagmi/core/query";
import { Address, encodeFunctionData, Hex } from "viem";

import { GasRouter } from "../../artifacts/GasRouter.js";
import { IUniversalRouter } from "../../artifacts/IUniversalRouter.js";
import {
    getPermit2PermitSignature,
    GetPermit2PermitSignatureParams,
} from "../../calls/Permit2/getPermit2PermitSignature.js";
import { MAX_UINT_160 } from "../../constants/uint256.js";
import { Currency, getUniswapV4Address } from "../../currency/currency.js";
import { getSuperchainBridgeTransaction } from "../../superchain/getSuperchainBridgeTransaction.js";
import { getTransferRemoteCall } from "../../swap/getTransferRemoteCall.js";
import { PermitSingle } from "../../types/AllowanceTransfer.js";
import { PoolKeyOptions } from "../../types/PoolKey.js";
import { getHyperlaneTransferRemoteCommand } from "../commands/getHyperlaneTransferRemoteCommand.js";
import { getOrbiterBridgeAllETHCommand } from "../commands/getOrbiterBridgeAllEthCommand.js";
import { getSuperchainSendAllERC20Command } from "../commands/getSuperchainSendAllERC20Command.js";
import { CommandType, createCommand, RoutePlanner } from "../routerCommands.js";

import { getRouteSteps } from "./getRouteSteps.js";
import { getRouterCommandsForQuote } from "./getUniswapRoute.js";

//TODO: Add slippage?
export interface GetRouteTransactionParams {
    account: Address;
    currencyIn: Currency;
    currencyOut: Currency;
    amountIn: bigint;
    recipient?: Address;
    currencyHopsByChain: Record<number, Address[] | undefined>;
    contractsByChain: Record<number, { universalRouter: Address; metaQuoter: Address; weth9: Address } | undefined>;
    poolKeyOptions?: PoolKeyOptions[];
}

export async function getRouteTransaction(
    queryClient: QueryClient,
    wagmiConfig: Config,
    params: GetRouteTransactionParams,
): Promise<{ to: Address; data: Hex; value: bigint } | null> {
    const { account, contractsByChain } = params;

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
            const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

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
            const { currencyIn, currencyOut, amountIn, recipient } = step;
            const router = currencyIn.hyperlaneAddress!;
            const bridgePayment = await queryClient.fetchQuery(
                readContractQueryOptions(wagmiConfig, {
                    chainId: currencyIn.chainId,
                    address: router,
                    abi: GasRouter.abi,
                    functionName: "quoteGasPayment",
                    args: [currencyOut.chainId],
                }),
            );

            if (currencyIn.hyperlaneAddress != currencyIn.address) {
                // HypERC20Collateral (collateral has different address)
                // TODO: Implement transfer via smart account?
                return null;
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
                    bridgePayment: 0n, // TODO: Add bridge payment if needed
                    router: bridge.currencyIn.hyperlaneAddress!,
                    destination: bridge.currencyOut.chainId,
                    recipient: bridge.recipient ?? account,
                });
                commands.push(bridgeCommand);
            }

            const routePlanner = RoutePlanner.create(commands);
            const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
            // const [bridge, swap] = steps;
            //TODO: Implement this case
            return null;
        } else {
            return null; // Invalid route, must have one swap and one bridge
        }
    } else {
        // Unsupported 3 steps route
        return null;
    }
}
