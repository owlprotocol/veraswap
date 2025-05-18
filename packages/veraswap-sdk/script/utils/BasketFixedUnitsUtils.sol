// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {BasketFixedUnits} from "../../contracts/vaults/BasketFixedUnits.sol";
import {Create2Utils} from "./Create2Utils.sol";

library BasketFixedUnitsUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        BasketFixedUnits.BasketToken[] memory basket,
        string memory name,
        string memory symbol
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(type(BasketFixedUnits).creationCode, abi.encode(basket, name, symbol));
    }

    function getOrCreate2(
        BasketFixedUnits.BasketToken[] memory basket,
        string memory name,
        string memory symbol
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(basket, name, symbol));
        if (!exists) {
            address deployed = address(new BasketFixedUnits{salt: Create2Utils.BYTES32_ZERO}(basket, name, symbol));
            vm.assertEq(deployed, addr);
        }
    }
}
