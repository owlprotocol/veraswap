// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {OwnableSignatureExecutor} from "../executors/OwnableSignatureExecutor.sol";
import {IAccountFactory} from "../interfaces/IAccountFactory.sol";
import {SignatureExecutionLib} from "../executors/SignatureExecutionLib.sol";
import {PredeployAddresses} from "@interop-lib/libraries/PredeployAddresses.sol";
import {IL2ToL2CrossDomainMessenger} from "@interop-lib/interfaces/IL2ToL2CrossDomainMessenger.sol";
import {ERC7579ExecutorMessage} from "../libraries/ERC7579ExecutorMessage.sol";

/// @title ERC7579ExecutorRouter
/// @notice A Superchain interop router designed to work with ERC7579 wallets using an Executor module
contract SuperchainERC7579ExecutorRouter {
    // ============ Structs ============
    // Remote Router Owner stores an approved owner, allowed to execute on an account from a specific router on a remote domain
    struct RemoteRouterOwner {
        uint256 domain;
        address owner;
        bool enabled;
    }

    struct MessageBody {
        address owner;
        address account;
        bytes initData;
        bytes32 initSalt;
        ERC7579ExecutorMessage.ExecutionMode executionMode;
        bytes callData;
        uint256 nonce;
        uint48 validAfter;
        uint48 validUntil;
        bytes signature;
    }

    // ============ Events ============
    /// @notice Emitted when an account is created
    /// @dev Useful to get lower-bound for additional event filtering
    event AccountCreated(address indexed account);

    /// @notice Emitted when an account owner is set
    /// @dev Useful to reconstruct current/historical set of owners for an account
    event AccountRemoteRouterOwnerSet(address indexed account, uint256 indexed domain, address owner, bool enabled);

    /// @notice Emitted when a call is dispatched to a remote domain
    /// @dev Useful to watch pending/historical messages dispatched to an account
    event RemoteCallDispatched(
        uint256 indexed destination,
        address indexed account,
        ERC7579ExecutorMessage.ExecutionMode executionMode,
        bytes32 messageId
    );

    /// @notice Emitted when a call is processed on an account
    /// @dev Useful to watch pending/historical calls processed on an account
    event RemoteCallProcessed(
        uint256 indexed origin, address indexed account, ERC7579ExecutorMessage.ExecutionMode executionMode
    );

    // ============ Errors ============
    error AccountDeploymentFailed(address account);
    error InvalidRemoteRouterOwner(address account, uint256 domain, address owner);
    error InvalidExecutorMode();
    error InvalidTimestamp(uint48 validUntil, uint48 validAfter);
    /// @notice Thrown when attempting to relay a message and the cross domain message sender is not the
    /// SuperchainTokenBridge.
    error InvalidCrossDomainSender();

    // ============ Constants ============
    /// @notice Address of the L2ToL2CrossDomainMessenger Predeploy.
    address internal constant MESSENGER = PredeployAddresses.L2_TO_L2_CROSS_DOMAIN_MESSENGER;

    // ============ Public Storage ============
    OwnableSignatureExecutor immutable executor;
    IAccountFactory immutable factory;
    mapping(address account => mapping(uint256 origin => mapping(address owner => bool))) public owners;

    // ============ Modifiers ============
    /**
     * @notice Only accept messages from the Superchain Cross Domain Messenger
     */
    modifier onlyCrossDomainMessenger() {
        require(msg.sender == MESSENGER, "Sender not MESSENGER");
        _;
    }

    // ============ Constructor ============
    constructor(address _executor, address _factory) {
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
            // Domain is implicitly converted to uint256 for mapping
            owners[msg.sender][_owners[i].domain][_owners[i].owner] = _owners[i].enabled;
            emit AccountRemoteRouterOwnerSet(msg.sender, _owners[i].domain, _owners[i].owner, _owners[i].enabled);
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
     * @return The Superchain interop message ID
     */
    function callRemote(
        uint256 destination,
        address account,
        bytes memory initData,
        bytes32 initSalt,
        ERC7579ExecutorMessage.ExecutionMode executionMode,
        bytes memory callData,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes memory signature
    ) external payable returns (bytes32) {
        bytes memory message = abi.encodeCall(
            this.handle,
            (msg.sender, account, initData, initSalt, executionMode, callData, nonce, validAfter, validUntil, signature)
        );

        bytes32 messageId = IL2ToL2CrossDomainMessenger(MESSENGER).sendMessage(destination, account, message);
        emit RemoteCallDispatched(destination, account, executionMode, messageId);

        return messageId;
    }

    // ============ Handle Incoming Messages ============
    /**
     * @notice Handles dispatched messages by relaying calls to the interchain account
     * @param account Target ERC7570 smart account
     * @param initData Smart account init data that either configures Router as Executor or sets another owner that can then be used to execute via signature (if account does not exist)
     * @param initSalt Smart account init salt (if account does not exist)
     * @param executionMode Smart account execution mode (single/batch, direct/signature)
     * @param callData Executor call data
     * @param nonce Signature nonce (for signature execution only)
     * @param validAfter Signature validAfter (for signature execution only)
     * @param validUntil Signature validUntil (for signature execution only)
     * @param signature Signature (for signature execution only)
     * @dev Does not need to be onlyRemoteRouter, as this application is designed
     * to receive messages from untrusted remote contracts.
     */
    function handle(
        address owner,
        address account,
        bytes memory initData,
        bytes32 initSalt,
        ERC7579ExecutorMessage.ExecutionMode executionMode,
        bytes memory callData,
        uint256 nonce,
        uint48 validAfter,
        uint48 validUntil,
        bytes memory signature
    ) external payable onlyCrossDomainMessenger {
        (address crossDomainMessageSender, uint256 origin) =
            IL2ToL2CrossDomainMessenger(MESSENGER).crossDomainMessageContext();

        if (crossDomainMessageSender != address(this)) revert InvalidCrossDomainSender();

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
        if (executionMode == ERC7579ExecutorMessage.ExecutionMode.NOOP) {
            // No execution, useful for simple deployment
        } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.SINGLE_SIGNATURE) {
            // Execute with signature, no checks on origin/owner
            SignatureExecutionLib.SignatureExecution memory signatureExecution =
                SignatureExecutionLib.SignatureExecution(account, nonce, validAfter, validUntil, msg.value, callData);

            executor.executeOnOwnedAccountWithSignature{value: msg.value}(signatureExecution, signature);
        } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.BATCH_SIGNATURE) {
            // Execute with signature, no checks on origin/owner
            SignatureExecutionLib.SignatureExecution memory signatureExecution =
                SignatureExecutionLib.SignatureExecution(account, nonce, validAfter, validUntil, msg.value, callData);
            executor.executeBatchOnOwnedAccountWithSignature{value: msg.value}(signatureExecution, signature);
        } else {
            if (block.timestamp > validUntil || block.timestamp < validAfter) {
                revert InvalidTimestamp(validUntil, validAfter);
            }

            // Assumes Router has been set as owner on Executor
            // Check Router Owner
            if (!owners[account][origin][owner]) {
                revert InvalidRemoteRouterOwner(account, origin, owner);
            }

            if (executionMode == ERC7579ExecutorMessage.ExecutionMode.SINGLE) {
                executor.executeOnOwnedAccount{value: msg.value}(account, callData);
            } else if (executionMode == ERC7579ExecutorMessage.ExecutionMode.BATCH) {
                executor.executeBatchOnOwnedAccount{value: msg.value}(account, callData);
            } else {
                revert InvalidExecutorMode();
            }
        }

        emit RemoteCallProcessed(origin, account, executionMode);
    }
}
