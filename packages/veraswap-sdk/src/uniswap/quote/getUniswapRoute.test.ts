import { QueryClient } from "@tanstack/react-query";
import { Address, parseAbi, parseUnits, zeroAddress } from "viem";
import { describe, expect, test } from "vitest";

import { IERC20 } from "../../artifacts/IERC20.js";
import { IUniversalRouter } from "../../artifacts/IUniversalRouter.js";
import { opChainL1, opChainL1Client } from "../../chains/supersim.js";
import { getMockERC20Address, LOCAL_CURRENCIES } from "../../constants/tokens.js";
import { LOCAL_UNISWAP_CONTRACTS } from "../../constants/uniswap.js";
import { getUniswapV4Address } from "../../currency/currency.js";
import { anvilClientL1, wagmiConfig } from "../../test/constants.js";
import { addCommandsToRoutePlanner } from "../addCommandsToRoutePlanner.js";
import { CommandType, RoutePlanner } from "../routerCommands.js";

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
    const tokenL34 = getUniswapV4Address(LOCAL_CURRENCIES[6]);
    const tokenL3 = getUniswapV4Address(LOCAL_CURRENCIES[7]);
    const tokenL4 = getUniswapV4Address(LOCAL_CURRENCIES[8]);
    const tokenZ = getMockERC20Address({ name: "Token Z", symbol: "Z", decimals: 18 });

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

    describe("V4 Single", () => {
        test("A -> L4", async () => {
            const currencyIn = tokenA;
            const currencyOut = tokenL4;
            console.debug({ currencyIn, currencyOut });
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

            const commands = getRouterCommandsForQuote({ currencyIn, currencyOut, amountIn, contracts, ...quote });

            const routePlanner = new RoutePlanner();
            addCommandsToRoutePlanner(routePlanner, commands);

            //Execute
            const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
            const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

        test("PERMIT2_TRANSFER_FROM command", async () => {
            const currencyIn = tokenA;

            const veraswapFeeRecipient = "0x000000000000000000000000000000000000beef" as Address;
            const feeRecipientBalanceBeforeSwap = await getBalanceForAddress(currencyIn, veraswapFeeRecipient);
            const currencyInBalanceBeforeSwap = await getBalance(currencyIn);

            const feeAmount = 1000n;

            const routePlanner = new RoutePlanner();
            routePlanner.addCommand(CommandType.PERMIT2_TRANSFER_FROM, [currencyIn, veraswapFeeRecipient, feeAmount]);

            //Execute
            const value = 0n;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
            const hash = await anvilClientL1.writeContract({
                abi: [...IUniversalRouter.abi, ...UniswapErrorAbi],
                address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
                value,
                functionName: "execute",
                args: [routePlanner.commands, routePlanner.inputs, deadline],
            });
            await opChainL1Client.waitForTransactionReceipt({ hash });

            const currencyInBalanceAfterSwap = await getBalance(currencyIn);
            const feeRecipientBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapFeeRecipient);

            // Input balance decreased by exact amount
            expect(currencyInBalanceBeforeSwap - currencyInBalanceAfterSwap).toBe(feeAmount);
            // Input balance increased by exact amount
            expect(feeRecipientBalanceAfterSwap - feeRecipientBalanceBeforeSwap).toBe(feeAmount);
        });

        test("A -> L4 with Veraswap fee", async () => {
            const currencyIn = tokenA;
            const currencyOut = tokenL4;
            const currencyHops: Address[] = [];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            const feeBips = 100n; // 1% referral fee
            const bipsDenominator = 10000n; // 100% = 10000 bips
            const feeAmount = (amountIn * feeBips) / bipsDenominator;
            const amountInWithoutFee = amountIn - feeAmount;

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
            const commands = getRouterCommandsForQuote({
                currencyIn,
                currencyOut,
                amountIn,
                contracts,
                veraswapFeeRecipient,
                ...quote,
            });

            const routePlanner = new RoutePlanner();
            addCommandsToRoutePlanner(routePlanner, commands);

            //Execute
            const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
            const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
            const veraswapBalanceBeforeSwap = await getBalanceForAddress(currencyIn, veraswapAddress);

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
            const veraswapBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapAddress);

            expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
            expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
            expect(veraswapBalanceAfterSwap).toBe(veraswapBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
        });

        test("A -> L4 with Veraswap and referral fee", async () => {
            const currencyIn = tokenA;
            const currencyOut = tokenL4;
            const currencyHops: Address[] = [];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            const feeBips = 100n; // 1% referral fee
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

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
            const veraswapBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapAddress);
            const referralBalanceAfterSwap = await getBalanceForAddress(currencyIn, referralAddress);

            expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
            expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
            expect(veraswapBalanceAfterSwap).toBe(veraswapBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
            expect(referralBalanceAfterSwap).toBe(referralBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
        });

        // TODO: figure out why ETH is giving V3TooLittleReceived()
        test.skip("ETH -> L4 with Veraswap fee", async () => {
            const currencyIn = zeroAddress; // ETH
            const currencyOut = tokenL4;
            const currencyHops: Address[] = [];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            const feeBips = 100n; // 1% referral fee
            const bipsDenominator = 10000n; // 100% = 10000 bips
            const feeAmount = (amountIn * feeBips) / bipsDenominator;
            const amountInWithoutFee = amountIn - feeAmount;

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
            const commands = getRouterCommandsForQuote({
                currencyIn,
                currencyOut,
                amountIn,
                contracts,
                veraswapFeeRecipient,
                ...quote,
            });

            const routePlanner = new RoutePlanner();
            addCommandsToRoutePlanner(routePlanner, commands);

            //Execute
            const currencyInBalanceBeforeSwap = await getBalance(currencyIn);
            const currencyOutBalanceBeforeSwap = await getBalance(currencyOut);
            const veraswapBalanceBeforeSwap = await getBalanceForAddress(currencyIn, veraswapAddress);

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
            const veraswapBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapAddress);

            expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
            expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
            expect(veraswapBalanceAfterSwap).toBe(veraswapBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
        });

        // TODO: figure out why ETH is giving V3TooLittleReceived()
        test.skip("ETH -> L4 with Veraswap and referral fee", async () => {
            const currencyIn = zeroAddress; // ETH
            const currencyOut = tokenL4;
            const currencyHops: Address[] = [];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            const feeBips = 100n; // 1% referral fee
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

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
            const veraswapBalanceAfterSwap = await getBalanceForAddress(currencyIn, veraswapAddress);
            const referralBalanceAfterSwap = await getBalanceForAddress(currencyIn, referralAddress);

            expect(currencyInBalanceAfterSwap).toBe(currencyInBalanceBeforeSwap - amountIn); // Input balance decreased by exact amount
            expect(currencyOutBalanceAfterSwap).toBe(currencyOutBalanceBeforeSwap + amountOut); // Output balance increased by variable amount
            expect(veraswapBalanceAfterSwap).toBe(veraswapBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
            expect(referralBalanceAfterSwap).toBe(referralBalanceBeforeSwap + feeAmount); // Input balance increased by exact amount
        });
    });

    describe("V3 Single", () => {
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

    describe("V4 Multihop", () => {
        test("A -> L4 -> B", async () => {
            const currencyIn = tokenA;
            const currencyOut = tokenB;
            const currencyHops = [tokenL4];

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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

    describe("V3 Multihop", () => {
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

    describe("Mixed V4 -> V3", () => {
        test("L4 -> L34 -> L3", async () => {
            const currencyIn = tokenL4;
            const currencyOut = tokenL3;
            const hopCurrencies = [tokenL34];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            // Route
            const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
                chainId: opChainL1.id,
                currencyIn,
                currencyOut,
                currencyHops: hopCurrencies,
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

        test("A -> ETH -> Z", async () => {
            const currencyIn = tokenA;
            const currencyOut = tokenZ;
            const hopCurrencies = [zeroAddress];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            // Route
            const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
                chainId: opChainL1.id,
                currencyIn,
                currencyOut,
                currencyHops: hopCurrencies,
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
    describe("Mixed V3 -> V4", () => {
        test("L3 -> L34 -> L4", async () => {
            const currencyIn = tokenL3;
            const currencyOut = tokenL4;
            const hopCurrencies = [tokenL34];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            // Route
            const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
                chainId: opChainL1.id,
                currencyIn,
                currencyOut,
                currencyHops: hopCurrencies,
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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

        test("Z -> ETH -> A", async () => {
            const currencyIn = tokenZ;
            const currencyOut = tokenA;
            const hopCurrencies = [zeroAddress];

            const contracts = {
                weth9: LOCAL_UNISWAP_CONTRACTS.weth9,
                metaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            };

            // Route
            const route = await getUniswapRouteExactIn(queryClient, wagmiConfig, {
                chainId: opChainL1.id,
                currencyIn,
                currencyOut,
                currencyHops: hopCurrencies,
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
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
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
});
