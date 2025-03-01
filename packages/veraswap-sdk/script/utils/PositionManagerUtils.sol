// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IAllowanceTransfer} from "permit2/src/interfaces/IAllowanceTransfer.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IWETH9} from "@uniswap/v4-periphery/src/interfaces/external/IWETH9.sol";
import {IPositionDescriptor} from "@uniswap/v4-periphery/src/interfaces/IPositionDescriptor.sol";
import {PositionManager} from "@uniswap/v4-periphery/src/PositionManager.sol";
import {Create2Utils} from "./Create2Utils.sol";

library PositionManagerUtils {
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function getDeployBytecode(address poolManager) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                type(PositionManager).creationCode,
                poolManager,
                PERMIT2,
                uint256(300_000),
                address(0),
                address(0)
            );
    }

    function getOrCreate2(address poolManager) internal returns (address addr, bool exists) {
        (addr, exists) = Create2Utils.getAddressExists(getDeployBytecode(poolManager));
        if (!exists) {
            addr = address(
                new PositionManager{salt: Create2Utils.BYTES32_ZERO}(
                    IPoolManager(poolManager),
                    IAllowanceTransfer(PERMIT2),
                    uint256(300_000),
                    IPositionDescriptor(address(0)),
                    IWETH9(address(0))
                )
            );
        }
    }
}
