// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MockERC20Utils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(type(MockERC20).creationCode, abi.encode(name, symbol, decimals));
    }

    function getOrCreate2(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(name, symbol, decimals));
        if (!exists) {
            address deployed = address(new MockERC20{salt: Create2Utils.BYTES32_ZERO}(name, symbol, decimals));
            vm.assertEq(deployed, addr);
        }
    }
}
