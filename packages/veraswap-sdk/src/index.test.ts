import { getRandomValues } from "crypto";

import { SimpleAccount, SimpleAccountFactory } from "@owlprotocol/contracts-account-abstraction/artifacts";
import { PERMIT2_ADDRESS } from "@uniswap/permit2-sdk";
import { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { Actions, Pool, Position, priceToClosestTick, V4Planner, V4PositionPlanner } from "@uniswap/v4-sdk";
import { getAnvilAccount } from "@veraswap/anvil-account";
import { getDeployDeterministicAddress, getOrDeployDeterministicContract } from "@veraswap/create-deterministic";
import {
    Address,
    createPublicClient,
    createWalletClient,
    encodeAbiParameters,
    encodeDeployData,
    encodeFunctionData,
    encodePacked,
    Hex,
    http,
    keccak256,
    nonceManager,
    numberToHex,
    padHex,
    parseEther,
    zeroAddress,
    zeroHash,
} from "viem";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

import { IAllowanceTransfer } from "./artifacts/IAllowanceTransfer.js";
import { IERC20 } from "./artifacts/IERC20.js";
import { IMulticall_v4 as IMulticall } from "./artifacts/IMulticall_v4.js";
import { IPositionManager } from "./artifacts/IPositionManager.js";
import { IStateView } from "./artifacts/IStateView.js";
import { IUniversalRouter } from "./artifacts/IUniversalRouter.js";
import { quoteExactInputSingle as quoteExactInputSingleAbi } from "./artifacts/IV4Quoter.js";
import { MockERC20 as ERC20 } from "./artifacts/MockERC20.js";
import { opChainL1 } from "./chains/index.js";
import { MAX_UINT_160, MAX_UINT_256, MAX_UINT_48, V4_SWAP } from "./constants/index.js";
import { UNISWAP_CONTRACTS } from "./constants/uniswap.js";
import { getEOASwapCalls } from "./swap/getEOASwapCalls.js";
import { getPermitTransferFromData } from "./swap/getPermitTransferFromData.js";
import { getSmartAccountSwapCalls } from "./swap/getSmartAccountSwapCalls.js";
import { PoolKey, PoolKeyAbi, poolKeysToPath } from "./types/PoolKey.js";

describe("index.test.ts", function () {
    const chain = opChainL1;
    const chainId = chain.id;
    const uniswapContracts = UNISWAP_CONTRACTS[chainId]!;
    const publicClient = createPublicClient({
        chain,
        transport: http(),
    });

    const walletClient = createWalletClient({
        account: getAnvilAccount(0, { nonceManager }),
        chain,
        transport: http(),
    });

    let simpleAccountFactoryAddress: Address;

    beforeAll(async () => {
        const PoolManager = await publicClient.getCode({ address: uniswapContracts.v4PoolManager });
        expect(PoolManager).toBeDefined();
        const PositionManager = await publicClient.getCode({ address: uniswapContracts.v4PositionManager });
        expect(PositionManager).toBeDefined();
        const Router = await publicClient.getCode({ address: uniswapContracts.universalRouter });
        expect(Router).toBeDefined();
        const Quoter = await publicClient.getCode({ address: uniswapContracts.v4Quoter });
        expect(Quoter).toBeDefined();
        const StateView = await publicClient.getCode({ address: uniswapContracts.v4StateView });
        expect(StateView).toBeDefined();

        // deploy SimpleAccountFactory
        const simpleAccountFactoryDeployParams = {
            salt: zeroHash,
            bytecode: encodeDeployData({
                abi: SimpleAccountFactory.abi,
                bytecode: SimpleAccountFactory.bytecode,
                args: [zeroAddress],
            }),
        };

        const simpleAccountFactoryDeployResult = await getOrDeployDeterministicContract(
            walletClient,
            simpleAccountFactoryDeployParams,
        );
        simpleAccountFactoryAddress = simpleAccountFactoryDeployResult.address;
        if (simpleAccountFactoryDeployResult.hash) {
            await publicClient.waitForTransactionReceipt({ hash: simpleAccountFactoryDeployResult.hash });
        }
    });

    describe.skip("New Pool", () => {
        let salt: bigint;
        let currency0Address: Address;
        let currency1Address: Address;
        let currency0: Token;
        let currency1: Token;
        let poolKey: PoolKey;

        beforeEach(async () => {
            salt = BigInt(getRandomValues(new Uint32Array(1))[0]);
            const saltHex = padHex(numberToHex(salt), { size: 32 });

            /** *** Create Tokens *****/
            const tokenADeployBytecode = encodeDeployData({
                abi: ERC20.abi,
                bytecode: ERC20.bytecode,
                args: ["Token A", "A", 18],
            });
            const tokenADeployParams = { salt: saltHex, bytecode: tokenADeployBytecode };
            const tokenADeployResult = await getOrDeployDeterministicContract(walletClient, tokenADeployParams);
            if (tokenADeployResult.hash) {
                await publicClient.waitForTransactionReceipt({ hash: tokenADeployResult.hash });
            }

            const tokenBDeployBytecode = encodeDeployData({
                abi: ERC20.abi,
                bytecode: ERC20.bytecode,
                args: ["Token B", "B", 18],
            });
            const tokenBDeployParams = { salt: saltHex, bytecode: tokenBDeployBytecode };
            const tokenBDeployResult = await getOrDeployDeterministicContract(walletClient, tokenBDeployParams);
            if (tokenBDeployResult.hash) {
                await publicClient.waitForTransactionReceipt({ hash: tokenBDeployResult.hash });
            }
            // currencyA < currencyB
            currency0Address =
                tokenADeployResult.address < tokenBDeployResult.address
                    ? tokenADeployResult.address
                    : tokenBDeployResult.address;
            currency1Address =
                tokenADeployResult.address < tokenBDeployResult.address
                    ? tokenBDeployResult.address
                    : tokenADeployResult.address;

            // mint
            await publicClient.waitForTransactionReceipt({
                hash: await walletClient.writeContract({
                    address: currency0Address,
                    abi: ERC20.abi,
                    functionName: "mint",
                    args: [walletClient.account.address, parseEther("1")],
                }),
            });
            await publicClient.waitForTransactionReceipt({
                hash: await walletClient.writeContract({
                    address: currency1Address,
                    abi: ERC20.abi,
                    functionName: "mint",
                    args: [walletClient.account.address, parseEther("1")],
                }),
            });
            currency0 = new Token(chainId, currency0Address, 0);
            currency1 = new Token(chainId, currency1Address, 0);

            /** *** Token Permit2 Approvals ******/
            // Aprove tokens to Permit2
            const currency0ApprovePermit2Hash = await walletClient.writeContract({
                address: currency0Address,
                abi: IERC20.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS, MAX_UINT_256],
            });
            await publicClient.waitForTransactionReceipt({ hash: currency0ApprovePermit2Hash });

            const currency1ApprovePermit2Hash = await walletClient.writeContract({
                address: currency1Address,
                abi: IERC20.abi,
                functionName: "approve",
                args: [PERMIT2_ADDRESS, MAX_UINT_256],
            });
            await publicClient.waitForTransactionReceipt({ hash: currency1ApprovePermit2Hash });

            // Set tokens Permit2 Allowance
            const currencyAApprovePOSMHash = await walletClient.writeContract({
                address: PERMIT2_ADDRESS,
                abi: IAllowanceTransfer.abi,
                functionName: "approve",
                args: [currency0Address, uniswapContracts.v4PositionManager, MAX_UINT_160, MAX_UINT_48],
            });
            await publicClient.waitForTransactionReceipt({ hash: currencyAApprovePOSMHash });

            const currencyBApprovePOSMHash = await walletClient.writeContract({
                address: PERMIT2_ADDRESS,
                abi: IAllowanceTransfer.abi,
                functionName: "approve",
                args: [currency1Address, uniswapContracts.v4PositionManager, MAX_UINT_160, MAX_UINT_48],
            });
            await publicClient.waitForTransactionReceipt({ hash: currencyBApprovePOSMHash });

            /** *** Create Pool Key *****/
            // Create Pool Key (0.30%/60)
            const lpFee = 3000; // ticks 3000 = 0.30% (1 thousandth percent)
            const tickSpacing = 60;
            const sqrtRatioX96 = 79228162514264337593543950336n; // 1:1
            const hooks = zeroAddress; // Can be set to address(0) when using static fee for a simple pool

            poolKey = {
                currency0: currency0Address,
                currency1: currency1Address,
                fee: lpFee,
                tickSpacing,
                hooks,
            };
            // Create Pool Init Data
            const initializePoolData = encodeFunctionData({
                abi: IPositionManager.abi,
                args: [poolKey, sqrtRatioX96],
                functionName: "initializePool",
            });

            /** *** Create Pool Liquidity *****/
            const pool = new Pool(currency0, currency1, lpFee, tickSpacing, hooks, sqrtRatioX96.toString(), 0, 0);
            // Create Pool Liquidity Data
            // Understanding ticks https://blog.uniswap.org/uniswap-v3-math-primer#ticks-vs-tickspacing
            const liquidityPlan = new V4PositionPlanner();
            let tickLower = priceToClosestTick(
                new Price({
                    baseAmount: CurrencyAmount.fromRawAmount(currency0, 10000),
                    quoteAmount: CurrencyAmount.fromRawAmount(currency1, 5000),
                }),
            );
            tickLower = tickLower - (tickLower % tickSpacing);
            let tickUpper = priceToClosestTick(
                new Price({
                    baseAmount: CurrencyAmount.fromRawAmount(currency0, 5000),
                    quoteAmount: CurrencyAmount.fromRawAmount(currency1, 10000),
                }),
            );
            tickUpper = tickUpper - (tickUpper % tickSpacing);

            const amountAMax = parseEther("0.1");
            const amountBMax = parseEther("0.1");
            const recipient = walletClient.account.address;

            // Create Position (to compute liquidity)
            const liquidityPosition = Position.fromAmounts({
                pool,
                amount0: amountAMax.toString(),
                amount1: amountBMax.toString(),
                tickLower,
                tickUpper,
                useFullPrecision: false,
            });
            const liquidity = BigInt(liquidityPosition.liquidity.toString(10));

            liquidityPlan.addMint(
                pool,
                tickLower,
                tickUpper,
                liquidity.toString(),
                amountAMax.toString(),
                amountBMax.toString(),
                recipient,
            );
            liquidityPlan.addSettlePair(currency0, currency1);
            const positionsData = liquidityPlan.finalize() as Hex;
            const modifyLiquidityDeadline = BigInt(Math.floor(Date.now() / 1000) + 60);
            const modifyLiquiditiesData = encodeFunctionData({
                abi: IPositionManager.abi,
                args: [positionsData, modifyLiquidityDeadline],
                functionName: "modifyLiquidities",
            });

            /** *** Execute Multicall *****/
            const multicallHash = await walletClient.writeContract({
                address: uniswapContracts.v4PositionManager,
                abi: IMulticall.abi,
                functionName: "multicall",
                args: [[initializePoolData, modifyLiquiditiesData]],
            });
            await publicClient.waitForTransactionReceipt({ hash: multicallHash });

            /** *** Get Pool Liquidity *****/
            const poolId = keccak256(encodeAbiParameters([PoolKeyAbi], [poolKey]));
            const currentLiquidity = await publicClient.readContract({
                address: uniswapContracts.v4StateView,
                abi: IStateView.abi,
                functionName: "getLiquidity",
                args: [poolId],
            });
            expect(currentLiquidity).toBeGreaterThan(0n);
        });

        test("Swap with EOA", async () => {
            // Get current balances
            const balance0PreTrade = await publicClient.readContract({
                address: poolKey.currency0,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });
            const balance1PreTrade = await publicClient.readContract({
                address: poolKey.currency1,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });

            /** *** Get Quote *****/
            const amountIn = 1_000_000n;
            const [amountOutQuoted] = (await publicClient.readContract({
                abi: [quoteExactInputSingleAbi],
                address: uniswapContracts.v4Quoter,
                functionName: "quoteExactInputSingle",
                args: [{ poolKey, zeroForOne: true, exactAmount: amountIn, hookData: "0x" }],
            })) as [bigint, bigint];

            const permit2Allowance = await publicClient.readContract({
                abi: IERC20.abi,
                address: currency0Address,
                functionName: "allowance",
                args: [walletClient.account.address, PERMIT2_ADDRESS],
            });

            // Need to approve if allowance too low
            const approvePermit2 = permit2Allowance < amountIn;

            const amountOutMinimum = amountOutQuoted;

            const path = poolKeysToPath(currency0Address, [poolKey]);
            const swapCalls = getEOASwapCalls({
                amountIn,
                amountOutMinimum,
                currencyIn: currency0Address,
                currencyOut: currency1Address,
                path,
                universalRouter: uniswapContracts.universalRouter,
                approvePermit2,
            });

            for (const call of swapCalls) {
                await publicClient.waitForTransactionReceipt({
                    hash: await walletClient.sendTransaction(call),
                });
            }

            // Get current balances
            const balance0PostTrade = await publicClient.readContract({
                address: poolKey.currency0,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });
            const balance1PostTrade = await publicClient.readContract({
                address: poolKey.currency1,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });
            // Input decreased
            expect(balance0PostTrade).toBeLessThan(balance0PreTrade);
            // Output increased
            expect(balance1PostTrade).toBeGreaterThan(balance1PreTrade);
        });

        test("Swap with SimpleAccount", async () => {
            // Get current balances
            const balance0PreTrade = await publicClient.readContract({
                address: poolKey.currency0,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });

            /** *** Create Smart Account *****/
            // deploy SimpleAccount (separate TX, limitation from factory and not using a bundler / entrypoint
            // const salt = 0n;
            const simpleAccountHash = await walletClient.writeContract({
                abi: SimpleAccountFactory.abi,
                address: simpleAccountFactoryAddress,
                functionName: "createAccount",
                args: [walletClient.account.address, salt],
            });

            if (simpleAccountHash) {
                await publicClient.waitForTransactionReceipt({ hash: simpleAccountHash });
            }

            const simpleAccountAddress = await publicClient.readContract({
                abi: SimpleAccountFactory.abi,
                address: simpleAccountFactoryAddress,
                functionName: "getAddress",
                args: [walletClient.account.address, salt],
            });

            const balance1PreTrade = await publicClient.readContract({
                address: poolKey.currency1,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [simpleAccountAddress],
            });

            /** *** Permit2 Signature Transfer EOA to Smart Wallet *****/
            const amountIn = 1_000_000n;

            const currencyInAddress = currency0Address;
            const permitTransferFromData = await getPermitTransferFromData(walletClient, {
                chainId,
                spender: simpleAccountAddress,
                currencyInAddress,
                amountIn,
            });

            /** *** Get Quote *****/
            const [amountOutQuoted] = (await publicClient.readContract({
                abi: [quoteExactInputSingleAbi],
                address: uniswapContracts.v4Quoter,
                functionName: "quoteExactInputSingle",
                args: [{ poolKey, zeroForOne: true, exactAmount: amountIn, hookData: "0x" }],
            })) as [bigint, bigint];

            const permit2Allowance = await publicClient.readContract({
                abi: IERC20.abi,
                address: currencyInAddress,
                functionName: "allowance",
                args: [simpleAccountAddress, PERMIT2_ADDRESS],
            });

            // Need to approve if allowance too low
            const approvePermit2 = permit2Allowance < amountIn;

            const amountOutMinimum = amountOutQuoted;

            const path = poolKeysToPath(currency0Address, [poolKey]);

            const batchCalls = getSmartAccountSwapCalls({
                amountIn,
                amountOutMinimum,
                currencyIn: currency0Address,
                currencyOut: poolKey.currency1,
                path,
                permitTransferFromData,
                universalRouter: uniswapContracts.universalRouter,
                approvePermit2,
            });

            const batchDest = batchCalls.map((c) => c.to);
            // We know value is 0n for all calls, saves gas
            const batchValue: bigint[] = [];
            const batchFunc = batchCalls.map((c) => c.data);

            const executeHash = await walletClient.writeContract({
                abi: SimpleAccount.abi,
                address: simpleAccountAddress,
                functionName: "executeBatch",
                args: [batchDest, batchValue, batchFunc],
            });

            await publicClient.waitForTransactionReceipt({ hash: executeHash });

            // Get current balances
            const balance0PostTrade = await publicClient.readContract({
                address: poolKey.currency0,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [walletClient.account.address],
            });
            const balance1PostTrade = await publicClient.readContract({
                address: poolKey.currency1,
                abi: IERC20.abi,
                functionName: "balanceOf",
                args: [simpleAccountAddress],
            });
            // Input declined
            expect(balance0PostTrade).toBeLessThan(balance0PreTrade);
            // Output increased
            expect(balance1PostTrade).toBeGreaterThan(balance1PreTrade);
        });
    });

    test.skip("Anvil Existing Pool Swap", async () => {
        // Deploy 2x ERC20
        const tokenADeployAddress = getDeployDeterministicAddress({
            salt: zeroHash,
            bytecode: encodeDeployData({
                abi: ERC20.abi,
                bytecode: ERC20.bytecode,
                args: ["Token A", "A", 18],
            }),
        });
        const tokenBDeployAddress = getDeployDeterministicAddress({
            salt: zeroHash,
            bytecode: encodeDeployData({
                abi: ERC20.abi,
                bytecode: ERC20.bytecode,
                args: ["Token B", "B", 18],
            }),
        });
        // currencyA < currencyB
        const currency0Address = tokenADeployAddress < tokenBDeployAddress ? tokenADeployAddress : tokenBDeployAddress;
        const currency1Address = tokenADeployAddress < tokenBDeployAddress ? tokenBDeployAddress : tokenADeployAddress;

        // Create Pool Key (0.30%/60)
        const lpFee = 3000; // ticks 3000 = 0.30% (1 thousandth percent)
        const tickSpacing = 60;
        const currency0 = new Token(chainId, currency0Address, 0);
        const currency1 = new Token(chainId, currency1Address, 0);

        const poolKey: PoolKey = {
            currency0: currency0.address as Address,
            currency1: currency1.address as Address,
            fee: lpFee,
            tickSpacing,
            hooks: zeroAddress,
        };

        // Get current balances
        const balance0PreTrade = await publicClient.readContract({
            address: poolKey.currency0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [walletClient.account.address],
        });
        const balance1PreTrade = await publicClient.readContract({
            address: poolKey.currency1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [walletClient.account.address],
        });

        // Pool deployed with first liquidity NFT
        const positionLiquidity = await publicClient.readContract({
            address: uniswapContracts.v4PositionManager,
            abi: IPositionManager.abi,
            functionName: "getPositionLiquidity",
            args: [1n],
        });
        expect(positionLiquidity).toBeGreaterThan(0n);

        /** *** Execute swap *****/
        // Permit2 Universal Router
        // Set tokens Permit2 Allowance
        const currency0ApproveRouterHash = await walletClient.writeContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [poolKey.currency0, uniswapContracts.universalRouter, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currency0ApproveRouterHash });

        const currency1ApproveRouterHash = await walletClient.writeContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [poolKey.currency1, uniswapContracts.universalRouter, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currency1ApproveRouterHash });

        const amountIn = 1_000_000n; // this was issue

        const [amountOutQuoted, gasEstimate] = (await publicClient.readContract({
            abi: [quoteExactInputSingleAbi],
            address: uniswapContracts.v4Quoter,
            functionName: "quoteExactInputSingle",
            args: [{ poolKey, zeroForOne: true, exactAmount: amountIn, hookData: "0x" }],
        })) as [bigint, bigint];

        console.log({ amountIn, amountOutQuoted, gasEstimate });

        const amountOutMinimum = 0n;
        // higher-level abstraction, no built-in helpers exist for the actions we use
        // unfortunately, there are no type checks, and tuples expect key-value inputs
        const tradePlan = new V4Planner();
        tradePlan.addAction(Actions.SWAP_EXACT_IN_SINGLE, [
            { poolKey, zeroForOne: true, amountIn, amountOutMinimum, hookData: "0x" },
        ]);
        tradePlan.addAction(Actions.SETTLE_ALL, [poolKey.currency0, amountIn]);
        tradePlan.addAction(Actions.TAKE_ALL, [poolKey.currency1, amountOutMinimum]);

        // Swap Configuration
        /*
        // Manual Encoding
        const routerActions = encodePacked(
            ["uint8", "uint8", "uint8"],
            [Actions.SWAP_EXACT_IN_SINGLE, Actions.SETTLE_ALL, Actions.TAKE_ALL],
        );
        const routerSwapParam0 = encodeAbiParameters(
            [ExactInputSingleParamsAbi],
            [[poolKey, true, amountIn, amountOutMinimum, "0x"]], //WARNING: Cannot use key-value despite typecheck being accepted
        );
        const routerSwapParams = [
            routerSwapParam0,
            encodeAbiParameters([{ type: "address" }, { type: "uint128" }], [poolKey.currency0, amountIn]),
            encodeAbiParameters([{ type: "address" }, { type: "uint128" }], [poolKey.currency1, amountOutMinimum]),
        ];
        const routerInput0 = encodeAbiParameters(
            [
                { type: "bytes", name: "actions" },
                { type: "bytes[]", name: "params" },
            ],
            [routerActions, routerSwapParams],
        );
        expect(routerSwapParams[1], "SETTLE_ALL").toBe(
            "0x0000000000000000000000009194d5c4eab03b39de7a7a453dd497eceb7110eb00000000000000000000000000000000000000000000000000000000000f4240",
        );
        expect(routerSwapParams[2], "TAKE_ALL").toBe(
            "0x000000000000000000000000c5faa1872cc940a9b35beefe38e1de21153e0cb20000000000000000000000000000000000000000000000000000000000000000",
        );
        routerSwapParams[0] = routerSwapParam0;
        expect(routerSwapParams[0], "SWAP_EXACT_IN_SINGLE").toBe(
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000009194d5c4eab03b39de7a7a453dd497eceb7110eb000000000000000000000000c5faa1872cc940a9b35beefe38e1de21153e0cb20000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000000",
        );
        */
        const routerInput0 = tradePlan.finalize() as Hex;

        const routerCommands = encodePacked(["uint8"], [V4_SWAP]);
        const routerDeadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

        expect(routerCommands, "routerCommands").toBe("0x10");

        const hash = await walletClient.writeContract({
            account: walletClient.account,
            address: uniswapContracts.universalRouter,
            abi: IUniversalRouter.abi,
            functionName: "execute",
            args: [routerCommands, [routerInput0], routerDeadline],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        // Get current balances
        const balance0PostTrade = await publicClient.readContract({
            address: poolKey.currency0,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [walletClient.account.address],
        });
        const balance1PostTrade = await publicClient.readContract({
            address: poolKey.currency1,
            abi: IERC20.abi,
            functionName: "balanceOf",
            args: [walletClient.account.address],
        });

        // Input decreased
        expect(balance0PostTrade).toBeLessThan(balance0PreTrade);
        // Output increased
        expect(balance1PostTrade).toBeGreaterThan(balance1PreTrade);
    });
});
