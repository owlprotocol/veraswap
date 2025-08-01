// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployPolygon {
    uint256 constant chainId = 137;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270,
            v2Factory: 0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C,
            v3Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x67366782805870060151383F4BbFF9daB53e5cD6,
            v3NFTPositionManager: 0xC36442b4a4522E871399CD717aBDD847Ab11FE88,
            v4PositionManager: 0x1Ec2eBf4F37E7363FDfe3551602425af0B3ceef9,
            v3Quoter: address(0),
            v4StateView: address(0),
            v4Quoter: address(0),
            metaQuoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0x5d934f4e2f797775e53561bB72aca21ba36B96BB
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
