// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {DeployParameters} from "../DeployParameters.s.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {DeployPermit2} from "../../test/utils/forks/DeployPermit2.sol";

contract DeployAnvil is DeployParameters, DeployPermit2 {
    function setUp() public override {
        address permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

        if (permit2.code.length == 0) {
            deployPermit2();
        }

        params = RouterParameters({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            //TODO: Add WETH9
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: UNSUPPORTED_PROTOCOL,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: 0x5FbDB2315678afecb367f032d93F642f64180aa3,
            v3NFTPositionManager: UNSUPPORTED_PROTOCOL,
            v4PositionManager: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
        });

        unsupported = address(1);
    }
}
