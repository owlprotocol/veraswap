import { getOrDeployDeterministicContract } from "@owlprotocol/create-deterministic";
import { Chain, createPublicClient, createWalletClient, encodeDeployData, Hex, http, parseUnits, zeroHash } from "viem";
import { sepolia, arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { GithubRegistry } from "@hyperlane-xyz/registry";
import { getOrDeployTokenRouter, IERC20, TokenTypeExtended } from "@owlprotocol/contracts-hyperlane";
import { MockERC20 } from "../artifacts/MockERC20.js";
import { testHyperlaneRegistry } from "../constants.js";
import { getChainNameAndMailbox } from "../utils/getChainNameAndMailbox.js";

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
            account: privateKeyToAccount(privateKey as Hex),
        }),
    );

    const hyperlaneRegistry = chains.findIndex((c) => c.id === 1337)
        ? testHyperlaneRegistry
        : await fetchGithubRegistryData();

    const chainMailboxesAndNames = chains.map((chain) =>
        getChainNameAndMailbox({
            chainId: chain.id,
            hyperlaneRegistry,
        }),
    );

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
        testUSDCDef,
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
                publicClients[0].waitForTransactionReceipt({ hash: tokenDeploy.hash });
            }

            console.log(`Deployed ${tokenDef.name} on ${chains[0].name} at ${tokenDeploy.address}`);

            return tokenDeploy.address;
        }),
    );

    // Mint test tokens
    await Promise.all(
        testTokenAddresses.map(async (address, i) => {
            const balance = await publicClients[0].readContract({
                abi: IERC20.abi,
                address,
                functionName: "balanceOf",
                args: [walletClients[0].account.address],
            });

            if (balance > 0n) return;

            const hash = await walletClients[0].writeContract({
                abi: MockERC20.abi,
                address,
                functionName: "mint",
                args: [walletClients[0].account.address, parseUnits("1", testTokenDefs[i].decimals)],
            });

            await publicClients[0].waitForTransactionReceipt({ hash });

            console.log(`Minted 1 ${testTokenDefs[i].symbol} on ${chains[0].name}`);
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
                publicClients[i].waitForTransactionReceipt({ hash: tokenDeploy.hash });
            }

            console.log(`Deployed ${testUSDCDef.name} on ${chains[i].name} at ${tokenDeploy.address}`);

            return tokenDeploy.address;
        }),
    );

    await Promise.all(
        testUSDCAddresses.map(async (address, i) => {
            const balance = await publicClients[i].readContract({
                abi: IERC20.abi,
                address,
                functionName: "balanceOf",
                args: [walletClients[i].account.address],
            });

            if (balance === 0n) {
                const hash = await walletClients[i].writeContract({
                    abi: MockERC20.abi,
                    address,
                    functionName: "mint",
                    args: [walletClients[i].account.address, parseUnits("1", testUSDCDef.decimals)],
                });

                await publicClients[i].waitForTransactionReceipt({ hash });
            }
        }),
    );

    // Setup bridges
    const chainTokenBridgeAddresses = await Promise.all(
        walletClients.map(async (walletClient, i) => {
            return await Promise.all(
                testTokenDefs.map(async (tokenDef, j) => {
                    const tokenType = i === 0 ? TokenTypeExtended.collateral : TokenTypeExtended.synthetic;
                    const { tokenRouterProxyAddress } = await getOrDeployTokenRouter(walletClient, {
                        account: walletClient.account.address,
                        tokenType,
                        mailboxAddress: chainMailboxesAndNames[i].mailbox!,
                        collateralAddress: testTokenAddresses[j],
                        totalSupply: 0n,
                        ...tokenDef,
                    });

                    console.log(
                        `Deployed ${tokenType} of ${tokenDef.name} on ${chains[i].name} at ${tokenRouterProxyAddress}`,
                    );

                    return tokenRouterProxyAddress;
                }),
            );
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

    // Fund testUSDC Collateral
    await Promise.all(
        testUSDCAddresses.map(async (address, i) => {
            const balance = await publicClients[i].readContract({
                abi: IERC20.abi,
                address,
                functionName: "balanceOf",
                args: [testUSDCCollateralAddresses[i]],
            });

            const targetBalance = parseUnits("10", testUSDCDef.decimals);

            if (balance >= targetBalance) return;

            const topupAmount = targetBalance - balance;

            const hash = await walletClients[0].writeContract({
                abi: IERC20.abi,
                address,
                functionName: "transfer",
                args: [testUSDCCollateralAddresses[i], topupAmount],
            });

            await publicClients[0].waitForTransactionReceipt({ hash });

            console.log(`Funded testUSDC collateral on ${chains[i].name} with ${topupAmount}`);
        }),
    );
}

const chains = [sepolia, arbitrumSepolia];
deployTestTokens(chains).then(() => {
    console.log("Test tokens deployed successfully");
});
