// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Create2Utils} from "./utils/Create2Utils.sol";

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
import {HyperlanePausableHookUtils} from "./utils/HyperlanePausableHookUtils.sol";
import {HyperlaneNoopIsmUtils} from "./utils/HyperlaneNoopIsmUtils.sol";
import {HyperlaneMailboxUtils} from "./utils/HyperlaneMailboxUtils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";
import {HypERC20Utils} from "./utils/HypERC20Utils.sol";
import {HypERC20} from "@hyperlane-xyz/core/token/HypERC20.sol";
import {HypERC20Collateral} from "@hyperlane-xyz/core/token/HypERC20Collateral.sol";
import {TestRecipient} from "@hyperlane-xyz/core/test/TestRecipient.sol";

// Permit2
import {Permit2Utils} from "./utils/Permit2Utils.sol";

// Hyperlane Kernel Interchain Account Infra
import {ECDSAValidatorUtils} from "./utils/ECDSAValidatorUtils.sol";
import {KernelUtils} from "./utils/KernelUtils.sol";
import {KernelFactoryUtils} from "./utils/KernelFactoryUtils.sol";
import {OwnableSignatureExecutorUtils} from "./utils/OwnableSignatureExecutorUtils.sol";
import {ERC7579ExecutorRouterUtils} from "./utils/ERC7579ExecutorRouterUtils.sol";

contract DeployAll is Script, Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function run() external {
        string[2] memory chains = ["localhost", "OPChainA"];
        uint32[2] memory chainIds = [uint32(900), uint32(901)];

        uint mainFork = vm.createSelectFork(chains[0]);
        vm.startBroadcast();

        (
            address mailboxMain,
            address routerMain,
            address v4PositionManagerMain,
            address v4StateViewMain
        ) = deployCoreContracts();
        (address tokenA, address tokenB) = deployTokensAndPools(routerMain, v4PositionManagerMain, v4StateViewMain);

        // Create HypERC20Collateral for token A and B
        (address hypERC20CollateralTokenA, ) = HypERC20CollateralUtils.getOrCreate2(tokenA, mailboxMain);
        console2.log("hypERC20CollateralTokenA:", hypERC20CollateralTokenA);

        (address hypERC20CollateralTokenB, ) = HypERC20CollateralUtils.getOrCreate2(tokenB, mailboxMain);
        console2.log("hypERC20CollateralTokenB:", hypERC20CollateralTokenB);

        vm.stopBroadcast();

        // Create HypERC20 for token A and B
        uint remoteFork = vm.createSelectFork(chains[1]);
        vm.startBroadcast();

        (address mailboxRemote, , , ) = deployCoreContracts();
        (address hypERC20TokenA, ) = HypERC20Utils.getOrCreate2(18, mailboxRemote, 0, "Synth Token A", "sA");
        console2.log("hypERC20TokenA:", hypERC20TokenA);
        (address hypERC20TokenB, ) = HypERC20Utils.getOrCreate2(18, mailboxRemote, 0, "Synth Token B", "sB");
        console2.log("hypERC20TokenB:", hypERC20TokenB);

        vm.stopBroadcast();

        // Enroll
        vm.selectFork(mainFork);
        vm.startBroadcast();
        HypERC20Collateral(hypERC20CollateralTokenA).enrollRemoteRouter(
            chainIds[1],
            bytes32(uint256(uint160(hypERC20TokenA)))
        );
        HypERC20Collateral(hypERC20CollateralTokenB).enrollRemoteRouter(
            chainIds[1],
            bytes32(uint256(uint160(hypERC20TokenB)))
        );
        vm.stopBroadcast();

        vm.selectFork(remoteFork);
        vm.startBroadcast();
        HypERC20(hypERC20TokenA).enrollRemoteRouter(chainIds[0], bytes32(uint256(uint160(hypERC20CollateralTokenA))));
        HypERC20(hypERC20TokenB).enrollRemoteRouter(chainIds[0], bytes32(uint256(uint160(hypERC20CollateralTokenB))));

        // Deploy TestRecipient on remote
        address testRecipientAddr = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(type(TestRecipient).creationCode),
            Create2Utils.DETERMINISTIC_DEPLOYER
        );
        bool testRecipientExists = address(testRecipientAddr).code.length > 0;

        if (!testRecipientExists) {
            new TestRecipient{salt: BYTES32_ZERO}();
        }
        console2.log("testRecipient: ", testRecipientAddr);
        vm.stopBroadcast();
    }

    function deployCoreContracts()
        internal
        returns (address mailbox, address router, address v4PositionManager, address v4StateView)
    {
        uint32 chainId = uint32(block.chainid);

        // Permit2
        (address permit2, bool exists) = Permit2Utils.getOrCreate2();
        // UNISWAP CONTRACTS
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        (address v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        (v4PositionManager, ) = PositionManagerUtils.getOrCreate2(v4PoolManager);
        (v4StateView, ) = StateViewUtils.getOrCreate2(v4PoolManager);
        (address v4Quoter, ) = V4QuoterUtils.getOrCreate2(v4PoolManager);

        RouterParameters memory routerParams = RouterParameters({
            permit2: permit2,
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

        // HYPERLANE CONTRACTS
        (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();
        (address ism, ) = HyperlaneNoopIsmUtils.getOrCreate2();
        (address hook, ) = HyperlanePausableHookUtils.getOrCreate2();
        (mailbox, ) = HyperlaneMailboxUtils.getOrCreate2(chainId, ism, hook);

        console2.log("Mailbox:", mailbox);
        console2.log("Router:", router);
        console2.log("v4PositionManager:", v4PositionManager);
        console2.log("v4StateView:", v4StateView);

        // KERNEL CONTRACTS
        (address kernel, ) = KernelUtils.getOrCreate2(0x0000000071727De22E5E9d8BAf0edAc6f37da032);
        (address kernelFactory, ) = KernelFactoryUtils.getOrCreate2(kernel);

        (address ecdsaValidator, ) = ECDSAValidatorUtils.getOrCreate2();
        (address executor, ) = OwnableSignatureExecutorUtils.getOrCreate2();

        (address executorRouter, ) = ERC7579ExecutorRouterUtils.getOrCreate2(
            mailbox,
            address(0),
            executor,
            kernelFactory
        );
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
