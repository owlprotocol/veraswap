// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IPostDispatchHook} from "@hyperlane-xyz/core/interfaces/hooks/IPostDispatchHook.sol";
import {TypeCasts} from "@hyperlane-xyz/core/libs/TypeCasts.sol";
import {OwnableSignatureExecutor} from "@rhinestone/core-modules/OwnableSignatureExecutor/OwnableSignatureExecutor.sol";
import {MailboxClientStatic} from "./MailboxClientStatic.sol";
import {IAccountFactory} from "./IAccountFactory.sol";
import {ERC7579ExecutorMessage} from "./ERC7579ExecutorMessage.sol";

/// @title ERC7579ExecutorRouter
/// @notice A Hyperlane Router designed to work with ERC7579 wallets using an Executor module
contract ERC7579ExecutorRouter is MailboxClientStatic {
    // ============ Structs ============
    struct RouterInfo {
        uint32 domain;
        address addr;
    }

    struct OwnerInfo {
        uint32 domain;
        address addr;
        bool enabled;
    }

    // ============ Errors ============
    error AccountDeploymentFailed(address account);
    error InvalidRemoteRouter(address account, uint32 domain, address router);
    error InvalidOriginSender(address account, address originSender);
    error InvalidExecutorMode();

    // ============ Public Storage ============
    OwnableSignatureExecutor immutable executor;
    IAccountFactory immutable factory;
    mapping(address account => mapping(uint32 domain => address router)) public routers;
    mapping(address account => mapping(uint32 domain => mapping(address owner => bool))) public owners;

    // ============ Constructor ============
    constructor(
        address _mailbox,
        address _ism,
        address _executor,
        address _factory
    ) MailboxClientStatic(_mailbox, _ism) {
        executor = OwnableSignatureExecutor(_executor);
        factory = IAccountFactory(_factory);
    }
    // =========== Remote Router Management =======
    /**
     * @notice Set remote routers and owners for account
     * @param _routers remote routers to set
     * @param _owners remote owners to set
     */
    function setAccountInfo(RouterInfo[] memory _routers, OwnerInfo[] memory _owners) external {
        // Set Approved Remote Routers
        for (uint256 i = 0; i < _routers.length; i++) {
            routers[msg.sender][_routers[i].domain] = _routers[i].addr;
        }
        // Set Approved Remote Owners
        for (uint256 i = 0; i < _owners.length; i++) {
            owners[msg.sender][_owners[i].domain][_owners[i].addr] = _owners[i].enabled;
        }
    }

    // ============ Dispatch Outgoing Messages ============
    // ============ External Functions ============
    /**
     * @notice Dispatches a single remote call to be made by an owner's
     * interchain account on the destination domain
     * @dev Uses the default router and ISM addresses for the destination
     * domain, reverting if none have been configured
     * @param destination Remote domain of the ERC7579 Account
     * @param account Target ERC7570 smart account
     * @param initData Smart account init data that either configures Router as Executor or sets another owner that can then be used to execute via signature (if account does not exist)
     * @param initSalt Smart account init salt (if account does not exist)
     * @param executionMode Smart account execution mode (single/batch, direct/signature)
     * @param callData Executor call data
     * @param nonce Signature nonce (for signature execution only)
     * @param validAfter Signature validAfter (for signature execution only)
     * @param validUntil Signature validUntil (for signature execution only)
     * @param signature Signature (for signature execution only)
     * @param hookMetadata Hook metadata
     * @param hook Hook address
     * @return The Hyperlane message ID
     */
    function callRemote(
        uint32 destination,
        address router,
        address account,
        bytes memory initData,
        bytes32 initSalt,
        ERC7579ExecutorMessage.ExecutionMode executionMode,
        bytes memory callData,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes memory signature,
        bytes memory hookMetadata,
        address hook
    ) external payable returns (bytes32) {
        bytes memory msgBody = ERC7579ExecutorMessage.encode(
            msg.sender,
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
        return _dispatch(destination, TypeCasts.addressToBytes32(router), msg.value, msgBody, hookMetadata, hook);
    }

    // ============ Handle Incoming Messages ============
    /**
     * @notice Handles dispatched messages by relaying calls to the interchain account
     * @param origin The origin domain of the interchain account
     * @param sender The sender of the interchain message
     * @param message The InterchainAccountMessage containing the account
     * owner, ISM, and sequence of calls to be relayed
     * @dev Does not need to be onlyRemoteRouter, as this application is designed
     * to receive messages from untrusted remote contracts.
     */
    function handle(uint32 origin, bytes32 sender, bytes calldata message) external payable onlyMailbox {
        (
            address originSender,
            address account,
            bytes memory initData,
            bytes32 initSalt,
            ERC7579ExecutorMessage.ExecutionMode executionMode,
            bytes memory callData,
            uint256 nonce,
            uint48 validAfter,
            uint48 validUntil,
            bytes memory signature
        ) = ERC7579ExecutorMessage.decode(message);

        if (initData.length > 0) {
            // Check account exists and deploy if not
            if (account.code.length == 0) {
                // Deploy
                factory.createAccount(initData, initSalt);
                if (account.code.length == 0) {
                    revert AccountDeploymentFailed(account);
                }
            }
        }

        // Assume account exists beyond this point
        if (executionMode == ERC7579ExecutorMessage.ExecutionMode.SINGLE_SIGNATURE) {
            // Execute with signature, no checks on origin/router/originSender
            executor.executeOnOwnedAccount{value: msg.value}(
                account,
                nonce,
                validAfter,
                validUntil,
                callData,
                signature
            );
        } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.BATCH_SIGNATURE) {
            // Execute with signature, no checks on origin/router/originSender
            executor.executeBatchOnOwnedAccount{value: msg.value}(
                account,
                nonce,
                validAfter,
                validUntil,
                callData,
                signature
            );
        } else {
            // Assumes Router has been set as owner on Executor
            // Check Router
            address router = TypeCasts.bytes32ToAddress(sender);
            if (routers[account][origin] != router) {
                revert InvalidRemoteRouter(account, origin, router);
            }
            // Check Origin Sender (on Executor)
            if (!owners[account][origin][originSender]) {
                revert InvalidOriginSender(account, originSender);
            }

            if (executionMode == ERC7579ExecutorMessage.ExecutionMode.SINGLE) {
                executor.executeOnOwnedAccount{value: msg.value}(account, callData);
            } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.BATCH) {
                executor.executeBatchOnOwnedAccount{value: msg.value}(account, callData);
            } else {
                revert InvalidExecutorMode();
            }
        }
    }
}
