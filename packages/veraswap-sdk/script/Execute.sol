// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Dummy contract
contract Execute {
    function execute(address target, uint256 value, bytes calldata data) external {
        target.call{value: value}(data);
    }

    function executeBatch(address[] calldata target, uint256[] calldata value, bytes[] calldata data) external {
        for (uint256 i = 0; i < target.length; i++) {
            target[i].call{value: value[i]}(data[i]);
        }
    }
}
