// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";

import {SuperchainERC7579ExecutorRouter} from "contracts/superchain/SuperchainERC7579ExecutorRouter.sol";
import {Create2Utils} from "./Create2Utils.sol";

library SuperchainERC7579ExecutorRouterUtils {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getDeployBytecode(address _executor, address _factory) internal pure returns (bytes memory) {
        return abi.encodePacked(type(SuperchainERC7579ExecutorRouter).creationCode, abi.encode(_executor, _factory));
    }

    function getOrCreate2(address _executor, address _factory) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(_executor, _factory));
        if (!exists) {
            address deployed =
                address(new SuperchainERC7579ExecutorRouter{salt: Create2Utils.BYTES32_ZERO}(_executor, _factory));
            vm.assertEq(deployed, addr);
        }
    }
}
