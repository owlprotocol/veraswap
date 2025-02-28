// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {DeployPermit2} from "../test/utils/forks/DeployPermit2.sol";

contract DeployPermit2Anvil is DeployPermit2 {
    function run() external {
        anvilPermit2();
    }
}
