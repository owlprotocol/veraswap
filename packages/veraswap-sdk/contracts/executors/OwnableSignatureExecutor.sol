// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.25;

import {IERC7579Account} from "modulekit/accounts/common/interfaces/IERC7579Account.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";
import {ModeLib} from "modulekit/accounts/common/lib/ModeLib.sol";
import {SentinelListLib} from "sentinellist/SentinelList.sol";
import {NonceManager} from "@ERC4337/account-abstraction/contracts/core/NonceManager.sol";
import {OwnableExecutor} from "@rhinestone/core-modules/OwnableExecutor/OwnableExecutor.sol";

/**
 * @title OwnableSignatureExecutor
 * @dev Module that allows users to designate an owner that can execute transactions on their behalf using msg.sender or EIP191 signatures,
 * and pays for gas. Signature based transactions have their own internal shared nonce counter, validUntil and validAfter timestamps.
 * @author Leo Vigna
 */
contract OwnableSignatureExecutor is OwnableExecutor, NonceManager {
    using SentinelListLib for SentinelListLib.SentinelList;

    error InvalidNonce(uint256 nonce);
    error InvalidTimestamp(uint48 validUntil, uint48 validAfter);

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/
    /**
     * Executes a transaction on the owned account
     *
     * @param ownedAccount address of the account to execute the transaction on
     * @param nonce 2D Nonce (similar to ERC4337) to enable transaction ordering
     * @param validAfter signature valid after timestamp
     * @param validUntil signature valid until timestamp
     * @param callData encoded data containing the transaction to execute
     * @param signature encoded signature of chainId, ownedAccount, nonce, validAfter, validUntil msg.value, callData
     */
    function executeOnOwnedAccountWithSignature(
        address ownedAccount,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes calldata callData,
        bytes calldata signature
    ) external payable {
        if (block.timestamp > validUntil || block.timestamp < validAfter) {
            revert InvalidTimestamp(validUntil, validAfter);
        }

        if (!_validateAndUpdateNonce(ownedAccount, nonce)) {
            revert InvalidNonce(nonce);
        }

        bytes32 execHash = ECDSA.toEthSignedMessageHash(
            abi.encode(block.chainid, ownedAccount, nonce, validAfter, validUntil, msg.value, callData)
        );
        address owner = ECDSA.recoverCalldata(execHash, signature);

        // check if the signer is an owner
        if (!accountOwners[ownedAccount].contains(owner)) {
            revert UnauthorizedAccess();
        }

        // execute the transaction on the owned account
        IERC7579Account(ownedAccount).executeFromExecutor{value: msg.value}(ModeLib.encodeSimpleSingle(), callData);
    }

    /**
     * Executes a batch of transactions on the owned account
     *
     * @param ownedAccount address of the account to execute the transaction on
     * @param nonce 2D Nonce (similar to ERC4337) to enable transaction ordering
     * @param validAfter signature valid after timestamp
     * @param validUntil signature valid until timestamp
     * @param callData encoded data containing the transactions to execute
     * @param signature encoded signature of ownedAccount, msg.value, callData
     */
    function executeBatchOnOwnedAccountWithSignature(
        address ownedAccount,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes calldata callData,
        bytes calldata signature
    ) external payable {
        if (block.timestamp > validUntil || block.timestamp < validAfter) {
            revert InvalidTimestamp(validUntil, validAfter);
        }

        if (!_validateAndUpdateNonce(ownedAccount, nonce)) {
            revert InvalidNonce(nonce);
        }

        bytes32 execHash = ECDSA.toEthSignedMessageHash(
            abi.encode(block.chainid, ownedAccount, nonce, validAfter, validUntil, msg.value, callData)
        );
        address owner = ECDSA.recoverCalldata(execHash, signature);

        // check if the signer is an owner
        if (!accountOwners[ownedAccount].contains(owner)) {
            revert UnauthorizedAccess();
        }

        // execute the batch of transaction on the owned account
        IERC7579Account(ownedAccount).executeFromExecutor{value: msg.value}(ModeLib.encodeSimpleBatch(), callData);
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
