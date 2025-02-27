// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {DeployTokenAndPool, UniswapContractsAddresses} from '../DeployTokenAndPool.s.sol';

contract DeployLocal is DeployTokenAndPool {
    function setUp() public override {
        params = UniswapContractsAddresses({
            v4PositionManager: 0x9737f068eb64a1328B7A323370DDf836d3a446BD,
            router: 0x8C29321D10039d36dB8d084009761D79c2707B6d,
            stateView: 0x3282543F6117a031a2a2c8Cf535Aebdd0Dde0887
        });
    }
}
