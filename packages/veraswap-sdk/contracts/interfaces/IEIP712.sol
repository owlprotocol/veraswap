// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

interface IEIP712 {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}
