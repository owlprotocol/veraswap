// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@ERC4337/account-abstraction/contracts/core/BasePaymaster.sol";
import "@ERC4337/account-abstraction/contracts/interfaces/IEntryPoint.sol";

/// @title OpenPaymaster
/// @notice A paymaster that accepts all UserOps without any validation. Useful for testing.
contract OpenPaymaster is BasePaymaster {
    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    /// @notice Open paymaster — accepts all UserOps
    function _validatePaymasterUserOp(
        PackedUserOperation calldata /*userOp*/,
        bytes32 /*userOpHash*/,
        uint256 /*requiredPreFund*/
    ) internal pure override returns (bytes memory context, uint256 validationData) {
        return ("", 0);
    }

    /// @notice No-op postOp
    function _postOp(
        PostOpMode /*mode*/,
        bytes calldata /*context*/,
        uint256 /*actualGasCost*/,
        uint256 /*actualUserOpFeePerGas*/
    ) internal pure override {
        return;
    }
}
