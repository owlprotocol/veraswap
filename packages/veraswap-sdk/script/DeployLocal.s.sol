// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";
import "forge-std/Script.sol";

// ERC20
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
// Permit2
import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
// WETH9
import {WETH} from "solmate/src/tokens/WETH.sol";
import {WETHUtils} from "./utils/WETHUtils.sol";
// Uniswap V2 Core
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
// Uniswap V3 Core
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {V3PositionManagerMock} from "../contracts/uniswap/v3/V3PositionManagerMock.sol";
// Uniswap V4 Core
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
// Uniswap V4 Periphery
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
// Uniswap Universap Router
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
// Hyperlane
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
import {OwnableSignatureExecutorUtils} from "./utils/OwnableSignatureExecutorUtils.sol";
import {KernelFactoryUtils} from "./utils/KernelFactoryUtils.sol";

import {DeployCoreContracts} from "./DeployCoreContracts.s.sol";
import {MultichainFork} from "./MultichainFork.sol";
import {CoreContracts} from "./Structs.sol";
import {Permit2Utils} from "./utils/Permit2Utils.sol";
import {MockInterchainGasPaymasterUtils} from "./utils/MockInterchainGasPaymasterUtils.sol";

// Baskets
import {BasketFixedUnits} from "../contracts/vaults/BasketFixedUnits.sol";
import {BasketFixedUnitsUtils} from "./utils/BasketFixedUnitsUtils.sol";
import {ExecuteSweep} from "../contracts/ExecuteSweep.sol";
import {ExecuteSweepUtils} from "./utils/ExecuteSweepUtils.sol";

import {ContractsCoreLibrary} from "./libraries/ContractsCore.sol";
import {LocalTokens, LocalTokensLibrary} from "./libraries/LocalTokens.sol";
import {LocalPoolsLibrary, LocalV4Pools} from "./libraries/LocalPools.sol";

/**
 * Local develpoment script to deploy core contracts and setup tokens and pools using forge multichain deployment
 * Similar pattern can be used to configure Testnet and Mainnet deployments
 */
contract DeployLocal is Script {
    using LocalTokensLibrary for LocalTokens;

    // Core contracts
    mapping(uint256 chainId => CoreContracts) public chainContracts;
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => mapping(bytes32 id => address)) public tokens;

    address constant entryPoint = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    address constant permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function run() external virtual {
        string[] memory chains = new string[](3);
        chains[0] = "localhost";
        chains[1] = "OPChainA";
        chains[2] = "OPChainB";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();

            // Deploy core contracts
            console2.log("Deploying contracts on chain: ", chains[i]);
            // TODO: Use setCode or etch to match pre-deploy addresses
            (address weth9, ) = WETHUtils.getOrCreate2();
            CoreContracts memory contracts = ContractsCoreLibrary.deploy(weth9);
            vm.stopBroadcast();
            chainContracts[chainIds[i]] = contracts;
        }

        /**
         * Main Fork ****
         */
        // Create HypERC20Collateral for token A and B
        {
            vm.selectFork(forks[0]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[0]];

            // Create tokens
            LocalTokens memory localTokens = LocalTokensLibrary.deploy(contracts.uniswap.weth9);
            // Approve Universal Router
            localTokens.permit2Approve(contracts.uniswap.universalRouter);
            // Create V4 Pools
            LocalPoolsLibrary.deployV4Pools(IPositionManager(contracts.uniswap.v4PositionManager), localTokens);
            // Create V3 Pools
            LocalPoolsLibrary.deployV3Pools(
                IUniswapV3Factory(contracts.uniswap.v3Factory),
                V3PositionManagerMock(contracts.uniswap.v3NFTPositionManager),
                localTokens
            );
            // Create V2 Pools
            LocalPoolsLibrary.deployV2Pools(IUniswapV2Factory(contracts.uniswap.v2Factory), localTokens);

            // Setup HypERC20Collateral for MockERC20 tokens
            address tokenA = address(localTokens.tokenA);
            address tokenB = address(localTokens.tokenB);
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
                HypTokenRouterSweep(payable(contracts.hyperlane.hypTokenRouterSweep)).approveAll(
                    tokenA,
                    hypERC20CollateralTokenA
                );
            }
            if (IERC20(tokenB).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenB) == 0) {
                HypTokenRouterSweep(payable(contracts.hyperlane.hypTokenRouterSweep)).approveAll(
                    tokenB,
                    hypERC20CollateralTokenB
                );
            }
            // Create BasketFixedUnits with A/B
            BasketFixedUnits.BasketToken[] memory basket = new BasketFixedUnits.BasketToken[](2);
            (address basketToken0, address basketToken1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
            basket[0] = BasketFixedUnits.BasketToken({addr: basketToken0, units: 1 ether});
            basket[1] = BasketFixedUnits.BasketToken({addr: basketToken1, units: 1 ether});
            (address basketAddr0, ) = BasketFixedUnitsUtils.getOrCreate2(
                "Index AB50",
                "AB50.NF",
                address(0),
                0,
                basket
            );
            (address basketAddr1, ) = BasketFixedUnitsUtils.getOrCreate2(
                "Index AB50",
                "AB50.WF",
                address(1),
                10_000,
                basket
            );
            // Basket 0 Approvals
            IAllowanceTransfer(address(Permit2Utils.permit2)).approve(
                address(basketToken0),
                address(basketAddr0),
                type(uint160).max,
                type(uint48).max
            );
            IAllowanceTransfer(address(Permit2Utils.permit2)).approve(
                address(basketToken1),
                address(basketAddr0),
                type(uint160).max,
                type(uint48).max
            );
            // Basket 1 Approvals
            IAllowanceTransfer(address(Permit2Utils.permit2)).approve(
                address(basketToken0),
                address(basketAddr1),
                type(uint160).max,
                type(uint48).max
            );
            IAllowanceTransfer(address(Permit2Utils.permit2)).approve(
                address(basketToken1),
                address(basketAddr1),
                type(uint160).max,
                type(uint48).max
            );
            // Set Permit2 Approvals for ExecuteSweep
            ExecuteSweep executeSweep = ExecuteSweep(payable(contracts.executeSweep));
            executeSweep.approveAll(basketToken0, Permit2Utils.permit2);
            executeSweep.approveAll(basketToken1, Permit2Utils.permit2);
            executeSweep.approveAll(basketToken0, basketAddr0);
            executeSweep.approveAll(basketToken1, basketAddr0);
            executeSweep.approveAll(basketToken0, basketAddr1);
            executeSweep.approveAll(basketToken1, basketAddr1);

            vm.stopBroadcast();
        }

        /**
         * Remote Fork(s) Deploy Tokens ****
         */
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

        /**
         * Enroll Tokens ****
         */
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

        /**
         * MockMailbox Environment ****
         */
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
}
