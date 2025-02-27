// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {DeployTokenAndPool, UniswapContractsAddresses} from '../DeployTokenAndPool.s.sol';

contract DeploySepolia is DeployTokenAndPool {
    function setUp() public override {
        params = UniswapContractsAddresses({
            v4PositionManager: 0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4,
            router: 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b,
            stateView: 0xE1Dd9c3fA50EDB962E442f60DfBc432e24537E4C
        });
    }
}
