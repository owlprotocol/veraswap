// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

/// @notice A library to implement an approved reentrant in transient storage.
/// @dev The approved reentrant's address is stored to allow the contract to know if the caller is approved
/// TODO: This library can be deleted when we have the transient keyword support in solidity.
library ApprovedReentrant {
    // The slot holding the approved reentrant state, transiently. bytes32(uint256(keccak256("ApprovedReentrant")) - 1)
    bytes32 constant APPROVED_REENTRANT_SLOT = 0x954e40ac94e7c945c409f421f1846b7d735df1d1d7487ba181a55646c5c256fa;

    function set(address approvedReentrant) internal {
        assembly ("memory-safe") {
            tstore(APPROVED_REENTRANT_SLOT, approvedReentrant)
        }
    }

    function get() internal view returns (address approvedReentrant) {
        assembly ("memory-safe") {
            approvedReentrant := tload(APPROVED_REENTRANT_SLOT)
        }
    }
}
