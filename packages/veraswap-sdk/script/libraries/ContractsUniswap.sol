// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";
import {Vm} from "forge-std/Vm.sol";

// Create2
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Create2Utils} from "../utils/Create2Utils.sol";
// Permit2
import {Permit2Utils} from "../utils/Permit2Utils.sol";
// Uniswap V2 Core
import {UniswapV2FactoryUtils} from "../utils/UniswapV2FactoryUtils.sol";
// Uniswap V3 Core
import {UniswapV3Pool} from "@uniswap/v3-core/contracts/UniswapV3Pool.sol";
import {UniswapV3FactoryUtils} from "../utils/UniswapV3FactoryUtils.sol";
// Uniswap V3 Periphery
import {V3PositionManagerMockUtils} from "../utils/V3PositionManagerMockUtils.sol";
import {V3QuoterUtils} from "../utils/V3QuoterUtils.sol";
// Uniswap V4 Core
import {PoolManagerUtils} from "../utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "../utils/PositionManagerUtils.sol";
// Uniswap V4 Periphery
import {StateViewUtils} from "../utils/StateViewUtils.sol";
import {V4QuoterUtils} from "../utils/V4QuoterUtils.sol";
// Uniswap Universal Router
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {UnsupportedProtocolUtils} from "../utils/UnsupportedProtocolUtils.sol";
import {UniversalRouterUtils} from "../utils/UniversalRouterUtils.sol";
import {MetaQuoterUtils} from "../utils/MetaQuoterUtils.sol";
// Contract Structs
import {UniswapContracts} from "../Structs.sol";

