// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.26;

import {UniswapContracts, HyperlaneDeployParams, DeployParams} from "../Structs.sol";

library DeployUnichainSepolia {
    uint256 constant chainId = 1301;

    function getParams() internal pure returns (DeployParams memory params) {
        UniswapContracts memory uniswap = UniswapContracts({
            permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3,
            weth9: 0x4200000000000000000000000000000000000006,
            v2Factory: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f,
            v3Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984,
            pairInitCodeHash: 0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f,
            poolInitCodeHash: 0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54,
            v4PoolManager: 0x9cB26A7183B2F4515945Dc52CB4195B0d2D06C95,
            v3NFTPositionManager: 0xB7F724d6dDDFd008eFf5cc2834edDE5F9eF0d075,
            v4PositionManager: 0x12A98709BB5D0641D61458f85dcAFbE17AC2d05c,
            v4StateView: address(0),
            v4Quoter: address(0),
            universalRouter: address(0)
        });

        HyperlaneDeployParams memory hyperlane = HyperlaneDeployParams({
            mailbox: 0xDDcFEcF17586D08A5740B7D91735fcCE3dfe3eeD
        });

        params = DeployParams({uniswap: uniswap, hyperlane: hyperlane});
    }
}
