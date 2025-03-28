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
// Permit2
import {Permit2Utils} from "./utils/Permit2Utils.sol";
// Hyperlane
import {HyperlanePausableHookUtils} from "./utils/HyperlanePausableHookUtils.sol";
import {HyperlaneNoopIsmUtils} from "./utils/HyperlaneNoopIsmUtils.sol";
import {HyperlaneMailboxUtils} from "./utils/HyperlaneMailboxUtils.sol";
import {HypERC20Utils} from "./utils/HypERC20Utils.sol";
import {HypERC20CollateralUtils} from "./utils/HypERC20CollateralUtils.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";
import {HyperlaneTestRecipientUtils} from "./utils/HyperlaneTestRecipientUtils.sol";
// Kernel Account
import {ECDSAValidatorUtils} from "./utils/ECDSAValidatorUtils.sol";
import {KernelUtils} from "./utils/KernelUtils.sol";
import {KernelFactoryUtils} from "./utils/KernelFactoryUtils.sol";
// Kernel Account (custom)
import {OwnableSignatureExecutorUtils} from "./utils/OwnableSignatureExecutorUtils.sol";
import {ERC7579ExecutorRouterUtils} from "./utils/ERC7579ExecutorRouterUtils.sol";

struct UniswapContracts {
    // Uniswap
    address v4PoolManager;
    address v4PositionManager;
    address v4StateView;
    address v4Quoter;
    address universalRouter;
}

struct HyperlaneContracts {
    // Uniswap
    address ism;
    address hook;
    address mailbox;
    address testRecipient;
    address hypTokenRouterSweep;
}

struct CoreContracts {
    // Uniswap
    UniswapContracts uniswap;
    // Hyperlane
    HyperlaneContracts hyperlane;
    // Kernel
    address kernel;
    address kernelFactory;
    address ecdsaValidator;
    address ownableSignatureExecutor;
    address erc7579ExecutorRouter;
}

contract DeployCoreContracts is Script, Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function run() external {
        vm.startBroadcast();
        CoreContracts memory contractsMain = deployCoreContracts();
        vm.stopBroadcast();
    }

    function deployUniswapContracts() internal returns (UniswapContracts memory) {
        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();
        // UNISWAP CONTRACTS
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        (address v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        (address v4PositionManager, ) = PositionManagerUtils.getOrCreate2(v4PoolManager);
        (address v4StateView, ) = StateViewUtils.getOrCreate2(v4PoolManager);
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
        (address universalRouter, ) = UniversalRouterApprovedReentrantUtils.getOrCreate2(routerParams);

        console2.log("v4PoolManager:", v4PoolManager);
        console2.log("v4PositionManager:", v4PositionManager);
        console2.log("v4StateView:", v4StateView);
        console2.log("v4Quoter:", v4Quoter);
        console2.log("universalRouter:", universalRouter);

        return
            UniswapContracts({
                v4PoolManager: v4PoolManager,
                v4PositionManager: v4PositionManager,
                v4StateView: v4StateView,
                v4Quoter: v4Quoter,
                universalRouter: universalRouter
            });
    }

    function deployHyperlaneContracts() internal returns (HyperlaneContracts memory) {
        uint32 chainId = uint32(block.chainid);
        console2.log("ChainId:", chainId);
        // HYPERLANE CONTRACTS
        (address ism, ) = HyperlaneNoopIsmUtils.getOrCreate2();
        (address hook, ) = HyperlanePausableHookUtils.getOrCreate2();
        (address mailbox, ) = HyperlaneMailboxUtils.getOrCreate2(chainId, ism, hook);
        (address testRecipient, ) = HyperlaneTestRecipientUtils.getOrCreate2();
        (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();

        console2.log("ism:", ism);
        console2.log("hook:", hook);
        console2.log("mailbox:", mailbox);
        console2.log("testRecipient:", testRecipient);
        console2.log("hypTokenRouterSweep:", hypTokenRouterSweep);

        return
            HyperlaneContracts({
                mailbox: mailbox,
                ism: ism,
                hook: hook,
                testRecipient: testRecipient,
                hypTokenRouterSweep: hypTokenRouterSweep
            });
    }

    function deployCoreContracts() internal returns (CoreContracts memory) {
        uint32 chainId = uint32(block.chainid);
        console2.log("ChainId:", chainId);

        UniswapContracts memory uniswap = deployUniswapContracts();
        HyperlaneContracts memory hyperlane = deployHyperlaneContracts();

        // KERNEL CONTRACTS
        (address kernel, ) = KernelUtils.getOrCreate2(0x0000000071727De22E5E9d8BAf0edAc6f37da032);
        (address kernelFactory, ) = KernelFactoryUtils.getOrCreate2(kernel);
        (address ecdsaValidator, ) = ECDSAValidatorUtils.getOrCreate2();

        console2.log("kernel:", kernel);
        console2.log("kernelFactory:", kernelFactory);
        console2.log("ecdsaValidator:", ecdsaValidator);

        (address ownableSignatureExecutor, ) = OwnableSignatureExecutorUtils.getOrCreate2();
        (address erc7579ExecutorRouter, ) = ERC7579ExecutorRouterUtils.getOrCreate2(
            hyperlane.mailbox,
            address(0),
            ownableSignatureExecutor,
            kernelFactory
        );

        console2.log("ownableSignatureExecutor:", ownableSignatureExecutor);
        console2.log("erc7579ExecutorRouter:", erc7579ExecutorRouter);

        return
            CoreContracts({
                uniswap: uniswap,
                // Hyperlane
                hyperlane: hyperlane,
                // Kernel
                kernel: kernel,
                kernelFactory: kernelFactory,
                ecdsaValidator: ecdsaValidator,
                ownableSignatureExecutor: ownableSignatureExecutor,
                erc7579ExecutorRouter: erc7579ExecutorRouter
            });
    }
}
