// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {BasketFixedUnits} from "../../contracts/vaults/BasketFixedUnits.sol";
import {Create2Utils} from "./Create2Utils.sol";

library BasketFixedUnitsUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        string memory _name,
        string memory _symbol,
        address _owner,
        uint256 _mintFeeCentiBips,
        BasketFixedUnits.BasketToken[] memory _basket
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                type(BasketFixedUnits).creationCode,
                abi.encode(_name, _symbol, _owner, _mintFeeCentiBips, _basket)
            );
    }

    function getOrCreate2(
        string memory _name,
        string memory _symbol,
        address _owner,
        uint256 _mintFeeCentiBips,
        BasketFixedUnits.BasketToken[] memory _basket
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(
            getDeployBytecode(_name, _symbol, _owner, _mintFeeCentiBips, _basket)
        );
        if (!exists) {
            address deployed = address(
                new BasketFixedUnits{salt: Create2Utils.BYTES32_ZERO}(
                    _name,
                    _symbol,
                    _owner,
                    _mintFeeCentiBips,
                    _basket
                )
            );
            vm.assertEq(deployed, addr);
        }
    }
}
