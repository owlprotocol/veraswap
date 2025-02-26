import { getOrDeployDeterministicContract } from "@owlprotocol/create-deterministic";
import {
    Chain,
    createPublicClient,
    createWalletClient,
    encodeDeployData,
    Hex,
    http,
    parseUnits,
    zeroHash,
    nonceManager,
    Address,
    encodeFunctionData,
    zeroAddress,
} from "viem";
import { localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import {
    getOrDeployTokenRouter,
    getTokenRouterDeployTransactions,
    IERC20,
    TokenTypeExtended,
} from "@owlprotocol/contracts-hyperlane";
import { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { Pool, V4PositionPlanner, priceToClosestTick, Position } from "@uniswap/v4-sdk";
import { MockERC20 } from "../artifacts/MockERC20.js";
import {
    MAX_UINT_160,
    MAX_UINT_256,
    MAX_UINT_48,
    PERMIT2_ADDRESS,
    testHyperlaneRegistry,
    UNISWAP_CONTRACTS,
} from "../constants.js";
import { getChainNameAndMailbox } from "../utils/getChainNameAndMailbox.js";
import { chainId, localhost2 } from "../test/constants.js";
import { IAllowanceTransfer } from "../artifacts/IAllowanceTransfer.js";
import { IPositionManager } from "../artifacts/IPositionManager.js";
import { IMulticall_v4 } from "../artifacts/IMulticall_v4.js";

// TODO: just have this in the sdk, and import later in app
const fetchGithubRegistryData = async () => {
    const registry = new GithubRegistry();

    const chainMetadata = await registry.getMetadata();
    const chainAddresses = await registry.getAddresses();

    return {
        metadata: chainMetadata,
        addresses: chainAddresses,
    };
};

/**
 * Deploys:
 * - test tokens on chains[0], their bridged tokens on other chains,
 * - testUSDC on chains[0] and other chains with HypERC20Collateral bridges,
 * - LPs on chains[0] between testUSDC and test tokens.
 * Also, mints to self 1 eth of each token
 */
async function deployTestTokens(chains: Chain[]) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not set");

    const walletClients = chains.map((chain) =>
        createWalletClient({
            chain,
            transport: http(),
            account: privateKeyToAccount(privateKey as Hex, { nonceManager }),
        }),
    );
    // await setupTestMailboxContracts(walletClients[0]);
    // await setupTestMailboxContracts(walletClients[1]);

    const usingLocalChains = chains.findIndex((c) => c.id === 1337) !== -1;
    const hyperlaneRegistry = usingLocalChains ? testHyperlaneRegistry : await fetchGithubRegistryData();

    const chainMailboxesAndNames = chains.map((chain) =>
        getChainNameAndMailbox({
            chainId: chain.id,
            hyperlaneRegistry,
        }),
    );

    if (chainMailboxesAndNames.some((elem) => !elem.mailbox)) {
        throw new Error(`Mailbox missing for some chain: ${chainMailboxesAndNames}`);
    }

    const publicClients = chains.map((chain) =>
        createPublicClient({
            chain,
            transport: http(),
        }),
    );

    // Deploy Test Tokens
    const testUSDCDef = { name: "testUSDC", symbol: "tUSDC", decimals: 6 };
    const testTokenDefs: { name: string; symbol: string; decimals: number }[] = [
        { name: "TokenA", symbol: "A", decimals: 18 },
        { name: "TokenB", symbol: "B", decimals: 18 },
        { name: "TokenC", symbol: "C", decimals: 18 },
    ];

    const testTokenAddresses = await Promise.all(
        testTokenDefs.map(async (tokenDef) => {
            const tokenDeploy = await getOrDeployDeterministicContract(walletClients[0], {
                bytecode: encodeDeployData({
                    abi: MockERC20.abi,
                    args: [tokenDef.name, tokenDef.symbol, tokenDef.decimals],
                    bytecode: MockERC20.bytecode,
                }),
                salt: zeroHash,
            });

            if (tokenDeploy.hash) {
                await publicClients[0].waitForTransactionReceipt({ hash: tokenDeploy.hash });
            }

            console.log(`Deployed ${tokenDef.name} on ${chains[0].name} at ${tokenDeploy.address}`);

            return tokenDeploy.address;
        }),
    );

    const testUSDCAddresses = await Promise.all(
        walletClients.map(async (walletClient, i) => {
            const tokenDeploy = await getOrDeployDeterministicContract(walletClient, {
                bytecode: encodeDeployData({
                    abi: MockERC20.abi,
                    args: [testUSDCDef.name, testUSDCDef.symbol, testUSDCDef.decimals],
                    bytecode: MockERC20.bytecode,
                }),
                salt: zeroHash,
            });

            if (tokenDeploy.hash) {
                await publicClients[i].waitForTransactionReceipt({ hash: tokenDeploy.hash });
            }

            console.log(`Deployed ${testUSDCDef.name} on ${chains[i].name} at ${tokenDeploy.address}`);

            return tokenDeploy.address;
        }),
    );

    // Mint test tokens
    for (let i = 0; i < testTokenAddresses.length; i++) {
        const address = testTokenAddresses[i];

        const balance = await publicClients[0].readContract({
            abi: IERC20.abi,
            address,
            functionName: "balanceOf",
            args: [walletClients[0].account.address],
        });

        if (balance > 0n) continue;

        const hash = await walletClients[0].writeContract({
            abi: MockERC20.abi,
            address,
            functionName: "mint",
            args: [walletClients[0].account.address, parseUnits("1", testTokenDefs[i].decimals)],
        });

        await publicClients[0].waitForTransactionReceipt({ hash });

        console.log(`Minted 1 ${testTokenDefs[i].symbol} on ${chains[0].name}`);
    }

    await Promise.all(
        testUSDCAddresses.map(async (address, i) => {
            const balance = await publicClients[i].readContract({
                abi: IERC20.abi,
                address,
                functionName: "balanceOf",
                args: [walletClients[i].account.address],
            });

            if (balance >= parseUnits("1", testUSDCDef.decimals)) return;

            const hash = await walletClients[i].writeContract({
                abi: MockERC20.abi,
                address,
                functionName: "mint",
                args: [walletClients[i].account.address, parseUnits("1", testUSDCDef.decimals)],
            });

            await publicClients[i].waitForTransactionReceipt({ hash });

            console.log(`Minted 1 ${testTokenDefs[i].symbol} on ${chains[0].name}`);
        }),
    );

    console.log("Setting up bridges");

    const chainTokenBridgeAddresses = await Promise.all(
        walletClients.map(async (walletClient, i) => {
            const isOriginChain = i === 0;

            const tokenBridgeAddresses: Address[] = [];
            for (let j = 0; j < testTokenDefs.length; j++) {
                const tokenDef = testTokenDefs[j];
                const tokenType = isOriginChain ? TokenTypeExtended.collateral : TokenTypeExtended.synthetic;

                const { tokenRouterProxyAddress, transactions } = await getTokenRouterDeployTransactions(walletClient, {
                    account: walletClient.account.address,
                    tokenType,
                    mailboxAddress: chainMailboxesAndNames[i].mailbox!,
                    collateralAddress: isOriginChain ? testTokenAddresses[j] : undefined,
                    ...tokenDef,
                });

                for (let txId = 0; txId < transactions.length; txId++) {
                    const transaction = transactions[txId];
                    console.log({ to: transaction.to, token: tokenDef.name });
                    const hash = await walletClients[i].sendTransaction(transaction);
                    await publicClients[i].waitForTransactionReceipt({ hash });
                }

                console.log(
                    `Deployed ${tokenType} of ${tokenDef.name} on ${chains[i].name} at ${tokenRouterProxyAddress}`,
                );

                tokenBridgeAddresses.push(tokenRouterProxyAddress);
            }

            return tokenBridgeAddresses;
        }),
    );

    console.log({ chainTokenBridgeAddresses });

    const testUSDCCollateralAddresses = await Promise.all(
        testUSDCAddresses.map(async (address, i) => {
            const tokenType = TokenTypeExtended.collateral;
            const { tokenRouterProxyAddress } = await getOrDeployTokenRouter(walletClients[i], {
                account: walletClients[i].account.address,
                tokenType,
                mailboxAddress: chainMailboxesAndNames[i].mailbox!,
                collateralAddress: address,
                ...testUSDCDef,
            });
            console.log(
                `Deployed ${tokenType} of ${testUSDCDef.name} on ${chains[i].name} at ${tokenRouterProxyAddress}`,
            );

            return tokenRouterProxyAddress;
        }),
    );

    console.log({ testUSDCCollateralAddresses });

    // Fund testUSDC Collateral
    await Promise.all(
        testUSDCAddresses.map(async (address, i) => {
            const balance = await publicClients[i].readContract({
                abi: IERC20.abi,
                address,
                functionName: "balanceOf",
                args: [testUSDCCollateralAddresses[i]],
            });

            const targetBalance = parseUnits("0.01", testUSDCDef.decimals);

            if (balance >= targetBalance) return;

            const topupAmount = targetBalance - balance;

            const hash = await walletClients[i].writeContract({
                abi: IERC20.abi,
                address,
                functionName: "transfer",
                args: [testUSDCCollateralAddresses[i], topupAmount],
            });

            await publicClients[i].waitForTransactionReceipt({ hash });

            console.log(`Funded testUSDC collateral on ${chains[i].name} with ${topupAmount}`);
        }),
    );

    // Deploy LPs
    for (let i = 0; i < testTokenAddresses.length; i++) {
        const testTokenAddress = testTokenAddresses[i];

        let currency0: Token;
        let currency1: Token;

        if (testUSDCAddresses[0] < testTokenAddress) {
            currency0 = new Token(chains[0].id, testUSDCAddresses[0], testUSDCDef.decimals);
            currency1 = new Token(chains[0].id, testTokenAddress, testTokenDefs[i].decimals);
        } else {
            currency0 = new Token(chains[0].id, testTokenAddress, testTokenDefs[i].decimals);
            currency1 = new Token(chains[0].id, testUSDCAddresses[0], testUSDCDef.decimals);
        }

        const currency0Address = currency0.address as Address;
        const currency1Address = currency1.address as Address;

        const walletClient = walletClients[0];
        const publicClient = publicClients[0];

        const chainIdStr = chains[0].id.toString();
        // @ts-expect-error
        const positionManager = UNISWAP_CONTRACTS[chainIdStr].POSITION_MANAGER;

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
            args: [currency0Address, positionManager, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currencyAApprovePOSMHash });

        const currencyBApprovePOSMHash = await walletClient.writeContract({
            address: PERMIT2_ADDRESS,
            abi: IAllowanceTransfer.abi,
            functionName: "approve",
            args: [currency1Address, positionManager, MAX_UINT_160, MAX_UINT_48],
        });
        await publicClient.waitForTransactionReceipt({ hash: currencyBApprovePOSMHash });

        /***** Create Pool Key *****/
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
        // Create Pool Init Data
        const initializePoolData = encodeFunctionData({
            abi: IPositionManager.abi,
            args: [poolKey, sqrtRatioX96],
            functionName: "initializePool",
        });

        /***** Create Pool Liquidity *****/
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

        const amountAMax = parseUnits("0.1", currency0.decimals);
        const amountBMax = parseUnits("0.1", currency1.decimals);
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

        /***** Execute Multicall *****/
        const multicallHash = await walletClient.writeContract({
            address: UNISWAP_CONTRACTS[chainId].POSITION_MANAGER,
            abi: IMulticall_v4.abi,
            functionName: "multicall",
            args: [[initializePoolData, modifyLiquiditiesData]],
        });
        await publicClient.waitForTransactionReceipt({ hash: multicallHash });
        console.log({ multicallHash, testTokenAddress, token: testTokenDefs[i].name });
    }
}

// baseSepolia, sepolia, arbitrumSepolia, optimismSepolia fail
// const chains: Chain[] = [{ ...sepolia, rpcUrls: { default: { http: ["https://sepolia.drpc.org"] } } }, arbitrumSepolia];
const chains: Chain[] = [localhost, localhost2];
deployTestTokens(chains).then(() => {
    console.log("Test tokens deployed successfully");
    // eslint-disable-next-line no-process-exit
    process.exit();
});
