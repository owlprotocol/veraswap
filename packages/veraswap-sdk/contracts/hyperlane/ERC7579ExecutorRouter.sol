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
    // Remote Router Owner stores an approved owner, allowed to execute on an account from a specific router on a remote domain
    struct RemoteRouterOwner {
        uint32 domain;
        address router;
        address owner;
        bool enabled;
    }

    // ============ Events ============
    /// @notice Emitted when an account is created
    /// @dev Useful to get lower-bound for additional event filtering
    event AccountCreated(address indexed account);

    /// @notice Emitted when an account owner is set
    /// @dev Useful to reconstruct current/historical set of owners for an account
    event AccountRemoteRouterOwnerSet(
        address indexed account,
        uint32 indexed domain,
        address router,
        address owner,
        bool enabled
    );

    /// @notice Emitted when a call is dispatched to a remote domain
    /// @dev Useful to watch pending/historical messages dispatched to an account
    event RemoteCallDispatched(
        uint32 indexed destination,
        address indexed router,
        address indexed account,
        ERC7579ExecutorMessage.ExecutionMode executionMode,
        bytes32 messageId
    );

    /// @notice Emitted when a call is processed on an account
    /// @dev Useful to watch pending/historical calls processed on an account
    // TODO: Future Mailbox version could pass the messageId in the handler for optimized indexing
    event RemoteCallProcessed(
        uint32 indexed origin,
        address indexed router,
        address indexed account,
        ERC7579ExecutorMessage.ExecutionMode executionMode
    );

    // ============ Errors ============
    error AccountDeploymentFailed(address account);
    error InvalidRemoteRouterOwner(address account, uint32 domain, address router, address owner);
    error InvalidExecutorMode();

    // ============ Public Storage ============
    OwnableSignatureExecutor immutable executor;
    IAccountFactory immutable factory;
    mapping(address account => mapping(uint32 domain => mapping(address router => mapping(address owner => bool))))
        public owners;

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
     * @param _owners remote router owners to set
     */
    function setAccountOwners(RemoteRouterOwner[] memory _owners) external {
        // Set Approved Remote Router Owners
        for (uint256 i = 0; i < _owners.length; i++) {
            owners[msg.sender][_owners[i].domain][_owners[i].router][_owners[i].owner] = _owners[i].enabled;
            emit AccountRemoteRouterOwnerSet(
                msg.sender,
                _owners[i].domain,
                _owners[i].router,
                _owners[i].owner,
                _owners[i].enabled
            );
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

        bytes32 messageId = _dispatch(
            destination,
            TypeCasts.addressToBytes32(router),
            msg.value,
            msgBody,
            hookMetadata,
            hook
        );
        emit RemoteCallDispatched(destination, router, account, executionMode, messageId);

        return messageId;
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
        address router = TypeCasts.bytes32ToAddress(sender);

        if (initData.length > 0) {
            // Check account exists and deploy if not
            if (account.code.length == 0) {
                // Deploy
                factory.createAccount(initData, initSalt);
                if (account.code.length == 0) {
                    revert AccountDeploymentFailed(account);
                }
                emit AccountCreated(account);
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
            // Check Router Owner
            if (!owners[account][origin][router][originSender]) {
                revert InvalidRemoteRouterOwner(account, origin, router, originSender);
            }

            if (executionMode == ERC7579ExecutorMessage.ExecutionMode.SINGLE) {
                executor.executeOnOwnedAccount{value: msg.value}(account, callData);
            } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.BATCH) {
                executor.executeBatchOnOwnedAccount{value: msg.value}(account, callData);
            } else {
                revert InvalidExecutorMode();
            }
        }

        emit RemoteCallProcessed(origin, router, account, executionMode);
    }
}
