// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TokenRouter} from "@hyperlane-xyz/core/token/libs/TokenRouter.sol";

import {MockSuperchainERC20Utils} from "./utils/MockSuperchainERC20Utils.sol";
import {PoolUtils} from "./utils/PoolUtils.sol";

import {HypERC20Utils} from "./utils/HypERC20Utils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HypTokenRouterSweep} from "../contracts/hyperlane/HypTokenRouterSweep.sol";
import {SuperchainTokenBridgeSweepUtils} from "./utils/SuperchainTokenBridgeSweepUtils.sol";

import {DeployCoreContracts} from "./DeployCoreContracts.s.sol";
import {MultichainFork} from "./MultichainFork.sol";
import {CoreContracts} from "./Structs.sol";

/**
    * Local develpoment script to deploy core contracts and setup tokens and pools using forge multichain deployment
* Similar pattern can be used to configure Testnet and Mainnet deployments
*/
contract DeployInteropTestnet is DeployCoreContracts {
    // Core contracts
    mapping(uint256 chainId => CoreContracts) public chainContracts;
    // Tokens with bytes32 identifiers
    mapping(uint256 chainId => mapping(bytes32 id => address)) public tokens;

    function run() external virtual override {
        string[] memory chains = new string[](3);
        chains[0] = "op-interop-0";
        chains[1] = "op-interop-1";
        chains[2] = "optimism-sepolia";

        (uint256[] memory chainIds, uint256[] memory forks) = MultichainFork.getForks(chains);

        for (uint256 i = 0; i < chains.length; i++) {
            vm.selectFork(forks[i]);

            vm.startBroadcast();

            (address superchainTokenBridgeSweep, ) = SuperchainTokenBridgeSweepUtils.getOrCreate2();
            console2.log("superchainTokenBridgeSweep:", superchainTokenBridgeSweep);

            CoreContracts memory contracts = deployCoreContracts();
            vm.stopBroadcast();

            console2.log("Deployed core contracts on %s", chains[i]);

            console2.log("v4PoolManager:", contracts.uniswap.v4PoolManager);
            console2.log("v4PositionManager:", contracts.uniswap.v4PositionManager);
            console2.log("v4Quoter:", contracts.uniswap.v4Quoter);
            console2.log("universalRouter:", contracts.uniswap.universalRouter);

            console2.log("mailbox:", contracts.hyperlane.mailbox);

            console2.log("kernel:", contracts.kernel);
            console2.log("kernelFactory:", contracts.kernelFactory);
            console2.log("ecdsaValidator:", contracts.ecdsaValidator);
            console2.log("ownableSignatureExecutor:", contracts.ownableSignatureExecutor);
            console2.log("erc7579ExecutorRouter:", contracts.erc7579ExecutorRouter);

            chainContracts[chainIds[i]] = contracts;
        }

        // Only deploy superchain erc20 on interop chains
        for (uint256 i = 0; i < 2; i++) {
            vm.selectFork(forks[i]);
            vm.startBroadcast();
            (address superchainTokenC, ) = MockSuperchainERC20Utils.getOrCreate2("Token C", "C", 18);
            (address superchainTokenD, ) = MockSuperchainERC20Utils.getOrCreate2("Token D", "D", 18);

            console2.log("Deployed Superchain Token C on %s: %s", chains[i], superchainTokenC);
            console2.log("Deployed Superchain Token D on %s: %s", chains[i], superchainTokenD);
            vm.stopBroadcast();
        }


        /***** Main Fork *****/
            {
            vm.selectFork(forks[0]);
            vm.startBroadcast();
            CoreContracts storage contracts = chainContracts[chainIds[0]];

            deployTokensAndPools(
                contracts.uniswap.universalRouter,
                contracts.uniswap.v4PositionManager,
                contracts.uniswap.v4StateView
            );
            // TODO: Deploy hyperc20 router when hyperlane is available
            // Create HypERC20Collateral for token C and D
            // (address hypERC20CollateralTokenC, ) = HypERC20CollateralUtils.getOrCreate2(
            //     tokenC,
            //     contracts.hyperlane.mailbox
            // );
            // console2.log("hypERC20CollateralTokenC:", hypERC20CollateralTokenC);
            //
            // (address hypERC20CollateralTokenD, ) = HypERC20CollateralUtils.getOrCreate2(
            //     tokenD,
            //     contracts.hyperlane.mailbox
            // );
            // console2.log("hypERC20CollateralTokenD:", hypERC20CollateralTokenD);
            // tokens[chainIds[0]][keccak256("C")] = hypERC20CollateralTokenC;
            // tokens[chainIds[0]][keccak256("D")] = hypERC20CollateralTokenD;
            //
            // // Configure sweeper to approveAll (token: ERC20, spender: HypERC20Collateral)
            // if (IERC20(tokenC).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenC) == 0) {
            //     HypTokenRouterSweep(contracts.hyperlane.hypTokenRouterSweep).approveAll(
            //         tokenC,
            //         hypERC20CollateralTokenC
            //     );
            // }
            // if (IERC20(tokenD).allowance(contracts.hyperlane.hypTokenRouterSweep, hypERC20CollateralTokenD) == 0) {
            //     HypTokenRouterSweep(contracts.hyperlane.hypTokenRouterSweep).approveAll(
            //         tokenD,
            //         hypERC20CollateralTokenD
            //     );
            // }
            // vm.stopBroadcast();
        }

        // TODO: Deploy hyperc20 router when hyperlane is available
        // /***** Remote Fork(s) Deploy Tokens *****/
            //     vm.selectFork(forks[2]);
            //     vm.startBroadcast();
            //     CoreContracts storage contracts = chainContracts[chainIds[i]];
            //
            //     (address hypERC20TokenC, ) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Token C", "C");
            //     console2.log("hypERC20TokenC:", hypERC20TokenC);
            //     (address hypERC20TokenD, ) = HypERC20Utils.getOrCreate2(18, contracts.hyperlane.mailbox, 0, "Token D", "D");
            //     console2.log("hypERC20TokenD:", hypERC20TokenD);
            //     tokens[chainIds[0]][keccak256("C")] = hypERC20TokenC;
            //     tokens[chainIds[0]][keccak256("D")] = hypERC20TokenD;
            //     vm.stopBroadcast();
            //
            // /***** Enroll Tokens *****/
            //     vm.selectFork(forks[0]);
            //     vm.startBroadcast();
            //     TokenRouter routerC = TokenRouter(tokens[chainIds[0]][keccak256("C")]);
            //     TokenRouter routerD = TokenRouter(tokens[chainIds[0]][keccak256("D")]);
            //
            //             uint256 remoteChainId = chainIds[2];
            //             bytes32 remoteRouterC = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("C")])));
            //             if (routerC.routers(uint32(remoteChainId)) != remoteRouterC) {
            //                 routerC.enrollRemoteRouter(uint32(remoteChainId), remoteRouterC);
            //             }
            //             bytes32 remoteRouterD = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("D")])));
            //             if (routerD.routers(uint32(remoteChainId)) != remoteRouterD) {
            //                 routerD.enrollRemoteRouter(uint32(remoteChainId), remoteRouterD);
            //             }
            //     vm.stopBroadcast();
            //
            //     vm.selectFork(forks[2]);
            //     vm.startBroadcast();
            //     TokenRouter routerC = TokenRouter(tokens[chainIds[2]][keccak256("C")]);
            //     TokenRouter routerD = TokenRouter(tokens[chainIds[2]][keccak256("D")]);
            //
            //             uint256 remoteChainId = chainIds[0];
            //             bytes32 remoteRouterC = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("C")])));
            //             if (routerC.routers(uint32(remoteChainId)) != remoteRouterC) {
            //                 routerC.enrollRemoteRouter(uint32(remoteChainId), remoteRouterC);
            //             }
            //             bytes32 remoteRouterD = bytes32(uint256(uint160(tokens[remoteChainId][keccak256("D")])));
            //             if (routerD.routers(uint32(remoteChainId)) != remoteRouterD) {
            //                 routerD.enrollRemoteRouter(uint32(remoteChainId), remoteRouterD);
            //             }
            //     vm.stopBroadcast();
            // }
}

        function deployTokensAndPools(
            address router,
            address v4PositionManager,
            address v4StateView
        ) internal returns (address tokenC, address tokenD) {
            (tokenC, ) = MockSuperchainERC20Utils.getOrCreate2("Token C", "C", 18);
            (tokenD, ) = MockSuperchainERC20Utils.getOrCreate2("Token D", "D", 18);

            /*
                address token0 = tokenC;
            address token1 = tokenD;
            if (uint160(tokenC) > uint160(tokenD)) {
                (token0, token1) = (token1, token0);
            }

            Currency currency0 = (token0 == address(0)) ? CurrencyLibrary.ADDRESS_ZERO : Currency.wrap(token0);
            Currency currency1 = (token1 == address(0)) ? CurrencyLibrary.ADDRESS_ZERO : Currency.wrap(token1);
            PoolKey memory poolKey = PoolKey(currency0, currency1, 3000, tickSpacing, IHooks(address(0)));

            // Skip if liquidity > 0
            uint256 liquidity = v4StateView.getLiquidity(PoolIdLibrary.toId(poolKey));
        */
            // Skip liquidity for now
            uint256 liquidity = 0; // Placeholder for actual liquidity check
                if (liquidity == 0) {
                    PoolUtils.setupToken(IERC20(tokenC), IPositionManager(v4PositionManager), IUniversalRouter(router));
                    PoolUtils.setupToken(IERC20(tokenD), IPositionManager(v4PositionManager), IUniversalRouter(router));
                    PoolUtils.deployPool(tokenC, tokenD, IPositionManager(v4PositionManager), IStateView(v4StateView));

                    console2.log("Token C:", tokenC);
                    console2.log("Token D:", tokenD);
                    console2.log("Deployed Tokens and pool");
                }
        }
}
