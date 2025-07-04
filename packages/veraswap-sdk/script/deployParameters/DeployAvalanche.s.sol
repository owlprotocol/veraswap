// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployAvalanche {
    uint256 constant chainId = 43114;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7,
            v2Factory: 0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C,
            v3Factory: 0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x06380C0e0912312B5150364B9DC4542BA0DbBc85,
            v3NFTPositionManager: 0x655C406EBFa14EE2006250925e54ec43AD184f8B,
            v4PositionManager: 0xB74b1F14d2754AcfcbBe1a221023a5cf50Ab8ACD,
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane =
            HyperlaneDeployParams({mailbox: 0xFf06aFcaABaDDd1fb08371f9ccA15D73D51FeBD6});

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
