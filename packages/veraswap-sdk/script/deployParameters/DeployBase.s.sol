// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployBase {
    function getParams() internal pure returns (DeployParams memory params) {
        RouterParameters memory uniswap = RouterParameters({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6,
            v3Factory: 0x33128a8fC17869897dcE68Ed026d694621f6FDfD,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x498581fF718922c3f8e6A244956aF099B2652b2b,
            v3NFTPositionManager: 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1,
            v4PositionManager: 0x7C5f5A4bBd8fD63184577525326123B519429bDc
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0xb2e2060A682f2974a19f138101D4d2C31D124CF7
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
