import { QueryClient } from "@tanstack/react-query";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { createConfig, http } from "@wagmi/core";
import { createWalletClient, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IERC20 } from "../artifacts/IERC20.js";
import { opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";

import { getBasketSwaps } from "./getBasketSwaps.js";

describe("basket/getBasketSwaps.test.ts", function () {
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

    test("getBasketSwaps", async () => {
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
        const call = await getBasketSwaps(queryClient, config, {
            chainId: opChainL1.id,
            currencyIn: zeroAddress,
            currencyHops: [],
            exactAmount: amountIn,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
            contracts: {
                v4StateView: LOCAL_UNISWAP_CONTRACTS.v4StateView,
                v4Quoter: LOCAL_UNISWAP_CONTRACTS.v4Quoter,
                universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            },
            basketTokens,
            slippage: 0, //TODO: Implement this
        });

        const hash = await anvilClientL1.sendTransaction(call);
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
        expect(balanceADelta).toBeGreaterThan(balanceBDelta);
    });
});
