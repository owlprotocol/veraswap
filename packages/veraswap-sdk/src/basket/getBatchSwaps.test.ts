import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { createWalletClient, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IERC20 } from "../artifacts/IERC20.js";
import { UniversalRouter } from "../artifacts/UniversalRouter.js";
import { opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getBasketQuotes } from "./getBasketQuotes.js";
import { BatchSwapItem, getBatchSwaps } from "./getBatchSwaps.js";

describe("basket/getBatchSwaps.test.ts", function () {
    const config = createConfig({
        chains: [opChainL1],
        transports: {
            [opChainL1.id]: http(),
        },
    });
    const queryClient = new QueryClient();

    const anvilAccount = getAnvilAccount();
    const anvilClientL1 = createWalletClient({
        account: anvilAccount,
        chain: opChainL1Client.chain,
        transport: http(),
    });

    const tokenA = LOCAL_CURRENCIES[0];
    const tokenAAddress = getUniswapV4Address(tokenA);
    const tokenB = LOCAL_CURRENCIES[3];
    const tokenBAddress = getUniswapV4Address(tokenB);

    const basketTokens = [
        {
            address: tokenAAddress,
            weight: 2n,
        },
        {
            address: tokenBAddress,
            weight: 1n,
        },
    ];

    test("getBatchSwaps", async () => {
        const balanceEthStart = await opChainL1Client.getBalance({ address: anvilAccount.address });
        const balanceAStart = await opChainL1Client.readContract({
            address: tokenAAddress,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        const balanceBStart = await opChainL1Client.readContract({
            address: tokenBAddress,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });

        const amountIn = parseUnits("0.1", 18);
        // Buy with ETH, (2A,1B) ratio
        const quotes = await getBasketQuotes(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: zeroAddress,
            currencyHops: [],
            exactAmount: amountIn,
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
            },
            basketTokens,
        });

        expect(quotes.length).toBe(2);
        expect(quotes[0].amountIn).toBe(quotes[1].amountIn * 2n);
        expect(quotes[0].amountOut).toBeGreaterThan(quotes[1].amountOut); //Not exactly 2x due to slippage

        // Compute V4 swap
        const swaps: BatchSwapItem[] = quotes.map((quote) => {
            return {
                currencyIn: quote.currencyIn,
                currencyOut: quote.currencyOut,
                route: quote.route,
                amountIn: quote.amountIn,
                amountOutMinimum: quote.amountOut,
            };
        });

        const v4Swap = getBatchSwaps({ swaps, receiver: anvilAccount.address });
        expect(v4Swap).toBeDefined();

        const routePlanner = new RoutePlanner();
        routePlanner.addCommand(CommandType.V4_SWAP, [v4Swap]);
        const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

        const hash = await anvilClientL1.writeContract({
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            abi: UniversalRouter.abi,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, routerDeadline],
            value: amountIn,
        });
        const receipt = await opChainL1Client.waitForTransactionReceipt({
            hash,
        });
        expect(receipt).toBeDefined();

        const balanceEthEnd = await opChainL1Client.getBalance({ address: anvilAccount.address });
        const balanceAEnd = await opChainL1Client.readContract({
            address: tokenAAddress,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });
        const balanceBEnd = await opChainL1Client.readContract({
            address: tokenBAddress,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [anvilAccount.address],
        });

        const balanceEthDelta = balanceEthEnd - balanceEthStart;
        const balanceADelta = balanceAEnd - balanceAStart;
        const balanceBDelta = balanceBEnd - balanceBStart;

        expect(balanceEthDelta).toBe(-1n * (amountIn + receipt.effectiveGasPrice * receipt.gasUsed));
        expect(balanceADelta).toBe(quotes[0].amountOut);
        expect(balanceBDelta).toBe(quotes[1].amountOut);
    });
});
