// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import "forge-std/console2.sol";
import {Script} from "forge-std/Script.sol";

import {WETHUtils} from "./utils/WETHUtils.sol";

import {DeployParams, UniswapContracts} from "./Structs.sol";
import {ContractParams} from "./libraries/ContractParams.sol";
import {ContractsUniswapLibrary} from "./libraries/ContractsUniswap.sol";
import {PoolManagerUtils} from "./utils/PoolManagerUtils.sol";
import {PositionManagerUtils} from "./utils/PositionManagerUtils.sol";
import {Permit2Utils} from "./utils/Permit2Utils.sol";

/**
 * Deploys a full Uniswap suite. Use only on testnets where Uniswap is not yet deployed and you need it.
 */
contract DeployTestUniswap is Script {
    function run() external virtual {
        vm.startBroadcast();

        deployTestUniswap();

        vm.stopBroadcast();
    }

    function deployTestUniswap() internal returns (UniswapContracts memory contracts) {
        DeployParams memory params = ContractParams.getParams(block.chainid);
        contracts = params.uniswap;

        if (contracts.weth9 == address(0)) {
            (address weth,) = WETHUtils.getOrCreate2();
            console2.log("WETH Deployed:", weth);
            contracts.weth9 = weth;
        }

        if (contracts.permit2 == address(0)) {
            (address permit2,) = Permit2Utils.getOrCreate2();
            console2.log("Permit2 Deployed:", permit2);
            contracts.permit2 = permit2;
        }

        if (contracts.v4PoolManager == address(0)) {
            (address v4PoolManager,) = PoolManagerUtils.getOrCreate2(address(0));
            console2.log("V4 Pool Manager Deployed:", v4PoolManager);
            contracts.v4PoolManager = v4PoolManager;
        }

        if (contracts.v4PositionManager == address(0)) {
            (address v4PositionManager,) = PositionManagerUtils.getOrCreate2(contracts.v4PoolManager, contracts.weth9);
            console2.log("V4 Position Manager Deployed:", v4PositionManager);
            contracts.v4PositionManager = v4PositionManager;
        }

        ContractsUniswapLibrary.getOrDeploy(contracts);
    }
}
