import { QueryClient } from "@tanstack/react-query";
import { Actions, V4Planner } from "@uniswap/v4-sdk";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress } from "@veraswap/create-deterministic";
import {
    Address,
    createWalletClient,
    encodeDeployData,
    encodeFunctionData,
    Hex,
    http,
    numberToHex,
    parseAbi,
    parseEther,
    zeroAddress,
    zeroHash,
} from "viem";
import { describe, expect, test } from "vitest";
import { createConfig } from "wagmi";
import { readContractQueryOptions } from "wagmi/query";

import { BasketFixedUnits } from "../artifacts/BasketFixedUnits.js";
import { ExecuteSweep } from "../artifacts/ExecuteSweep.js";
import { IERC20 } from "../artifacts/IERC20.js";
import { IUniversalRouter } from "../artifacts/IUniversalRouter.js";
import { metaQuoteExactOutputBest } from "../artifacts/IV4MetaQuoter.js";
import { opChainL1, opChainL1Client } from "../chains/supersim.js";
import { LOCAL_CURRENCIES } from "../constants/tokens.js";
import { MAX_UINT_256 } from "../constants/uint256.js";
import { EXECUTE_SWEEP, LOCAL_UNISWAP_CONTRACTS } from "../constants/uniswap.js";
import { getUniswapV4Address } from "../currency/currency.js";
import { DEFAULT_POOL_PARAMS } from "../types/PoolKey.js";
import { MetaQuoteBestType, V4MetaQuoteExactBestReturnType } from "../uniswap/quote/MetaQuoter.js";
import { CommandType, RoutePlanner } from "../uniswap/routerCommands.js";

import { getBasketMint } from "./getBasketMint.js";
import { getBasketMintQuote } from "./getBasketMintQuote.js";

