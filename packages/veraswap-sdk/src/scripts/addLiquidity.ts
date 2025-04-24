import { IERC20 } from "@owlprotocol/contracts-hyperlane";
import { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { Pool, Position, priceToClosestTick, V4PositionPlanner } from "@uniswap/v4-sdk";
import {
    Address,
    Chain,
    createPublicClient,
    createWalletClient,
    encodeAbiParameters,
    encodeFunctionData,
    Hex,
    http,
    keccak256,
    nonceManager,
    parseUnits,
    zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { IMulticall_v4 } from "../artifacts/IMulticall_v4.js";
import { IPositionManager } from "../artifacts/IPositionManager.js";
import { IStateView } from "../artifacts/IStateView.js";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { MAX_UINT_160, MAX_UINT_256, MAX_UINT_48, PERMIT2_ADDRESS, UNISWAP_CONTRACTS } from "../constants/index.js";
import { PoolKeyAbi } from "../types/PoolKey.js";

/**
 * Deploys:
 * - test tokens on chains[0], their bridged tokens on other chains,
 * - testUSDC on chains[0] and other chains with HypERC20Collateral bridges,
 * - LPs on chains[0] between testUSDC and test tokens.
 * Also, mints to self 1 eth of each token
 */
export async function addLiquidity(chains: Chain[]) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not set");

    const walletClients = chains.map((chain) =>
        createWalletClient({
            chain,
            transport: http(),
            account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
        }),
    );

    const publicClients = chains.map((chain) =>
        createPublicClient({
            chain,
            transport: http(),
        }),
    );

    const chainId0Str = chains[0].id;
    if (!(chainId0Str in UNISWAP_CONTRACTS)) {
        throw new Error(`Chain ${chainId0Str} not supported`);
    }

    // Deploy Test Tokens
    const testTokenDefs: { name: string; symbol: string; decimals: number }[] = [
        { name: "Super C", symbol: "C", decimals: 18 },
        { name: "Super D", symbol: "D", decimals: 18 },
    ];

    const testTokenAddresses = [
        "0x323ca01033701674011505da2d9958ce33fd7b7c",
        "0x0afb6bd539a527dae4fee019cb7d5de946b10eee",
    ];

    // Mint test tokens
    for (let i = 0; i < testTokenAddresses.length; i++) {
        const address = testTokenAddresses[i] as Address;

        const balance = await publicClients[0].readContract({
            abi: IERC20.abi,
            address,
            functionName: "balanceOf",
            args: [walletClients[0].account.address],
        });

        if (balance > 1_000_000_000_000_000) continue;

        const hash = await walletClients[0].writeContract({
            abi: MockERC20.abi,
            address,
            functionName: "mint",
            args: [walletClients[0].account.address, parseUnits("100", testTokenDefs[i].decimals)],
        });

        await publicClients[0].waitForTransactionReceipt({ hash });

        console.log(`Minted 1 ${testTokenDefs[i].symbol} on ${chains[0].name}`);
    }

    {
        const testTokenAddress = testTokenAddresses[0];
        const testTokenAddress2 = testTokenAddresses[1];

        let currency0: Token;
        let currency1: Token;

        if (testTokenAddress2 < testTokenAddress) {
            currency0 = new Token(chains[0].id, testTokenAddress2, testTokenDefs[1].decimals);
            currency1 = new Token(chains[0].id, testTokenAddress, testTokenDefs[0].decimals);
        } else {
            currency0 = new Token(chains[0].id, testTokenAddress, testTokenDefs[0].decimals);
            currency1 = new Token(chains[0].id, testTokenAddress2, testTokenDefs[1].decimals);
        }

        const currency0Address = currency0.address as Address;
        const currency1Address = currency1.address as Address;

        const walletClient = walletClients[0];
        const publicClient = publicClients[0];

        const positionManager = UNISWAP_CONTRACTS[chainId0Str]!.v4PositionManager;

        const currency0Allowance = await publicClient.readContract({
            address: currency0Address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [walletClient.account.address, PERMIT2_ADDRESS],
        });

        // if (currency0Allowance < MAX_UINT_256 / 2n) {
        // Aprove tokens to Permit2
        const currency0ApprovePermit2Hash = await walletClient.writeContract({
            address: currency0Address,
            abi: IERC20.abi,
            functionName: "approve",
            args: [PERMIT2_ADDRESS, MAX_UINT_256],
        });
        await publicClient.waitForTransactionReceipt({ hash: currency0ApprovePermit2Hash });
        // }

        const currency1Allowance = await publicClient.readContract({
            address: currency1Address,
            abi: IERC20.abi,
            functionName: "allowance",
            args: [walletClient.account.address, PERMIT2_ADDRESS],
        });

        // if (currency1Allowance < MAX_UINT_256 / 2n) {
        const currency1ApprovePermit2Hash = await walletClient.writeContract({
            address: currency1Address,
            abi: IERC20.abi,
            functionName: "approve",
            args: [PERMIT2_ADDRESS, MAX_UINT_256],
        });
        await publicClient.waitForTransactionReceipt({ hash: currency1ApprovePermit2Hash });
        // }

        const [currencyAPermit2Allowance] = await publicClient.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [walletClient.account.address, currency0Address, positionManager],
        });

        // if (currencyAPermit2Allowance < MAX_UINT_160 / 2n) {
        // Set tokens Permit2 Allowance
        const currencyAApprovePOSMHash = await walletClient.writeContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [currency0Address, positionManager, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currencyAApprovePOSMHash });
        // }

        const [currencyBPermit2Allowance] = await publicClient.readContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "allowance",
            args: [walletClient.account.address, currency1Address, positionManager],
        });

        console.log({ currency0Allowance, currency1Allowance, currencyAPermit2Allowance, currencyBPermit2Allowance });

        // if (currencyBPermit2Allowance < MAX_UINT_160 / 2n) {
        const currencyBApprovePOSMHash = await walletClient.writeContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [currency1Address, positionManager, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currencyBApprovePOSMHash });
        // }

        /** *** Create Pool Key *****/
        // Create Pool Key (0.30%/60)
        const lpFee = 3000; // ticks 3000 = 0.30% (1 thousandth percent)
        const tickSpacing = 60;
        const sqrtRatioX96 = 79228162514264337593543950336n; // 1:1
        const hooks = zeroAddress; // Can be set to address(0) when using static fee for a simple pool

        const poolKey = {
            currency0: currency0Address,
            currency1: currency1Address,
            fee: lpFee,
            tickSpacing,
            hooks,
        };

        /** *** Get Pool Liquidity *****/
        const poolId = keccak256(encodeAbiParameters([PoolKeyAbi], [poolKey]));

        const currentLiquidity = await publicClients[0].readContract({
            address: UNISWAP_CONTRACTS[chainId0Str]!.v4StateView,
            abi: IStateView.abi,
            functionName: "getLiquidity",
            args: [poolId],
        });

        console.log({ currentLiquidity });

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

        const amountAMax = parseUnits("10", currency0.decimals);
        const amountBMax = parseUnits("10", currency1.decimals);
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
        // const liquidity = currentLiquidity;

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
            address: UNISWAP_CONTRACTS[chainId0Str]!.v4PositionManager,
            abi: IMulticall_v4.abi,
            functionName: "multicall",
            args: [[initializePoolData, modifyLiquiditiesData]],
            // args: [[modifyLiquiditiesData]],
        });
        console.log({ multicallHash });
        await publicClient.waitForTransactionReceipt({ hash: multicallHash });

        const newLiquidity = await publicClient.readContract({
            address: UNISWAP_CONTRACTS[chainId0Str]!.v4StateView,
            abi: IStateView.abi,
            functionName: "getLiquidity",
            args: [poolId],
        });
        console.log({ multicallHash, poolKey, newLiquidity, tokens: "A and B" });
    }
}

// baseSepolia, sepolia, arbitrumSepolia, optimismSepolia fail
// const chains: Chain[] = [{ ...sepolia, rpcUrls: { default: { http: ["https://sepolia.drpc.org"] } } }, arbitrumSepolia];
/*
const chains: Chain[] = [interopDevnet0, interopDevnet1];
addLiquidity(chains).then(() => {
    console.log("Test tokens deployed successfully");

    process.exit();
});
*/
