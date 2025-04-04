// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

import {MockERC20Utils} from "./utils/MockERC20Utils.sol";
import {PoolUtils} from "./utils/PoolUtils.sol";

import {HypERC20Utils} from "./utils/HypERC20Utils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HypTokenRouterSweep} from "../contracts/hyperlane/HypTokenRouterSweep.sol";

import {DeployCoreContracts} from "./DeployCoreContracts.s.sol";
import {MultichainFork} from "./MultichainFork.sol";
import {CoreContracts} from "./Structs.sol";

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
            CoreContracts memory contracts = deployCoreContracts();
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
}
