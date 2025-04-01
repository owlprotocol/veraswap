// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";

import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";

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
contract DeployTestnet is DeployCoreContracts {
    mapping(uint256 chainId => CoreContracts) public chainContracts;

    function run() external virtual override {
        string[] memory chains = new string[](2);
        chains[0] = "sepolia";
        chains[1] = "optimism-sepolia";

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
        vm.selectFork(forks[0]);
        vm.startBroadcast();
        CoreContracts storage contractsMain = chainContracts[chainIds[0]];

        (address tokenA, address tokenB) = deployTokensAndPools(
            contractsMain.uniswap.universalRouter,
            contractsMain.uniswap.v4PositionManager,
            contractsMain.uniswap.v4StateView
        );
        (address hypERC20CollateralTokenA, ) = HypERC20CollateralUtils.getOrCreate2(
            tokenA,
            contractsMain.hyperlane.mailbox
        );
        console2.log("hypERC20CollateralTokenA:", hypERC20CollateralTokenA);

        (address hypERC20CollateralTokenB, ) = HypERC20CollateralUtils.getOrCreate2(
            tokenB,
            contractsMain.hyperlane.mailbox
        );
        console2.log("hypERC20CollateralTokenB:", hypERC20CollateralTokenB);

        // Configure sweeper to approveAll (token: ERC20, spender: HypERC20Collateral)
        HypTokenRouterSweep(contractsMain.hyperlane.hypTokenRouterSweep).approveAll(tokenA, hypERC20CollateralTokenA);
        HypTokenRouterSweep(contractsMain.hyperlane.hypTokenRouterSweep).approveAll(tokenB, hypERC20CollateralTokenB);
        vm.stopBroadcast();

        /***** Remote Fork *****/
        vm.selectFork(forks[1]);
        vm.startBroadcast();
        CoreContracts storage contractsRemote = chainContracts[chainIds[1]];

        (address hypERC20TokenA, ) = HypERC20Utils.getOrCreate2(
            18,
            contractsRemote.hyperlane.mailbox,
            0,
            "Token C",
            "C"
        );
        console2.log("hypERC20TokenC:", hypERC20TokenA);
        (address hypERC20TokenB, ) = HypERC20Utils.getOrCreate2(
            18,
            contractsRemote.hyperlane.mailbox,
            0,
            "Token D",
            "D"
        );
        console2.log("hypERC20TokenD:", hypERC20TokenB);

        HypERC20(hypERC20TokenA).enrollRemoteRouter(
            uint32(chainIds[0]),
            bytes32(uint256(uint160(hypERC20CollateralTokenA)))
        );
        HypERC20(hypERC20TokenB).enrollRemoteRouter(
            uint32(chainIds[0]),
            bytes32(uint256(uint160(hypERC20CollateralTokenB)))
        );
        vm.stopBroadcast();

        /***** Main Fork *****/
        vm.selectFork(forks[0]);
        vm.startBroadcast();
        HypERC20Collateral(hypERC20CollateralTokenA).enrollRemoteRouter(
            uint32(chainIds[1]),
            bytes32(uint256(uint160(hypERC20TokenA)))
        );
        HypERC20Collateral(hypERC20CollateralTokenB).enrollRemoteRouter(
            uint32(chainIds[1]),
            bytes32(uint256(uint160(hypERC20TokenB)))
        );
        vm.stopBroadcast();
    }

    function deployTokensAndPools(
        address router,
        address v4PositionManager,
        address v4StateView
    ) internal returns (address tokenA, address tokenB) {
        (tokenA, ) = MockERC20Utils.getOrCreate2("Token C", "C", 18);
        (tokenB, ) = MockERC20Utils.getOrCreate2("Token D", "D", 18);

        PoolUtils.setupToken(IERC20(tokenA), IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.setupToken(IERC20(tokenB), IPositionManager(v4PositionManager), IUniversalRouter(router));
        PoolUtils.deployPool(
            IERC20(tokenA),
            IERC20(tokenB),
            IPositionManager(v4PositionManager),
            IStateView(v4StateView)
        );

        console2.log("Token C:", tokenA);
        console2.log("Token D:", tokenB);
        console2.log("Deployed Tokens and pool");
    }
}
