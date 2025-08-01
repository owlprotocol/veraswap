// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployStory {
    bytes32 constant BYTES32_ZERO = bytes32(0);
    uint256 constant chainId = 1514;
    address constant UNSUPPORTED_PROTOCOL = address(0);

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: UNSUPPORTED_PROTOCOL,
            v3Factory: UNSUPPORTED_PROTOCOL,
            pairInitCodeHash: BYTES32_ZERO,
            poolInitCodeHash: BYTES32_ZERO,
            v4PoolManager: address(0),
            v3NFTPositionManager: address(0),
            v4PositionManager: address(0),
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane =
            HyperlaneDeployParams({mailbox: 0x3a464f746D23Ab22155710f44dB16dcA53e0775E});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
