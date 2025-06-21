// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";

// Contract Structs
import {CoreContracts, DeployParams} from "./Structs.sol";
import {ContractParams} from "./libraries/ContractParams.sol";
import {ContractsCoreLibrary} from "./libraries/ContractsCore.sol";

contract DeployCoreContracts is Script {
    function run() external virtual {
        vm.startBroadcast();
        deployCoreContracts();
        vm.stopBroadcast();
    }

    function deployCoreContracts() internal returns (CoreContracts memory contracts) {
        DeployParams memory params = ContractParams.getParams(block.chainid);

        contracts.uniswap = params.uniswap;
        contracts.hyperlane.mailbox = params.hyperlane.mailbox;

        ContractsCoreLibrary.getOrDeploy(contracts);
        ContractsCoreLibrary.log(contracts);
        return contracts;
    }
}
