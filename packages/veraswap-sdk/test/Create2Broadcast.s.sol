// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/console2.sol";
import "forge-std/Test.sol";

import {VmSafe} from "forge-std/Vm.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Execute} from "./Execute.sol";

contract Create2Broadcast is Test {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    bytes32 constant BYTES32_ONE = bytes32(0);

    function run() external {
        // CREATE2 call is address(this)
        assertFalse(isBroadcasting());
        address noBroadcastExpectedAddress = address(new Execute{salt: BYTES32_ZERO}());
        address noBroadcastAddress = Create2.computeAddress(
            BYTES32_ZERO,
            keccak256(type(Execute).creationCode),
            address(this)
        );
        console2.log("address(this)", address(this));
        assertEq(noBroadcastAddress, noBroadcastExpectedAddress);

        // CREATE2 call is DeterministicDeployer
        vm.startBroadcast();
        assertTrue(isBroadcasting());
        address broadcastExpectedAddress = address(new Execute{salt: BYTES32_ONE}());
        address broadcastAddress = Create2.computeAddress(
            BYTES32_ONE,
            keccak256(type(Execute).creationCode),
            0x4e59b44847b379578588920cA78FbF26c0B4956C
        );
        console2.log("DeterministicDeployer", 0x4e59b44847b379578588920cA78FbF26c0B4956C);
        assertEq(broadcastAddress, broadcastExpectedAddress);
        vm.stopBroadcast();
    }

    function isBroadcasting() internal view returns (bool) {
        return msg.sender != tx.origin; // Likely means it's a script running
    }
}
