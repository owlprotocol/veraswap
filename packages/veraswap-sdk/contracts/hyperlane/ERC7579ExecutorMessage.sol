// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

library ERC7579ExecutorMessage {
    enum ExecutionMode {
        SINGLE,
        BATCH,
        SINGLE_SIGNATURE,
        BATCH_SIGNATURE,
        NOOP
    }

    /**
     * @notice Returns formatted ERC7579 ExecutorMessage
     * @dev This function should only be used in memory message construction.
     * @param owner msg.sender on origin chain
     * @param account Target ERC7570 smart account
     * @param initData Smart account init data that either configures Router as Executor or sets another owner that can then be used to execute via signature (if account does not exist)
     * @param initSalt Smart account init salt (if account does not exist)
     * @param executionMode Smart account execution mode (single/batch, direct/signature)
     * @param callData Executor call data
     * @param nonce Signature nonce (for signature execution only)
     * @param validAfter Signature validAfter (for signature execution only)
     * @param validUntil Signature validUntil (for signature execution only)
     * @param signature Signature (for signature execution only)
     * @return message body encoded as bytes
     */
    function encode(
        address owner,
        address account,
        bytes memory initData,
        bytes32 initSalt,
        ExecutionMode executionMode,
        bytes memory callData,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes memory signature
    ) internal pure returns (bytes memory) {
        return
            abi.encode(
                owner,
                account,
                initData,
                initSalt,
                executionMode,
                callData,
                nonce,
                validAfter,
                validUntil,
                signature
            );
    }

    /**
     * @notice Parses and returns the calls from the provided message
     * @param message The ERC7579 Executor message
     */
    function decode(
        bytes calldata message
    )
        internal
        pure
        returns (
            address owner,
            address account,
            bytes memory initData,
            bytes32 initSalt,
            ExecutionMode executionMode,
            bytes memory callData,
            uint256 nonce,
            uint48 validAfter,
            uint48 validUntil,
            bytes memory signature
        )
    {
        return
            abi.decode(
                message,
                (address, address, bytes, bytes32, ExecutionMode, bytes, uint256, uint48, uint48, bytes)
            );
    }
}
