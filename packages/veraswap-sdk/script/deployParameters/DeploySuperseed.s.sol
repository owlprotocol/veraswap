// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeploySuperseed {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint256 constant chainId = 5330;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: address(0),
            weth9: address(0),
            v2Factory: address(0),
            v3Factory: address(0),
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: address(0),
            v3NFTPositionManager: address(0),
            v4PositionManager: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0x3a464f746D23Ab22155710f44dB16dcA53e0775E
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
