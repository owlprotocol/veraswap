// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {CommonBase} from "forge-std/Base.sol";
import {VmSafe} from "forge-std/Vm.sol";

/// FOR INFORMATIONAL Purposes ONLY anvil already has this deployed
/// @notice helper to deploy DeterministicDeployer from precompiled bytecode.
contract DeployCreate2Deployer is CommonBase {
    address create2Deployer = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
    bytes constant CREATE2_DEPLOYER_BYTECODE =
        "0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3";

    /// @notice Deploys Create2Deployer with vm.etch, to be used in foundry tests
    function etchCreate2Deployer() public returns (address) {
        vm.etch(address(create2Deployer), CREATE2_DEPLOYER_BYTECODE);
        return create2Deployer;
    }

    /// @notice Deploys Create2Deployer with anvil_setCode, to be used in foundry scripts against anvil
    function anvilCreate2Deployer() public returns (address) {
        vm.rpc(
            "anvil_setCode",
            string.concat(
                '["', vm.toString(address(create2Deployer)), '","', vm.toString(CREATE2_DEPLOYER_BYTECODE), '"]'
            )
        );
        return create2Deployer;
    }

    /// @notice Deploys Create2Deployer depending on environment
    function deployCreate2Deployer() public returns (address) {
        if (vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            return anvilCreate2Deployer();
        } else {
            return etchCreate2Deployer();
        }
    }
}
