// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {DeployRouter} from "./DeployRouter.s.sol";
import {DeployTokensAndPools} from "./DeployTokensAndPools.s.sol";

abstract contract DeployAll is DeployRouter, DeployTokensAndPools {
    function run() external {
        vm.startBroadcast();

        params = RouterParameters({
            permit2: mapUnsupported(params.permit2),
            weth9: mapUnsupported(params.weth9),
            v2Factory: mapUnsupported(params.v2Factory),
            v3Factory: mapUnsupported(params.v3Factory),
            pairInitCodeHash: params.pairInitCodeHash,
            poolInitCodeHash: params.poolInitCodeHash,
            v4PoolManager: mapUnsupported(params.v4PoolManager),
            v3NFTPositionManager: mapUnsupported(params.v3NFTPositionManager),
            v4PositionManager: mapUnsupported(params.v4PositionManager)
        });

        logParams();
        deployTokensAndPools();
        deployRouter();

        vm.stopBroadcast();
    }
}
