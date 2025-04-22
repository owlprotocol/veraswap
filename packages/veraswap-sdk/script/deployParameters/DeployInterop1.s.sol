// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployInterop1 {
    uint256 constant chainId = 420120001;

    // TODO: set this to the correct values
    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: address(0),
            v3Factory: address(0),
            pairInitCodeHash: 0x0000000000000000000000000000000000000000000000000000000000000000,
            poolInitCodeHash: 0x0000000000000000000000000000000000000000000000000000000000000000,
            v4PoolManager: address(0),
            v3NFTPositionManager: address(0),
            v4PositionManager: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({mailbox: address(0)});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
