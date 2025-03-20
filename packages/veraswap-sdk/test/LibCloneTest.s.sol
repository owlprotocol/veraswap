// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {Script} from "forge-std/Script.sol";
import "forge-std/console2.sol";

import {LibClone} from "solady/utils/LibClone.sol";

contract LibCloneTest is Test, Script {
    function run() public pure {
        testInitCodeERC1967();
        // testInitCodeHashERC1967();
    }

    function testInitCodeERC1967() public pure {
        address implementation = 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF;
        bytes memory initCode = LibClone.initCodeERC1967(implementation);
        console2.logBytes(initCode);
    }

    function testInitCodeHashERC1967() public pure {
        address implementation = 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF;
        bytes32 initCodeHash = LibClone.initCodeHashERC1967(implementation);

        bytes32 expected = 0xb8540626bcbf5673a2648e866ce4cc5b88389fb5cc70e9eafb1bbd2dbee1f58e;
        assertEq(initCodeHash, expected);
    }
}