//TODO: Disable for now
describe.skip("basket/getBasketMint.test.ts", function () {
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

    const basketToken0 = tokenAAddress < tokenBAddress ? tokenAAddress : tokenBAddress;
    const basketToken1 = tokenAAddress < tokenBAddress ? tokenBAddress : tokenAAddress;
    const basketTokens = [
        {
            addr: basketToken0,
            units: parseEther("1"),
        },
        {
            addr: basketToken1,
            units: parseEther("1"),
        },
    ];
    const basket0 = getDeployDeterministicAddress({
        bytecode: encodeDeployData({
            abi: BasketFixedUnits.abi,
            bytecode: BasketFixedUnits.bytecode,
            args: ["Index AB50", "AB50.NF", zeroAddress, 0n, basketTokens],
        }),
        salt: zeroHash,
    });

    test("Swap A/B to EXECUTE_SWEEP", async () => {
        // Check ERC20 balances of EXECUTE_SWEEP pre-swap
        const balancePreSwapToken0 = await opChainL1Client.readContract({
            address: basketToken0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [EXECUTE_SWEEP],
        });
        const balancePreSwapToken1 = await opChainL1Client.readContract({
            address: basketToken1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [EXECUTE_SWEEP],
        });

        // Params
        const chainId = opChainL1.id;
        const basket = basket0;
        const mintAmount = parseEther("0.01");
        const receiver = anvilAccount.address;
        const referrer = zeroAddress;
        const currencyIn = zeroAddress;
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const currencyHops = [] as Address[];
        const contracts = {
            v4MetaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
            universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
        };
        const poolKeyOptions = Object.values(DEFAULT_POOL_PARAMS);
        // Get required underlying tokens and their raw units
        const mintUnits = await queryClient.fetchQuery(
            readContractQueryOptions(config, {
                chainId,
                address: basket,
                abi: BasketFixedUnits.abi,
                functionName: "getMintUnits",
                args: [mintAmount],
            }),
        );

        // Quote exactOut for each token
        const quotes = (await Promise.all(
            mintUnits.map(async (mintUnit) => {
                const token = mintUnit.addr;
                const units = mintUnit.units;

                const quote = await queryClient.fetchQuery(
                    readContractQueryOptions(config, {
                        chainId,
                        address: contracts.v4MetaQuoter,
                        abi: [metaQuoteExactOutputBest],
                        functionName: "metaQuoteExactOutputBest",
                        args: [
                            {
                                exactCurrency: token,
                                variableCurrency: currencyIn,
                                hopCurrencies: currencyHops.filter(
                                    (hopToken) => hopToken !== token && hopToken !== currencyIn,
                                ),
                                exactAmount: numberToHex(units),
                                poolKeyOptions,
                            } as const,
                        ],
                    }),
                );

                return { quote, currencyOut: token, amountOut: units };
            }),
        )) as { quote: V4MetaQuoteExactBestReturnType; currencyOut: Address; amountOut: bigint }[];

        // Encode swaps
        const tradePlan = new V4Planner();
        let currencyInAmount = 0n;
        // Add swaps
        quotes.forEach((swap) => {
            const [bestSingleSwap, bestMultihopSwap, bestType] = swap.quote;
            const currencyOut = swap.currencyOut;
            const amountOut = swap.amountOut;

            if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Single) {
                // Cheapest swap is single hop
                tradePlan.addAction(Actions.SWAP_EXACT_OUT_SINGLE, [
                    {
                        poolKey: bestSingleSwap.poolKey,
                        zeroForOne: bestSingleSwap.zeroForOne,
                        amountOut,
                        amountInMaximum: bestSingleSwap.variableAmount,
                        hookData: bestSingleSwap.hookData,
                    },
                ]);
                // Increase input settlement
                currencyInAmount += bestSingleSwap.variableAmount;
            } else if ((bestType as MetaQuoteBestType) === MetaQuoteBestType.Multihop) {
                // Cheapest swap is multihop
                tradePlan.addAction(Actions.SWAP_EXACT_OUT, [
                    {
                        currencyOut,
                        path: bestMultihopSwap.path,
                        amountOut,
                        amountInMaximum: bestMultihopSwap.variableAmount,
                    },
                ]);
                // Increase input settlement
                currencyInAmount += bestSingleSwap.variableAmount;
            } else {
                //TODO: Return null?
                throw new Error("no liquidity");
            }
        });

        // Settle all inputs
        //TODO: Add slippage for input & sweep any dust to user
        tradePlan.addAction(Actions.SETTLE_ALL, [currencyIn, MAX_UINT_256]);
        // Take all outputs (send to ExecuteSweep)
        const uniqueCurrencyOut = new Set(mintUnits.map(({ addr }) => addr));
        uniqueCurrencyOut.forEach((currencyOut) => {
            tradePlan.addAction(Actions.TAKE, [currencyOut, EXECUTE_SWEEP, 0]);
        });

        // Encode router plan
        const routePlanner = new RoutePlanner();
        // Add v4 swap command
        routePlanner.addCommand(CommandType.V4_SWAP, [tradePlan.finalize() as Hex]);

        const inputIsNative = currencyIn === zeroAddress;
        const errorAbi = parseAbi([
            "error DeltaNotNegative(address)",
            "error DeltaNotPositive(address)",
            "error CurrencyNotSettled()",
        ]);
        const executeArgs = {
            abi: [...IUniversalRouter.abi, ...errorAbi],
            address: contracts.universalRouter,
            value: inputIsNative ? currencyInAmount : 0n,
            functionName: "execute",
            args: [routePlanner.commands, routePlanner.inputs, deadline],
        } as const;
        const swapHash = await anvilClientL1.writeContract(executeArgs);
        await opChainL1Client.waitForTransactionReceipt({ hash: swapHash });

        // Check ERC20 balances of EXECUTE_SWEEP post-swap
        const balancePostSwapToken0 = await opChainL1Client.readContract({
            address: basketToken0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [EXECUTE_SWEEP],
        });
        const balancePostSwapToken1 = await opChainL1Client.readContract({
            address: basketToken1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [EXECUTE_SWEEP],
        });
        // EXECUTE_SWEEP receivs exact amount of tokens
        expect(balancePostSwapToken0 - balancePreSwapToken0, "IERC20(balanceToken0).balanceOf(EXECUTE_SWEEP)").toEqual(
            mintUnits[0].units,
        );
        expect(balancePostSwapToken1 - balancePreSwapToken1, "IERC20(balanceToken1).balanceOf(EXECUTE_SWEEP)").toEqual(
            mintUnits[1].units,
        );

        // Check basket0 balance of receiver pre-mint
        const balancePreMintBasket0 = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [receiver],
        });

        // Mint via EXECUTE_SWEEP
        const mintCall = encodeFunctionData({
            abi: BasketFixedUnits.abi,
            functionName: "mint",
            args: [mintAmount, receiver, referrer],
        });
        const mintUnitEth = mintUnits.find((unit) => unit.addr === zeroAddress);
        const mintUnitEthAmount = mintUnitEth ? mintUnitEth.units : 0n; //one of the basket assets is ETH
        expect(mintUnitEthAmount).toBe(0n); //underlying is only ERC20
        const executeSweepHash = await anvilClientL1.writeContract({
            abi: ExecuteSweep.abi,
            address: EXECUTE_SWEEP,
            functionName: "execute",
            args: [basket, mintCall, mintUnitEthAmount],
            value: mintUnitEthAmount,
        });
        await opChainL1Client.waitForTransactionReceipt({ hash: executeSweepHash });

        // Check basket0 balance of receiver post-mint
        const balancePostMintBasket0 = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [receiver],
        });
        // Receiver receivers mintAmount of basket tokens
        expect(balancePostMintBasket0 - balancePreMintBasket0).toEqual(mintAmount);
    });

    test("mint, sweep extra ETH", async () => {
        const mintAmount = parseEther("0.01");
        const receiver = anvilAccount.address;
        const basketMintParams = {
            chainId: opChainL1.id,
            basket: basket0,
            mintAmount,
            receiver,
            currencyIn: zeroAddress,
            slippageCentiBps: 0n, //TODO: Ignored for now
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
            currencyHops: [],
            contracts: {
                v4MetaQuoter: LOCAL_UNISWAP_CONTRACTS.metaQuoter,
                universalRouter: LOCAL_UNISWAP_CONTRACTS.universalRouter,
            },
        };
        const basketMintQuote = await getBasketMintQuote(queryClient, config, basketMintParams);
        const basketMintCall = await getBasketMint(queryClient, config, basketMintParams);
        // Check basket0 balance of receiver pre-mint
        const balancePreMintBasket0 = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [receiver],
        });
        // Check ETH balance of sender pre-swap
        const balancePreSwapEth = await opChainL1Client.getBalance({ address: anvilAccount.address });

        // Send extra 0.1 ETH (to test extra ETH sweep)
        const hash = await anvilClientL1.writeContract({
            ...basketMintCall,
            value: basketMintQuote.currencyInAmount + parseEther("0.1"),
        });

        const receipt = await opChainL1Client.waitForTransactionReceipt({ hash: hash });
        expect(receipt).toBeDefined();

        // Check basket0 balance of receiver post-mint
        const balancePostMintBasket0 = await opChainL1Client.readContract({
            address: basket0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [receiver],
        });
        // Receiver receivers mintAmount of basket tokens
        expect(balancePostMintBasket0 - balancePreMintBasket0).toEqual(mintAmount);
        // Check ETH Balance of UniversalRouter
        const balanceUniversalRouterEth = await opChainL1Client.getBalance({
            address: LOCAL_UNISWAP_CONTRACTS.universalRouter,
        });
        expect(balanceUniversalRouterEth, "UniversalRouter balance should be 0").toEqual(0n);
        // Check ETH balance of sender post-swap
        const balancePostSwapEth = await opChainL1Client.getBalance({ address: anvilAccount.address });
        //TODO: Get quote first to check = -txFee + -currencyInAmount
        const swapFeeEth = basketMintQuote.currencyInAmount;
        const txFeeEth = receipt.gasUsed * receipt.effectiveGasPrice;
        expect(balancePostSwapEth - balancePreSwapEth).toBe(-txFeeEth - swapFeeEth);
    });
});
