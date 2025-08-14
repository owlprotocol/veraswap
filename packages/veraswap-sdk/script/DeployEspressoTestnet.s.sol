// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
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
// Contract Structs
import {CoreContracts, DeployParams} from "./Structs.sol";
import {ContractParams} from "./libraries/ContractParams.sol";
import {ContractsCoreLibrary} from "./libraries/ContractsCore.sol";

/**
 * Local develpoment script to deploy core contracts and setup tokens and pools using forge multichain deployment
 * Similar pattern can be used to configure Testnet and Mainnet deployments
 */
contract DeployEspressoTestnet is DeployCoreContracts {
    // Core contracts
    mapping(uint256 chainId => CoreContracts) public chainContracts;
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => mapping(bytes32 id => address)) public tokens;

    function run() external virtual override {
        string[] memory chains = new string[](2);
        chains[0] = "appchain-testnet";
        chains[1] = "rari-testnet";

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
            console2.log("orbiterBridgeSweep:", contracts.orbiterBridgeSweep);

            chainContracts[chainIds[i]] = contracts;
        }

        /**
         * Main Fork ****
         */
        // Create HypERC20Collateral for Mocha and Ristretto
        {
            vm.selectFork(forks[0]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[0]];

            (address tokenM, address tokenR) = deployTokensAndPools(
                contracts.uniswap.universalRouter, contracts.uniswap.v4PositionManager, contracts.uniswap.v4StateView
            );
            (address hypERC20CollateralTokenM,) =
                HypERC20CollateralUtils.getOrCreate2(tokenM, contracts.hyperlane.mailbox);
            console2.log("hypERC20CollateralTokenM:", hypERC20CollateralTokenM);

            (address hypERC20CollateralTokenR,) =
                HypERC20CollateralUtils.getOrCreate2(tokenR, contracts.hyperlane.mailbox);
            console2.log("hypERC20CollateralTokenR:", hypERC20CollateralTokenR);
            tokens[chainIds[0]][keccak256("M")] = hypERC20CollateralTokenM;
            tokens[chainIds[0]][keccak256("R")] = hypERC20CollateralTokenR;

            // Configure sweeper to approveAll (token: ERC20, spender: HypERC20Collateral)
            if (IERC20(tokenM).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenM) == 0) {
                HypTokenRouterSweep(payable(contracts.hyperlane.hypTokenRouterSweep)).approveAll(
                    tokenM, hypERC20CollateralTokenM
                );
            }
            if (IERC20(tokenR).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenR) == 0) {
                HypTokenRouterSweep(payable(contracts.hyperlane.hypTokenRouterSweep)).approveAll(
                    tokenR, hypERC20CollateralTokenR
                );
            }
            vm.stopBroadcast();
        }

        /**
         * Remote Fork(s) Deploy Tokens ****
         */
        for (uint256 i = 1; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[i]];

            (address hypERC20TokenM,) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Mocha", "M");
            console2.log("hypERC20TokenM:", hypERC20TokenM);
            (address hypERC20TokenR,) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Ristretto", "R");
            console2.log("hypERC20TokenR:", hypERC20TokenR);
            tokens[chainIds[i]][keccak256("M")] = hypERC20TokenM;
            tokens[chainIds[i]][keccak256("R")] = hypERC20TokenR;
            vm.stopBroadcast();
        }

        /**
         * Enroll Tokens ****
         */
        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();
            TokenRouter routerM = TokenRouter(tokens[chainIds[i]][keccak256("M")]);
            TokenRouter routerR = TokenRouter(tokens[chainIds[i]][keccak256("R")]);

            for (uint256 j = 0; j < chains.length; j++) {
                if (i != j) {
                    uint256 remoteChainId = chainIds[j];
                    bytes32 remoteRouterM = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("M")])));
                    if (routerM.routers(uint32(remoteChainId)) != remoteRouterM) {
                        routerM.enrollRemoteRouter(uint32(remoteChainId), remoteRouterM);
                    }
                    bytes32 remoteRouterR = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("R")])));
                    if (routerR.routers(uint32(remoteChainId)) != remoteRouterR) {
                        routerR.enrollRemoteRouter(uint32(remoteChainId), remoteRouterR);
                    }
                }
            }
            vm.stopBroadcast();
        }
    }

    function deployTokensAndPools(address router, address v4PositionManager, address v4StateView)
        internal
        returns (address tokenM, address tokenR)
    {
        (tokenM,) = MockERC20Utils.getOrCreate2("Mocha", "M", 18);
        (tokenR,) = MockERC20Utils.getOrCreate2("Ristretto", "R", 18);

        // Skip liquidity for now
        uint256 liquidity = 1; // Placeholder for actual liquidity check
        if (liquidity == 1) {
            // PoolUtils.setupToken(IERC20(tokenM), IPositionManager(v4PositionManager), IUniversalRouter(router));
            // PoolUtils.setupToken(IERC20(tokenR), IPositionManager(v4PositionManager), IUniversalRouter(router));
            Currency tokenMCurrency = Currency.wrap(tokenM);
            Currency tokenRCurrency = Currency.wrap(tokenR);
            PoolUtils.createV4Pool(tokenMCurrency, tokenRCurrency, IPositionManager(v4PositionManager), 10 ether);
            // Currency eth = Currency.wrap(address(0));
            // PoolUtils.createV4Pool(eth, tokenMCurrency, IPositionManager(v4PositionManager), 1 ether);
            // PoolUtils.deployPool(tokenM, tokenR, IPositionManager(v4PositionManager), IStateView(v4StateView));
            // PoolUtils.deployPool(address(0), tokenM, IPositionManager(v4PositionManager), IStateView(v4StateView));
        }

        console2.log("Mocha:", tokenM);
        console2.log("Ristretto:", tokenR);
        console2.log("Deployed Tokens and pool");
    }
}
