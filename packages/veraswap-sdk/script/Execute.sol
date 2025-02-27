// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// Dummy contract that will execute swap on behalf of user
contract Execute {
    function execute(address target, uint256 value, bytes calldata data) external {
        target.call{value: value}(data);
    }
}
