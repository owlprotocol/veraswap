// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

import {MockMailbox} from "@hyperlane-xyz/core/mock/MockMailbox.sol";
import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

import {ERC7579ExecutorRouterUtils} from "./utils/ERC7579ExecutorRouterUtils.sol";
import {MockERC20Utils} from "./utils/MockERC20Utils.sol";
import {MockSuperchainERC20Utils} from "./utils/MockSuperchainERC20Utils.sol";
import {PoolUtils} from "./utils/PoolUtils.sol";

import {HypERC20Utils} from "./utils/HypERC20Utils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HyperlaneMockMailboxUtils} from "./utils/HyperlaneMockMailboxUtils.sol";
import {HypTokenRouterSweep} from "../contracts/hyperlane/HypTokenRouterSweep.sol";
import {SuperchainTokenBridgeSweepUtils} from "./utils/SuperchainTokenBridgeSweepUtils.sol";
import {OwnableSignatureExecutorUtils} from "./utils/OwnableSignatureExecutorUtils.sol";
import {KernelFactoryUtils} from "./utils/KernelFactoryUtils.sol";

import {DeployCoreContracts} from "./DeployCoreContracts.s.sol";
import {MultichainFork} from "./MultichainFork.sol";
import {CoreContracts} from "./Structs.sol";
import {Permit2Utils} from "./utils/Permit2Utils.sol";
import {MockInterchainGasPaymasterUtils} from "./utils/MockInterchainGasPaymasterUtils.sol";

/**
 * Local develpoment script to deploy core contracts and setup tokens and pools using forge multichain deployment
 * Similar pattern can be used to configure Testnet and Mainnet deployments
 */
