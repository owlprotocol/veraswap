// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

//TODO: Use forge cheatcode to get the configured deterministic deployer
library Create2Utils {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    //Default salt deployer
    address constant DETERMINISTIC_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    /// @notice Get or deploy with Create2 using BYTES32_ZERO, DETERMINISTIC_DEPLOYER
    /// @dev Be careful whether broadcast has started because expected/deployed can sometimes not match
    /*
    function getOrDeploy(bytes memory bytecode) returns (address addr, bool exists) {
        (addr, exists) = getAddressExists(bytecode);

        if (!exists) {
            //TODO: This is incorrect, need call to DETERMINISTIC_DEPLOYER (unused for now)
            addr = Create2.deploy(0, BYTES32_ZERO, bytecode);
        }
        return (addr, exists);
    }
    */

    /// @notice Get Create2 address, exists with BYTES32_ZERO, DETERMINISTIC_DEPLOYER
    function getAddressExists(bytes memory bytecode) internal returns (address expected, bool contractExists) {
        expected = getAddress(bytecode);
        contractExists = expected.code.length > 0;
    }

    /// @notice Get Create2 address with BYTES32_ZERO, DETERMINISTIC_DEPLOYER
    function getAddress(bytes memory bytecode) internal pure returns (address expected) {
        expected = Create2.computeAddress(BYTES32_ZERO, keccak256(bytecode), DETERMINISTIC_DEPLOYER);
    }

    /// @notice Create2 address deployed with BYTES32_ZERO, DETERMINISTIC_DEPLOYER
    function exists(bytes memory bytecode) internal returns (bool contractExists) {
        (, contractExists) = getAddressExists(bytecode);
    }
}
