// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {MockERC20Utils} from "./utils/MockERC20Utils.sol";
import {UnsupportedProtocolUtils} from "./utils/UnsupportedProtocolUtils.sol";
import {PoolManagerUtils} from "./utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "./utils/PositionManagerUtils.sol";
import {StateViewUtils} from "./utils/StateViewUtils.sol";
import {V4QuoterUtils} from "./utils/V4QuoterUtils.sol";
import {UniversalRouterApprovedReentrantUtils} from "./utils/UniversalRouterApprovedReentrantUtils.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {IUniversalRouter} from "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import {IStateView} from "@uniswap/v4-periphery/src/interfaces/IStateView.sol";
import {PoolUtils} from "./utils/PoolUtils.sol";
import {HyperlaneUtils} from "./utils/HyperlaneUtils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";
import {HypERC20Utils} from "./utils/HypERC20Utils.sol";

contract DeployAll is Script, Test {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function run() external {
        string[2] memory chainRPCs = ["http://127.0.0.1:8545", "http://127.0.0.1:9545"];
        uint32[2] memory chainIds = [uint32(900), uint32(901)];

        uint mainFork = vm.createSelectFork(chainRPCs[0]);
        vm.startBroadcast();

        (
            address mailboxMain,
            address routerMain,
            address v4PositionManagerMain,
            address v4StateViewMain
        ) = deployCoreContracts(chainIds[0]);
        (address tokenA, address tokenB) = deployTokensAndPools(routerMain, v4PositionManagerMain, v4StateViewMain);

        (address hypERC20Collateral, ) = HypERC20CollateralUtils.getOrCreate2(tokenA, mailboxMain);
        console2.log("HypERC20Collateral:", hypERC20Collateral);

        vm.stopBroadcast();

        uint remoteFork = vm.createSelectFork(chainRPCs[1]);
        vm.startBroadcast();

        (address mailboxRemote, , , ) = deployCoreContracts(chainIds[1]);
        (address hypERC20, ) = HypERC20Utils.getOrCreate2(18, mailboxRemote, 0, "Synth Token A", "sA");
        console2.log("HypERC20:", hypERC20);

        vm.stopBroadcast();

        vm.selectFork(mainFork);
        vm.startBroadcast();
        HypERC20CollateralUtils.enrollRemoteRouter(hypERC20Collateral, chainIds[1], hypERC20);
        vm.stopBroadcast();

        vm.selectFork(remoteFork);
        vm.startBroadcast();
        HypERC20Utils.enrollRemoteRouter(hypERC20, chainIds[0], hypERC20Collateral);
        vm.stopBroadcast();
    }

    function deployCoreContracts(
        uint32 chainId
    ) internal returns (address mailbox, address router, address v4PositionManager, address v4StateView) {
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        (address v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        (v4PositionManager, ) = PositionManagerUtils.getOrCreate2(v4PoolManager);
        (v4StateView, ) = StateViewUtils.getOrCreate2(v4PoolManager);
        (address v4Quoter, ) = V4QuoterUtils.getOrCreate2(v4PoolManager);

        RouterParameters memory routerParams = RouterParameters({
            permit2: PERMIT2,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: unsupported,
            v3Factory: unsupported,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: v4PoolManager,
            v3NFTPositionManager: unsupported,
            v4PositionManager: v4PositionManager
        });

        (router, ) = UniversalRouterApprovedReentrantUtils.getOrCreate2(routerParams);
        (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();
        (address ism, ) = HyperlaneUtils.getOrCreateISM();
        (address hook, ) = HyperlaneUtils.getOrCreateHook();
        (mailbox, ) = HyperlaneUtils.getOrCreateMailbox(chainId);

        console2.log("Mailbox:", mailbox);
        console2.log("Router:", router);
        console2.log("v4PositionManager:", v4PositionManager);
        console2.log("v4StateView:", v4StateView);
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
        PoolUtils.deployPool(
            IERC20(tokenA),
            IERC20(tokenB),
            IPositionManager(v4PositionManager),
            IStateView(v4StateView)
        );

        console2.log("Deployed Tokens and pool");
    }
}
