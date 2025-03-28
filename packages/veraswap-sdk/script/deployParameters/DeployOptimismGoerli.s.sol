// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {DeployParameters} from "../DeployParameters.s.sol";
import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";

contract DeployOptimismGoerli is DeployParameters {
    function setUp() public override {
        params = RouterParameters({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: 0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: address(0),
            v3NFTPositionManager: address(0),
            v4PositionManager: address(0)
        });

        unsupported = 0x5302086A3a25d473aAbBd0356eFf8Dd811a4d89B;
    }
}
