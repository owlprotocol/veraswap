// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {ISuperchainTokenBridge} from "@interop-lib/interfaces/ISuperchainTokenBridge.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

/// @notice Middleware contract designed to call `sendERC20` on ISuperchainTokenBridge with full balance
/// This contract is useful for EOA batching of swap + bridge by setting the receiver as this contract and
/// then sending the full token balance to the user on the destination chain
/// This contract is more generally useful if the bridge amount is dynamic and we just wish to send all tokens
contract SuperchainTokenBridgeSweep {
    ISuperchainTokenBridge constant bridge = ISuperchainTokenBridge(0x4200000000000000000000000000000000000028);

    error BalanceZero();

    /// @notice Call ISuperchainTokenBridge with `sendERC20` using this contract's full balance.
    /// @dev Contract balance MUST be > 0 to work. Do NOT keep balance on this contract between transactions as they can be taken by anyone
    function sendAllERC20(address _token, address _to, uint256 _chainId) external returns (bytes32 msgHash_) {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        if (balance == 0) revert BalanceZero();

        return bridge.sendERC20(_token, _to, balance, _chainId);
    }
}
