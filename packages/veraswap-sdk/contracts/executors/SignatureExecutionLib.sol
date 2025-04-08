// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;
import {ECDSA} from "solady/utils/ECDSA.sol";

/// @title SignatureExecutionLib
/// @dev Library for the SignatureExecution struct and EIP712 hashing
library SignatureExecutionLib {
    struct SignatureExecution {
        address account; // account to execute the transaction on
        uint256 nonce; // 2D Nonce (similar to ERC4337) to enable transaction ordering
        uint48 validAfter; // signature valid after timestamp
        uint48 validUntil; // signature valid until timestamp
        uint256 value; // value to send with the transaction
        bytes callData; // encoded data containing the transaction to execute
    }

    bytes32 public constant _SIGNATURE_EXECUTION_TYPEHASH =
        keccak256(
            "SignatureExecution(address account,uint256 nonce,uint48 validAfter,uint48 validUntil,uint256 value,bytes callData)"
        );

    function hash(SignatureExecution memory signatureExecution) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    _SIGNATURE_EXECUTION_TYPEHASH,
                    signatureExecution.account,
                    signatureExecution.nonce,
                    signatureExecution.validAfter,
                    signatureExecution.validUntil,
                    signatureExecution.value,
                    keccak256(signatureExecution.callData)
                )
            );
    }
}
