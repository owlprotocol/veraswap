// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {UniswapV3Factory} from "@uniswap/v3-core/contracts/UniswapV3Factory.sol";
import {Create2Utils} from "./Create2Utils.sol";

library UniswapV3FactoryUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode() internal pure returns (bytes memory) {
        return abi.encodePacked(type(UniswapV3Factory).creationCode);
    }

    function getOrCreate2() internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode());
        if (!exists) {
            address deployed = address(new UniswapV3Factory{salt: Create2Utils.BYTES32_ZERO}());
            vm.assertEq(deployed, addr);
        }
    }
}
