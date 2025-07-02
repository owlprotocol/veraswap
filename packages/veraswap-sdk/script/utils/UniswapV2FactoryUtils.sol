// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Create2Utils} from "./Create2Utils.sol";

library UniswapV2FactoryUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address feeToSetter) internal view returns (bytes memory) {
        return
            abi.encodePacked(
                vm.getCode("artifacts/UniswapV2Factory.sol/UniswapV2Factory.json"),
                abi.encode(feeToSetter)
            );
    }

    function getOrCreate2(address feeToSetter) internal returns (address addr, bool exists) {
        bytes memory deployBytecode = getDeployBytecode(feeToSetter);
        (addr, exists) = Create2Utils.getAddressExists(deployBytecode);

        if (!exists) {
            address deployed = Create2.deploy(0, bytes32(0), deployBytecode);
            vm.assertEq(deployed, addr);
        }
    }
}