contract DeployLocal is DeployCoreContracts {
    // Core contracts
    mapping(uint256 chainId => CoreContracts) public chainContracts;
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => mapping(bytes32 id => address)) public tokens;

    function run() external virtual override {
        string[] memory chains = new string[](3);
        chains[0] = "localhost";
        chains[1] = "OPChainA";
        chains[2] = "OPChainB";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);

            vm.startBroadcast();

            console2.log("Deploying contracts on chain: ", chains[i]);
            CoreContracts memory contracts = deployCoreContracts();

            //TODO: Move this to deployCoreContracts & only deploy if chain has the interop predeploys
            (address superchainTokenBridgeSweep, ) = SuperchainTokenBridgeSweepUtils.getOrCreate2();
            console2.log("superchainTokenBridgeSweep:", superchainTokenBridgeSweep);

            // Deploy mock paymaster for local testing only
            (address mockInterchainGasPaymaster, ) = MockInterchainGasPaymasterUtils.getOrCreate2();
            console2.log("mockInterchainGasPaymaster:", mockInterchainGasPaymaster);

            vm.stopBroadcast();

            console2.log("v4PoolManager:", contracts.uniswap.v4PoolManager);
            console2.log("v4PositionManager:", contracts.uniswap.v4PositionManager);

            console2.log("mailbox:", contracts.hyperlane.mailbox);

            console2.log("kernel:", contracts.kernel);
            console2.log("kernelFactory:", contracts.kernelFactory);
            console2.log("ecdsaValidator:", contracts.ecdsaValidator);
            console2.log("ownableSignatureExecutor:", contracts.ownableSignatureExecutor);
            console2.log("erc7579ExecutorRouter:", contracts.erc7579ExecutorRouter);

            chainContracts[chainIds[i]] = contracts;
        }

        /***** Main Fork *****/
        // Create HypERC20Collateral for token A and B
        {
            vm.selectFork(forks[0]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[0]];

            (address tokenA, address tokenB) = deployTokensAndPools(
                contracts.uniswap.universalRouter,
                contracts.uniswap.v4PositionManager,
                contracts.uniswap.v4StateView
            );
            tokens[chainIds[0]][keccak256("MockERC20A")] = tokenA;
            tokens[chainIds[0]][keccak256("MockERC20B")] = tokenB;

            (address hypERC20CollateralTokenA, ) = HypERC20CollateralUtils.getOrCreate2(
                tokenA,
                contracts.hyperlane.mailbox
            );
            console2.log("hypERC20CollateralTokenA:", hypERC20CollateralTokenA);

            (address hypERC20CollateralTokenB, ) = HypERC20CollateralUtils.getOrCreate2(
                tokenB,
                contracts.hyperlane.mailbox
            );
            console2.log("hypERC20CollateralTokenB:", hypERC20CollateralTokenB);
            tokens[chainIds[0]][keccak256("A")] = hypERC20CollateralTokenA;
            tokens[chainIds[0]][keccak256("B")] = hypERC20CollateralTokenB;

            // Configure sweeper to approveAll (token: ERC20, spender: HypERC20Collateral)
            if (IERC20(tokenA).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenA) == 0) {
                HypTokenRouterSweep(contracts.hyperlane.hypTokenRouterSweep).approveAll(
                    tokenA,
                    hypERC20CollateralTokenA
                );
            }
            if (IERC20(tokenB).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenB) == 0) {
                HypTokenRouterSweep(contracts.hyperlane.hypTokenRouterSweep).approveAll(
                    tokenB,
                    hypERC20CollateralTokenB
                );
            }
            vm.stopBroadcast();
        }

        /***** Remote Fork(s) Deploy Tokens *****/
        for (uint256 i = 1; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[i]];

            // Deploy HypERC20 tokens for A and B
            (address hypERC20TokenA, ) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Token A", "A");
            console2.log("hypERC20TokenA:", hypERC20TokenA);
            (address hypERC20TokenB, ) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Token B", "B");
            console2.log("hypERC20TokenB:", hypERC20TokenB);
            tokens[chainIds[i]][keccak256("A")] = hypERC20TokenA;
            tokens[chainIds[i]][keccak256("B")] = hypERC20TokenB;
            vm.stopBroadcast();
        }

        /***** Enroll Tokens *****/
        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();
            TokenRouter routerA = TokenRouter(tokens[chainIds[i]][keccak256("A")]);
            TokenRouter routerB = TokenRouter(tokens[chainIds[i]][keccak256("B")]);

            for (uint256 j = 0; j < chains.length; j++) {
                if (i != j) {
                    uint256 remoteChainId = chainIds[j];
                    bytes32 remoteRouterA = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("A")])));
                    if (routerA.routers(uint32(remoteChainId)) != remoteRouterA) {
                        routerA.enrollRemoteRouter(uint32(remoteChainId), remoteRouterA);
                    }
                    bytes32 remoteRouterB = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("B")])));
                    if (routerB.routers(uint32(remoteChainId)) != remoteRouterB) {
                        routerB.enrollRemoteRouter(uint32(remoteChainId), remoteRouterB);
                    }
                }
            }
            vm.stopBroadcast();
        }

        /**** MockMailbox Environment *****/
        {
            // This deployment is used for crosschain unit tests and NOT by local development
            // Everything is deployed on the main chain and the mailboxes are mocked
            vm.selectFork(forks[0]);
            vm.startBroadcast();

            // Setup MockMailbox
            uint32 chainL1Domain = uint32(chainIds[0]);
            uint32 chainOpADomain = uint32(chainIds[1]);

            (address mailboxL1, ) = HyperlaneMockMailboxUtils.getOrCreate2(chainL1Domain);
            (address mailboxOpA, ) = HyperlaneMockMailboxUtils.getOrCreate2(chainOpADomain);
            MockMailbox(mailboxL1).addRemoteMailbox(chainOpADomain, MockMailbox(mailboxOpA));
            MockMailbox(mailboxOpA).addRemoteMailbox(chainL1Domain, MockMailbox(mailboxL1));
            // MockMailbox HypERC20Collateral
            (address hypMockERC20CollateralTokenA, ) = HypERC20CollateralUtils.getOrCreate2(
                tokens[chainIds[0]][keccak256("MockERC20A")],
                mailboxL1
            );
            (address hypMockERC20CollateralTokenB, ) = HypERC20CollateralUtils.getOrCreate2(
                tokens[chainIds[0]][keccak256("MockERC20B")],
                mailboxL1
            );
            // MockMaibox HypERC20
            (address hypMockERC20TokenA, ) = HypERC20Utils.getOrCreate2(18, mailboxOpA, 0, "Token A", "A");
            (address hypMockERC20TokenB, ) = HypERC20Utils.getOrCreate2(18, mailboxOpA, 0, "Token B", "B");
            IERC20(hypMockERC20TokenA).approve(address(Permit2Utils.permit2), type(uint256).max);
            IERC20(hypMockERC20TokenB).approve(address(Permit2Utils.permit2), type(uint256).max);
            // Enroll remote routers
            TokenRouter(hypMockERC20CollateralTokenA).enrollRemoteRouter(
                chainOpADomain,
                bytes32(uint256(uint160(hypMockERC20TokenA)))
            );
            TokenRouter(hypMockERC20CollateralTokenB).enrollRemoteRouter(
                chainOpADomain,
                bytes32(uint256(uint160(hypMockERC20TokenB)))
            );
            TokenRouter(hypMockERC20TokenA).enrollRemoteRouter(
                chainL1Domain,
                bytes32(uint256(uint160(hypMockERC20CollateralTokenA)))
            );
            TokenRouter(hypMockERC20TokenB).enrollRemoteRouter(
                chainL1Domain,
                bytes32(uint256(uint160(hypMockERC20CollateralTokenB)))
            );
            // ERC7579ExecutorRouter
            CoreContracts storage contracts = chainContracts[chainIds[0]];

            // L1 Executor Router
            ERC7579ExecutorRouterUtils.getOrCreate2(
                mailboxL1,
                address(0),
                contracts.ownableSignatureExecutor,
                contracts.kernelFactory
            );

            // New implementations to avoid collisions
            (address ownableSignatureExecutorOpA, ) = OwnableSignatureExecutorUtils.getOrCreate2(bytes32(uint256(901)));
            (address kernelFactoryOpA, ) = KernelFactoryUtils.getOrCreate2(contracts.kernel, bytes32(uint256(901)));

            // OPA Executor Router
            ERC7579ExecutorRouterUtils.getOrCreate2(
                mailboxOpA,
                address(0),
                ownableSignatureExecutorOpA,
                kernelFactoryOpA
            );

            vm.stopBroadcast();
        }
    }

    function deployTokensAndPools(
        address router,
        address v4PositionManager,
        address v4StateView
    ) internal returns (address tokenA, address tokenB) {
        (tokenA, ) = MockERC20Utils.getOrCreate2("Token A", "A", 18);
        (tokenB, ) = MockERC20Utils.getOrCreate2("Token B", "B", 18);

        PoolUtils.setupToken(IERC20(tokenA), IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.setupToken(IERC20(tokenB), IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.deployPool(tokenA, tokenB, IPositionManager(v4PositionManager), IStateView(v4StateView));
        PoolUtils.deployPool(tokenA, address(0), IPositionManager(v4PositionManager), IStateView(v4StateView));
        PoolUtils.deployPool(tokenB, address(0), IPositionManager(v4PositionManager), IStateView(v4StateView));

        console2.log("Token A:", tokenA);
        console2.log("Token B:", tokenB);
        console2.log("Deployed Tokens and pool");
    }

    function deploySuperchainTokenAndPools(
        string memory name,
        string memory symbol,
        address router,
        address v4PositionManager,
        address v4StateView
    ) internal returns (address token) {
        (token, ) = MockSuperchainERC20Utils.getOrCreate2(name, symbol, 18);

        PoolUtils.setupToken(IERC20(token), IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.deployPool(token, address(0), IPositionManager(v4PositionManager), IStateView(v4StateView));

        console2.log("Token:", token);
        console2.log("Deployed Token and pool");

        return token;
    }
}
