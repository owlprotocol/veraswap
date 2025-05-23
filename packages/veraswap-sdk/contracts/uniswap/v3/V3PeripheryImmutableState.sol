// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";

/// @title Immutable state
/// @notice Immutable state used by periphery contracts
abstract contract PeripheryImmutableState is IPeripheryImmutableState {
    /// @inheritdoc IPeripheryImmutableState
    address public immutable override factory;
    bytes32 public immutable poolInitCodeHash;
    /// @inheritdoc IPeripheryImmutableState
    address public immutable override WETH9;

    constructor(address _factory, bytes32 _poolInitCodeHash, address _WETH9) {
        factory = _factory;
        poolInitCodeHash = _poolInitCodeHash;
        WETH9 = _WETH9;
    }
}
