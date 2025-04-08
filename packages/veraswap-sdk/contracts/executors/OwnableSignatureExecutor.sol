// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {IERC7579Account} from "modulekit/accounts/common/interfaces/IERC7579Account.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";
import {ModeLib} from "modulekit/accounts/common/lib/ModeLib.sol";
import {SentinelListLib} from "sentinellist/SentinelList.sol";
import {NonceManager} from "@ERC4337/account-abstraction/contracts/core/NonceManager.sol";
import {OwnableExecutor} from "@rhinestone/core-modules/OwnableExecutor/OwnableExecutor.sol";
import {SignatureExecutionLib} from "./SignatureExecutionLib.sol";
import {SignatureExecutorEIP712} from "./SignatureExecutorEIP712.sol";

/**
 * @title OwnableSignatureExecutor
 * @dev Module that allows users to designate an owner that can execute transactions on their behalf using msg.sender or EIP191 signatures,
 * and pays for gas. Signature based transactions have their own internal shared nonce counter, validUntil and validAfter timestamps.
 * @author Leo Vigna
 */
contract OwnableSignatureExecutor is OwnableExecutor, SignatureExecutorEIP712, NonceManager {
    using SentinelListLib for SentinelListLib.SentinelList;
    using SignatureExecutionLib for SignatureExecutionLib.SignatureExecution;

    error InvalidNonce(uint256 nonce);
    error InvalidTimestamp(uint48 validUntil, uint48 validAfter);

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/
    /**
     * Executes a transaction on the owned account
     *
     * @param signatureExecution execution payload
     * @param signature EIP712 signature of the execution payload
     */
    function executeOnOwnedAccountWithSignature(
        SignatureExecutionLib.SignatureExecution calldata signatureExecution,
        bytes calldata signature
    ) external payable {
        _checkValidExecution(signatureExecution);

        bytes32 execHash = _hashTypedData(signatureExecution.hash());
        address owner = ECDSA.recoverCalldata(execHash, signature);

        // check if the signer is an owner
        if (!accountOwners[signatureExecution.account].contains(owner)) {
            revert UnauthorizedAccess();
        }

        // execute the transaction on the owned account
        IERC7579Account(signatureExecution.account).executeFromExecutor{value: signatureExecution.value}(
            ModeLib.encodeSimpleSingle(),
            signatureExecution.callData
        );
    }

    /**
     * Executes a batch of transactions on the owned account
     *
     * @param signatureExecution execution payload
     * @param signature EIP712 signature of the execution payload
     */
    function executeBatchOnOwnedAccountWithSignature(
        SignatureExecutionLib.SignatureExecution calldata signatureExecution,
        bytes calldata signature
    ) external payable {
        _checkValidExecution(signatureExecution);

        bytes32 execHash = _hashTypedData(signatureExecution.hash());
        address owner = ECDSA.recoverCalldata(execHash, signature);

        // check if the signer is an owner
        if (!accountOwners[signatureExecution.account].contains(owner)) {
            revert UnauthorizedAccess();
        }

        // execute the batch of transaction on the owned account
        IERC7579Account(signatureExecution.account).executeFromExecutor{value: msg.value}(
            ModeLib.encodeSimpleBatch(),
            signatureExecution.callData
        );
    }

    /**
     * @dev Check if execution timestamp is valid (validAfter, validUntil) and update nonce
     * @param signatureExecution execution payload
     */
    function _checkValidExecution(SignatureExecutionLib.SignatureExecution memory signatureExecution) internal {
        if (block.timestamp > signatureExecution.validUntil || block.timestamp < signatureExecution.validAfter) {
            revert InvalidTimestamp(signatureExecution.validUntil, signatureExecution.validAfter);
        }

        if (!_validateAndUpdateNonce(signatureExecution.account, signatureExecution.nonce)) {
            revert InvalidNonce(signatureExecution.nonce);
        }
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     METADATA
    //////////////////////////////////////////////////////////////////////////*/
    /**
     * Returns the name of the module
     *
     * @return name of the module
     */
    function name() external pure virtual override returns (string memory) {
        return "OwnableSignatureExecutor";
    }
}
