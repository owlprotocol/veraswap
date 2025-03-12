// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

import {Router} from "@hyperlane-xyz/core/client/Router.sol";

import {OwnableSignatureExecutor} from "@rhinestone/core-modules/OwnableSignatureExecutor/OwnableSignatureExecutor.sol";

contract ERC7579Router is Router {
    OwnableSignatureExecutor immutable executor;

    // ============ Constructor ============

    constructor(address _mailbox) Router(_mailbox) {}

    /**
     * @notice Handles dispatched messages by relaying calls to the interchain account
     * @param _origin The origin domain of the interchain account
     * @param _sender The sender of the interchain message
     * @param _message The InterchainAccountMessage containing the account
     * owner, ISM, and sequence of calls to be relayed
     * @dev Does not need to be onlyRemoteRouter, as this application is designed
     * to receive messages from untrusted remote contracts.
     */
    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external payable override onlyMailbox {
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
