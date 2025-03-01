// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MockSuperchainERC20} from "../../test/MockSuperchainERC20.sol";
import {Create2Utils} from "./Create2Utils.sol";

library MockSuperchainERC20Utils {
    function getDeployBytecode(string memory name, string memory symbol, uint8 decimals) returns (bytes memory) {
        return abi.encodePacked(type(MockSuperchainERC20).creationCode, abi.encode(name, symbol, decimals));
    }

    function getOrCreate2(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) returns (address expected, bool exists) {
        return Create2Utils.getOrCreate2(getDeployBytecode(name, symbol, decimals));
    }
}
