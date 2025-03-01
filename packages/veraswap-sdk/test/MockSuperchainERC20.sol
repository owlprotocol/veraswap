// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {SuperchainERC20} from "@interop-lib/SuperchainERC20.sol";

/// @notice Similar interface to MockERC20 for easy testing / demos
/// @dev This contract is meant for testing only as its mint function is public
contract MockSuperchainERC20 is SuperchainERC20 {
    string private _name;
    string private _symbol;
    uint8 private immutable _decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    function mint(address to, uint256 amount) external virtual {
        _mint(to, amount);
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
