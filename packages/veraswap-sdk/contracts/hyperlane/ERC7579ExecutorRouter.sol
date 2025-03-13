// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {IPostDispatchHook} from "@hyperlane-xyz/core/interfaces/hooks/IPostDispatchHook.sol";
import {OwnableSignatureExecutor} from "@rhinestone/core-modules/OwnableSignatureExecutor/OwnableSignatureExecutor.sol";
import {MailboxClientStatic} from "./MailboxClientStatic.sol";
import {IAccountFactory} from "./IAccountFactory.sol";
import {ERC7579ExecutorMessage} from "./ERC7579ExecutorMessage.sol";

/// @title ERC7579ExecutorRouter
/// @notice A Hyperlane Router designed to work with ERC7579 wallets using an Executor module
contract ERC7579ExecutorRouter is MailboxClientStatic {
    // ============ Public Storage ============
    OwnableSignatureExecutor immutable executor;
    IAccountFactory immutable factory;
    mapping(address account => mapping(uint32 domain => bytes32 router)) public routers;

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
     * @notice Enroll remote router for account
     * @param domain remote domain to enroll
     * @param router remote router to enroll
     */
    function enrollRemoteRouter(uint32 domain, bytes32 router) external {
        routers[msg.sender][domain] = router;
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
        return _dispatch(destination, bytes32(uint256(uint160(router))), msg.value, msgBody, hookMetadata, hook);
    }

    // ============ Handle Incoming Messages ============
    /**
     * @notice Handles dispatched messages by relaying calls to the interchain account
     * @param _origin The origin domain of the interchain account
     * @param _sender The sender of the interchain message
     * @param _message The InterchainAccountMessage containing the account
     * owner, ISM, and sequence of calls to be relayed
     * @dev Does not need to be onlyRemoteRouter, as this application is designed
     * to receive messages from untrusted remote contracts.
     */
    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external payable onlyMailbox {
        /*
        (bytes32 _owner, bytes32 _ism, CallLib.Call[] memory _calls) = InterchainAccountMessage.decode(_message);

        OwnableMulticall _interchainAccount = getDeployedInterchainAccount(
            _origin,
            _owner,
            _sender,
            _ism.bytes32ToAddress()
        );
        _interchainAccount.multicall{value: msg.value}(_calls);
        */
    }
}
