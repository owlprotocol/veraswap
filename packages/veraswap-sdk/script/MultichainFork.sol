// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.24;

import {Vm} from "forge-std/Vm.sol";

library MultichainFork {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function getForks(string[] memory rpcs) internal returns (uint256[] memory chainIds, uint256[] memory forks) {
        forks = new uint256[](rpcs.length);
        chainIds = new uint256[](rpcs.length);
        for (uint256 i = 0; i < rpcs.length; i++) {
            forks[i] = vm.createSelectFork(rpcs[i]);
            chainIds[i] = block.chainid;
        }
    }
}
