// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

library Create2Utils {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    address DETERMINISTIC_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function getOrCreate2(bytes memory bytecode) returns (address expected, bool exists) {
        expected = Create2.computeAddress(BYTES32_ZERO, keccak256(bytecode), DETERMINISTIC_DEPLOYER);
        exists = address(expected).code.length > 0;
        if (!exists) {
            Create2.deploy(0, BYTES32_ZERO, bytecode);
        }
        return (expected, exists);
    }
}
