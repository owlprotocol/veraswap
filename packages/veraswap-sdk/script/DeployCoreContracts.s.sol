// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/console2.sol";
import "forge-std/Script.sol";
import "forge-std/Test.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Create2Utils} from "./utils/Create2Utils.sol";

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "./utils/UnsupportedProtocolUtils.sol";
import {PoolManagerUtils} from "./utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "./utils/PositionManagerUtils.sol";
import {StateViewUtils} from "./utils/StateViewUtils.sol";
import {V4QuoterUtils} from "./utils/V4QuoterUtils.sol";
import {UniversalRouterApprovedReentrantUtils} from "./utils/UniversalRouterApprovedReentrantUtils.sol";
// Permit2
import {Permit2Utils} from "./utils/Permit2Utils.sol";
// Hyperlane
import {HyperlanePausableHookUtils} from "./utils/HyperlanePausableHookUtils.sol";
import {HyperlaneNoopIsmUtils} from "./utils/HyperlaneNoopIsmUtils.sol";
import {HyperlaneMailboxUtils} from "./utils/HyperlaneMailboxUtils.sol";
import {HypTokenRouterSweepUtils} from "./utils/HypTokenRouterSweepUtils.sol";
import {HyperlaneTestRecipientUtils} from "./utils/HyperlaneTestRecipientUtils.sol";
// Kernel Account
import {ECDSAValidatorUtils} from "./utils/ECDSAValidatorUtils.sol";
import {KernelUtils} from "./utils/KernelUtils.sol";
import {KernelFactoryUtils} from "./utils/KernelFactoryUtils.sol";
// Kernel Account (custom)
import {OwnableSignatureExecutorUtils} from "./utils/OwnableSignatureExecutorUtils.sol";
import {ERC7579ExecutorRouterUtils} from "./utils/ERC7579ExecutorRouterUtils.sol";

import {HyperlaneDeployParams, UniswapContracts, HyperlaneContracts, CoreContracts} from "./Structs.sol";
import {DeployParameters} from "./DeployParameters.s.sol";

contract DeployCoreContracts is DeployParameters {
    bytes32 constant BYTES32_ZERO = bytes32(0);

    function run() external virtual {
        vm.startBroadcast();
        CoreContracts memory contracts = deployCoreContracts();

        console2.log("v4PoolManager:", contracts.uniswap.v4PoolManager);
        console2.log("v4PositionManager:", contracts.uniswap.v4PositionManager);

        console2.log("mailbox:", contracts.hyperlane.mailbox);

        console2.log("kernel:", contracts.kernel);
        console2.log("kernelFactory:", contracts.kernelFactory);
        console2.log("ecdsaValidator:", contracts.ecdsaValidator);
        console2.log("ownableSignatureExecutor:", contracts.ownableSignatureExecutor);
        console2.log("erc7579ExecutorRouter:", contracts.erc7579ExecutorRouter);

        vm.stopBroadcast();
    }

    function deployUniswapRouterParams() internal returns (RouterParameters memory) {
        // Permit2
        (address permit2, ) = Permit2Utils.getOrCreate2();
        // UNISWAP CONTRACTS
        (address unsupported, ) = UnsupportedProtocolUtils.getOrCreate2();
        (address v4PoolManager, ) = PoolManagerUtils.getOrCreate2(address(0));
        (address v4PositionManager, ) = PositionManagerUtils.getOrCreate2(v4PoolManager);

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

        return routerParams;
    }

    function deployHyperlaneParams() internal returns (HyperlaneDeployParams memory) {
        uint32 chainId = uint32(block.chainid);
        // HYPERLANE CONTRACTS
        (address ism, ) = HyperlaneNoopIsmUtils.getOrCreate2();
        (address hook, ) = HyperlanePausableHookUtils.getOrCreate2();
        (address mailbox, ) = HyperlaneMailboxUtils.getOrCreate2(chainId, ism, hook);

        return HyperlaneDeployParams({mailbox: mailbox});
    }

    function deployCoreContracts() internal returns (CoreContracts memory) {
        uint256 chainId = block.chainid;

        // Deploy Parameters (contracts that might already have official addresses)
        RouterParameters memory uniswapParams;
        HyperlaneDeployParams memory hyperlaneParams;

        // TODO: These are only generated on local
        address v4StateView;
        address v4Quoter;
        if (chainId == 900 || chainId == 901 || chainId == 902) {
            // Local Anvil / Supersim
            uniswapParams = deployUniswapRouterParams();
            (v4StateView, ) = StateViewUtils.getOrCreate2(uniswapParams.v4PoolManager);
            (v4Quoter, ) = V4QuoterUtils.getOrCreate2(uniswapParams.v4PoolManager);

            hyperlaneParams = deployHyperlaneParams();
        } else {
            uniswapParams = deployParams[chainId].uniswap;
            if (uniswapParams.permit2 == address(0)) revert("Invalid: DeployParams Permit2 not deployed");
            hyperlaneParams = deployParams[chainId].hyperlane;
            if (hyperlaneParams.mailbox == address(0)) revert("Invalid: DeployParams Hyperlane Mailbox not deployed");
        }

        // Custom contracts (always deployed)
        // Deploy Universal Router
        (address universalRouter, ) = UniversalRouterApprovedReentrantUtils.getOrCreate2(uniswapParams);

        // Deploy Hyperlane Contracts
        (address testRecipient, ) = HyperlaneTestRecipientUtils.getOrCreate2();
        (address hypTokenRouterSweep, ) = HypTokenRouterSweepUtils.getOrCreate2();

        // KERNEL CONTRACTS
        (address kernel, ) = KernelUtils.getOrCreate2(0x0000000071727De22E5E9d8BAf0edAc6f37da032);
        (address kernelFactory, ) = KernelFactoryUtils.getOrCreate2(kernel);
        (address ecdsaValidator, ) = ECDSAValidatorUtils.getOrCreate2();

        (address ownableSignatureExecutor, ) = OwnableSignatureExecutorUtils.getOrCreate2();
        (address erc7579ExecutorRouter, ) = ERC7579ExecutorRouterUtils.getOrCreate2(
            hyperlaneParams.mailbox,
            address(0),
            ownableSignatureExecutor,
            kernelFactory
        );

        return
            CoreContracts({
                uniswap: UniswapContracts({
                    v4PoolManager: uniswapParams.v4PoolManager,
                    v4PositionManager: uniswapParams.v4PositionManager,
                    v4StateView: v4StateView,
                    v4Quoter: v4Quoter,
                    universalRouter: universalRouter
                }),
                hyperlane: HyperlaneContracts({
                    mailbox: hyperlaneParams.mailbox,
                    testRecipient: testRecipient,
                    hypTokenRouterSweep: hypTokenRouterSweep
                }),
                // Kernel
                kernel: kernel,
                kernelFactory: kernelFactory,
                ecdsaValidator: ecdsaValidator,
                ownableSignatureExecutor: ownableSignatureExecutor,
                erc7579ExecutorRouter: erc7579ExecutorRouter
            });
    }
}
