// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Permit2CreationCode} from "./Permit2CreationCode.sol";

library Permit2Utils {
    //Default deployer
    address internal constant DETERMINISTIC_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
    //Permit2 salt
    bytes32 internal constant SALT =
        bytes32(uint256(0x0000000000000000000000000000000000000000d3af2663da51c10215000000));

    address internal constant permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function getOrCreate2() internal returns (address addr, bool exists) {
        addr = Create2.computeAddress(
            SALT,
            keccak256(Permit2CreationCode.PERMIT2_CREATION_CODE),
            DETERMINISTIC_DEPLOYER
        );
        exists = addr.code.length > 0;
        if (!exists) {
            Create2.deploy(0, SALT, Permit2CreationCode.PERMIT2_CREATION_CODE);
        }
    }
}
