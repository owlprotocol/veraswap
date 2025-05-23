// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {V3Quoter} from "../../contracts/uniswap/v3/V3Quoter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library V3QuoterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(
        address factory,
        bytes32 poolInitCodeHash,
        address weth9
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(type(V3Quoter).creationCode, abi.encode(factory, poolInitCodeHash, weth9));
    }

    function getOrCreate2(
        address factory,
        bytes32 poolInitCodeHash,
        address weth9
    ) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(factory, poolInitCodeHash, weth9));
        if (!exists) {
            address deployed = address(new V3Quoter{salt: Create2Utils.BYTES32_ZERO}(factory, poolInitCodeHash, weth9));
            vm.assertEq(deployed, addr);
        }
    }
}
