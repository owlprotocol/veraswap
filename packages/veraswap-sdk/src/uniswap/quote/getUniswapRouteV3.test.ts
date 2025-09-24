import { QueryClient } from "@tanstack/react-query";
import { Address, parseAbi, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IERC20 } from "../../artifacts/IERC20.js";
import { IUniversalRouter } from "../../artifacts/IUniversalRouter.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../../constants/uniswap.js";
import { getUniswapV4Address } from "../../currency/currency.js";
import { anvilClientL1, wagmiConfig } from "../../test/constants.js";
import { addCommandsToRoutePlanner } from "../addCommandsToRoutePlanner.js";
import { RoutePlanner } from "../routerCommands.js";

import { getRouterCommandsForQuote, getUniswapRouteExactIn } from "./getUniswapRoute.js";

//TODO: Add deeper tests with ETH wrap/unwrap
describe("uniswap/quote/getUniswapRoute.test.ts", function () {
    const queryClient = new QueryClient();
    // Uniswap Error Abi
    const UniswapErrorAbi = parseAbi([
        "error DeltaNotNegative(address)",
        "error DeltaNotPositive(address)",
        "error CurrencyNotSettled()",
        "error PoolNotInitialized()",
        "error V3TooLittleReceived()",
        "error SwapAmountCannotBeZero()",
    ]);

    const amountIn = parseUnits("0.01", 18);

    // A/ETH, B/ETH Pools Exist
    // A/B Pool Does Not Exist
    const tokenA = getUniswapV4Address(LOCAL_CURRENCIES[0]); // 2 A tokens after this (Hyperlane)
    const tokenB = getUniswapV4Address(LOCAL_CURRENCIES[3]); // 2 B tokens after this (Hyperlane)
    const tokenL3 = getUniswapV4Address(LOCAL_CURRENCIES[7]);
    const tokenL4 = getUniswapV4Address(LOCAL_CURRENCIES[8]);

    const getBalanceForAddress = function (token: Address, address: Address) {
        if (token === zeroAddress) return opChainL1Client.getBalance({ address });

        return opChainL1Client.readContract({
            address: token,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [address],
        });
    };

    // Helper function to get balance of a token
    const getBalance = (token: Address) => getBalanceForAddress(token, anvilClientL1.account.address);

    test("A -> L3", async () => {
        const currencyIn = tokenA;
        const currencyOut = tokenL3;
        const currencyHops: Address[] = [];

        const contracts = {
            weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
            metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
        };

        // Route
        const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
            chainId: opChainL1.id,
            currencyIn,
            currencyOut,
            currencyHops,
            amountIn,
            contracts: {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            },
        });
        expect(route).toBeDefined();
        const { quote, amountOut, value } = route!;

        const commands = getRouterCommandsForQuote({ currencyIn, currencyOut, amountIn, contracts, ...quote });

        const routePlanner = new RoutePlanner();
        addCommandsToRoutePlanner(routePlanner, commands);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);
        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    });

    test("L4 -> ETH", async () => {
        const currencyIn = tokenL4;
        const currencyOut = zeroAddress; // ETH
        const currencyHops: Address[] = [];

        const contracts = {
            weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
            metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
        };

        // Route
        const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
            chainId: opChainL1.id,
            currencyIn,
            currencyOut,
            currencyHops,
            amountIn,
            contracts,
        });
        expect(route).toBeDefined();
        const { quote, amountOut, value } = route!;

        const commands = getRouterCommandsForQuote({
            currencyIn,
            currencyOut,
            amountIn,
            contracts,
            ...quote,
        });

        const routePlanner = new RoutePlanner();
        addCommandsToRoutePlanner(routePlanner, commands);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);

        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        const receipt = await opChainL1Client.waitForTransactionReceipt({ hash });
        // console.log(
        //     receipt.logs.map((l) => ({
        //         address: l.address,
        //         ...decodeEventLog({
        //             abi: events,
        //             data: l.data,
        //             topics: l.topics,
        //         }),
        //     })),
        // );

        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);

        const gasUsed = receipt.gasUsed;
        const effectiveGasPrice = receipt.effectiveGasPrice;
        const gasCost = gasUsed * effectiveGasPrice;

        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut - gasCost); // Output balance increased by variable amount minus gas cost
        // expect(currencyOutBalanceAfterSwap).toBe(amountOut); // Output balance increased by variable amount minus gas cost
    });

    test("L4 -> ETH with Veraswap and referral fee", async () => {
        const currencyIn = tokenL4;
        const currencyOut = zeroAddress; // ETH
        const currencyHops: Address[] = [];

        const contracts = {
            weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
            metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
        };

        const feeBips = 25n; // 0.25% referral fee
        const bipsDenominator = 10000n; // 100% = 10000 bips
        const feeAmount = (amountIn * feeBips) / bipsDenominator;
        const amountInWithoutFee = amountIn - feeAmount * 2n;

        // Route
        const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
            chainId: opChainL1.id,
            currencyIn,
            currencyOut,
            currencyHops,
            amountIn: amountInWithoutFee,
            contracts,
        });
        expect(route).toBeDefined();
        const { quote, amountOut, value } = route!;

        const veraswapAddress = "0x000000000000000000000000000000000000beef" as Address;
        const veraswapFeeRecipient = { address: veraswapAddress, bips: feeBips };

        const referralAddress = "0x00000000000000000000000000000000000beef2" as Address;
        const referralFeeRecipient = { address: referralAddress, bips: feeBips };

        const commands = getRouterCommandsForQuote({
            currencyIn,
            currencyOut,
            amountIn,
            contracts,
            veraswapFeeRecipient,
            referralFeeRecipient,
            ...quote,
        });

        const routePlanner = new RoutePlanner();
        addCommandsToRoutePlanner(routePlanner, commands);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
        const veraswapBalanceBeforeSwap = await getBalanceForAddress(currencyIn, veraswapAddress);
        const referralBalanceBeforeSwap = await getBalanceForAddress(currencyIn, referralAddress);

        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        const receipt = await opChainL1Client.waitForTransactionReceipt({ hash });

        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);
        const veraswapBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapAddress);
        const referralBalanceAfterSwap = await getBalanceForAddress(currencyIn, referralAddress);

        const gasUsed = receipt.gasUsed;
        const effectiveGasPrice = receipt.effectiveGasPrice;
        const gasCost = gasUsed * effectiveGasPrice;

        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut - gasCost); // Output balance increased by variable amount minus gas cost
        expect(veraswapBalanceAfterSwap).toBe(veraswapBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
        expect(referralBalanceAfterSwap).toBe(referralBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
    });

    test("A -> L3 -> B", async () => {
        const currencyIn = tokenA;
        const currencyOut = tokenB;
        const currencyHops = [tokenL3];

        const contracts = {
            weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
            metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
        };

        // Route
        const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
            chainId: opChainL1.id,
            currencyIn,
            currencyOut,
            currencyHops,
            amountIn,
            contracts,
        });
        expect(route).toBeDefined();
        const { quote, amountOut, value } = route!;

        const commands = getRouterCommandsForQuote({ currencyIn, currencyOut, amountIn, contracts, ...quote });

        const routePlanner = new RoutePlanner();
        addCommandsToRoutePlanner(routePlanner, commands);

        //Execute
        const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
        const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
        const hash = await anvilClientL1.writeContract({
            abi: [...IUniversalRouter.abi, ...UniswapErrorAbi],
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            value,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        });
        await opChainL1Client.waitForTransactionReceipt({ hash });
        const currencyInBalanceAfterSwap = await getBalance(currencyIn);
        const currencyOutBalanceAfterSwap = await getBalance(currencyOut);
        expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
        expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
    });
});