library ContractsUniswapLibrary {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    bytes32 constant BYTES32_ZERO = bytes32(0);

    /// @notice Deploy core Uniswap contracts, including Permit2, and Uniswap V3/V4 contracts.
    /// @dev ONLY local chains
    function deployUniswapRouterParams(address weth9) internal returns (RouterParameters memory) {
        // Permit2
        (address permit2,) = Permit2Utils.getOrCreate2();
        // Unsupported Revert Contract
        (address unsupported,) = UnsupportedProtocolUtils.getOrCreate2();
        // Uniswap V2
        (address v2Factory,) = UniswapV2FactoryUtils.getOrCreate2(address(0));
        bytes32 pairInitCodeHash =
            keccak256(abi.encodePacked(vm.getCode("artifacts/UniswapV2Pair.sol/UniswapV2Pair.json")));
        // Uniswap V3
        (address v3Factory,) = UniswapV3FactoryUtils.getOrCreate2();
        bytes32 poolInitCodeHash = keccak256(abi.encodePacked(type(UniswapV3Pool).creationCode));
        // Uniswap V4
        (address v4PoolManager,) = PoolManagerUtils.getOrCreate2(address(0));
        (address v4PositionManager,) = PositionManagerUtils.getOrCreate2(v4PoolManager, weth9);

        RouterParameters memory routerParams = RouterParameters({
            permit2: permit2,
            weth9: weth9,
            v2Factory: v2Factory,
            v3Factory: v3Factory,
            pairInitCodeHash: pairInitCodeHash,
            poolInitCodeHash: poolInitCodeHash,
            v4PoolManager: v4PoolManager,
            v3NFTPositionManager: unsupported,
            v4PositionManager: v4PositionManager
        });

        return routerParams;
    }

    /// @notice Deploy all Uniswap contracts
    /// @dev ONLY local chains
    function deploy(address weth9) internal returns (UniswapContracts memory contracts) {
        // Core Uniswap Contracts
        RouterParameters memory routerParams = deployUniswapRouterParams(weth9);
        // ERC20 Utils
        contracts.weth9 = routerParams.weth9;
        contracts.permit2 = routerParams.permit2;
        // Uniswap V2
        contracts.v2Factory = routerParams.v2Factory;
        contracts.pairInitCodeHash = routerParams.pairInitCodeHash;
        // Uniswap V3
        contracts.v3Factory = routerParams.v3Factory;
        contracts.poolInitCodeHash = routerParams.poolInitCodeHash;
        contracts.v3NFTPositionManager = routerParams.v3NFTPositionManager;
        // Uniswap V4
        contracts.v4PoolManager = routerParams.v4PoolManager;
        contracts.v4PositionManager = routerParams.v4PositionManager;
        // Universal Router
        (address universalRouter,) = UniversalRouterUtils.getOrCreate2(routerParams);
        contracts.universalRouter = universalRouter;
        // "Mock Position Manager" for Uniswap V3 (set this after deploying the Universal Router)
        (address v3PositionManagerMock,) =
            V3PositionManagerMockUtils.getOrCreate2(contracts.v3Factory, contracts.poolInitCodeHash);
        contracts.v3NFTPositionManager = v3PositionManagerMock;
        // Uniswap V3 Periphery
        (address v3Quoter,) = V3QuoterUtils.getOrCreate2(contracts.v3Factory, contracts.poolInitCodeHash);
        contracts.v3Quoter = v3Quoter;
        // Uniswap V4 Periphery
        (address v4StateView,) = StateViewUtils.getOrCreate2(contracts.v4PoolManager);
        contracts.v4StateView = v4StateView;
        (address v4Quoter,) = V4QuoterUtils.getOrCreate2(contracts.v4PoolManager);
        contracts.v4Quoter = v4Quoter;
        // Universal Periphery
        (address metaQuoter,) = MetaQuoterUtils.getOrCreate2(
            contracts.v2Factory,
            contracts.pairInitCodeHash,
            contracts.v3Factory,
            contracts.poolInitCodeHash,
            contracts.v4PoolManager,
            contracts.weth9
        );
        contracts.metaQuoter = metaQuoter;
    }

    /// @notice Get or deploy Uniswap contracts
    /// @dev Can be used to reconcile with existing deployment
    function getOrDeploy(UniswapContracts memory contracts) internal {
        // Check if required Uniswap contracts are deployed (will be true for local chains / chains configured in deployParams folder)
        // Core token infra for WETH9 and Permit2
        bool tokenInfraEnabled = contracts.weth9 != address(0) && contracts.permit2 != address(0);
        if (!tokenInfraEnabled) {
            console2.log("Core Uniswap Infra (eg. Permit2, WETH9), not deployed, skipping Uniswap deployment");
        }

        // Deploy additional Uniswap periphery contracts that are not yet set in deploy parameters or not yet deployed locally
        // Uniswap V3 Periphery
        {
            bool v3Enabled =
                tokenInfraEnabled && contracts.v3Factory != address(0) && contracts.poolInitCodeHash != bytes32(0);
            if (!v3Enabled) {
                console2.log("Uniswap V3 not enabled/deployed");
            } else {
                if (contracts.v3Quoter == address(0)) {
                    (address v3Quoter,) = V3QuoterUtils.getOrCreate2(contracts.v3Factory, contracts.poolInitCodeHash);
                    contracts.v3Quoter = v3Quoter;
                }
            }
        }
        // Uniswap V4 Periphery
        {
            bool v4Enabled =
                tokenInfraEnabled && contracts.v4PoolManager != address(0) && contracts.v4PositionManager != address(0);
            if (!v4Enabled) {
                console2.log("Uniswap V4 not enabled/deployed");
            } else {
                if (contracts.v4StateView == address(0)) {
                    (address v4StateView,) = StateViewUtils.getOrCreate2(contracts.v4PoolManager);
                    contracts.v4StateView = v4StateView;
                }
                if (contracts.v4Quoter == address(0)) {
                    (address v4Quoter,) = V4QuoterUtils.getOrCreate2(contracts.v4PoolManager);
                    contracts.v4Quoter = v4Quoter;
                }
                if (contracts.metaQuoter == address(0)) {
                    //TODO: Is it ok to deploy this if only V4 is enabled? (Note: if v3 is enabled, v4 is assumed to be enabled)
                    // => Seems fine as contract just skips not existant pools though there is a slight gas penalty
                    (address metaQuoter,) = MetaQuoterUtils.getOrCreate2(
                        contracts.v2Factory,
                        contracts.pairInitCodeHash,
                        contracts.v3Factory,
                        contracts.poolInitCodeHash,
                        contracts.v4PoolManager,
                        contracts.weth9
                    );
                    contracts.metaQuoter = metaQuoter;
                }
                if (contracts.universalRouter == address(0)) {
                    RouterParameters memory routerParams = RouterParameters({
                        permit2: contracts.permit2,
                        weth9: contracts.weth9,
                        v2Factory: contracts.v2Factory,
                        v3Factory: contracts.v3Factory,
                        pairInitCodeHash: contracts.pairInitCodeHash,
                        poolInitCodeHash: contracts.poolInitCodeHash,
                        v4PoolManager: contracts.v4PoolManager,
                        v3NFTPositionManager: contracts.v3NFTPositionManager,
                        v4PositionManager: contracts.v4PositionManager
                    });
                    (address universalRouter,) = UniversalRouterUtils.getOrCreate2(routerParams);
                    contracts.universalRouter = universalRouter;
                }
            }
        }
    }

    function log(UniswapContracts memory contracts) internal pure {
        console2.log("=== ERC20 Utils ===");
        console2.log("permit2:", contracts.permit2);
        console2.log("weth9:", contracts.weth9);

        console2.log("=== Uniswap V2 Contracts ===");
        console2.log("v2Factory:", contracts.v2Factory);

        console2.log("=== Uniswap V3 Contracts ===");
        console2.log("v3Factory:", contracts.v3Factory);
        console2.log("v3Quoter:", contracts.v3Quoter);

        console2.log("=== Uniswap V4 Contracts ===");
        console2.log("v4PoolManager:", contracts.v4PoolManager);
        console2.log("v4PositionManager:", contracts.v4PositionManager);
        console2.log("v4StateView:", contracts.v4StateView);
        console2.log("v4Quoter:", contracts.v4Quoter);

        console2.log("=== Uniswap Universal Contracts ===");
        console2.log("metaQuoter:", contracts.metaQuoter);
        console2.log("universalRouter:", contracts.universalRouter);
    }
}
