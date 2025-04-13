// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {MockSuperchainERC20} from "../../test/MockSuperchainERC20.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MockSuperchainERC20Utils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(type(MockSuperchainERC20).creationCode, abi.encode(name, symbol, decimals));
    }

    function getOrCreate2(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(name, symbol, decimals));
        if (!exists) {
            address deployed = address(
                new MockSuperchainERC20{salt: Create2Utils.BYTES32_ZERO}(name, symbol, decimals)
            );
            vm.assertEq(deployed, addr);
        }
    }
}
