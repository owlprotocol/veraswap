// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {ExecLib, ExecMode} from "@zerodev/kernel/utils/ExecLib.sol";

/// @title Execute
/// @notice An open contract usable by anyone to batch calls using ExecLib
contract Execute {
    function execute(
        ExecMode execMode,
        bytes calldata executionCalldata
    ) external payable returns (bytes[] memory returnData) {
        returnData = ExecLib.execute(execMode, executionCalldata);
    }
}
