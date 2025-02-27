// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {RouterParameters} from "@uniswap/universal-router/contracts/types/RouterParameters.sol";
import {DeployTokenAndPool, UniswapContractsAddresses} from '../DeployTokenAndPool.s.sol';

contract DeployArbitrumSepolia is DeployTokenAndPool {
    function setUp() public override {
        params = UniswapContractsAddresses({
            v4PositionManager: 0xAc631556d3d4019C95769033B5E719dD77124BAc,
            router: 0xeFd1D4bD4cf1e86Da286BB4CB1B8BcED9C10BA47,
            stateView: 0x9D467FA9062b6e9B1a46E26007aD82db116c67cB
        });
    }
}
