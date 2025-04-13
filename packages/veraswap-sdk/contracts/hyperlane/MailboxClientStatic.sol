// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.24;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IMailbox} from "@hyperlane-xyz/core/interfaces/IMailbox.sol";
import {IPostDispatchHook} from "@hyperlane-xyz/core/interfaces/hooks/IPostDispatchHook.sol";
import {IInterchainSecurityModule} from "@hyperlane-xyz/core/interfaces/IInterchainSecurityModule.sol";

/// @title MailboxClientStatic
/// @notice A mailbox client with a static ISM. Meant to be used in scenarios where users cannot trust owner with ISM management.
abstract contract MailboxClientStatic {
    IMailbox public immutable mailbox;
    uint32 public immutable localDomain;
    IInterchainSecurityModule public immutable interchainSecurityModule;

    /**
     * @notice Only accept messages from a Hyperlane Mailbox contract
     */
    modifier onlyMailbox() {
        require(msg.sender == address(mailbox), "MailboxClient: sender not mailbox");
        _;
    }

    /// @notice Initialize Mailbox Cient with static mailbox & ISM
    /// @param _mailbox Mailbox address
    /// @param _ism Interchain Security Module address, if address(0) ISM management is effectively the default ISM, trusting the Mailbox owner with ISM management
    constructor(address _mailbox, address _ism) {
        require(_mailbox.code.length > 0, "MailboxClient: invalid mailbox");
        require(_ism.code.length > 0 || _ism == address(0), "MailboxClient: invalid ism");

        mailbox = IMailbox(_mailbox);
        localDomain = mailbox.localDomain();
        interchainSecurityModule = IInterchainSecurityModule(_ism);
    }

    function _isLatestDispatched(bytes32 id) internal view returns (bool) {
        return mailbox.latestDispatchedId() == id;
    }

    function _isDelivered(bytes32 id) internal view returns (bool) {
        return mailbox.delivered(id);
    }

    /// @notice Dispatch message to Maibolx
    /// @param domain Target domain
    /// @param recipient Target recipient
    /// @param value Relay payment value
    /// @param messageBody Message body
    /// @param hookMetadata Hook metadata, useful for gas overrides and post-dispatch logic (default zero bytes)
    /// @param hook Hook (address(0) default hook)
    function _dispatch(
        uint32 domain,
        bytes32 recipient,
        uint256 value,
        bytes memory messageBody,
        bytes memory hookMetadata,
        address hook
    ) internal returns (bytes32) {
        return mailbox.dispatch{value: value}(domain, recipient, messageBody, hookMetadata, IPostDispatchHook(hook));
    }
}
